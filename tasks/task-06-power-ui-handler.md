# Task: task/06 — x^y / Power UI Handler

**Author:** ORCH
**Date:** 2026-10-03
**Status:** READY — **NOT ACTIVATED.** Do not start until ORCH explicitly activates (ENG is not yet authorized per FACTORY_STATE.md; no auto-start).
**Assigned to:** ENG
**Branch:** task/06-power-ui-handler
**Depends on:** task/05 (merged), task/03a (parser collision fix, merged — `CalcParser.parse` verified working on main)
**Priority:** P1 (closes the unimplemented `x^y` half of PRD FR-03, a MUST requirement)

---

## 1. Objective

Wire the existing `x^y` / power UI control to the already merged parser/evaluator expression model: clicking the `x^y` button must insert `^` into the current expression, so that `=` parses and evaluates it (PRD FR-03 "exponentiation (x^y)").

Verified current state: the button already exists in merged markup (exact element in §3 below) and the engine already supports `^` end-to-end (§4). The **only** missing piece is one handler entry in the `CalcEvents` handler map — `events.js` lines 49–51 state explicitly that `'pow'` (and `'fact'`) are "intentionally absent (deferred per Task 04)". This task closes the `'pow'` gap only.

## 2. Expected Deliverable

**Exactly one modified file: `src/js/events.js`.**

Why nothing else is required (evidence chain, all on merged main):

| Missing vs. already present | Evidence |
|---|---|
| Button markup exists | `src/index.html:29` (verified, §3) |
| Click delegation routes any `data-action` to the handler map | `events.js:10` (listener on `.buttons`), `events.js:70–74` (`handlers[btn.dataset.action]?.()`) |
| `^` is a recognized operator token | `constants.js:12` — `OPERATORS = ['+', '-', '*', '/', '^']` |
| `^` parses to an `Operator` node | `parser.js:88–95` (`parsePower`); task/03a post-merge Node run: `parse('2^3')` → `Operator ^` |
| `^` evaluates to a number | `evaluator.js:48` — `case '^': return round(Math.pow(left, right))`; task/03a run: `2^3` → 8 |
| Invalid expression errors already surface in UI | `events.js:37–47` (`evaluate()` try/catch → `CalcState.setError`) → `ui.js:36–38` (`renderError`) |
| **`handlers['pow']` does NOT exist** | `events.js:52–65` — no `pow` key; §2 comment defers it. Grep of `src/` confirms no other `pow` reference in any JS file. |

If ENG determines any other file is strictly required, **STOP and escalate to ORCH before writing code**. Parser, evaluator, state, UI, markup, and styling changes are NOT permitted under this contract; unnecessary parser/evaluator refactors are a review-failure.

## 3. Exact DOM Contract

Source of truth: verified against **merged `src/index.html`** on 2026-10-03 (main @ `b9e981d`, working tree clean) — not against any prior task sketch.

- **Power button element** (line 29, verbatim):
  ```html
  <button class="btn btn--sci" data-action="pow" aria-label="Exponentiation">x^y</button>
  ```
- **`data-action` value: `pow`** — this value was verified present in the real file; it is not a stale sketch.
- **Selector (reference only): `button[data-action="pow"]`** — the new code must NOT add a query for this or any other element. Routing to the handler already happens through the existing delegated click listener on `.buttons` (container element: `index.html:18`) via `e.target.closest('button')` → `btn.dataset.action` (`events.js:70–74`). Task 06 adds **zero new DOM queries and zero new event listeners**.
- Display targets for acceptance checks only: `#expression` (`index.html:13`), `#result` (`index.html:14`).

## 4. Exact Public API Contract

Injected by ORCH from merged main. **Inject nothing beyond this list; call nothing outside it.**

### APIs the new handler entry may invoke (only these)
1. `append(text)` — **private** function inside the `CalcEvents` IIFE, `events.js:15–17`; body is `CalcState.setExpression(CalcState.expression + text)`. The new `'pow'` entry must route through this existing private function (reused by every other entry, e.g. the `opSymbols` loop at `events.js:61–62`). No new state writes.
2. `CalcState.expression` (getter, `state.js:60`) and `CalcState.setExpression(val)` (`state.js:37`) — reached only via `append`; they notify the `'expression'` subscribers, which re-renders the display. No other state surface is touched.

### Reference APIs (read-only context — already merged, verified, unmodified by this task)
3. `CalcParser.parse(expression: string) → AST | null` (`parser.js:134–139`). `^` is binary, **right-associative** (`parser.js:88–95`), higher precedence than `*`/`/` (grammar, `parser.js:6–7`). Verified on main: `parse('2^3')` → `{ type: 'Operator', op: '^', … }`.
4. `CalcEvaluator.evaluate(node) → number` (`evaluator.js:99–110`); `^` → `round(Math.pow(left, right))` (`evaluator.js:48`). Verified on main: `2^3` → 8.
5. `CalcEvents` public surface — `return { init, handlers }` (`events.js:98`) — **stays unchanged**. The `handlers` object (`events.js:52–65`) gains exactly one key: `'pow'`.

No new globals, no new modules, no new IIFE exports, no cross-module imports.

## 5. Scope of Work (events.js only — minimal)

1. **Add exactly one entry** to the `handlers` map (`events.js:52–65`): key `'pow'`, handler appends the literal `'^'` by calling the existing private `append` (`events.js:15`). Keep the entry inside the IIFE scope so `append` is in reach. Placement is ENG's choice, matching the file's existing style (the `opSymbols` loop pattern, `events.js:61–62`, is the closest precedent).
2. **Update the stale JSDoc** on the handlers map (`events.js:48–51`): it currently claims both `'pow'` and `'fact'` are "intentionally absent (deferred per Task 04)". New fact: `'pow'` is now wired; **only** `'fact'` remains deferred (PRD FR-03 gap; no factorial task has been created). Keep the comment within the same 4-line span so the line budget (§8) holds.
3. **Nothing else.** No keydown changes, no new state keys, no formatting logic (result rounding already happens in `evaluate()` at `events.js:42`), no error-message reformatting.

## 6. Out of Scope

- **Factorial `n!`** — `data-action="fact"` button exists (`index.html:30`) but remains the unfilled PRD gap. **No task file for it is created in this step.**
- **Keyboard `^` handling** — see verification table row 7. Not in PRD FR-07's keyboard list. Pending adjudication; explicitly excluded here.
- **`CalcErrors` wiring into `evaluate()`** / error-message reformatting — separate future task (per FACTORY_STATE.md key decisions, task/05 review).
- Any modification of `src/index.html`, `src/style.css`, `src/js/parser.js`, `evaluator.js`, `state.js`, `ui.js`, `constants.js`, `errors.js`, or `app.js`.
- Test suites (QA is NOT activated).
- `FACTORY_STATE.md` and `tasks/` updates — ORCH-owned; done at review/merge, never by ENG.

## 7. Verification Evidence (ORCH inspection, 2026-10-03, main @ `b9e981d`, working tree clean)

| # | Fact | Evidence | Status |
|---|---|---|---|
| 1 | Power button exists with `data-action="pow"` | `src/index.html:29` (verbatim quote in §3) | **Verified** |
| 2 | Click delegation already routes `data-action` values to the handler map | `events.js:10`, `events.js:70–74` | **Verified** |
| 3 | `handlers['pow']` absent; deferred pending since task/04 | `events.js:49–51`; grep of `src/` shows no other `pow` references in JS | **Verified** |
| 4 | `^` tokenized and parsed (binary, right-associative) | `constants.js:12`, `parser.js:6–7`, `parser.js:88–95`; task/03a post-merge Node run: `parse('2^3')` → `Operator ^` | **Verified** |
| 5 | `^` evaluated numerically | `evaluator.js:48`; task/03a Node run: `2^3` → 8 (18/18 checks) | **Verified** |
| 6 | Error path surfaces parse failures in the result area | `events.js:37–47` → `state.js:49` → `ui.js:36–38` | **Verified** |
| 7 | "Keyboard `^` … already function" (FACTORY_STATE.md:33) | **Not found in merged code** — `onKeydown` (`events.js:79–89`) handles only 0–9, `+ - * /`, `( )`, `.`, Enter, Escape, Backspace; PRD FR-07 keyboard list also omits `^` | **Pending verification / adjudication — FACTORY_STATE claim is STALE.** Keyboard `^` is out of scope for this task; ORCH to correct FACTORY_STATE.md at next update. |

## 8. Line Budget

`src/js/events.js` is currently **99 lines**; ADR-01 §2.2 budget is ~100 lines. Expected final size: **100 lines** (+1 handler entry line; the JSDoc update must stay within the existing 4-line span, `events.js:48–51`). If ENG's change would exceed 100 lines, stop and ask ORCH.

## 9. Expected Behavior (acceptance — manual browser pass after activation)

PRD anchors: FR-03 (x^y), FR-08 (precision, trim trailing zeros), FR-10 (invalid-expression error).

| UI steps | Expression display | Expected result display | Note |
|---|---|---|---|
| `2` → `x^y` → `3` → `=` | `2^3` | `8` | Engine-level verified on main (task/03a run) |
| `2` → `x^y` → `10` → `=` | `2^10` | `1024` | exact integer |
| `2` → `x^y` → `0.5` → `=` | `2^0.5` | `1.4142135624` | 10-decimal precision, trailing-zero trim (FR-08) |
| `2` → `x^y` → `3` → `x^y` → `2` → `=` | `2^3^2` | `512` | `^` is right-associative (i.e. `2^(3^2)`) |
| `2` → `x^y` → `=` | `2^` | `Unexpected token: EOF` | Dangling operator hits the **existing** error path (`events.js:44–46`); message is the raw parser string — reformatting is out of scope |
| Regression: `7` `×` `8` `=` → 56; `√` `4` `=` → 2; `sin(` … `)`; `C`; `⌫`; `±`; `( )`; `.`; keyboard 0–9, `+ - * /`, `( )`, `.`, Enter, Esc, Backspace | — | all task/04 behaviors unchanged | no existing handler may be altered |

## 10. Definition of Done

- [ ] `src/js/events.js` modified: exactly one new `handlers['pow']` entry (appends `'^'` via the existing private `append`) and the stale handlers-map JSDoc updated (`'pow'` wired, only `'fact'` deferred)
- [ ] Diff vs `main` touches **only** `src/js/events.js`; final file ≤ 100 lines
- [ ] No `src/index.html` change; `data-action="pow"` value untouched; no new DOM queries or event listeners
- [ ] No changes to parser/evaluator/state/ui/constants/errors/app; no parser or evaluator refactor
- [ ] No new globals; `CalcEvents` public surface remains exactly `{ init, handlers }`
- [ ] Manual browser pass for all §9 rows (including regression) completed and noted in the branch PR/handoff summary
- [ ] Working on branch `task/06-power-ui-handler`
- [ ] Single commit with exact message: `[ENG] feat: wire x^y power button handler`
- [ ] `FACTORY_STATE.md` and `tasks/` untouched by ENG

## 11. Output Artifacts

- `src/js/events.js` — the only modified file (event module with the `x^y` power handler wired)

## Handoff

- **Reviewed by:** ORCH
- **Next consumer:** ORCH (code review + merge adjudication). Post-merge, ORCH updates FACTORY_STATE.md (including the stale keyboard-`^` claim, §7 row 7) and may then adjudicate scheduling of the remaining PRD gap (factorial) and/or QA activation — both remain explicitly NOT authorized until instructed.
- **After completion:** commit, push branch, notify human to switch to ORCH session.