---
name: package-and-deploy-setup
description: Workflow command scaffold for package-and-deploy-setup in 8bit-components.
allowed_tools: ["Bash", "Read", "Write", "Grep", "Glob"]
---

# /package-and-deploy-setup

Use this workflow when working on **package-and-deploy-setup** in `8bit-components`.

## Goal

Prepares the package for distribution and sets up deployment workflows, ensuring correct packaging and CI/CD integration.

## Common Files

- `package.json`
- `.github/workflows/ci.yml`
- `.github/workflows/pages.yml`
- `.gitignore`
- `README.md`
- `demo.html`

## Suggested Sequence

1. Understand the current state and failure mode before editing.
2. Make the smallest coherent change that satisfies the workflow goal.
3. Run the most relevant verification for touched files.
4. Summarize what changed and what still needs review.

## Typical Commit Signals

- Update package.json with new metadata, exports, or distribution rules.
- Add or modify GitHub Actions workflows (e.g., ci.yml, pages.yml) for CI/CD and deployment.
- Update .gitignore and other root-level config files as needed.
- Ensure documentation and demo files (README.md, demo.html, docs.html, index.html) are up to date.

## Notes

- Treat this as a scaffold, not a hard-coded script.
- Update the command if the workflow evolves materially.