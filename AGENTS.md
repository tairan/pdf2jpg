# Repository Guidelines

## Project Structure & Module Organization
This repository is a small browser-only Vite app for converting PDFs to JPGs locally. Keep application logic in `src/`:

- `src/main.js`: UI state, DOM events, and download flow
- `src/pdf-converter.js`: PDF.js rendering and stitch/split conversion logic
- `src/zip-builder.js`: ZIP packaging for multi-page downloads
- `src/style.css`: app styling
- `src/assets/`: bundled images used by Vite
- `public/`: static files served as-is, such as `favicon.svg`

Top-level config lives in `package.json`, `vite.config.js`, and `netlify.toml`.

## Build, Test, and Development Commands
- `npm install`: install dependencies
- `npm run dev`: start the local Vite dev server
- `npm run build`: create a production bundle in `dist/`
- `npm run preview`: serve the built app locally for a final smoke test

Run `npm run build` before opening a PR to catch bundling or import issues.

## Coding Style & Naming Conventions
Use ES modules, vanilla JavaScript, and 2-space indentation. Prefer small, single-purpose functions and keep browser-specific code explicit. Match the current naming patterns:

- `camelCase` for variables and functions like `convertPdfToJpegs`
- kebab-case for module filenames like `pdf-converter.js`
- `const` for DOM references and values that do not change

No formatter or linter is configured yet, so keep style consistent with existing files and avoid large unrelated refactors.

## Testing Guidelines
There is no automated test suite configured today. Validate changes with:

- `npm run dev` for interactive testing in the browser
- `npm run build` to verify the production bundle
- `npm run preview` for a quick post-build check

When changing conversion behavior, test both split-page ZIP export and stitched-image export with real multi-page PDFs.

## Commit & Pull Request Guidelines
Follow the existing Conventional Commit pattern from history, for example: `feat: add PDF stitch option` or `fix: handle empty file input`.

PRs should include:

- a short description of the user-facing change
- linked issue or context when applicable
- screenshots or GIFs for UI changes
- notes on manual test cases you ran

## Deployment & Configuration Notes
This project is configured for Netlify via `netlify.toml`. Keep processing client-side only; do not introduce server upload flows without explicitly documenting the privacy tradeoff in `README.md`.
