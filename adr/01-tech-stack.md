# ADR-01: Tech Stack, File Structure, and Context-Window Safety

**Status:** PROPOSED
**Date:** 2025-07-17
**Author:** ARCH
**Supersedes:** None

---

## 1. Context

The Scientific Calculator is a lightweight, single-page application with zero external dependencies. The PRD mandates vanilla HTML/CSS/JS, no build tools, and offline operation. The project is constrained by a 90k-token context window for all future worker personas (ENG, QA, UI-UX). If the codebase is not structured modularly, any single task will require loading the entire codebase into context, causing context overflow and degraded output quality.

This ADR defines the tech stack, file structure, design patterns, and explicit context-window safety rules that every future task must obey.

---

## 2. Decision

### 2.1 Tech Stack

| Layer | Technology | Rationale |
|---|---|---|
| Markup | HTML5 (semantic elements) | No framework needed; native accessibility via ARIA |
| Styling | CSS3 (custom properties, Flexbox, Grid) | No preprocessor; variables enable theming without build step |
| Logic | Vanilla JavaScript (ES2020+) | No framework; strict module boundaries via IIFE/ESM pattern |
| Delivery | Direct `file://` or static server | No build step; open `index.html` in any modern browser |

**Explicitly excluded:** React, Vue, Svelte, Webpack, Vite, Babel, TypeScript, any CDN dependency.

### 2.2 File Structure

The source tree under `src/` is split into **independent, single-responsibility modules**. Each file is kept under ~200 lines to guarantee that any single task reads at most 3 files without exceeding context limits.

```
src/
├── index.html              ← Shell: meta tags, ARIA root, button grid markup
├── style.css               ← All styles: custom properties, layout, responsive rules
└── js/
    ├── app.js              ← Bootstrap: wires modules together, fires on DOMContentLoaded
    ├── state.js            ← State module: expression string, result, error, trig mode
    ├── parser.js           ← Expression parser: tokenizes and builds an AST
    ├── evaluator.js        ← Expression evaluator: computes AST to a numeric result
    ├── ui.js               ← UI module: renders expression/result, updates DOM
    ├── events.js           ← Event module: keyboard and click handlers (delegation)
    ├── errors.js           ← Error module: domain errors, syntax errors, formatting
    └── constants.js        ← Constants: operator symbols, function names, precision
```

**File-size budget per module (target):**

| Module | Max Lines | Responsibility |
|---|---|---|
| `index.html` | ~80 | Static markup only; no inline JS/CSS |
| `style.css` | ~300 | All visual rules; split into sections via comments |
| `constants.js` | ~30 | Literal values only; no logic |
| `state.js` | ~60 | State object + getter/setter |
| `parser.js` | ~120 | Tokenizer + recursive-descent parser |
| `evaluator.js` | ~100 | AST walker + numeric computation |
| `errors.js` | ~60 | Error message factory + domain-check helpers |
| `ui.js` | ~80 | DOM references + render functions |
| `events.js` | ~100 | Event delegation + keyboard map |
| `app.js` | ~30 | Initialization glue |

### 2.3 Core Design Patterns

#### Module Pattern (IIFE)

Every JS file uses an Immediately Invoked Function Expression to create a private scope. No global variables are leaked.

```js
// Example: state.js
const CalcState = (() => {
  let expression = '';
  let result = '';
  let error = null;

  return {
    get expression() { return expression; },
    set expression(val) { expression = val; },
    get result() { return result; },
    set result(val) { result = val; },
    get error() { return error; },
    setError(msg) { error = msg; },
    clear() { expression = ''; result = ''; error = null; }
  };
})();
```

#### Event Delegation

A single delegated listener on the button container handles all click events. Keyboard events are delegated on `document`. This eliminates per-button listeners and keeps `events.js` small.

```js
// events.js — single click listener on container
buttonContainer.addEventListener('click', (e) => {
  const btn = e.target.closest('button');
  if (!btn) return;
  const action = btn.dataset.action;
  handlers[action]?.();
});
```

#### Pub/Sub (Observer) for UI Updates

The `state` module publishes change events. The `ui` module subscribes and re-renders only the affected elements. This decouples state from DOM and ensures `ui.js` never needs to know about state internals.

```js
// state.js — publish on mutation
function notify(subscribers, key) {
  subscribers.get(key)?.forEach(fn => fn(state[key]));
}

// ui.js — subscribe to relevant keys
state.subscribe('expression', renderExpression);
state.subscribe('result', renderResult);
state.subscribe('error', renderError);
```

#### Strategy Pattern for Evaluation

The `evaluator.js` module accepts an AST and applies the Strategy pattern: each AST node type (Number, Operator, FunctionCall) has its own evaluation strategy. This makes `evaluator.js` self-contained and testable without importing parser internals.

### 2.4 Context-Window Safety Strategy

The modular structure above is the primary safety mechanism. The following **hard rules** apply to all future worker personas:

#### Rule 1: ENG Reads Only the Module Being Edited

When assigned a task to modify a specific feature, the ENG persona reads **only**:
1. The module file being edited (e.g., `src/js/evaluator.js`)
2. `src/js/constants.js` (if the module references constants)
3. `src/js/state.js` (if the module reads or writes state)

The ENG persona **must not** read `style.css`, `index.html`, or unrelated JS modules unless the task contract explicitly lists them.

#### Rule 2: ORCH Injects Context Into Task Contracts

When ORCH creates a task contract in `tasks/`, it must summarize any cross-module context into the task file itself. The task contract becomes the single source of truth for what the ENG persona needs to know. No task should require the ENG persona to read more than 3 source files.

#### Rule 3: UI-UX Reads Only Design + One Module

The UI-UX persona reads:
1. The design spec (from `design/`)
2. `src/style.css` (to understand current styling)
3. `src/index.html` (to understand markup structure)

UI-UX **must not** read any `src/js/` files unless the task contract explicitly requires it.

#### Rule 4: QA Reads Only Test Targets

The QA persona reads:
1. The test suite file being written/modified
2. The source module under test
3. `src/js/constants.js` (for expected values)

#### Rule 5: Maximum File Count Per Task

No single task contract shall require a worker persona to read more than **3 source files** from `src/`. If a task inherently requires more context, ORCH must summarize the additional context **into the task file** before assignment.

#### Rule 6: No Cross-Module Imports

Modules communicate exclusively through the public API of other modules (e.g., `CalcState.expression`, `CalcUI.render()`). There are no `import` statements, no shared mutable globals, and no circular dependencies. This ensures that reading one module never requires reading another to understand its behavior.

---

## 3. Consequences

### Positive

- **Context safety:** Each module is small enough (~30–120 lines) that any task requires reading at most 3 files, keeping context well under 90k tokens.
- **Navigability:** Future ENG and QA workers can locate the exact file they need without scanning unrelated code.
- **Testability:** Each module has a single responsibility and a clean public API, making unit testing straightforward.
- **Zero build overhead:** No build step means ENG can iterate by simply opening `index.html` in a browser.
- **Predictable file sizes:** The budget table ensures no module grows beyond its intended scope without a deliberate ADR update.

### Negative

- **More files to manage:** 10 source files instead of 1 or 3 requires careful naming and documentation to avoid confusion.
- **Initialization ordering:** `app.js` must wire modules in the correct order; a mistake here causes runtime failures that are harder to debug than in a monolithic script.
- **No build-time checks:** Without a linter or bundler, there is no automated enforcement of the "no cross-module imports" rule — it relies on discipline and ORCH review.

### Trade-offs Accepted

| Trade-off | Reason |
|---|---|
| More files, smaller context | Context overflow is a harder failure mode than file-count confusion |
| IIFE over ES modules | No build step; IIFEs work in all target browsers without transpilation |
| Pub/Sub over direct calls | Decouples state from UI; slight indirection is worth the modularity gain |
| No linter/bundler | Zero dependencies aligns with PRD constraint NFR-05 (file size < 50KB gzipped) |

---

## 4. References

- `specs/prd.md` — Product Requirements Document
- `AGENTS.md` — Factory Rules of Engagement
- `tasks/task-01-architecture.md` — Task contract for this ADR

---

## Handoff

- **Reviewed by:** ORCH (Orchestrator persona)
- **Next consumer:** ORCH — for review, approval, and WBS decomposition into task contracts
- **Next action:** ORCH reads this ADR and produces task contracts in `tasks/` for ENG and UI-UX workstreams
- **File to read next:** `tasks/` directory (produced by ORCH)
