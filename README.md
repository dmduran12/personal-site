# Personal Site

This repo contains a React/Vite project that plays a Vimeo video and renders it as real-time ASCII art. Follow these steps to run it locally.

## Prerequisites
- [Node.js](https://nodejs.org/) 18+ (Corepack enabled)
- [pnpm](https://pnpm.io/) 8.9.0

## Setup
1. Copy `.env.example` to `.env` and fill in your `VIMEO_TOKEN` and `VITE_VIMEO_VIDEO_ID`.
2. Install dependencies:
   ```bash
   corepack pnpm install
   ```
3. Start the dev server:
   ```bash
   corepack pnpm dev
   ```
   The app will be available at `http://localhost:5173`.

## Codespaces
For development inside GitHub Codespaces, run the helper script. The repository
includes a devcontainer configuration that installs Node.js 18 and pnpm for you:

```bash
./scripts/start.sh
```
This script installs dependencies and starts the dev server automatically.

## Building for Production
```bash
corepack pnpm run build
```
The static files will be in the `dist/` directory.

## Deployment
A GitHub Action in `.github/workflows/deploy.yml` builds the project when you push changes.

## Notes
- The ASCII worker implements a simple shader pipeline for real-time rendering.
