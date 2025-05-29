# Personal Site

This repo contains a React/Vite project that plays a Vimeo video and renders it as real-time ASCII art. Follow these steps to run it locally.

## Prerequisites
- [Node.js](https://nodejs.org/) 18+
- [pnpm](https://pnpm.io/) package manager

## Setup
1. Copy `.env.example` to `.env` and fill in your `VIMEO_TOKEN` and `VIMEO_RIP_URL`.
2. Install dependencies:
   ```bash
   pnpm install
   ```
3. Start the dev server:
   ```bash
   pnpm dev
   ```
   The app will be available at `http://localhost:5173`.

## Building for Production
```bash
pnpm run build
```
The static files will be in the `dist/` directory.

## Deployment
A GitHub Action in `.github/workflows/deploy.yml` builds the project and uploads the bundle to your Webflow CDN bucket via `wrangler r2`.

## Notes
- This is a starter skeleton. The WebGL shader in `src/workers/asciiWorker.ts` still needs to be implemented.
- Update the Webflow embed script to point to your CDN.
