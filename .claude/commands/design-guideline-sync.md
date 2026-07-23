---
name: design-guideline-sync
description: Workflow command scaffold for design-guideline-sync in 8bit-components.
allowed_tools: ["Bash", "Read", "Write", "Grep", "Glob"]
---

# /design-guideline-sync

Use this workflow when working on **design-guideline-sync** in `8bit-components`.

## Goal

Ensures that design documentation, README, tokens, and code are in sync after a visual or behavioral change to components.

## Common Files

- `components.css`
- `tokens.css`
- `base.css`
- `DESIGN.md`
- `README.md`
- `docs.js`

## Suggested Sequence

1. Understand the current state and failure mode before editing.
2. Make the smallest coherent change that satisfies the workflow goal.
3. Run the most relevant verification for touched files.
4. Summarize what changed and what still needs review.

## Typical Commit Signals

- Update the relevant CSS files (components.css, tokens.css, base.css) to implement the change.
- Update prose and guidelines in DESIGN.md and README.md to reflect the new behavior or design.
- Update docs.js and relevant docs pages to match the new design or behavior.

## Notes

- Treat this as a scaffold, not a hard-coded script.
- Update the command if the workflow evolves materially.