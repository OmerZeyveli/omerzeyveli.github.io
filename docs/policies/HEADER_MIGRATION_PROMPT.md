# Batch Header Migration Prompt

Objective:
Apply mandatory 3-line explanatory headers to eligible source files in one requested folder batch.

Eligibility:

- Include extensions: `.astro`, `.html`, `.ts`, `.tsx`, `.js`, `.jsx`, `.mjs`, `.cjs`, `.css`, `.py`, `.sh`
- Exclude extensions: `.md`, `.mdx`, `.json`
- Exclude paths: build artifacts and generated files

JSON handling:

- Do not add in-file headers to pure `.json` files.
- When a touched pure JSON file needs header coverage, create or update a same-folder sidecar named `<file>.comment.md`.
- Treat JSON sidecars as the required header-equivalent path under the root policy.

Hard constraints:

1. Preserve runtime behavior; do not modify logic/imports/exports.
2. Add header only when non-compliant; skip compliant files.
3. Process only the user-requested folder batch.

Header placement and syntax:

- `.html`: first 3 lines must be `<!-- ... -->`
- `.astro`:
  - line 1 must be opening frontmatter delimiter `---`
  - lines 2-4 must be `// ...` header comments
  - keep/close frontmatter normally after header and existing script content
- `.ts`/`.tsx`/`.js`/`.jsx`/`.mjs`/`.cjs`/`.css`: first 3 lines must be `// ...` (or equivalent valid comment syntax)
- `.py`/`.sh`: first 3 lines must be `# ...`

Required report format:

- Modified files list
- Skipped (already compliant) list
- Skipped (excluded) list
- Errors list with reason
- Summary counts
