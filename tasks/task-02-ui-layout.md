# Task: task/02 — Base UI/Layout

**Author:** ORCH
**Date:** 2025-07-17
**Status:** READY
**Assigned to:** UI-UX
**Branch:** task/02-ui-layout
**Depends on:** task/01 (ADR merged to main)
**Priority:** P0

---

## Context (Read First)

The Scientific Calculator ADR has been approved. The app is a vanilla HTML/CSS/JS single-page application with zero build step. The UI must be responsive (320px–1920px), keyboard-accessible with ARIA labels, and support a button grid for scientific operations. The ADR defines the file structure: `src/index.html` for markup and `src/style.css` for all styles. No JS files are in scope for this task.

## Files to Read
- `adr/01-tech-stack.md` — Sections 2.1 (Tech Stack), 2.2 (File Structure), 2.4 (Context-Window Safety, Rules 3 & 5)
- `specs/prd.md` — Sections 4 (FR-01, FR-04, FR-05, FR-06, FR-12), 5 (NFR-02, NFR-04), 6 (Out of Scope)

## Cross-Module Context (Injected by ORCH)

**HTML Structure Requirements (from PRD + ADR):**
- A display area showing the current expression and computed result (FR-01)
- A button grid containing: digits 0-9, operators + - * /, parentheses ( ), decimal ., clear C, backspace ⌫, ± toggle, and scientific functions: √ sin cos tan log ln x^y n! π e
- All buttons must have ARIA labels (NFR-02) and be at least 44×44px touch targets (NFR-04)
- The HTML must be semantic and self-contained; no inline JS or CSS

**CSS Requirements (from ADR):**
- Use CSS custom properties for theming (colors, spacing, font sizes)
- Use Flexbox and/or Grid for the button layout
- Responsive: works at 320px width up to 1920px
- Split CSS into logical sections via comments (per ADR file-size budget: ~300 lines max)

**What UI-UX Must NOT Do:**
- Write any JavaScript
- Create dark/light mode toggle (out of scope per PRD §6)
- Add animation or transition effects beyond what's needed for usability
- Exceed 300 lines in style.css

## Scope of Work
1. Create `src/index.html` with semantic markup: a display region (expression + result) and a button grid with all required controls.
2. Create `src/style.css` with custom properties, responsive grid layout, ARIA-compatible styling, and sectioned comments.
3. Ensure the layout is functional at 320px (mobile) and scales gracefully to desktop.

## Out of Scope
- JavaScript interactivity (belongs to ENG tasks 03–05)
- Design specs or wireframes (no separate design/ directory deliverable required)
- Icons or images (use Unicode characters: √, ⌫, π, ±)
- Theme switching

## Definition of Done
- [ ] `src/index.html` created with complete button grid and display area
- [ ] `src/style.css` created with custom properties, responsive layout, sectioned comments
- [ ] All buttons have `aria-label` attributes
- [ ] Button touch targets are ≥44×44px
- [ ] Layout renders correctly at 320px viewport width
- [ ] File committed with message: `[UI-UX] feat: base UI layout for scientific calculator`

## Output Artifacts
- `src/index.html` — Static markup shell (~80 lines max per ADR budget)
- `src/style.css` — All visual rules (~300 lines max per ADR budget)

## Handoff
- **Reviewed by:** ORCH
- **Next consumer:** ENG (for task/03: Core Math Engine — needs to know DOM element IDs/classes from index.html)
- **After completion:** Commit, push branch, notify human to switch to ORCH session.
