import io
import logging
import os
import re
from typing import TypedDict
from urllib.parse import urlparse

from markitdown import (
    FileConversionException,
    MarkItDown,
    StreamInfo,
    UnsupportedFormatException,
)

log = logging.getLogger("markitdown")


class ConversionResult(TypedDict):
    filename: str
    markdown: str | None
    title: str | None
    error: str | None


# ---------------------------------------------------------------------------
# Configuration (from environment variables)
# ---------------------------------------------------------------------------
MAX_FILE_SIZE = int(os.getenv("MAX_FILE_SIZE", str(50 * 1024 * 1024)))  # 50 MB
MAX_FILES_PER_BATCH = int(os.getenv("MAX_FILES_PER_BATCH", "10"))
REQUEST_TIMEOUT = int(os.getenv("REQUEST_TIMEOUT", "30"))  # seconds


# ---------------------------------------------------------------------------
# URL validation (SSRF prevention)
# ---------------------------------------------------------------------------
BLOCKED_HOSTS = (
    "127.0.0.0/8",
    "10.0.0.0/8",
    "172.16.0.0/12",
    "192.168.0.0/16",
    "::1",
)

_INTERNAL_IP_PATTERN = re.compile(r"^(127\.|10\.|172\.(1[6-9]|2\d|3[01])\.|192\.168\.|::1$)")


def validate_url(url: str) -> str:
    """Validate and sanitize a URL. Returns the cleaned URL or raises ValueError."""
    url = url.strip()
    parsed = urlparse(url)

    if not parsed.netloc:
        raise ValueError("URL must have a valid host")

    if parsed.scheme not in ("http", "https"):
        raise ValueError("Only http and https URLs are allowed")

    host = parsed.netloc.split(":")[0]  # strip port

    # Block internal IPs
    if _INTERNAL_IP_PATTERN.match(host):
        raise ValueError(f"URL points to an internal/private host: {host}")

    if host in ("localhost", "0.0.0.0"):
        raise ValueError(f"URL points to localhost: {host}")

    return url


# ---------------------------------------------------------------------------
# Filename sanitisation
# ---------------------------------------------------------------------------
def sanitize_filename(filename: str) -> str:
    """Remove path separators and dangerous characters from a filename."""
    # Normalise Windows backslash separators to forward slash first,
    # so os.path.basename works correctly even on Linux.
    name = filename.replace("\\", "/")
    name = os.path.basename(name)
    # Strip null bytes and other dangerous chars
    name = re.sub(r"[\x00-\x1f<>:\"/\\|?*]", "", name)
    return name if name else "unnamed_file"


# ---------------------------------------------------------------------------
# PDF fallback helpers: pdfminer-lenient → pdfplumber → pypdfium2
# ---------------------------------------------------------------------------
def _is_pdf_bytes(file_bytes: bytes) -> bool:
    """Check if the file starts with the PDF magic bytes '%PDF-'."""
    return file_bytes[:5] == b"%PDF-"


def _pdf_fallback_pdfminer_lenient(file_bytes: bytes, filename: str) -> str | None:
    """
    Try pdfminer with the lenient CachingPDFParser which tolerates
    malformed headers (e.g. PDFs without a proper /Root object at the
    expected offset).
    Returns a Markdown string, or None if extraction fails.
    """
    try:
        from pdfminer.high_level import extract_text_to_fp
        from pdfminer.layout import LAParams

        buf = io.BytesIO()
        extract_text_to_fp(
            io.BytesIO(file_bytes),
            buf,
            laparams=LAParams(),
            output_type="text",
            codec="utf-8",
            caching=True,
        )
        text = buf.getvalue().decode("utf-8", errors="replace").strip()
        if text:
            log.info("PDF fallback (pdfminer-lenient) succeeded for '%s'", filename)
            return text
        return None
    except Exception as e:
        log.warning("PDF fallback pdfminer-lenient failed for '%s': %s", filename, e)
        return None


def _pdf_fallback_pdfplumber(file_bytes: bytes, filename: str) -> str | None:
    """
    Try to extract text from a PDF using pdfplumber.
    Returns a Markdown string, or None if extraction fails.
    """
    try:
        import pdfplumber

        lines: list[str] = []
        with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
            title = None
            if pdf.metadata:
                title = pdf.metadata.get("Title") or None
            if title:
                lines.append(f"# {title}\n")

            for page_num, page in enumerate(pdf.pages, 1):
                text = page.extract_text()
                if text and text.strip():
                    lines.append(f"\n<!-- Page {page_num} -->\n")
                    lines.append(text.strip())

                tables = page.extract_tables()
                for table in tables:
                    if not table:
                        continue
                    md_table: list[str] = []
                    for i, row in enumerate(table):
                        cells = [str(c or "").replace("\n", " ").strip() for c in row]
                        md_table.append("| " + " | ".join(cells) + " |")
                        if i == 0:
                            md_table.append("|" + "|".join(["---"] * len(cells)) + "|")
                    lines.append("\n" + "\n".join(md_table))

        result = "\n".join(lines).strip()
        if result:
            log.info("PDF fallback (pdfplumber) succeeded for '%s'", filename)
            return result
        return None
    except Exception as e:
        log.warning("PDF fallback pdfplumber failed for '%s': %s", filename, e)
        return None


def _pdf_fallback_pypdfium2(file_bytes: bytes, filename: str) -> str | None:
    """
    Try to extract text from a PDF using pypdfium2 as last resort.
    Returns a Markdown string, or None if extraction fails.
    """
    try:
        import pypdfium2 as pdfium

        lines: list[str] = []
        doc = pdfium.PdfDocument(io.BytesIO(file_bytes))
        for page_num in range(len(doc)):
            page = doc[page_num]
            text_page = page.get_textpage()
            text = text_page.get_text_range()
            if text and text.strip():
                lines.append(f"\n<!-- Page {page_num + 1} -->\n")
                lines.append(text.strip())

        result = "\n".join(lines).strip()
        if result:
            log.info("PDF fallback (pypdfium2) succeeded for '%s'", filename)
            return result
        return None
    except Exception as e:
        log.warning("PDF fallback pypdfium2 failed for '%s': %s", filename, e)
        return None


def _convert_pdf_with_fallbacks(file_bytes: bytes, filename: str) -> str | None:
    """
    Attempt PDF extraction in order:
      1. pdfminer (lenient/high-level)
      2. pdfplumber
      3. pypdfium2
    Returns the first successful Markdown text, or None.
    """
    for fallback_fn in (
        _pdf_fallback_pdfminer_lenient,
        _pdf_fallback_pdfplumber,
        _pdf_fallback_pypdfium2,
    ):
        result = fallback_fn(file_bytes, filename)
        if result:
            return result
    return None


# ---------------------------------------------------------------------------
# Safe conversion wrapper
# ---------------------------------------------------------------------------
def safe_convert(
    md: MarkItDown,
    file_bytes: bytes,
    filename: str,
    extension: str | None = None,
) -> ConversionResult:
    """
    Safely convert a file payload to Markdown.
    Returns a dict with keys: filename, markdown, title, error.

    For PDF files, if the primary converter (pdfminer) fails with a syntax error,
    it automatically falls back to pdfplumber and then pypdfium2.
    """
    safe_name = sanitize_filename(filename)
    ext = extension or os.path.splitext(filename)[1].lower()

    # Also detect PDF by magic bytes in case the extension is missing/wrong
    is_pdf = ext in (".pdf",) or _is_pdf_bytes(file_bytes)
    if is_pdf and ext != ".pdf":
        ext = ".pdf"
        log.info("Detected PDF by magic bytes for '%s'", safe_name)

    try:
        stream = io.BytesIO(file_bytes)
        stream_info = StreamInfo(
            extension=ext,
            filename=safe_name,
            mimetype="application/pdf" if is_pdf else None,
        )
        result = md.convert_stream(stream, stream_info=stream_info)
        return {
            "filename": safe_name,
            "markdown": result.markdown,
            "title": result.title,
            "error": None,
        }

    except UnsupportedFormatException:
        return {
            "filename": safe_name,
            "markdown": None,
            "title": None,
            "error": f"Unsupported format: '{ext or 'unknown'}'",
        }

    except (FileConversionException, Exception) as primary_error:
        primary_msg = str(primary_error)
        log.warning("Primary converter failed for '%s': %s", safe_name, primary_msg)

        # ---- PDF-specific fallback path ----
        if is_pdf:
            log.info("Attempting PDF fallback converters for '%s'", safe_name)
            fallback_md = _convert_pdf_with_fallbacks(file_bytes, safe_name)

            if fallback_md:
                return {
                    "filename": safe_name,
                    "markdown": fallback_md,
                    "title": None,
                    "error": None,
                }
            else:
                # All fallbacks exhausted — return a helpful error message
                return {
                    "filename": safe_name,
                    "markdown": None,
                    "title": None,
                    "error": (
                        "PDF conversion failed. The file may be encrypted, corrupted, "
                        "or image-only (scanned PDF without a text layer). "
                        f"Details: {primary_msg}"
                    ),
                }

        # Non-PDF error — return original error message
        return {
            "filename": safe_name,
            "markdown": None,
            "title": None,
            "error": f"Conversion failed: {primary_msg}",
        }
