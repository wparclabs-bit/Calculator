# Task: task/07 — Factorial (n!) Support

**Author:** ORCH
**Date:** 2026-10-03
**Status:** READY — **NOT ACTIVATED / READY_FOR_PMO_AUTHORIZATION.** Do not start until PMO explicitly authorizes (ENG is not yet authorized per FACTORY_STATE.md; no auto-start).
**Assigned to:** ENG
**Branch:** task/07-factorial-support
**Depends on:** task/06 (merged, ORCH merge commit `8351cd7`), task/03a (parser collision fix, merged), task/05 (error handling, merged)
**Priority:** P1 (closes the unimplemented `n!` half of PRD FR-03, a MUST requirement)

---

## 1. Objective

Implement factorial (`n!`) per PRD FR-03 ("factorial (n!)"). The `n!` button already exists in merged markup (`src/index.html:30`, `data-action="fact"`) but has **no handler**, and the engine has **no factorial support**. This task wires the button and adds factorial evaluation so that `=` parses and evaluates it.

## 2. Design Decision (ORCH recommendation — PMO to authorize)

**Recommended: function notation `fact(n)`.**

This is consistent with the existing scientific-function pattern already merged on main: the `√` button inserts `sqrt(`, `sin` inserts `sin(`, etc. (all via the `CalcConstants.FUNCTIONS` loop). So `n!` → `fact(` follows the same convention. It reuses the existing FunctionCall mechanism end-to-end and requires **no parser change and no events.js change**.

**Alternative (only if PMO explicitly requests literal `5!` in the expression): postfix `!` operator.** This would require a new token, a new postfix parser rule, and a new AST node — a larger, higher-risk scope. **Not recommended for v1.** If PMO selects this, ORCH will re-scope the contract before activation.

## 3. Exact Scope of Work (recommended function approach)

**Files to change (exactly two):**

1. **`src/js/constants.js`** — add `'fact'` to the `FUNCTIONS` array (line 15). No new line; the array becomes `['sqrt', 'sin', 'cos', 'tan', 'log', 'ln', 'fact']`.
2. **`src/js/evaluator.js`** — add a `case 'fact':` to `evalFunctionCall` (after the `ln` case, before `default`), computing the factorial with an inline domain check (matching the existing inline-error style, e.g. the `sqrt` case at `evaluator.js:64-66`).

**Files NOT to change (and why):**

| File | Why no change |
|---|---|
| `src/js/events.js` | The `FUNCTIONS` loop (`events.js:64`) auto-creates `handlers['fact'] = () => append('fact(')` once `fact` is in `CalcConstants.FUNCTIONS`. No manual handler entry needed. |
| `src/js/parser.js` | The tokenizer already recognizes any name in `CalcConstants.FUNCTIONS` as a FUNCTION token (`parser.js:42`); `parsePrimary` already handles `FUNCTION '(' expression ')'` → `FunctionCall` (`parser.js:110-118`). No parser change. |
| `src/js/errors.js` | Existing domain errors are thrown **inline** in `evaluator.js` (not via `CalcErrors`); the `fact` case follows the same inline style. No `errors.js` change. |
| `src/index.html`, `src/style.css`, `src/js/state.js`, `src/js/ui.js`, `src/js/app.js` | No change. The button markup already exists; state/UI/error flow already works. |

If ENG determines any other file is strictly required, **STOP and escalate to ORCH before writing code.**

## 4. Exact Public API Contract

- `CalcConstants.FUNCTIONS` gains `'fact'`.
- `CalcEvaluator.evaluate` handles a `FunctionCall` node with `name === 'fact'`.
- AST node shape is **reused, not new**: `{ type: 'FunctionCall', name: 'fact', arg }` (produced by the existing `parsePrimary`).
- No new globals, no new modules, no new IIFE exports, no cross-module imports.

## 5. Factorial Semantics (domain rules)

- `fact(n)` for a **non-negative integer** `n`: product `1 × 2 × … × n`. `fact(0) = 1`, `fact(1) = 1`, `fact(5) = 120`, `fact(6) = 720`.
- `fact(n)` for a **negative or non-integer** `n`: throw a domain error (PRD FR-11). Suggested message: `Cannot take factorial of a negative or non-integer number`.
- `fact(n)` for `n > 170`: the result overflows to `Infinity` in JS (`171! > Number.MAX_VALUE`). **ORCH decision: throw a domain error for `n > 170`** (e.g. `Factorial overflow: n must be ≤ 170`) to avoid a silent `Infinity`.
- The result is rounded via the existing `round()` (`PRECISION = 10`, `evaluator.js:18-20`) like all other results (FR-08).

## 6. Out of Scope

- Postfix `!` notation (unless PMO amends the design decision in §2).
- Keyboard `!` handling (not in PRD FR-07's keyboard list).
- Gamma function / non-integer factorial extension.
- Test suites (QA is NOT activated).
- `FACTORY_STATE.md` and `tasks/` updates — ORCH-owned; done at review/merge, never by ENG.

## 7. Verification Evidence (ORCH inspection, 2026-10-03, main @ `8351cd7`, working tree clean)

| # | Fact | Evidence | Status |
|---|---|---|---|
| 1 | `n!` button exists with `data-action="fact"` | `src/index.html:30` | **Verified** |
| 2 | `handlers['fact']` absent; deferred | `events.js` handlers map has no `fact` key; JSDoc (`events.js:50`) defers `'fact'` | **Verified** |
| 3 | `FUNCTIONS` loop auto-wires any name in `CalcConstants.FUNCTIONS` | `events.js:64` | **Verified** |
| 4 | Tokenizer recognizes any name in `FUNCTIONS` as a FUNCTION token | `parser.js:42` | **Verified** |
| 5 | Parser handles `FUNCTION '(' expression ')'` → `FunctionCall` | `parser.js:110-118` | **Verified** |
| 6 | Evaluator has a FunctionCall strategy with a name switch | `evaluator.js:60-79` | **Verified** |
| 7 | `fact` is NOT in `CalcConstants.FUNCTIONS` | `constants.js:15` | **Verified** |
| 8 | `fact` is NOT handled in `evalFunctionCall` | `evaluator.js:63-78` (no `fact` case) | **Verified** |
| 9 | Domain errors are thrown inline in `evaluator.js` (not via `CalcErrors`) | `evaluator.js:64-66` (`sqrt` case) | **Verified** |

## 8. Line Budget

| Module | Current | After change | ADR budget | Note |
|---|---|---|---|---|
| `constants.js` | 42 | 42 | ~30 | Adding `'fact'` to the existing array adds **no** line. (Pre-existing overage of the ~30 target; not introduced by this task.) |
| `evaluator.js` | 113 | ~117–119 | ~100 | The `case 'fact':` block adds ~4–6 lines. (Pre-existing overage of the ~100 target; the addition is modest.) |

If ENG's change would push either file materially beyond the existing overage, **stop and ask ORCH.**

## 9. Expected Behavior (acceptance — manual browser pass after activation)

PRD anchors: FR-03 (n!), FR-08 (precision, trim trailing zeros), FR-10 (invalid expression), FR-11 (domain error).

| UI steps | Expression display | Expected result display | Note |
|---|---|---|---|
| `n!` → `5` → `)` → `=` | `fact(5)` | `120` | exact integer |
| `n!` → `0` → `)` → `=` | `fact(0)` | `1` | 0! = 1 |
| `n!` → `1` → `)` → `=` | `fact(1)` | `1` | 1! = 1 |
| `n!` → `6` → `)` → `=` | `fact(6)` | `720` | exact integer |
| `n!` → `2` → `)` → `+` → `n!` → `3` → `)` → `=` | `fact(2)+fact(3)` | `5` | 2! + 3! = 2 + 3 |
| `n!` → `2.5` → `)` → `=` | `fact(2.5)` | domain error | non-integer factorial undefined (FR-11) |
| `n!` → `171` → `)` → `=` | `fact(171)` | domain error | overflow guard (n > 170) |
| Engine-level: `CalcEvaluator.evaluate(CalcParser.parse('fact(-1)'))` | — | domain error | negative factorial undefined (FR-11); UI cannot easily type a leading `-` inside `fact(` (pre-existing `negate` limitation), so this row is verified at the engine level |
| Regression: all task/04–06 behaviors unchanged (`√`, `sin`, `cos`, `tan`, `log`, `ln`, `x^y`, digits, operators, parens, `C`, `⌫`, `±`, `.`, keyboard) | — | all prior behaviors unchanged | no existing handler/function may be altered |

## 10. Definition of Done

- [ ] `src/js/constants.js`: `'fact'` added to `FUNCTIONS`
- [ ] `src/js/evaluator.js`: `case 'fact':` added to `evalFunctionCall` with inline domain check (non-negative integer; `n > 170` overflow guard) and `round()` applied
- [ ] Diff vs `main` touches **only** `src/js/constants.js` and `src/js/evaluator.js`
- [ ] No `src/js/events.js` change (auto-wired by the `FUNCTIONS` loop); no `src/js/parser.js` change; no `src/index.html` change; `data-action="fact"` value untouched; no new DOM queries or event listeners
- [ ] No changes to state/ui/errors/app; no new globals; no cross-module imports
- [ ] Manual browser pass for all §9 rows (including regression) completed and noted in the branch handoff summary
- [ ] Working on branch `task/07-factorial-support`
- [ ] Single commit with exact message: `[ENG] feat: add factorial (n!) support`
- [ ] `FACTORY_STATE.md` and `tasks/` untouched by ENG

## 11. Output Artifacts

- `src/js/constants.js` — `FUNCTIONS` gains `'fact'`
- `src/js/evaluator.js` — `evalFunctionCall` handles `fact`

## Handoff

- **Reviewed by:** ORCH
- **Next consumer:** PMO (authorization decision) → ORCH (activation + code review + merge adjudication). Post-merge, ORCH updates FACTORY_STATE.md and may then adjudicate QA activation.
- **After completion:** commit, push branch, notify human to switch to ORCH session.
