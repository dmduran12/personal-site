# ASCII Portfolio Agent Guide

This file tracks progress and provides instructions for working on the repo.
It mirrors the blueprint provided in the project brief.

## Quick Start
- Install dependencies with `pnpm install`.
- `pnpm dev` starts the Vite dev server with HMR.
- `pnpm run build` builds the production bundle.

## Testing
There are currently no automated tests. Add `vitest` and `playwright` when ready.

## Feature Tags
| Feature tag | Files |
|-------------|-------|
| @ascii-core | src/* |
| @api        | pages/api/* |

## Style Guide
- Use Tailwind utilities; no inline styles.
- Shader uniforms should be camelCase.

## Progress Log
- Initialized Vite + React + Tailwind structure.
- Added API route for Vimeo files.
- Added deployment workflow skeleton.
- TODO: Implement WebGL shader logic in `asciiWorker.ts`.
