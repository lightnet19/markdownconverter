"""Integration tests for API endpoints."""

import os
import sys

import pytest
from fastapi.testclient import TestClient

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from backend.app import app
from backend.deps import init_markitdown


@pytest.fixture(autouse=True, scope="module")
def setup():
    init_markitdown()
    yield


@pytest.fixture
def client():
    return TestClient(app)


def test_health(client):
    resp = client.get("/api/health")
    assert resp.status_code == 200
    data = resp.json()
    assert data["status"] == "ok"
    assert len(data["converters"]) > 0


def test_convert_file_html(client):
    resp = client.post(
        "/api/convert/file",
        files={"files": ("test.html", b"<h1>Hello World</h1>", "text/html")},
    )
    assert resp.status_code == 200
    data = resp.json()
    assert len(data) == 1
    assert data[0]["error"] is None
    assert "Hello World" in data[0]["markdown"]


def test_convert_file_txt(client):
    resp = client.post(
        "/api/convert/file",
        files={"files": ("hello.txt", b"Hello **Markdown**!", "text/plain")},
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data[0]["error"] is None
    assert data[0]["markdown"] is not None


def test_convert_file_csv(client):
    csv = b"name,age\nAlice,30\nBob,25\n"
    resp = client.post(
        "/api/convert/file",
        files={"files": ("data.csv", csv, "text/csv")},
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data[0]["error"] is None


def test_convert_file_json(client):
    resp = client.post(
        "/api/convert/file",
        files={"files": ("data.json", b'{"key": "value"}', "application/json")},
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data[0]["error"] is None


def test_convert_batch(client):
    resp = client.post(
        "/api/convert/file",
        files=[
            ("files", ("a.html", b"<h1>A</h1>", "text/html")),
            ("files", ("b.html", b"<h1>B</h1>", "text/html")),
        ],
    )
    assert resp.status_code == 200
    data = resp.json()
    assert len(data) == 2
    assert data[0]["error"] is None
    assert data[1]["error"] is None


def test_convert_unsupported_format(client):
    resp = client.post(
        "/api/convert/file",
        files={"files": ("test.exe", b"MZ\x90\x00", "application/x-msdownload")},
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data[0]["error"] is not None


def test_convert_batch_too_many(client):
    files = [("files", (f"f{i}.txt", b"test", "text/plain")) for i in range(11)]
    resp = client.post("/api/convert/file", files=files)
    assert resp.status_code == 422


def test_convert_url(client):
    resp = client.post("/api/convert/url", json={"url": "https://example.com"})
    assert resp.status_code == 200
    data = resp.json()
    assert data["error"] is None
    assert "Example Domain" in data["markdown"]


def test_convert_bad_url(client):
    resp = client.post("/api/convert/url", json={"url": "http://127.0.0.1:8000"})
    assert resp.status_code == 422


def test_frontend_served(client):
    resp = client.get("/")
    assert resp.status_code == 200
    assert "Markdown Converter" in resp.text


def test_frontend_assets(client):
    resp = client.get("/css/style.css")
    assert resp.status_code == 200

    resp = client.get("/js/app.js")
    assert resp.status_code == 200


def test_rate_limit_file(client):
    from backend.app import _request_log

    _request_log.clear()

    # FILE limit is 30. We do 31 requests.
    for _ in range(30):
        resp = client.post(
            "/api/convert/file",
            files={"files": ("test.html", b"<h1>A</h1>", "text/html")},
        )
        assert resp.status_code == 200

    resp = client.post(
        "/api/convert/file",
        files={"files": ("test.html", b"<h1>A</h1>", "text/html")},
    )
    assert resp.status_code == 429
    assert "Rate limit exceeded" in resp.json()["error"]


def test_rate_limit_url(client):
    from backend.app import _request_log

    _request_log.clear()

    # URL limit is 10. We do 11 requests.
    for _ in range(10):
        resp = client.post("/api/convert/url", json={"url": "https://example.com"})
        assert resp.status_code == 200

    resp = client.post("/api/convert/url", json={"url": "https://example.com"})
    assert resp.status_code == 429
    assert "Rate limit exceeded" in resp.json()["error"]
