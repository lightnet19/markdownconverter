"""Unit tests for backend utility functions."""

import os
import sys

import pytest

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from backend.deps import init_markitdown
from backend.utils import (
    safe_convert,
    sanitize_filename,
    validate_url,
)


@pytest.fixture(scope="module")
def md():
    init_markitdown()
    from backend.deps import get_markitdown

    return get_markitdown()


# ---- sanitize_filename ----


def test_sanitize_filename_removes_path():
    assert sanitize_filename("../../etc/passwd") == "passwd"
    assert sanitize_filename("/etc/hosts") == "hosts"
    assert sanitize_filename("C:\\Windows\\system32") == "system32"


def test_sanitize_filename_removes_null():
    assert sanitize_filename("file\x00.txt") == "file.txt"


def test_sanitize_filename_empty():
    assert sanitize_filename("") == "unnamed_file"


def test_sanitize_filename_keeps_normal():
    assert sanitize_filename("report.pdf") == "report.pdf"
    assert sanitize_filename("my document.docx") == "my document.docx"


# ---- validate_url ----


def test_validate_url_ok():
    assert validate_url("https://example.com") == "https://example.com"
    assert validate_url("http://example.org/path") == "http://example.org/path"
    assert validate_url("https://example.com:443/page?q=1") == "https://example.com:443/page?q=1"


def test_validate_url_rejects_internal():
    with pytest.raises(ValueError, match="internal"):
        validate_url("http://127.0.0.1:8000")
    with pytest.raises(ValueError, match="internal"):
        validate_url("http://10.0.0.1")
    with pytest.raises(ValueError, match="internal"):
        validate_url("http://192.168.1.1")


def test_validate_url_rejects_localhost():
    with pytest.raises(ValueError, match="localhost"):
        validate_url("http://localhost")
    with pytest.raises(ValueError, match="localhost"):
        validate_url("http://0.0.0.0")


def test_validate_url_rejects_bad_scheme():
    with pytest.raises(ValueError, match="Only http"):
        validate_url("ftp://example.com")
    # file:///etc/passwd has no netloc → caught by "valid host" check first
    with pytest.raises(ValueError, match="valid host"):
        validate_url("file:///etc/passwd")


def test_validate_url_rejects_empty():
    with pytest.raises(ValueError, match="valid host"):
        validate_url("")


# ---- safe_convert ----


def test_safe_convert_html(md):
    html = b"<html><body><h1>Hello</h1></body></html>"
    result = safe_convert(md, html, "test.html")
    assert result["error"] is None
    assert "Hello" in result["markdown"]
    assert result["filename"] == "test.html"


def test_safe_convert_plain_text(md):
    result = safe_convert(md, b"Hello **World**", "hello.txt")
    assert result["error"] is None
    assert result["markdown"] is not None


def test_safe_convert_unsupported(md):
    result = safe_convert(md, b"\x00\x01\x02\xff\xfe", "test.xyz")
    assert result["error"] is not None


def test_safe_convert_empty(md):
    result = safe_convert(md, b"", "empty.txt")
    assert result["error"] is None
    assert result["markdown"] is not None


def test_safe_convert_nonexistent_extension(md):
    result = safe_convert(md, b"some content", "file.unknown")
    # MarkItDown 0.1.6+ may have a generic text converter;
    # fall back to verifying we always get a valid response dict.
    assert "filename" in result
    assert result["filename"] == "file.unknown"
    # If the conversion succeeded, markdown should be non-None;
    # otherwise error should explain why.
    assert (result["error"] is None) == (result["markdown"] is not None)


def test_safe_convert_csv(md):
    csv = b"name,age\nAlice,30\nBob,25\n"
    result = safe_convert(md, csv, "data.csv")
    assert result["error"] is None
    assert "Alice" in result["markdown"] or "|" in result["markdown"]
