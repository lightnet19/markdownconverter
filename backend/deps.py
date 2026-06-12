"""
Dependency resolution: MarkItDown singleton accessible by all modules.
Also handles optional OCR plugin initialization via LLM vision.
"""

import logging
import os
from typing import Any

from markitdown import MarkItDown

log = logging.getLogger("markitdown")

_md: MarkItDown | None = None
_ocr_enabled: bool = False
_ocr_model: str | None = None


def init_markitdown() -> MarkItDown:
    global _md, _ocr_enabled, _ocr_model
    if _md is not None:
        return _md

    log.info("Initializing MarkItDown ...")
    kwargs: dict[str, Any] = {}

    # Check for OCR support
    ocr_enabled = os.getenv("OCR_ENABLED", "").strip().lower() in ("1", "true", "yes")
    llm_api_key = os.getenv("LLM_API_KEY", "").strip()
    llm_model = os.getenv("LLM_MODEL", "gpt-4o").strip()
    llm_base_url = os.getenv("LLM_BASE_URL", "").strip()

    if ocr_enabled and llm_api_key:
        try:
            # Import OCR dependencies
            from openai import OpenAI

            if llm_base_url:
                llm_client = OpenAI(api_key=llm_api_key, base_url=llm_base_url)
            else:
                llm_client = OpenAI(api_key=llm_api_key)
            kwargs["enable_plugins"] = True
            kwargs["llm_client"] = llm_client
            kwargs["llm_model"] = llm_model
            _ocr_enabled = True
            _ocr_model = llm_model
            log.info("OCR enabled — using LLM model: %s", llm_model)
        except ImportError as e:
            log.warning(
                "OCR enabled but dependencies missing: %s. "
                "Install: pip install -r backend/requirements-ocr.txt",
                e,
            )
        except Exception as e:
            log.warning("OCR initialization failed: %s", e)
    elif ocr_enabled and not llm_api_key:
        log.warning("OCR_ENABLED=true but LLM_API_KEY not set — OCR disabled")

    _md = MarkItDown(**kwargs)
    converter_count = len(_md._converters)
    if _ocr_enabled:
        log.info(
            "MarkItDown ready (%d converters — OCR-enhanced converters active)",
            converter_count,
        )
    else:
        log.info("MarkItDown ready (%d converters)", converter_count)
    return _md


def get_markitdown() -> MarkItDown:
    assert _md is not None, "MarkItDown not initialized — call init_markitdown() first"
    return _md


def get_custom_markitdown(api_key: str, base_url: str = "", model: str = "gpt-4o") -> MarkItDown:
    """Create a temporary MarkItDown instance using a user-provided LLM API Key."""
    kwargs = {}
    try:
        from openai import OpenAI
        if base_url:
            llm_client = OpenAI(api_key=api_key, base_url=base_url)
        else:
            llm_client = OpenAI(api_key=api_key)
        kwargs["enable_plugins"] = True
        kwargs["llm_client"] = llm_client
        kwargs["llm_model"] = model
        log.info("Created custom MarkItDown instance with user API key for model: %s", model)
    except Exception as e:
        log.warning("Failed to initialize custom MarkItDown instance: %s", e)
        
    return MarkItDown(**kwargs)


def get_ocr_status() -> dict:
    """Return current OCR status for health endpoint."""
    return {
        "enabled": _ocr_enabled,
        "model": _ocr_model,
    }
