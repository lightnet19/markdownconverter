import asyncio
import io
import zipfile

from fastapi import APIRouter, File, HTTPException, UploadFile, Header
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

from ..deps import get_markitdown, get_ocr_status, get_custom_markitdown
from ..utils import (
    MAX_FILE_SIZE,
    MAX_FILES_PER_BATCH,
    REQUEST_TIMEOUT,
    ConversionResult,
    safe_convert,
    sanitize_filename,
    validate_url,
)

router = APIRouter()


# ---------------------------------------------------------------------------
# POST /api/convert/file
# ---------------------------------------------------------------------------
@router.post("/convert/file")
async def convert_file(
    files: list[UploadFile] = File(...),
    x_llm_api_key: str | None = Header(None),
    x_llm_base_url: str | None = Header(None),
    x_llm_model: str | None = Header(None),
):
    """Upload one or more files and convert each to Markdown."""
    # Validate batch size
    if len(files) > MAX_FILES_PER_BATCH:
        raise HTTPException(
            status_code=422,
            detail=f"Maximum {MAX_FILES_PER_BATCH} files per batch",
        )

    if x_llm_api_key:
        md = get_custom_markitdown(
            api_key=x_llm_api_key,
            base_url=x_llm_base_url or "",
            model=x_llm_model or "gpt-4o"
        )
    else:
        md = get_markitdown()
        
    results: list[ConversionResult] = []

    for file in files:
        filename = sanitize_filename(file.filename or "unnamed")

        # Read file content
        content = await file.read()

        # Validate file size
        if len(content) > MAX_FILE_SIZE:
            results.append(
                {
                    "filename": filename,
                    "markdown": None,
                    "title": None,
                    "error": f"File too large (max {MAX_FILE_SIZE // (1024 * 1024)}MB)",
                }
            )
            continue

        # Convert
        result = safe_convert(md, content, filename)
        results.append(result)

    return results


# ---------------------------------------------------------------------------
# Request model for URL conversion
# ---------------------------------------------------------------------------
class UrlRequest(BaseModel):
    url: str


# ---------------------------------------------------------------------------
# POST /api/convert/url
# ---------------------------------------------------------------------------
@router.post("/convert/url")
async def convert_url(
    request: UrlRequest,
    x_llm_api_key: str | None = Header(None),
    x_llm_base_url: str | None = Header(None),
    x_llm_model: str | None = Header(None),
):
    """Fetch a URL and convert its content to Markdown."""
    try:
        url = validate_url(request.url)
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e)) from e

    if x_llm_api_key:
        md = get_custom_markitdown(
            api_key=x_llm_api_key,
            base_url=x_llm_base_url or "",
            model=x_llm_model or "gpt-4o"
        )
    else:
        md = get_markitdown()

    try:
        # Run convert_uri with a timeout to prevent hanging on slow URLs
        result = await asyncio.wait_for(
            asyncio.to_thread(md.convert_uri, url),
            timeout=REQUEST_TIMEOUT,
        )
        return {
            "url": url,
            "markdown": result.markdown,
            "title": result.title,
            "error": None,
        }
    except TimeoutError:
        return {
            "url": url,
            "markdown": None,
            "title": None,
            "error": f"Request timed out after {REQUEST_TIMEOUT}s",
        }
    except Exception as e:
        return {
            "url": url,
            "markdown": None,
            "title": None,
            "error": f"Conversion failed: {str(e)}",
        }


# ---------------------------------------------------------------------------
# Request/Response models for ZIP download
# ---------------------------------------------------------------------------
class DownloadZipItem(BaseModel):
    filename: str
    markdown: str


class DownloadZipRequest(BaseModel):
    files: list[DownloadZipItem]


# ---------------------------------------------------------------------------
# POST /api/convert/download-zip
# ---------------------------------------------------------------------------
@router.post("/convert/download-zip")
async def convert_download_zip(request: DownloadZipRequest):
    """Download multiple converted files as a single ZIP archive."""
    buf = io.BytesIO()
    with zipfile.ZipFile(buf, "w", zipfile.ZIP_DEFLATED) as zf:
        for item in request.files:
            safe_name = sanitize_filename(item.filename)
            md_name = safe_name.rsplit(".", 1)[0] + ".md" if "." in safe_name else safe_name + ".md"
            zf.writestr(md_name, item.markdown)

    buf.seek(0)
    return StreamingResponse(
        buf,
        media_type="application/zip",
        headers={"Content-Disposition": "attachment; filename=converted_files.zip"},
    )


# ---------------------------------------------------------------------------
# GET /api/health
# ---------------------------------------------------------------------------
@router.get("/health")
async def health():
    """Health check endpoint."""
    md = get_markitdown()
    ocr = get_ocr_status()
    converters = [type(c.converter).__name__ for c in md._converters]
    return {
        "status": "ok",
        "version": "0.1.0",
        "converters": converters,
        "ocr": ocr,
    }
