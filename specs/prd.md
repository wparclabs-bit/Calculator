# PRD: Scientific Calculator

**Author:** PM Persona
**Date:** 2025-07-17
**Status:** DRAFT
**Version:** 1.0

---

## 1. Problem Statement

Students, educators, and professionals frequently need a quick, reliable way to perform scientific calculations without installing heavy software or relying on an internet connection. Existing solutions are either bloated desktop applications, require account creation, or lack keyboard accessibility. This project delivers a lightweight, single-page scientific calculator that runs directly in any modern browser — no downloads, no dependencies, no friction.

## 2. Goal

Deliver a responsive, keyboard-accessible, single-page scientific calculator in vanilla HTML/CSS/JS that handles basic and scientific operations with robust error handling.

## 3. Users

| User Type | Description |
|---|---|
| Students | Need quick scientific calculations for homework and exams (where calculators are allowed but apps are not). |
| Educators | Want a clean, distraction-free tool for classroom demonstrations. |
| Professionals | Require on-the-fly calculations during meetings or fieldwork without installing software. |
| Casual Users | Anyone who needs a fast, no-signup calculator in their browser. |

## 4. Functional Requirements

| ID | Requirement | Priority |
|---|---|---|
| FR-01 | Display a numeric input field and a result area showing the current expression and computed result. | MUST |
| FR-02 | Support basic arithmetic: addition (+), subtraction (-), multiplication (*), division (/). | MUST |
| FR-03 | Support scientific functions: square root (√), sine (sin), cosine (cos), tangent (tan), logarithm base 10 (log), natural logarithm (ln), exponentiation (x^y), factorial (n!), π, and e. | MUST |
| FR-04 | Support parentheses for expression grouping: (, ). | MUST |
| FR-05 | Support a clear button (C) to reset the expression and result. | MUST |
| FR-06 | Support a backspace button (⌫) to remove the last character. | MUST |
| FR-07 | Support keyboard input: digits 0-9, operators + - * /, parentheses, Enter to evaluate, Escape to clear, Backspace to delete. | MUST |
| FR-08 | Display results with appropriate precision (up to 10 decimal places; trim trailing zeros). | SHOULD |
| FR-09 | Handle division by zero with a clear error message ("Cannot divide by zero"). | SHOULD |
| FR-10 | Handle invalid expressions (e.g., unmatched parentheses, invalid function syntax) with a user-friendly error message. | SHOULD |
| FR-11 | Handle domain errors for scientific functions (e.g., sqrt of negative number, log of non-positive number) with an appropriate error message. | SHOULD |
| FR-12 | Support a decimal point (.) for fractional input. | COULD |
| FR-13 | Support a positive/negative toggle (±) to quickly invert the sign of the current input. | COULD |

## 5. Non-Functional Requirements

| ID | Requirement | Target |
|---|---|---|
| NFR-01 | Performance | Expression evaluation must complete in under 100ms on a typical consumer device. |
| NFR-02 | Accessibility | Full keyboard navigation and ARIA labels on all buttons. Screen reader compatible. |
| NFR-03 | Compatibility | Works on Chrome, Firefox, Safari, and Edge (latest 2 versions). No polyfills required. |
| NFR-04 | Responsiveness | Layout adapts to screen widths from 320px (mobile) to 1920px (desktop). Touch-friendly button targets (minimum 44×44px). |
| NFR-05 | File Size | Total bundle (HTML + CSS + JS) under 50KB gzipped. |
| NFR-06 | Offline | Fully functional without network connectivity after initial load. |

## 6. Out of Scope

- **Graphing:** No function plotting or visual graph rendering.
- **Calculation History:** No persistent or session history of previous calculations.
- **Theme Toggles:** No dark/light mode switcher; a single clean design is delivered.
- **Backend / Database:** No server-side processing, user accounts, or data storage.
- **Unit Conversions:** No angle/unit conversion modes (degrees vs. radians handled via a fixed mode indicator).
- **Memory Functions:** No M+, M-, MR, MC memory operations.
- **Advanced Functions:** No hyperbolic functions, permutations/combinations, or complex number support.

## 7. Constraints

- **Tech Stack:** Vanilla HTML, CSS, and JavaScript only. No frameworks, no build tools, no external dependencies.
- **Single File (Optional):** The entire application may be delivered as a single `index.html` file with inline CSS and JS, or as three separate files (`index.html`, `style.css`, `script.js`) — architect's discretion.
- **No Build Step:** The project must run directly by opening `index.html` in a browser.
- **Trig Mode:** Default to radians; a visible indicator shows the current mode. Degree mode is out of scope for v1.

## 8. Acceptance Criteria (Definition of Done)

- [ ] All basic arithmetic operations (+, -, *, /) produce correct results.
- [ ] All scientific functions (√, sin, cos, tan, log, ln, x^y, n!, π, e) produce correct results.
- [ ] Keyboard input is fully functional: digits, operators, Enter, Escape, Backspace.
- [ ] Division by zero displays "Cannot divide by zero" error.
- [ ] Invalid expressions display a user-friendly error message.
- [ ] Domain errors (e.g., √-4, log(-1)) display an appropriate error message.
- [ ] Clear (C) and backspace (⌫) buttons work correctly.
- [ ] Layout is responsive and functional on viewports from 320px to 1920px.
- [ ] All buttons are keyboard-focusable and have ARIA labels.
- [ ] Application loads and functions offline with no network requests.
- [ ] Total file size is under 50KB gzipped.
- [ ] Code is committed with proper `[ENG]` prefix commit messages on a feature branch.

## 9. Handoff

- **Reviewed by:** ORCH (for feasibility and task decomposition), ARCH (for tech stack validation)
- **Consumed by:** ORCH (for WBS decomposition into task contracts)
- **Next action:** ORCH reads this PRD and produces task contracts in `tasks/`.
