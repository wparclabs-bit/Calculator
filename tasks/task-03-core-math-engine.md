# Task: task/03 — Core Math Engine

**Author:** ORCH
**Date:** 2025-07-17
**Status:** READY
**Assigned to:** ENG
**Branch:** task/03-core-math-engine
**Depends on:** task/02 (UI/Layout — src/index.html and src/style.css must exist)
**Priority:** P0

---

## Context (Read First)

The UI layout (Task 02) defines the button grid and display elements. This task builds the core computation engine: constants, state management, expression parsing, and AST evaluation. These four modules are the mathematical backbone of the calculator. They must follow the IIFE module pattern from the ADR, communicate only through public APIs, and never import other JS modules.

## Files to Read
- `adr/01-tech-stack.md` — Sections 2.2 (File Structure, line budgets), 2.3 (Design Patterns: IIFE, Pub/Sub, Strategy)
- `src/index.html` — To know the DOM element IDs/classes that state/ui modules will target
- `src/style.css` — To understand CSS custom properties (for potential JS-driven style updates)

## Cross-Module Context (Injected by ORCH)

**Public API Contract (from ADR):**

```js
// CalcState — state module public API
CalcState.expression   // getter: current expression string
CalcState.result       // getter: last computed result
CalcState.error        // getter: current error message or null
CalcState.setExpression(val)
CalcState.setResult(val)
CalcState.setError(msg)
CalcState.clear()
CalcState.subscribe(key, callback)  // Pub/Sub: callback fires on state change
CalcState.notify(key)               // internal: notify subscribers

// CalcConstants — constants module public API
CalcConstants.OPERATORS      // ['+', '-', '*', '/', '^']
CalcConstants.FUNCTIONS      // ['sqrt', 'sin', 'cos', 'tan', 'log', 'ln']
CalcConstants.CONSTANTS      // ['pi', 'e']
CalcConstants.DIGITS         // ['0','1','2','3','4','5','6','7','8','9']
CalcConstants.PRECISION      // 10 (max decimal places)
```

**Parser AST Node Types (from ADR):**
- `{ type: 'Number', value: number }`
- `{ type: 'Operator', op: string, left: ASTNode, right: ASTNode }`
- `{ type: 'FunctionCall', name: string, arg: ASTNode }`
- `{ type: 'UnaryOperator', op: string, arg: ASTNode }` (for negation)

**Evaluator Strategy Pattern (from ADR):**
- Each AST node type has its own evaluation strategy function
- `evaluate(node)` dispatches to the correct strategy
- No cross-module imports; evaluator receives a plain AST object

**State-Pub/Sub Flow (from ADR):**
- When expression changes → `CalcState.notify('expression')` → `CalcUI.renderExpression()`
- When result changes → `CalcState.notify('result')` → `CalcUI.renderResult()`
- When error changes → `CalcState.notify('error')` → `CalcUI.renderError()`

**Precision Rule (from PRD FR-08):**
- Results show up to 10 decimal places, trailing zeros trimmed
- Use: `Number(result.toFixed(10))` then convert to string

## Scope of Work

### 1. `src/js/constants.js` (~30 lines)
- Define all literal constants: operators, functions, digits, precision, symbol mappings
- Export via IIFE as `CalcConstants`

### 2. `src/js/state.js` (~60 lines)
- Manage expression, result, error, and trig mode (radians fixed for v1)
- Implement getter/setter pattern
- Implement Pub/Sub: `subscribe(key, fn)` and `notify(key)`
- Export via IIFE as `CalcState`

### 3. `src/js/parser.js` (~120 lines)
- Tokenizer: converts expression string into tokens (numbers, operators, functions, parentheses)
- Recursive-descent parser: builds AST from tokens
- Grammar supports: numbers, + - * / ^, parentheses, unary minus, functions (sqrt, sin, cos, tan, log, ln)
- Export via IIFE as `CalcParser` with `parse(expression) → AST | null`

### 4. `src/js/evaluator.js` (~100 lines)
- Accepts an AST node and returns a numeric result
- Strategy pattern: separate handler per node type (Number, Operator, FunctionCall, UnaryOperator)
- Handles π and e as numeric constants
- Throws descriptive errors for undefined operations
- Export via IIFE as `CalcEvaluator` with `evaluate(ast) → number`

## Out of Scope
- UI rendering (belongs to task/04)
- Event handling (belongs to task/04)
- Error message formatting (belongs to task/05)
- Keyboard input (belongs to task/04)
- Factorial, x^y with non-integer exponents (deferred to later tasks if needed)

## Definition of Done
- [ ] `src/js/constants.js` created with all required constants
- [ ] `src/js/state.js` created with state management and Pub/Sub
- [ ] `src/js/parser.js` created with tokenizer and recursive-descent parser
- [ ] `src/js/evaluator.js` created with strategy-pattern AST evaluation
- [ ] All modules use IIFE pattern; no global variable leakage
- [ ] No cross-module imports between JS files
- [ ] Parser correctly handles: `2+3`, `(2+3)*4`, `sin(π/2)`, `sqrt(16)`, `log(100)`
- [ ] Evaluator returns correct numeric results for all supported expressions
- [ ] File committed with message: `[ENG] feat: core math engine (constants, state, parser, evaluator)`

## Output Artifacts
- `src/js/constants.js` — Literal values module (~30 lines)
- `src/js/state.js` — State + Pub/Sub module (~60 lines)
- `src/js/parser.js` — Tokenizer + AST builder (~120 lines)
- `src/js/evaluator.js` — AST evaluator (~100 lines)

## Handoff
- **Reviewed by:** ORCH
- **Next consumer:** ENG (for task/04: UI Binding & Events — needs CalcState and CalcParser APIs)
- **After completion:** Commit, push branch, notify human to switch to ORCH session.
