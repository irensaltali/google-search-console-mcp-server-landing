# Repository Guidelines

## Project Structure & Module Organization

This repository is a static Vite landing page for `google-search-console-mcp-server.irensaltali.com`.

- `index.html` contains the page structure, metadata, and primary content.
- `styles.css` contains the full visual system and responsive layout.
- `script.js` contains the small browser interaction for copying the MCPize command.
- `public/robots.txt` and `public/sitemap.xml` define crawler-facing SEO files copied into the build output.
- `package.json` defines the Vite scripts. There is no `src/` directory or test directory at present.

## Build, Test, and Development Commands

Use the npm workflow documented in `README.md` unless a change intentionally updates package-manager policy.

```bash
npm install
npm run dev
npm run build
npm run preview
```

- `npm run dev` starts Vite on `127.0.0.1` for local editing.
- `npm run build` creates the production `dist/` output.
- `npm run preview` serves the built site locally for final checks.

When working through Codex shell commands in this repo, follow the local RTK instruction and prefix shell commands with `rtk`.

## Coding Style & Naming Conventions

Use two-space indentation in HTML, CSS, and JavaScript, matching the existing files. Keep JavaScript as plain browser ESM; avoid adding frameworks for simple page interactions. Use descriptive kebab-case CSS class names such as `hero-actions`, `deploy-terminal`, and `section-kicker`. Reuse existing CSS custom properties in `:root` before introducing new colors or fonts.

## Testing Guidelines

There is no automated test runner configured. For changes, run `npm run build`, then use `npm run preview` to verify the rendered page manually. Check desktop and mobile widths, the copy button state, canonical metadata, and that `robots.txt` and `sitemap.xml` still point at the production domain.

## Commit & Pull Request Guidelines

The current Git history only shows `first commit`, so no detailed convention is established. Use short, imperative commit subjects, for example `Update landing page metadata` or `Refine mobile hero layout`.

Pull requests should include a concise summary, the verification performed, and screenshots for visual changes. Note any SEO-facing changes to title, description, canonical URL, `robots.txt`, or `sitemap.xml`.

## Security & Configuration Tips

Do not commit secrets, OAuth credentials, analytics tokens, or deployment keys. This landing page should only reference public URLs and public product copy.
