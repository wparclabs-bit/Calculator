# Task: task/07 — Factorial (n!) Support

**Author:** ORCH
**Date:** 2026-10-03
**Status:** FINALIZED — **READY_FOR_PMO_AUTHORIZATION / READY_NOT_ACTIVATED.** Do not start until PMO explicitly authorizes (ENG is not yet authorized per FACTORY_STATE.md; no auto-start).
**Assigned to:** ENG
**Branch:** task/07-factorial-support
**Depends on:** task/06 (merged, ORCH merge commit `8351cd7`), task/03a (parser collision fix, merged), task/05 (error handling, merged)
**Priority:** P1 (closes the unimplemented `n!` half of PRD FR-03, a MUST requirement)

> **ORCH NOTATION CORRECTION (2026-10-03):** The earlier draft of this contract recommended function notation `fact(n)`. That recommendation is **RETRACTED**. The PRD SSOT phrase is `factorial (n!)` and the shipped UI control is labeled `n!`; the PRD never mentions `fact(n)`. Per the non-negotiable notation rule, **postfix `!` is the required user-facing behavior** and is the explicit acceptance target of this contract. `fact(n)` is **not** implemented here (it is not required by the PRD); if PMO later wants it, it is additive and a separate decision. This contract is the single source of truth for ENG.

---

## 1. Objective

Implement factorial support required by PRD FR-03 ("factorial (n!)") using the existing modular vanilla JS architecture. The `n!` button already exists in merged markup (`src/index.html:30`, `data-action="fact"`) but has **no handler**, and the engine has **no factorial support** (no `!` token, no postfix parser rule, no evaluator strategy). This task wires the button to insert `!` and adds postfix-factorial tokenization, parsing, and evaluation so that `=` parses and evaluates `n!`.

## 2. Assigned Persona

**ENG.** ORCH does not activate ENG in this step; this contract is finalized for a single PMO authorization decision.

## 3. Branch Name

`task/07-factorial-support` (cut only on activation; ENG works only on this branch).

## 4. Notation Decision

**Required notation: postfix `!` (primary and explicit acceptance target).**

Evidence:

| Source | Evidence |
|---|---|
| PRD FR-03 | `specs/prd.md:33` — "…exponentiation (x^y), **factorial (n!)**, π, and e." The SSOT phrase is `factorial (n!)` — postfix. The PRD contains **no** mention of `fact(n)` anywhere. |
| UI control | `src/index.html:30` — `<button class="btn btn--sci" data-action="fact" aria-label="Factorial">n!</button>`. Visible label is `n!` (postfix), aria-label is `Factorial`. |

Decision rationale: the PRD and the shipped UI both express factorial as postfix `n!`. The PRD does **not** state that `fact(n)` is required or acceptable, so per the non-negotiable rule, postfix `!` is the required user-facing behavior. `fact(n)` is **not** a substitute and is **not** implemented in this task. If postfix `!` requires tokenizer/parser changes, those changes **are in scope** for this task (they do — see §7).

## 5. Verified DOM Contract

Source of truth: verified against **merged `src/index.html`** on 2026-10-03 (main @ `4371df5`, working tree clean) — not against any prior task sketch.

- **Factorial button element** (line 30, verbatim):
  ```html
  <button class="btn btn--sci" data-action="fact" aria-label="Factorial">n!</button>
  ```
- **Visible label/text:** `n!`
- **aria-label:** `Factorial`
- **`data-action` value: `fact`** — verified present in the real file (not a stale sketch).
- **Surrounding scientific button pattern** (Row 2, `src/index.html:28–34`): `pow` (`x^y`), `fact` (`n!`), `pi` (`π`), `e` (`e`), `open-paren` (`(`), `close-paren` (`)`). All use `class="btn btn--sci"`. The factorial button is a normal grid button; it is routed by the existing delegated click listener, not by any per-button wiring.
- **Selector (reference only): `button[data-action="fact"]`** — the new code must NOT add a query for this or any other element. Routing already happens through the existing delegated click listener on `.buttons` (`index.html:18`) via `e.target.closest('button')` → `btn.dataset.action` (`events.js:71–75`). This task adds **zero new DOM queries and zero new event listeners**.
- **Display targets for acceptance checks only:** `#expression` (`index.html:13`), `#result` (`index.html:14`).

## 6. Verified Event Wiring Requirement

**`src/js/events.js` MUST be changed** (one handler entry + a JSDoc correction).

Why the existing function loop does **not** auto-wire `fact` for postfix:

- The generic function loop is `events.js:64`: `for (const name of CalcConstants.FUNCTIONS) handlers[name] = () => append(name + '(');`. It iterates `CalcConstants.FUNCTIONS` and inserts `name + '('` (function-call syntax).
- `'fact'` is **not** in `CalcConstants.FUNCTIONS` (`constants.js:15` = `['sqrt','sin','cos','tan','log','ln']`), so the loop does **not** create a `fact` handler today.
- Even if `'fact'` were added to `FUNCTIONS`, the loop would insert `fact(` (function-call notation), **not** `!` (postfix). That is the wrong behavior for this contract.

Therefore the button must insert the literal `!`, which requires a **minimal manual handler change**:

- Add exactly one entry to the `handlers` map (`events.js:52–61`): `'fact': () => append('!')`, routing through the existing private `append` (`events.js:15–17`).
- Update the now-stale handlers-map JSDoc (`events.js:48–51`): it currently reads `'pow' is wired below; 'fact' is intentionally absent (deferred)`. New fact: **both** `'pow'` and `'fact'` are wired; `'fact'` inserts `!`. Keep the comment within the same 4-line span so the line budget (§12) holds.

ENG must not have to discover this by reading the whole repo — this section is the complete event-wiring contract.

## 7. Verified Parser Requirement

Postfix `!` is **not** currently supported. Verified: the tokenizer has no `!` branch, so `!` falls through to `parser.js:47` and throws `Unexpected character: !`; there is no postfix rule anywhere in the recursive-descent structure. The required parser change is defined precisely below.

**Token type for `!`:** add a new token type to the `TOK` object (`parser.js:15–16`): `FACTORIAL: '!'`. (It is a **postfix unary operator**, not a binary operator — it is **not** added to `CalcConstants.OPERATORS`.)

**Where the tokenizer recognizes it:** add one branch in `tokenize` (`parser.js:23–51`), immediately after the binary-operator check (`parser.js:35`) and before the `(` check (`parser.js:36`):
```js
if (ch === '!') { tokens.push({ type: TOK.FACTORIAL }); i++; continue; }
```

**Postfix parser rule:** add a new private function `parsePostfix(ctx)` and wire it into `parseUnary`:
```js
function parsePostfix(ctx) {
  let node = parsePrimary(ctx);
  if (ctx.tokens[ctx.pos].type === TOK.FACTORIAL) {
    ctx.pos++;
    node = { type: 'Factorial', arg: node };
  }
  return node;
}
```
Change `parseUnary` (`parser.js:97–104`) so its final `return parsePrimary(ctx);` becomes `return parsePostfix(ctx);`. The rule is `postfix → primary '!'?` — **at most one** `!` (not `('!')*`), so `2!!` is a syntax error.

**Updated grammar** (only the `unary`/`postfix` levels change; everything else is unchanged):
```
expression → term (('+' | '-') term)*
term       → power (('*' | '/') power)*
power      → unary ('^' power)?
unary      → ('-' | '+')? postfix
postfix    → primary '!'?
primary    → NUMBER | FUNCTION '(' expression ')' | CONSTANT | '(' expression ')'
```

**Precedence (explicit, unambiguous):** `!` is a **postfix unary operator with the highest precedence** — it binds tighter than every other operator, including exponentiation `^`, unary minus, function calls, and parentheses.

| Relative to | Rule | Example |
|---|---|---|
| Parentheses | `!` applies to the result of a parenthesized group (it sits outside the parens) | `(3+2)!` = `5!` = 120 |
| Function calls | `!` applies to the result of a function call | `sqrt(4)!` = `2!` = 2 |
| Unary minus | `!` binds tighter than unary minus, so `-3!` = `-(3!)` | `-3!` = -6; `(-3)!` = domain error (negative) |
| Exponentiation `^` | `!` binds tighter than `^` | `2^3!` = `2^(3!)` = 64; `3!^2` = `(3!)^2` = 36 |
| Multiplication/division | `!` binds tighter than `*`/`/` | `2*3!` = `2*(3!)` = 12; `3!/2` = `(3!)/2` = 3 |
| Addition/subtraction | `!` binds tighter than `+`/`-` | `3! + 2` = 8; `2 + 3!` = 8 |

**Supported forms:** `5!`, `(3+2)!`, `3! + 2`, `2 + 3!`, `-3!` (= -6), `(-3)!` (domain error), `2^3!` (= 64), `3!^2` (= 36), `2*3!` (= 12), `3!/2` (= 3), `sqrt(4)!` (= 2).

**Malformed forms (all syntax errors via the existing parser error path):**
- `!5` → `Unexpected token: !` (`parsePrimary` sees a `FACTORIAL` token, not a valid primary — `parser.js:126`).
- `2!!` → `Unexpected token after expression` (the second `!` is left over — `parser.js:62–64`).
- `5 + !` (dangling `!`) → `Unexpected token: !`.

**`fact(n)` is NOT required**, so no function-call parsing change is needed. (The existing `FUNCTION '(' expression ')'` rule at `parser.js:110–118` is left untouched.)

## 8. Verified Evaluator Requirement

**`src/js/evaluator.js` MUST be changed** (one new strategy + one dispatch case).

Add a new private strategy `evalFactorial(node)` and a dispatch case `case 'Factorial': return evalFactorial(node);` in `evaluate` (`evaluator.js:99–110`). The new AST node is `{ type: 'Factorial', arg: ASTNode }`.

Evaluation behavior:
- `0!` = 1
- `1!` = 1
- Positive integer `n`: product `1 × 2 × … × n` (e.g. `5!` = 120, `6!` = 720).
- **Negative** number → domain error (see §10).
- **Non-integer** number → domain error (see §10).
- **Too-large input** (`n > 170`) → domain/overflow error, **not** `Infinity` (see §9).
- **Overflow behavior:** guarded at `n > 170` before the product is computed, so the result never becomes `Infinity`.
- **Return type/format:** consistent with the existing evaluator precision rules — apply the existing `round()` (`evaluator.js:18–20`, `PRECISION = 10`) to the result, exactly like every other strategy.

Reference implementation (ENG may use this verbatim; it matches the existing inline-error style):
```js
function evalFactorial(node) {
  const arg = evaluate(node.arg);
  if (arg < 0) throw new Error('Cannot take factorial of a negative number');
  if (!Number.isInteger(arg)) throw new Error('Cannot take factorial of a non-integer number');
  if (arg > 170) throw new Error('Factorial overflow: n must be ≤ 170');
  let result = 1;
  for (let i = 2; i <= arg; i++) result *= i;
  return round(result);
}
```

## 9. Default Numeric Limit

The PRD does **not** specify a maximum factorial input. ORCH adopts this safe default (recorded as an ORCH-defined safe default; ENG does not decide it):

- **Maximum input: 170.**
- `n > 170` produces an existing-style domain/overflow error (`Factorial overflow: n must be ≤ 170`), **not** `Infinity`.
- Non-integers produce an existing-style error (`Cannot take factorial of a non-integer number`).
- Negative integers produce an existing-style error (`Cannot take factorial of a negative number`).

Rationale: `170! ≈ 7.257415615311911e+306` is within `Number.MAX_VALUE` (`≈ 1.7976931348623157e+308`), but `171!` overflows to `Infinity`. Guarding at `n > 170` keeps every valid result finite and in the existing numeric format.

## 10. Error Behavior

Align with the existing error style. Errors are thrown **inline** in `evaluator.js` (domain) and `parser.js` (syntax) — the same pattern already used for `sqrt`/`log` (`evaluator.js:64–66`, `70–75`) and for unexpected tokens (`parser.js:47`, `62–64`, `126`). **No new error framework and no `errors.js` change** (the `CalcErrors` factories are not wired into `evaluate()` and remain out of scope).

User-facing error categories:

| Category | Trigger | Message (existing-style) | Thrown by |
|---|---|---|---|
| Negative factorial | `(-3)!` | `Cannot take factorial of a negative number` | `evaluator.js` (inline) |
| Non-integer factorial | `2.5!` | `Cannot take factorial of a non-integer number` | `evaluator.js` (inline) |
| Factorial overflow / too large | `171!` | `Factorial overflow: n must be ≤ 170` | `evaluator.js` (inline) |
| Malformed postfix — leading `!` | `!5` | `Unexpected token: !` | `parser.js` (existing) |
| Malformed postfix — double `!` | `2!!` | `Unexpected token after expression` | `parser.js` (existing) |
| Malformed postfix — dangling `!` | `5 + !` | `Unexpected token: !` | `parser.js` (existing) |

All errors surface through the **existing** error path: `events.js` `evaluate()` try/catch (`events.js:37–47`) → `CalcState.setError(err.message)` → `ui.js` `renderError` (`ui.js:36–38`) → `#result`. No new error plumbing.

## 11. Expected Deliverables (exact files ENG may modify)

**Exactly three files:**

1. **`src/js/parser.js`** — add `FACTORIAL: '!'` to `TOK`; add the `!` tokenizer branch; add `parsePostfix`; change `parseUnary` to call `parsePostfix`.
2. **`src/js/evaluator.js`** — add `evalFactorial` strategy; add `case 'Factorial'` to the `evaluate` dispatch.
3. **`src/js/events.js`** — add `handlers['fact'] = () => append('!')`; update the stale handlers-map JSDoc.

**All other `src/` changes are forbidden**, specifically:

| File | Why no change |
|---|---|
| `src/js/constants.js` | `!` is a postfix unary operator, **not** a binary operator — it is **not** added to `OPERATORS`. `'fact'` is **not** added to `FUNCTIONS` (that would produce `fact(` function-call behavior, which is wrong). The `FACTORIAL` token type lives in `parser.js` `TOK`, not here. No change. |
| `src/js/errors.js` | Errors are thrown inline in `evaluator.js`/`parser.js` (existing style). No new error framework. No change. |
| `src/index.html` | The button already exists (`index.html:30`). No markup change. |
| `src/style.css` | No styling change. |
| `src/js/state.js`, `src/js/ui.js`, `src/js/app.js` | State/UI/error flow already works; no change. |

If ENG determines any other file is strictly required, **STOP and escalate to ORCH before writing code.**

## 12. Line Budget

| Module | Current | After change | ADR budget | Note |
|---|---|---|---|---|
| `parser.js` | 140 | ~148 | ~120 | +`TOK.FACTORIAL` (1), +tokenizer branch (1), +`parsePostfix` (~5), +1 line in `parseUnary`. (Pre-existing overage of the ~120 target; not introduced by this task.) |
| `evaluator.js` | 113 | ~122 | ~100 | +`evalFactorial` (~8), +1 dispatch case. (Pre-existing overage of the ~100 target; the addition is modest.) |
| `events.js` | 100 | ~101 | ~100 | +1 handler entry; the JSDoc update stays within the existing 4-line span (`events.js:48–51`). Minimal +1. |

If ENG's change would push any file materially beyond the existing overage, **stop and ask ORCH.**

## 13. Public API Contract

Injected by ORCH from merged main. **Inject nothing beyond this list; call nothing outside it.**

### APIs the new code may invoke (only these)
1. `append(text)` — **private** function inside the `CalcEvents` IIFE, `events.js:15–17`; body is `CalcState.setExpression(CalcState.expression + text)`. The new `'fact'` entry must route through this existing private function. No new state writes.
2. `CalcState.expression` (getter, `state.js:60`) and `CalcState.setExpression(val)` (`state.js:37`) — reached only via `append`; they notify the `'expression'` subscribers, which re-render the display. No other state surface is touched.
3. `round(n)` — **private** function inside the `CalcEvaluator` IIFE, `evaluator.js:18–20`; body is `Number(n.toFixed(PRECISION))`. `evalFactorial` must apply it to its result. No new precision logic.

### Reference APIs (read-only context — already merged, verified, unmodified by this task)
4. `CalcConstants.OPERATORS` — `['+','-','*','/','^']` (`constants.js:12`, used at `parser.js:14`). **Unchanged** (`!` is not added).
5. `CalcConstants.FUNCTIONS` — `['sqrt','sin','cos','tan','log','ln']` (`constants.js:15`, used at `parser.js:14` and `events.js:64`). **Unchanged** (`'fact'` is not added).
6. `CalcConstants.PRECISION` — `10` (`constants.js:24`, used at `evaluator.js:11`).
7. `CalcParser.parse(expression: string) → AST | null` (`parser.js:134–139`) — **public API unchanged**. New internal `parsePostfix(ctx)` and new token type `TOK.FACTORIAL = '!'` (`parser.js:15–16`). New AST node `{ type: 'Factorial', arg: ASTNode }`.
8. `CalcEvaluator.evaluate(node) → number` (`evaluator.js:99–110`) — **public API unchanged**. New internal `evalFactorial(node)` and new dispatch case.
9. `CalcEvents` public surface — `return { init, handlers }` (`events.js:99`) — **unchanged**. The `handlers` object (`events.js:52–61`) gains exactly one key: `'fact'`.
10. `CalcUI.renderError(value)` (`ui.js:36–38`) — surfaces error messages in `#result`; unchanged.

**`CalcErrors` is NOT required** — no new error framework; errors are thrown inline (existing style). No new globals, no new modules, no new IIFE exports, no cross-module imports.

## 14. Requirement Traceability Matrix

| PRD Clause | Required User Behavior | UI Control | Current Code Status | Required Implementation | Acceptance Test |
|---|---|---|---|---|---|
| FR-03 (factorial `n!`) | Compute factorial of a number/expression using postfix `!` | `n!` button (`index.html:30`, `data-action="fact"`) | Button exists but has **no handler**; no `!` token, no postfix rule, no evaluator strategy | Add `handlers['fact']` (inserts `!`); add `FACTORIAL` token + `parsePostfix`; add `evalFactorial` | `5!` → 120; `(3+2)!` → 120; `3!+2` → 8; `2+3!` → 8 |
| FR-08 (precision) | Factorial results shown with ≤10 decimals, trailing zeros trimmed | `#result` (`index.html:14`) | `round()` exists (`evaluator.js:18–20`) | Apply `round()` in `evalFactorial` | `5!` → `120` (not `120.0000000000`) |
| FR-10 (invalid expression) | Malformed postfix (`!5`, `2!!`, dangling `!`) shows a user-friendly error | `#result` | Parser already throws on unexpected tokens (`parser.js:47`, `62–64`, `126`) | Reuse existing parser error throws (no new framework) | `!5` → `Unexpected token: !`; `2!!` → `Unexpected token after expression` |
| FR-11 (domain error) | Negative / non-integer / overflow factorial shows an appropriate error | `#result` | Inline domain errors exist (`evaluator.js:64–66`, `70–75`) | Add inline domain checks in `evalFactorial` | `(-3)!` → negative error; `2.5!` → non-integer error; `171!` → overflow error (not `Infinity`) |

## 15. Acceptance Criteria (concrete pass/fail)

Postfix `!` is selected. All cases below must pass (manual browser pass after activation, plus engine-level checks where noted).

| # | Input | Expected | Category |
|---|---|---|---|
| 1 | `0!` | `1` | 0! = 1 |
| 2 | `1!` | `1` | 1! = 1 |
| 3 | `5!` | `120` | positive integer |
| 4 | `6!` | `720` | positive integer |
| 5 | `(3+2)!` | `120` | parenthesized group |
| 6 | `3! + 2` | `8` | precedence over `+` |
| 7 | `2 + 3!` | `8` | precedence over `+` |
| 8 | `-3!` | `-6` | unary minus applies to factorial result (`-(3!)`) |
| 9 | `(-3)!` | domain error `Cannot take factorial of a negative number` | negative factorial |
| 10 | `2^3!` | `64` | `2^(3!)` — `!` binds tighter than `^` |
| 11 | `3!^2` | `36` | `(3!)^2` |
| 12 | `2*3!` | `12` | `!` binds tighter than `*` |
| 13 | `3!/2` | `3` | `!` binds tighter than `/` |
| 14 | `sqrt(4)!` | `2` | `!` applies to function-call result |
| 15 | `!5` | syntax error `Unexpected token: !` | malformed postfix |
| 16 | `2!!` | syntax error `Unexpected token after expression` | malformed postfix |
| 17 | `5 + !` | syntax error `Unexpected token: !` | dangling `!` |
| 18 | `2.5!` | domain error `Cannot take factorial of a non-integer number` | non-integer |
| 19 | `171!` | domain error `Factorial overflow: n must be ≤ 170` (**not** `Infinity`) | overflow |
| 20 | `170!` | `7.257415615311911e+306` (finite, `round()` applied) | max valid input |
| 21 | Factorial button | inserts `!` into the expression (e.g. `5` → `n!` → `5!`) | UI wiring |
| 22 | `2^3` | `8` | existing power handler still works (task/06 regression) |
| 23 | `7 × 8 =` → 56; `√ 4 =` → 2; `sin( … )`; `log( … )`; `ln( … )`; `π`; `e` | all prior behaviors unchanged | scientific/arithmetic regression |
| 24 | `C`, `⌫`, `±`, `.` | all prior behaviors unchanged | action regression |
| 25 | any invalid input | no crash; error shown in `#result` via the existing path | robustness |

## 16. Out of Scope

- **QA** and **final UAT** (QA is NOT activated).
- **Automated tests** unless separately authorized (no `tests/` changes).
- **PRD amendment** (no `specs/` changes).
- **Currency converter** (not in PRD).
- **UI/CSS redesign** (no `src/style.css` changes).
- **HTML redesign** — forbidden. The factorial button already exists (`index.html:30`); no `src/index.html` change. (HTML changes would require PMO separately approving a proven missing button, which is not the case here.)
- **Keyboard factorial** — not in PRD FR-07's keyboard list; excluded.
- **`fact(n)` function notation** — not required by the PRD; if PMO wants it later, it is additive and a separate decision.
- **Unrelated scientific functions.**
- **Broad parser/evaluator refactor** — only the minimal postfix `!` additions.
- **`errors.js` refactor** beyond minimal factorial error reuse (none needed — inline throws).
- **`FACTORY_STATE.md` changes by ENG** (ORCH-owned).
- **Merge to main by ENG** (ORCH-only).

## 17. Worker Guardrails

ENG must:
- work **only** on branch `task/07-factorial-support`;
- modify **only** the allowed files listed in §11 (`src/js/parser.js`, `src/js/evaluator.js`, `src/js/events.js`);
- commit **only** to that branch;
- **not** merge to main;
- **not** update `FACTORY_STATE.md`;
- **not** add tests unless explicitly authorized;
- **not** expand scope (no new files, no other `src/` changes, no `fact(n)`, no keyboard `!`);
- **stop and report BLOCKED** if the contract conflicts with verified PRD/UI behavior;
- **not** guess notation, precedence, limits, or error behavior — all are fixed by this contract.

## 18. ENG Activation Block

```
ENG Activation Block
- Branch: task/07-factorial-support
- Allowed files: src/js/parser.js, src/js/evaluator.js, src/js/events.js
- Forbidden files: all other files (src/index.html, src/style.css, src/js/constants.js, src/js/state.js, src/js/ui.js, src/js/app.js, src/js/errors.js, specs/, adr/, tasks/, FACTORY_STATE.md, tests/, and any new file)
- Exact commit message: [ENG] feat: add postfix factorial (n!) support
- Merge allowed: NO
- FACTORY_STATE update allowed: NO
- QA allowed: NO
- Acceptance checks: all rows in §15 (0!→1, 1!→1, 5!→120, 6!→720, (3+2)!→120, 3!+2→8, 2+3!→8, -3!→-6, (-3)!→negative error, 2^3!→64, 3!^2→36, 2*3!→12, 3!/2→3, sqrt(4)!→2, !5→syntax error, 2!!→syntax error, 5+!→syntax error, 2.5!→non-integer error, 171!→overflow error not Infinity, 170!→finite, button inserts !, 2^3→8, arithmetic/scientific/action regressions pass, no crash on invalid input)
```

## 19. Definition of Done

- [ ] `src/js/parser.js`: `FACTORIAL: '!'` added to `TOK`; `!` tokenizer branch added; `parsePostfix` added; `parseUnary` calls `parsePostfix`
- [ ] `src/js/evaluator.js`: `evalFactorial` added (negative / non-integer / `n > 170` guards, `round()` applied); `case 'Factorial'` added to `evaluate`
- [ ] `src/js/events.js`: `handlers['fact'] = () => append('!')` added; stale handlers-map JSDoc updated (`'fact'` now wired, inserts `!`)
- [ ] Diff vs `main` touches **only** `src/js/parser.js`, `src/js/evaluator.js`, `src/js/events.js`
- [ ] No `src/js/constants.js` change (`!` not in `OPERATORS`, `'fact'` not in `FUNCTIONS`); no `src/js/errors.js` change; no `src/index.html` change; `data-action="fact"` value untouched; no new DOM queries or event listeners
- [ ] No changes to state/ui/app; no new globals; no cross-module imports; no `fact(n)`; no keyboard `!`
- [ ] Manual browser pass for all §15 rows (including regression) completed and noted in the branch handoff summary
- [ ] Working on branch `task/07-factorial-support`
- [ ] Single commit with exact message: `[ENG] feat: add postfix factorial (n!) support`
- [ ] `FACTORY_STATE.md` and `tasks/` untouched by ENG

## 20. Output Artifacts

- `src/js/parser.js` — postfix `!` tokenization + `parsePostfix` rule
- `src/js/evaluator.js` — `evalFactorial` strategy
- `src/js/events.js` — `n!` button handler (inserts `!`)

## Handoff

- **Reviewed by:** ORCH
- **Next consumer:** PMO (single authorization decision) → ORCH (activation + code review + merge adjudication). Post-merge, ORCH updates FACTORY_STATE.md and may then adjudicate QA activation.
- **After completion:** commit, push branch, notify human to switch to ORCH session.
