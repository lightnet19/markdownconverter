# Development Plan (devplan.md)

This document maps out the phases of the Markdown Converter web application development.

## Project Phases

### Phase 1 - 11: Core Application & Features — COMPLETE
- Basic file conversion logic using Microsoft's MarkItDown engine.
- Batch conversions (up to 10 files, 50MB each).
- Live preview split pane editor (marked.js).
- Clear, copy, and download actions.
- LocalStorage conversion history tracking.
- Zip batch download.
- Rate limiting middleware (30 req / 60s).
- Optional vision-based OCR support for images.
- Multi-language interface support (EN, ID, JA, AR, ZH).

### Phase 12: Rebranding & Attribution — COMPLETE
- Global name change to **Markdown Converter**.
- Added sub-header attribution referencing Microsoft's repository `https://github.com/microsoft/markitdown`.
- Updated developer configs, Readme, and Docker configurations.

### Phase 13: SEO & AI Optimization (AIO) — COMPLETE
- Integrated complete head SEO tags (Canonical, Robots, OG, Twitter Card).
- Integrated JSON-LD Structured Data (WebApplication, FAQPage, BreadcrumbList).
- Implemented static fallback `.seo-content` for AI/SEO crawlers.
- Added root endpoints `/robots.txt`, `/sitemap.xml`, `/llms.txt`, `/ai.txt` on backend.
- Handled dynamic `<html lang="...">` synchronizations.
- Generated Favicon and Open Graph assets.

### Phase 14: Ultra-Premium Modern SaaS UI Redesign — COMPLETE
- Redesigned visual system with curated dark mode gradient-glow theme (`#08090d`).
- Implemented responsive glassmorphic sticky header (`position: sticky`, `backdrop-filter`).
- Integrated high-end typography using Google Fonts (Inter & Fira Code).
- Designed elegant "Hero Section" with gradient title and clear attribution badge.
- Re-architected files list, upload drop zones, results toolbar, and code editor panes with glassmorphic elements, modern gradients, hover animations, and cohesive light/dark theme variables.
- Optimized and verified layout responsiveness for mobile devices (375x812 viewport) including adaptive logo headers and typography scaling.
- Added a styled footer crediting "Made with love by alfajri" linking to https://alfajri.my.id/.

### Phase 15: User-Provided LLM API Key for OCR — COMPLETE
- Added an "Advanced Options (OCR & LLM)" accordion component on the frontend directly below the input panels.
- Configured frontend to store LLM settings (API Key, Base URL, Model Name) in `localStorage`.
- Updated requests to include custom headers (`X-LLM-API-Key`, `X-LLM-Base-URL`, `X-LLM-Model`).
- Created a factory function on the backend to dynamically instantiate a user-specific `MarkItDown` instance using their credentials.
- Updated endpoints (`/api/convert/file` and `/api/convert/url`) to process headers and fallback to global setup when custom headers are missing.
- Enabled compatibility with international/Chinese LLMs (such as DeepSeek, Kimi, Qwen) using the custom Base URL and Model Name fields.
