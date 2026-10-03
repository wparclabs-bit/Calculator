# Task: task/05 — Error Handling & Bootstrap

**Author:** ORCH
**Date:** 2025-07-17
**Status:** READY
**Assigned to:** ENG
**Branch:** task/05-error-handling-bootstrap
**Depends on:** task/04 (UI Binding & Events — CalcUI and CalcEvents must exist)
**Priority:** P0

---

## Context (Read First)

The calculator's core engine, UI binding, and event handling are complete (Tasks 03–04). This task adds robust error handling and the bootstrap glue that wires everything together. Error messages must be user-friendly (PRD FR-09, FR-10, FR-11), and `app.js` must initialize modules in the correct order to avoid runtime failures.

## Files to Read
- `adr/01-tech-stack.md` — Sections 2.2 (File Structure, line budgets), 2.3 (Design Patterns)
- `src/js/errors.js` — (will be created by this task; no prior file)
- `src/js/state.js` — To understand CalcState public API
- `src/js/events.js` — To understand how evaluate is triggered and where errors are caught

## Cross-Module Context (Injected by ORCH)

**Error Requirements (from PRD):**
- FR-09: Division by zero → `"Cannot divide by zero"`
- FR-10: Invalid expression (unmatched parentheses, bad syntax) → user-friendly message
- FR-11: Domain errors (√ of negative, log of non-positive) → appropriate message
- FR-08: Precision — up to 10 decimal places, trailing zeros trimmed

**Error Flow:**
1. `events.js` calls `CalcParser.parse(expression)` → if null, set syntax error via `CalcState.setError(msg)`
2. If parse succeeds, `CalcEvaluator.evaluate(ast)` → if throws, catch and set domain/syntax error via `CalcState.setError(msg)`
3. `ui.js` subscribes to `'error'` and renders the error message in the display
4. `CalcState.clear()` resets expression, result, and error

**Bootstrap Order (critical — from ADR):**
Modules must be initialized in dependency order:
1. `constants.js` — no dependencies, loads first
2. `state.js` — depends on constants (for precision), loads second
3. `parser.js` — depends on constants (for operator/function lists), loads third
4. `evaluator.js` — depends on constants, loads fourth
5. `ui.js` — depends on state (for Pub/Sub), loads fifth
6. `events.js` — depends on state, parser, evaluator, ui, loads sixth
7. `errors.js` — standalone error utilities, loads seventh
8. `app.js` — wires everything, fires on DOMContentLoaded, loads last

**HTML Script Loading Order (from ADR app.js pattern):**
```html
<script src="js/constants.js"></script>
<script src="js/state.js"></script>
<script src="js/parser.js"></script>
<script src="js/evaluator.js"></script>
<script src="js/ui.js"></script>
<script src="js/events.js"></script>
<script src="js/errors.js"></script>
<script src="js/app.js"></script>
```

**Error Message Factory (from ADR errors.js pattern):**
```js
const CalcErrors = (() => {
  return {
    divisionByZero() { return 'Cannot divide by zero'; },
    syntaxError(msg) { return `Syntax error: ${msg}`; },
    domainError(func, val) { return `Domain error: ${func}(${val}) is undefined`; },
    // ... other error factories
  };
})();
```

## Scope of Work

### 1. `src/js/errors.js` (~60 lines)
- Error message factory functions: `divisionByZero()`, `syntaxError(msg)`, `domainError(func, val)`, `invalidExpression(msg)`
- Domain-check helpers: `isDivisionByZero(dividend, divisor)`, `isValidSqrtArg(val)`, `isValidLogArg(val)`
- Export via IIFE as `CalcErrors`

### 2. `src/js/app.js` (~30 lines)
- Ensure DOM is ready (DOMContentLoaded event)
- Call `CalcEvents.init()` to attach listeners
- No other initialization logic — keep it minimal

### 3. Update `src/index.html`
- Add `<script>` tags in the correct bootstrap order (as shown above)
- Ensure scripts are loaded at the end of `<body>`

## Out of Scope
- Changing UI layout or styles
- Adding new mathematical functions
- Writing tests (belongs to QA)
- Setting up CI/CD (belongs to OPS)

## Definition of Done
- [ ] `src/js/errors.js` created with error factories and domain-check helpers
- [ ] `src/js/app.js` created with DOMContentLoaded bootstrap
- [ ] `src/index.html` updated with script tags in correct bootstrap order
- [ ] Division by zero displays "Cannot divide by zero"
- [ ] Invalid expressions display a user-friendly syntax error
- [ ] Domain errors (√ of negative, log of non-positive) display appropriate messages
- [ ] Calculator initializes correctly with no console errors
- [ ] File committed with message: `[ENG] feat: error handling and application bootstrap`

## Output Artifacts
- `src/js/errors.js` — Error factory module (~60 lines)
- `src/js/app.js` — Bootstrap glue module (~30 lines)
- `src/index.html` — Updated with script tags in correct order

## Handoff
- **Reviewed by:** ORCH
- **Next consumer:** QA (for task/06: Test Suite — needs the complete running application to test against)
- **After completion:** Commit, push branch, notify human to switch to ORCH session.
