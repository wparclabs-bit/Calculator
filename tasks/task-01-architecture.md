# Task: task/01 — Architecture Decision Record (Tech Stack)

**Author:** ORCH
**Date:** 2025-07-17
**Status:** IN_PROGRESS
**Assigned to:** ARCH
**Branch:** task/01-architecture
**Depends on:** none
**Priority:** P0

---

## Context (Read First)
The PRD for the Scientific Calculator has been approved by the Human PMO. The project is transitioning from the PLANNING phase to the DESIGN phase. Before any code is written, the technical architecture must be defined so that future worker tasks (ENG, UI-UX) never exceed a 90k context window. This requires a highly modular codebase where each module is small, focused, and independently navigable.

## Files to Read
- `specs/prd.md` — Full file
- `AGENTS.md` — Full file (factory rules and directory structure)

## Scope of Work
Read `specs/prd.md` and produce `adr/01-tech-stack.md`. The architecture MUST be designed so that future worker tasks (ENG, UI-UX) never exceed a 90k context window. This means the codebase must be highly modular.

Specifically, the ADR must address:
1. **Tech Stack Selection:** Confirm vanilla HTML/CSS/JS (no frameworks, no build tools) per PRD constraints.
2. **File Structure:** Define the directory layout under `src/` that supports modularity — e.g., separate modules for expression parsing, UI rendering, event handling, and error management.
3. **Core Design Patterns:** Recommend patterns that keep each file small and focused (e.g., Module Pattern, Observer for UI updates, Strategy for expression evaluation).
4. **Context Window Safety:** Explicitly describe how the modular structure ensures no single task requires reading more than ~3 files, keeping context well under 90k tokens.
5. **Build & Delivery:** Confirm no build step is needed; the app runs by opening `index.html` directly in a browser.

## Out of Scope
- Writing any source code.
- Creating UI wireframes or design specs.
- Defining test strategies (that belongs to QA).
- Setting up CI/CD (that belongs to OPS).

## Definition of Done
- [ ] `adr/01-tech-stack.md` is written with all sections above addressed.
- [ ] File is committed with message: `[ARCH] docs: add ADR for tech stack and architecture`
- [ ] Branch is pushed to remote.

## Output Artifacts
- `adr/01-tech-stack.md` — Architecture Decision Record covering tech stack, file structure, design patterns, and context-window safety strategy.

## Handoff
- **Reviewed by:** ORCH
- **Next consumer:** ORCH (for review and WBS decomposition)
- **After completion:** Commit, push branch, notify human to switch to ORCH session.
