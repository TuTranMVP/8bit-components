---
name: add-or-update-component
description: Workflow command scaffold for add-or-update-component in 8bit-components.
allowed_tools: ["Bash", "Read", "Write", "Grep", "Glob"]
---

# /add-or-update-component

Use this workflow when working on **add-or-update-component** in `8bit-components`.

## Goal

Adds a new UI component or updates an existing one, ensuring it follows design contracts and is documented in both code and docs.

## Common Files

- `components.css`
- `base.css`
- `tokens.css`
- `docs.js`
- `DESIGN.md`
- `README.md`

## Suggested Sequence

1. Understand the current state and failure mode before editing.
2. Make the smallest coherent change that satisfies the workflow goal.
3. Run the most relevant verification for touched files.
4. Summarize what changed and what still needs review.

## Typical Commit Signals

- Implement or update component styles and logic in components.css (and sometimes base.css or tokens.css).
- Update or create documentation for the component in docs.js and relevant docs pages.
- Sync design guidelines and component details in DESIGN.md and README.md.
- Update or extend type definitions in index.d.ts if needed.

## Notes

- Treat this as a scaffold, not a hard-coded script.
- Update the command if the workflow evolves materially.