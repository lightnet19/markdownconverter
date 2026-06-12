import logging
import os
import time
from collections import defaultdict
from collections.abc import Awaitable, Callable
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from markitdown import FileConversionException, UnsupportedFormatException

from .deps import init_markitdown
from .routers import convert

# ---------------------------------------------------------------------------
# Logging
# ---------------------------------------------------------------------------
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
log = logging.getLogger("markitdown")


# ---------------------------------------------------------------------------
# In-memory rate limiter (simple sliding window per endpoint)
# ---------------------------------------------------------------------------
RATE_LIMIT_WINDOW = int(os.getenv("RATE_LIMIT_WINDOW", "60"))  # seconds
RATE_LIMIT_FILE = int(os.getenv("RATE_LIMIT_FILE", "30"))  # req / window
RATE_LIMIT_URL = int(os.getenv("RATE_LIMIT_URL", "10"))  # req / window
RATE_LIMIT_ZIP = int(os.getenv("RATE_LIMIT_ZIP", "20"))  # req / window

_ENDPOINT_LIMITS: dict[str, int] = {
    "/api/convert/file": RATE_LIMIT_FILE,
    "/api/convert/url": RATE_LIMIT_URL,
    "/api/convert/download-zip": RATE_LIMIT_ZIP,
}

_request_log: dict[tuple[str, str], list[float]] = defaultdict(list)


async def rate_limit_middleware(
    request: Request, call_next: Callable[[Request], Awaitable[Response]]
) -> Response:
    path = request.url.path

    # Skip static files, health check, and paths not in mapping
    if path.startswith("/static") or path == "/api/health" or path not in _ENDPOINT_LIMITS:
        return await call_next(request)

    client_ip = request.client.host if request.client else "unknown"
    limit = _ENDPOINT_LIMITS[path]
    key = (client_ip, path)

    now = time.time()
    window_start = now - RATE_LIMIT_WINDOW

    # Clean old entries
    _request_log[key] = [t for t in _request_log[key] if t > window_start]

    if len(_request_log[key]) >= limit:
        log.warning("Rate limit exceeded for %s on %s", client_ip, path)
        return JSONResponse(
            status_code=429,
            content={
                "error": f"Rate limit exceeded. Max {limit} requests per {RATE_LIMIT_WINDOW}s on {path}."
            },
        )

    _request_log[key].append(now)
    return await call_next(request)


@asynccontextmanager
async def lifespan(app: FastAPI):
    init_markitdown()
    log.info("MarkItDown app started")
    yield
    log.info("MarkItDown app shutting down")


# ---------------------------------------------------------------------------
# FastAPI application
# ---------------------------------------------------------------------------
app = FastAPI(
    title="Markdown Converter",
    description="Convert documents (PDF, DOCX, PPTX, XLSX, HTML, …) to Markdown.",
    version="0.1.0",
    lifespan=lifespan,
)

# CORS — allow all origins for public MVP
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Rate limiting middleware
app.middleware("http")(rate_limit_middleware)

# Register API routers FIRST (before static mount to avoid conflicts)
app.include_router(convert.router, prefix="/api")

# Serve frontend static files
frontend_path = os.path.join(os.path.dirname(__file__), "..", "frontend")
if os.path.isdir(frontend_path):
    @app.get("/robots.txt", include_in_schema=False)
    async def serve_robots():
        return FileResponse(os.path.join(frontend_path, "robots.txt"), media_type="text/plain")

    @app.get("/sitemap.xml", include_in_schema=False)
    async def serve_sitemap():
        return FileResponse(os.path.join(frontend_path, "sitemap.xml"), media_type="application/xml")

    @app.get("/llms.txt", include_in_schema=False)
    async def serve_llms():
        return FileResponse(os.path.join(frontend_path, "llms.txt"), media_type="text/plain")

    @app.get("/ai.txt", include_in_schema=False)
    async def serve_ai_txt():
        return FileResponse(os.path.join(frontend_path, "ai.txt"), media_type="text/plain")

    app.mount("/static", StaticFiles(directory=frontend_path), name="static")

    @app.get("/")
    async def serve_index():
        return FileResponse(os.path.join(frontend_path, "index.html"))

    @app.get("/{path:path}")
    async def serve_frontend(path: str):
        file_path = os.path.join(frontend_path, path)
        if os.path.isfile(file_path):
            return FileResponse(file_path)
        # Fallback to index.html for SPA-like routing
        return FileResponse(os.path.join(frontend_path, "index.html"))


# ---------------------------------------------------------------------------
# Global exception handlers
# ---------------------------------------------------------------------------
@app.exception_handler(UnsupportedFormatException)
async def unsupported_format_handler(request: Request, exc: UnsupportedFormatException):
    return JSONResponse(
        status_code=422,
        content={"error": str(exc)},
    )


@app.exception_handler(FileConversionException)
async def file_conversion_handler(request: Request, exc: FileConversionException):
    return JSONResponse(
        status_code=422,
        content={"error": str(exc)},
    )


@app.exception_handler(Exception)
async def generic_error_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={"error": f"Internal server error: {str(exc)}"},
    )
