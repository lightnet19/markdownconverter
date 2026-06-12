# Design System (DESIGN.md)

This document describes the design tokens and layout components used in **Markdown Converter**.

## Visual Principles

Markdown Converter is designed with a premium, high-contrast dark theme (default) that transitions into a clean light theme. It emphasizes content focus, readable text, and dynamic feedback through animations.

---

## 1. Color Palette

The color system uses CSS custom variables to support smooth theme switching.

### Dark Theme (Default)
- **Background**: `#0f0f1a` (deep midnight blue)
- **Surface**: `#181829` (card backgrounds)
- **Border**: `rgba(255, 255, 255, 0.08)`
- **Text Primary**: `#f1f1f7`
- **Text Secondary**: `#a0a0b8`
- **Accent**: `#7c4dff` (neon violet)
- **Success**: `#00e676`
- **Error**: `#ff1744`

### Light Theme
- **Background**: `#f8f9fa` (clean off-white)
- **Surface**: `#ffffff` (white card backgrounds)
- **Border**: `rgba(0, 0, 0, 0.08)`
- **Text Primary**: `#1a1a24`
- **Text Secondary**: `#606070`
- **Accent**: `#6200ea` (deep violet)
- **Success**: `#00c853`
- **Error**: `#d50000`

---

## 2. Typography
- **Primary Font**: `Inter`, system-ui, -apple-system, sans-serif.
- **Monospace Font**: `Fira Code`, Consolas, Monaco, monospace (for markdown editor).
- **Line Heights**:
  - Headings: `1.3`
  - Body Text: `1.6`
  - Editor Code: `1.5`

---

## 3. UI Layout
- **App Container**: Centered layout with maximum width of `1200px`.
- **Drag-and-Drop Zone**: Highlighted border dashes that animate (`pulse`) when dragging.
- **Split Pane**: Horizontal flexbox dividing code input/output equally, scaling vertically to fit device viewports.
- **SEO Section**: Placed at the very bottom, separated by a light border, with styled collapsible accordion menus (`details`/`summary`) for FAQs.
