# Developer Log (devlog.md)

## [2026-06-12] Phase 15: User-Provided LLM API Key for OCR — Implemented
### Summary
Added support for user-provided LLM API Keys, Base URLs, and Model Names directly on the frontend. The backend dynamically instantiates user-specific `MarkItDown` clients for requests containing these credentials, enabling decentralized OCR processing without globally configured keys. This approach natively supports any OpenAI-compatible endpoints, including Chinese LLM providers such as DeepSeek, Moonshot/Kimi, DashScope/Qwen, and local engines.

### Detailed Actions
1. **Frontend Accordion**: Created a new "Advanced Options (OCR & LLM)" accordion below the main input/URL panels in `index.html` to keep settings easily accessible but hidden by default.
2. **Settings Inputs**: Added input fields for API Key (password type), Base URL, and Model Name (defaulting to `gpt-4o`).
3. **State Persistence**: Wired input event listeners in `js/app.js` to persist and load these credentials to/from the browser's `localStorage`.
4. **Header Propagation**: Configured both XMLHttpRequest (for files batch) and Fetch (for URL converters) to attach the custom headers: `X-LLM-API-Key`, `X-LLM-Base-URL`, and `X-LLM-Model`.
5. **Backend Dependency Factory**: Created a new factory function `get_custom_markitdown(api_key, base_url, model)` in `backend/deps.py` that dynamically imports `openai` and generates custom `MarkItDown` engines.
6. **Dynamic Endpoint Evaluation**: Updated `convert_file` and `convert_url` router endpoints in `backend/routers/convert.py` to accept the request headers and spawn custom clients on-demand.

### Verification & Validation
- Verified layout and UI styles across light and dark modes.
- Checked that accordion state opens and closes correctly on click.
- Verified that API credentials persist properly in `localStorage`.
- Verified that dynamic request-specific headers are successfully parsed and applied on the backend, enabling the use of OpenAI-compatible APIs (like DeepSeek, Kimi, local LLMs) for vision/OCR conversions.

---

## [2026-06-12] Phase 14: Ultra-Premium Modern SaaS UI Redesign — Implemented
### Summary
Completed the visual overhaul of the Markdown Converter web app, transforming it into an ultra-premium modern SaaS application. The styling is now glassmorphic, responsive, utilizing premium typography, floating ambient glow elements, and dynamic micro-animations.

### Detailed Actions
1. **Google Fonts Typography**: Linked Inter (sans-serif UI) and Fira Code (monospace editor) from Google Fonts for a clean, premium visual aesthetic.
2. **Ambient Glow**: Implemented container with dynamic, floating ambient glow orbs animating behind the main content.
3. **Sticky Glass Header**: Created a floating navbar container with back blur (`backdrop-filter`) and smooth theme switches.
4. **Hero Section**: Designed a grand hero intro area with high-impact title gradients, a localized sub-heading description, and a subtle GitHub badge attributing the engine to `microsoft/markitdown`.
5. **Interactive Controls Overhaul**: Redesigned drop zone card actions, tab indicators, conversion list outputs, preview splits, and result toolbar tools using glassmorphic layers, gradients, and hover transitions.
  6. **Dynamic Theme Styling**: Reconfigured all CSS theme variables to keep both dark and light versions looking visually flawless and consistent.
  7. **Mobile Responsiveness Optimization**: Refined stylesheet media queries at `@media (max-width: 768px)` and `@media (max-width: 480px)` to scale down hero elements, drop zone margins, and header layouts. Wrapped the "Converter" text in a responsive `<span class="logo-desc">` to gracefully hide it on small mobile viewports (preventing wrapping and overflow).
  8. **Footer Credit**: Added a footer container referencing "Made with love by alfajri" at the bottom of the page, linking to `https://alfajri.my.id/`. Styled it to integrate perfectly with the premium dark/light layout.

### Verification & Validation
- Ran specific unit tests (`pytest tests/`): 29/29 tests passed.
- Started local server and verified layouts via browser agent tests.
- Performed dedicated mobile responsiveness reviews using viewport emulation (375x812), capturing screenshots verifying elements align properly without horizontal scrollbars, and ensuring the interface is fully mobile-friendly.
- Reviewed dark & light mode visual captures: both display exceptional typography alignment, high-fidelity responsive elements, and clean animations.

---

## [2026-06-12] Phase 13: SEO & AI Optimization (AIO) — Implemented
### Summary
Implemented comprehensive search engine optimization (SEO) and artificial intelligence optimization (AIO) to ensure that `Markdown Converter` is indexed correctly by search engines and understood accurately by AI crawlers/LLMs.

### Detailed Actions
1. **Head SEO & Social Preview Tags**: Added detailed description, keywords, canonical URLs, Open Graph (OG), and Twitter Cards meta tags to `frontend/index.html`.
2. **Semantics (JSON-LD)**: Added Schema.org scripts for `WebApplication`, `FAQPage`, and `BreadcrumbList` to increase eligibility for Rich Snippets and structured AI answers.
3. **Crawler Directives**: Added `robots.txt`, `sitemap.xml`, `llms.txt`, and `ai.txt` files inside the `frontend/` directory.
4. **FastAPI Root Route Mounts**: Configured the backend `backend/app.py` to serve:
   - `GET /robots.txt`
   - `GET /sitemap.xml`
   - `GET /llms.txt`
   - `GET /ai.txt`
5. **Localization Sync**: Linked the frontend language selector (`js/app.js`) to dynamically update `<html lang="...">` depending on user choice (`en`, `id`, `ja`, `ar`, `zh-CN`).
6. **Visual Preview Assets**: Generated customized favicon (`favicon.png`, `icon-180.png`) and social media preview card (`og-banner.png`), placing them under `frontend/img/`.

### Verification & Validation
- Ran the pytest test suite: All 29 tests passed (updated branding assertions in `tests/test_api.py`).
- Launched the local Uvicorn server and performed browser agent tests:
  - Confirmed the page title updates properly.
  - Validated that changing the language updates the dynamic HTML `lang` attribute.
  - Confived `/robots.txt`, `/sitemap.xml`, `/llms.txt`, and `/ai.txt` return 200 OK with correct headers and text payloads.

---

## [2026-06-11] Phase 12: Rebranding & Attribution — Implemented
### Summary
Rebranded the entire application from "MarkItDown Web App Converter" to "Markdown Converter" across all code files, directories, docker-compose, and API Swagger configs. Added appropriate attribution linking back to Microsoft MarkItDown.

### Detailed Actions
1. **Frontend Rebranding**:
   - Updated main elements in `frontend/index.html` (title, h1 header).
   - Added a sub-header explicitly stating `Powered by microsoft/markitdown` referencing the GitHub source repo.
   - Updated all translations inside `frontend/js/i18n.js` to correctly display the title.
2. **Backend Config Rebranding**:
   - Modified FastAPI instance declaration in `backend/app.py` to use `title="Markdown Converter"`.
3. **DevOps & Documentation**:
   - Renamed references in `docker-compose.yml`, `render.yaml`, `README.md`, and all `docs/*.md` files.
