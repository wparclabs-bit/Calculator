# Task: task/04 — UI Binding & Events

**Author:** ORCH
**Date:** 2025-07-17
**Status:** READY
**Assigned to:** ENG
**Branch:** task/04-ui-binding-events
**Depends on:** task/03 (Core Math Engine — CalcState, CalcParser, CalcEvaluator must exist)
**Priority:** P0

---

## Context (Read First)

The core math engine (Task 03) provides `CalcState` (state + Pub/Sub), `CalcParser` (expression → AST), and `CalcEvaluator` (AST → number). This task wires the UI to the engine: rendering state changes into the DOM and handling user input (clicks + keyboard). The ADR mandates event delegation (single listener on container) and Pub/Sub-driven re-renders.

## Files to Read
- `adr/01-tech-stack.md` — Sections 2.3 (Event Delegation, Pub/Sub patterns), 2.4 (Context-Window Safety, Rules 1 & 2)
- `src/js/state.js` — To understand CalcState public API (subscribe, notify, getters/setters)
- `src/index.html` — To know DOM element IDs for display and button container

## Cross-Module Context (Injected by ORCH)

**DOM Structure (from Task 02 index.html):**
```html
<!-- Display area -->
<div class="calculator">
  <div class="display">
    <div class="expression" id="expression-display"></div>
    <div class="result" id="result-display"></div>
  </div>
  <!-- Button grid -->
  <div class="button-grid" id="button-container">
    <!-- Buttons with data-action attributes, e.g.: -->
    <button data-action="digit" data-value="7">7</button>
    <button data-action="operator" data-value="+">+</button>
    <button data-action="function" data-value="sin">sin</button>
    <button data-action="clear">C</button>
    <button data-action="backspace">⌫</button>
    <!-- ... all other buttons ... -->
  </div>
</div>
```

**CalcState API (from merged `src/js/state.js`):**
```js
// Getters
CalcState.expression   // string — current expression
CalcState.result       // string — last computed result
CalcState.error        // string | null — error message or null

// Setters (all notify subscribers)
CalcState.setExpression(val: string)
CalcState.setResult(val: string)
CalcState.setError(msg: string | null)
CalcState.clear()        // resets expression, result, error; notifies all

// Pub/Sub
CalcState.subscribe(key: 'expression' | 'result' | 'error', fn: (value) => void)
CalcState.notify(key: 'expression' | 'result' | 'error')  // internal; notifies subscribers
```

**CalcParser API (from merged `src/js/parser.js`):**
```js
CalcParser.parse(expression: string): Object | null
// Returns AST node or null if expression is empty/whitespace.
// AST node types:
//   { type: 'Number', value: number }
//   { type: 'Operator', op: '+'|'-'|'*'|'/'|'^', left: AST, right: AST }
//   { type: 'FunctionCall', name: 'sqrt'|'sin'|'cos'|'tan'|'log'|'ln', arg: AST }
//   { type: 'UnaryOperator', op: '-'|'+', arg: AST }
// Throws Error on syntax errors (unknown identifier, unexpected character, unmatched paren).
```

**CalcEvaluator API (from merged `src/js/evaluator.js`):**
```js
CalcEvaluator.evaluate(node: Object | null): number
// Accepts AST node from CalcParser; returns rounded number (10 decimal precision).
// Throws Error on:
//   - Division by zero: "Cannot divide by zero"
//   - Domain errors: "Cannot take square root of a negative number",
//                    "Cannot take logarithm of a non-positive number"
//   - Unknown node type: "Unknown AST node type: <type>"
//   - Unsupported operator/function: "Unsupported operator/function: <name>"
```

**CalcConstants API (from merged `src/js/constants.js`):**
```js
CalcConstants.OPERATORS      // string[] — ['+', '-', '*', '/', '^']
CalcConstants.FUNCTIONS      // string[] — ['sqrt', 'sin', 'cos', 'tan', 'log', 'ln']
CalcConstants.CONSTANTS      // string[] — ['pi', 'e']
CalcConstants.DIGITS         // string[] — ['0'..'9']
CalcConstants.PRECISION      // number — 10
CalcConstants.getValue(name: string): number  // returns Math.PI for 'pi', Math.E for 'e', 0 otherwise
```

**Event Delegation Pattern (from ADR):**
```js
// Single listener on container — no per-button listeners
buttonContainer.addEventListener('click', (e) => {
  const btn = e.target.closest('button');
  if (!btn) return;
  const action = btn.dataset.action;
  const value = btn.dataset.value;
  handlers[action]?.(value);
});
```

**Keyboard Map (from PRD FR-07):**
| Key | Action |
|---|---|
| 0-9 | Append digit |
| + - * / | Append operator |
| ( ) | Append parenthesis |
| . | Append decimal |
| Enter | Evaluate expression |
| Escape | Clear |
| Backspace | Delete last character |

**Precision Rule (from PRD FR-08):**
- Format result: `Number(result.toFixed(10)).toString()` to trim trailing zeros

## Scope of Work

### 1. `src/js/ui.js` (~80 lines)
- Reference DOM elements by ID (`expression-display`, `result-display`)
- Subscribe to CalcState changes: `'expression'`, `'result'`, `'error'`
- Render functions: `renderExpression()`, `renderResult()`, `renderError()`
- Clear display elements on `CalcState.clear()`
- Export via IIFE as `CalcUI`

### 2. `src/js/events.js` (~100 lines)
- Define handler map: `{ digit, operator, function, clear, backspace, evaluate, decimal, toggle-sign }`
- Implement click delegation on `#button-container`
- Implement keyboard delegation on `document`
- Each handler updates `CalcState` appropriately (e.g., `digit` appends to expression, `evaluate` parses + evaluates + sets result)
- Export via IIFE as `CalcEvents` with `init()` function

## Out of Scope
- Error message formatting (belongs to task/05 — errors.js)
- Bootstrap/initialization ordering (belongs to task/05 — app.js)
- Styling changes (belongs to UI-UX)
- Factorial and x^y handlers (deferred)

## Definition of Done
- [ ] `src/js/ui.js` created with DOM references and Pub/Sub render functions
- [ ] `src/js/events.js` created with click delegation and keyboard handlers
- [ ] Clicking buttons updates expression and computes results correctly
- [ ] Keyboard input (0-9, + - * /, ( ), Enter, Escape, Backspace) works
- [ ] Clear (C) resets expression, result, and error displays
- [ ] Backspace (⌫) removes last character from expression
- [ ] All modules use IIFE pattern; no global variable leakage
- [ ] No cross-module imports between JS files
- [ ] File committed with message: `[ENG] feat: UI binding and event handling`

## Output Artifacts
- `src/js/ui.js` — DOM rendering module (~80 lines)
- `src/js/events.js` — Event delegation module (~100 lines)

## Handoff
- **Reviewed by:** ORCH
- **Next consumer:** ENG (for task/05: Error Handling & Bootstrap — needs CalcUI and CalcEvents APIs)
- **After completion:** Commit, push branch, notify human to switch to ORCH session.
