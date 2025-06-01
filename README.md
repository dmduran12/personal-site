# Personal Site

This repo contains a React/Vite project that plays a Vimeo video and renders it as real-time ASCII art. Follow these steps to run it locally.

## Prerequisites
- [Node.js](https://nodejs.org/) 18+ (Corepack enabled)
- [pnpm](https://pnpm.io/) 8.9.0

## Setup
1. Create a `.env` file in the project root with the following variables:

   ```bash
   VITE_VIMEO_TOKEN=<your-vimeo-token>
   VITE_VIMEO_VIDEO_ID=<your-video-id>
   ```

   You can quickly generate this file with:

   ```bash
   cat > .env <<'EOF'
   VITE_VIMEO_TOKEN=<your-vimeo-token>
   VITE_VIMEO_VIDEO_ID=<your-video-id>
   EOF
   ```

   A blank screen usually means the environment variables weren't configured
   correctly or the Vimeo request was blocked. Double-check your token and video
   ID.
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
For development inside GitHub Codespaces, run the helper script:

```bash
./scripts/start.sh
```
It installs dependencies and starts the dev server automatically.

## Building for Production
```bash
corepack pnpm run build
```
The static files will be in the `dist/` directory.

## Deployment
A GitHub Action in `.github/workflows/deploy.yml` builds the project when you push changes.

## Notes
- The ASCII worker implements a simple shader pipeline for real-time rendering.
- The shader now renders with a neon palette and a tighter 6x8 grid using a cryptic character set.

## Troubleshooting

### `node_modules/.ignored` warnings

If you installed packages with another package manager (like `npm` or `yarn`),
`pnpm` will warn about moving those modules to `node_modules/.ignored`. Remove
the existing `node_modules` folder and any `package-lock.json` or `yarn.lock`
files, then reinstall:

```bash
rm -rf node_modules package-lock.json yarn.lock
corepack pnpm install
```

### Video loads but ASCII output is missing

If `OffscreenCanvas` or `WebGL2` aren't available, the app automatically falls back to a slower Canvas 2D renderer. Ensure cross-origin video playback is allowed.
