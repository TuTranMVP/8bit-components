```markdown
# 8bit-components Development Patterns

> Auto-generated skill from repository analysis

## Overview
The **8bit-components** repository is a React-based JavaScript component library focused on modular, design-driven UI elements. It emphasizes consistency between code, documentation, and design guidelines, using conventional commit messages and a clear workflow for adding, updating, and deploying components. The codebase is structured for maintainability, with a strong focus on CSS modularity and type safety.

## Coding Conventions

- **File Naming:**  
  Use `camelCase` for JavaScript and CSS files.  
  _Example:_  
  ```
  buttonGroup.js
  inputField.css
  ```

- **Import Style:**  
  Use relative imports for internal modules.  
  _Example:_  
  ```js
  import { Button } from './button';
  import styles from './buttonGroup.css';
  ```

- **Export Style:**  
  Prefer named exports for components and utilities.  
  _Example:_  
  ```js
  // button.js
  export const Button = ({ children, ...props }) => (
    <button {...props}>{children}</button>
  );
  ```

- **Commit Messages:**  
  Follow [Conventional Commits](https://www.conventionalcommits.org/) with prefixes like `feat` and `refactor`.  
  _Example:_  
  ```
  feat: add toggle switch component with accessibility support
  refactor: simplify button group logic and improve test coverage
  ```

## Workflows

### Add or Update Component
**Trigger:** When introducing a new component or making significant changes to an existing one  
**Command:** `/new-component`

1. Implement or update component styles and logic in `components.css` (and sometimes `base.css` or `tokens.css`).
2. Update or create documentation for the component in `docs.js` and relevant docs pages.
3. Sync design guidelines and component details in `DESIGN.md` and `README.md`.
4. Update or extend type definitions in `index.d.ts` if needed.

_Example:_
```js
// components/button.js
export const Button = ({ children, ...props }) => (
  <button className="btn" {...props}>{children}</button>
);

// components.css
.btn {
  background: var(--primary-bg);
  color: var(--primary-text);
}
```

### Design Guideline Sync
**Trigger:** After a visual or behavioral change to a component or design token  
**Command:** `/sync-design-docs`

1. Update the relevant CSS files (`components.css`, `tokens.css`, `base.css`) to implement the change.
2. Update prose and guidelines in `DESIGN.md` and `README.md` to reflect the new behavior or design.
3. Update `docs.js` and relevant docs pages to match the new design or behavior.

_Example:_
```css
/* tokens.css */
:root {
  --primary-bg: #222;
  --primary-text: #fff;
}
```

### Package and Deploy Setup
**Trigger:** When updating distribution settings, adding deployment workflows, or changing package metadata  
**Command:** `/setup-deploy`

1. Update `package.json` with new metadata, exports, or distribution rules.
2. Add or modify GitHub Actions workflows (e.g., `.github/workflows/ci.yml`, `pages.yml`) for CI/CD and deployment.
3. Update `.gitignore` and other root-level config files as needed.
4. Ensure documentation and demo files (`README.md`, `demo.html`, `docs.html`, `index.html`) are up to date.

_Example:_
```json
// package.json (snippet)
{
  "name": "8bit-components",
  "main": "dist/index.js",
  "types": "index.d.ts",
  "scripts": {
    "build": "webpack --config webpack.config.js",
    "test": "jest"
  }
}
```

## Testing Patterns

- **Test File Naming:**  
  Test files follow the `*.test.*` pattern, e.g., `button.test.js`.
- **Framework:**  
  The specific testing framework is not detected, but tests are colocated with components or in a `__tests__` directory.
- **Example:**  
  ```js
  // button.test.js
  import { render } from '@testing-library/react';
  import { Button } from './button';

  test('renders button with children', () => {
    const { getByText } = render(<Button>Click me</Button>);
    expect(getByText('Click me')).toBeInTheDocument();
  });
  ```

## Commands

| Command            | Purpose                                                      |
|--------------------|--------------------------------------------------------------|
| /new-component     | Add or update a UI component with full documentation         |
| /sync-design-docs  | Synchronize design guidelines, docs, and code after changes  |
| /setup-deploy      | Prepare package metadata and deployment workflows            |
```