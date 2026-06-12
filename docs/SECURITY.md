# Security Policy (SECURITY.md)

This document outlines the security practices and mechanisms employed in **Markdown Converter** to protect users and backend resources.

## 1. Rate Limiting
To prevent Distributed Denial of Service (DDoS) and API abuse, a custom rate limiting middleware is integrated:
- **Limit**: Maximum of 30 requests per 60 seconds per client IP address.
- **Scope**: Applied to all `/api/convert/file` and `/api/convert/url` endpoints.
- **Fallback**: Clients exceeding the threshold receive a `429 Too Many Requests` response.

## 2. File Processing Safety
- **Max File Size**: The application strictly enforces a maximum file size of **50 MB** per upload.
- **Batch Limit**: Users can upload a maximum of 10 files in a single batch.
- **In-Memory Processing**: File conversions are handled in-memory and through temporary streams where possible to prevent permanent storage of sensitive documents on backend server disks.

## 3. Web App Privacy
- **No Analytics / Trackers**: We do not inject tracking scripts or user identifiers.
- **Local Storage**: Conversion history is kept strictly on the user's browser client using HTML5 `localStorage`. No user conversion history is uploaded to or saved on the backend server.
