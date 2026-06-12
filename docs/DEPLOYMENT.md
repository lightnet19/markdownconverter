# Deployment Guide (DEPLOYMENT.md)

This document provides steps to deploy **Markdown Converter** on hosting platforms like Render or generic VPS environments.

## 1. Deploying on Render (Preferred)

Render is the target cloud hosting provider. The repository includes a `render.yaml` configuration file describing the blueprint.

### Configuration (`render.yaml`)
```yaml
services:
  - type: web
    name: markdown-converter
    env: python
    buildCommand: "pip install -r backend/requirements.txt"
    startCommand: "uvicorn backend.app:app --host 0.0.0.0 --port $PORT"
    envVars:
      - key: PYTHON_VERSION
        value: 3.10.0
```

### Steps to Deploy:
1. Connect your GitHub repository to Render.
2. Render will automatically detect the `render.yaml` file.
3. Configure the custom domain name to **`markitdown.my.id`** in the Render settings.
4. Set up CNAME/A records on your DNS registrar pointing to Render's addresses.

---

## 2. Docker / Local Production Deployments

For self-hosting, use the provided Docker configuration.

### Steps:
1. Build the docker image:
   ```bash
   docker-compose build
   ```
2. Start the container:
   ```bash
   docker-compose up -d
   ```
3. The application will be accessible at `http://localhost:8000`.
