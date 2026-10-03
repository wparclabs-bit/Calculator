# Task: task/03a — Fix `parse` Function Name Collision in CalcParser

**Author:** ORCH
**Date:** 2025-07-17
**Status:** READY (BLOCKING)
**Assigned to:** ENG
**Branch:** task/03a-parser-parse-collision
**Depends on:** task/03 (Core Math Engine — merged)
**Priority:** P0 — BLOCKER: integration (task/05) and QA are halted until this is merged.
**Origin:** ORCH review of task/04, 2025-07-17. Defect originates in task/03 (`src/js/parser.js`), already on `main`.

---

## Context (Read First)

During the ORCH review of `task/04` it was confirmed — by static inspection AND a Node.js runtime reproduction — that `src/js/parser.js` contains **two `function parse` declarations in the same IIFE scope**:

- **Line 58** — `function parse(tokens)` — the internal token-list → AST builder.
- **Line 134** — `function parse(expression)` — the intended PUBLIC API (string → tokenize → AST).

Both declarations sit in the function scope of the `CalcParser` IIFE. JS function declarations are hoisted as a single binding, and the **later declaration (line 134) overwrites** the earlier one (line 58). Consequently:

1. `CalcParser.parse` (exported at line 139 `return { parse }`) is bound to the **internal** token-parsing function, not the public string-parsing function.
2. The internal `parse(tokens)` **no longer exists** under that name — its definition was clobbered.
3. Line 136 `return parse(tokenize(expression));` therefore self-invokes the public function with a **token array**. It immediately hits `expression.trim is not a function` because `trim` is not a method on an array.

**Runtime evidence (Node.js, against the exact `src/js/parser.js` on `main`):**
```
typeof CalcParser.parse  →  function
CalcParser.parse('2+2')  →  THROWN: expression.trim is not a function
```

**Impact:** Every evaluation through the real UI path (`events.js` `evaluate()` → `CalcParser.parse(expression)`) throws for **all** inputs. The calculator cannot compute any expression. This is a blocking integration defect carried into `main` from task/03 (the file is byte-identical on `main` and on the task/04 branch — task/04 did not modify `parser.js`).

## Files to Read
- `src/js/parser.js` — the only file to be changed.

## Scope of Work — MINIMAL, no refactoring

1. Rename the **internal** token-parsing function (currently `function parse(tokens)` at line 58) to **`parseTokens`**.
2. Update its **single internal call site** (currently line 136: `return parse(tokenize(expression));`) to call `parseTokens(tokenize(expression))`.
3. **Preserve the public API exactly:** `CalcParser.parse(expression)` must remain the exported function (the one at line 134, unchanged).
4. **Do NOT refactor** the parser. Do **NOT** change any grammar, tokenization, AST shape, precedence, or error messages. Do **NOT** touch `src/js/ui.js`, `src/js/events.js`, or any other file. This is a two-line rename (declaration + call site).

### After the rename the structure must be:
```js
function parseTokens(tokens) { ... }          // line 58, renamed; body unchanged
function parseExpression(ctx) { ... }          // unchanged
function parseTerm(ctx) { ... }                // unchanged
function parsePower(ctx) { ... }               // unchanged
function parseUnary(ctx) { ... }               // unchanged
function parsePrimary(ctx) { ... }             // unchanged
function parse(expression) {                   // line 134, UNCHANGED — the public API
  if (!expression || expression.trim() === '') return null;
  return parseTokens(tokenize(expression));    // line 136, now calls parseTokens
}
return { parse };                              // unchanged
```

## Out of Scope
- Any grammar change or new operator/function.
- Any UI / event / bootstrap work (that is task/05).
- Factorial implementation (still deferred; PRD FR-03 gap).
- x^y / `pow` UI handler (still deferred per task/04; PRD FR-03 partial gap — keyboard `^` and parser/evaluator `^` already work).

## Definition of Done
- [ ] Internal function renamed to `parseTokens`; exactly one call site updated (line 136).
- [ ] `CalcParser.parse('2+2')` returns the AST `{ type:'Operator', op:'+', left:{type:'Number',value:2}, right:{type:'Number',value:2} }` (no throw).
- [ ] Spot-check (manual or Node): `parse('sqrt(4)')` → `{type:'FunctionCall', name:'sqrt', ...}`; `parse('2^3')` → `{type:'Operator', op:'^', ...}`; `parse('')` → `null`.
- [ ] No other file modified; no grammar behavior change.
- [ ] File committed on branch `task/03a-parser-parse-collision` with message: `[ENG] fix: resolve parser function name collision`

## Output Artifacts
- `src/js/parser.js` — modified in place (2-line rename).

## Handoff
- **Reviewed by:** ORCH
- **Next consumer:** ORCH (merge), then ENG (task/05 — Error Handling & Bootstrap) and QA can resume.
- **After completion:** Commit, push branch, notify human to switch to ORCH session.