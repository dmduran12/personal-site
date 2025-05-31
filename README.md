# Personal Site

This repo contains a React/Vite project that plays a Vimeo video and renders it as real-time ASCII art. Follow these steps to run it locally.

## Prerequisites
- [Node.js](https://nodejs.org/) 18+
- [pnpm](https://pnpm.io/) package manager

## Setup
1. Copy `.env.example` to `.env` and fill in your `VIMEO_TOKEN` and `VITE_VIMEO_RIP_URL`.
2. Install dependencies:
   ```bash
   pnpm install
   ```
3. Start the dev server:
   ```bash
   pnpm dev
   ```
   The app will be available at `http://localhost:5173`.

## Codespaces
For development inside GitHub Codespaces, run the helper script:

```bash
./scripts/start.sh
```
This installs dependencies and starts the dev server automatically.

## Building for Production
```bash
pnpm run build
```
The static files will be in the `dist/` directory.

## Deployment
A GitHub Action in `.github/workflows/deploy.yml` builds the project when you push changes.

## Notes
- The ASCII worker implements a simple shader pipeline for real-time rendering.
