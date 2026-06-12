# Testing & Verification Documentation (TESTING.md)

This document describes the test suite structure and instructions for verifying **Markdown Converter**.

## 1. Backend Testing

The backend is tested using `pytest`. The test files are located in the `tests/` directory:
- `tests/test_api.py`: Integrations tests for FastAPI routes (conversions, rate limits, root file serving).
- `tests/test_utils.py`: Unit tests for helper functions and document processing checks.

### Running Pytest
To execute the tests, ensure your virtual environment is active and run:
```bash
.venv\Scripts\python -m pytest tests/
```

### Coverage Areas
- **File Upload Endpoint (`/api/convert/file`)**: Tests successful conversions, error handling, rate limits, and batch uploads.
- **URL Endpoint (`/api/convert/url`)**: Verifies HTML-to-Markdown parsing, request timeouts, and error handling for bad urls.
- **Root SEO endpoints**: Verifies `/robots.txt`, `/sitemap.xml`, `/llms.txt`, and `/ai.txt` are served with status `200` and correct MIME types.

---

## 2. Frontend & SEO Testing

### Dynamic HTML Lang Check
Verify that switching the UI language selector updates `<html lang="...">` dynamically:
- Select "English" -> HTML lang should be `en`
- Select "Indonesia" -> HTML lang should be `id`
- Select "日本語" -> HTML lang should be `ja`

### Crawler Asset Verification
Perform the following checks locally or post-deployment:
1. View `/robots.txt` in your browser. Confirm it lists standard search bots and AI bots.
2. View `/sitemap.xml` and verify all URLs are absolute and match the deployment domain `markitdown.my.id`.
3. Verify `/llms.txt` and `/ai.txt` return structured text payloads without 404 errors.
