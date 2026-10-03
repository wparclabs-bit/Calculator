# Factory State

**Project:** Scientific Calculator
**Last Updated:** 2026-10-03 by ORCH
**Current Phase:** IMPLEMENTATION

---

## Active Task
| Field | Value |
|---|---|
| Task ID | task/07-factorial-support (contract **FINALIZED**; work NOT started) |
| Assigned to | ENG — authorization: **NO** (do not start) |
| Branch | planned: `task/07-factorial-support` (cut only on activation) |
| Status | **READY_NOT_ACTIVATED / READY_FOR_PMO_AUTHORIZATION** — contract `tasks/task-07-factorial-support.md` **FINALIZED** 2026-10-03 (postfix `!` notation decision locked), awaiting explicit PMO authorization. QA activation: **NO**. Do NOT auto-start. |

**Note:** task/06 is CLOSED (reviewed and merged to main, ORCH merge commit `8351cd7`). The parser blocker remains CLEARED. QA is NOT activated. Task 07 is **FINALIZED** (READY_NOT_ACTIVATED / READY_FOR_PMO_AUTHORIZATION); ENG is NOT authorized and no work has started. **Factorial notation decision: postfix `!`** (evidence: PRD FR-03 `specs/prd.md:33` "factorial (n!)"; button `src/index.html:30` label `n!`). No task beyond Task 07 is created or assigned. Remaining open PRD gaps are recorded below.

## Completed Tasks
- [x] task/00 — PRD Approved (Merged to main)
- [x] task/01 — Architecture Decision Record (Merged to main)
- [x] task/02 — UI Layout (Merged to main)
- [x] task/03 — Core Math Engine (Merged to main) — ⚠ carried the `parse()` collision defect into main; superseded by task/03a (see Key Decisions Log).
- [x] task/04 — UI Binding & Events (Reviewed & Merged to main)
- [x] **task/03a — Parser `parse` Collision Fix (Reviewed & Merged to main)** — branch `task/03a-parser-parse-collision`, ENG commit `a43cadc`, ORCH merge commit `692b9ad`. 2-line rename only (`parse`→`parseTokens` + call site). Verified: 18/18 Node checks pass on `main` post-merge.
- [x] **task/05 — Error Handling & Bootstrap (Reviewed & Merged to main)** — branch `task/05-error-handling-bootstrap`, ENG commit `36215da`, ORCH merge commit `2745740`. New `src/js/errors.js` (51 lines, `CalcErrors` IIFE: 4 message factories + 3 domain-check helpers), new `src/js/app.js` (25 lines, `CalcApp` IIFE: DOMContentLoaded bootstrap calling `CalcEvents.init()`), and `src/index.html` script-order update only (8 script tags at end of `<body>` in ADR order: constants → state → parser → evaluator → ui → events → errors → app). No math engine files, events.js, FACTORY_STATE.md, or tests touched.
- [x] **task/06 — x^y / Power UI Handler (Reviewed & Merged to main)** — branch `task/06-power-ui-handler`, ENG corrected commit `162a093` (full `162a0933f5d0728b7578550f6f4f75d84e2157af`), ORCH merge commit `8351cd7` (full `8351cd775cb1a84f7911f7cef494b68938d58535`). Single-file change to `src/js/events.js` (+2 / -1): added `handlers['pow'] = () => append('^')` and corrected the stale handlers-map JSDoc (`'pow'` wired, `'fact'` deferred). The previously rejected commit `bfde339` had a deviating commit message; the corrected commit `162a093` carries the exact required message `[ENG] feat: wire x^y power button handler`, so the commit-message deviation is RESOLVED. Delegation path statically verified (`src/index.html:29` `data-action="pow"` → `events.js:74` `handlers[btn.dataset.action]?.()` → `handlers['pow']` → `append('^')`). **Browser runtime verification remains an open QA/UAT item, not a Task 06 blocker.** No parser/evaluator/state/ui/constants/errors/app/index.html/style.css/test/FACTORY_STATE change by ENG; no merge to main by ENG.

## Blocked / Rejected
- _(none — parser parse-collision blocker CLEARED by task/03a merge, ORCH merge commit `692b9ad`; remains cleared. Task 06's rejected commit `bfde339` was superseded by corrected commit `162a093`, which passed review and was merged.)_

## Open PRD Gaps (not scheduled beyond task/07)
- Factorial (`n!`) — still unimplemented (PRD FR-03 partial gap; button `data-action="fact"`, label `n!`, exists in `src/index.html:30`). **Assigned to task/07-factorial-support** — contract **FINALIZED** (postfix `!` notation decision locked; evidence `specs/prd.md:33` + `src/index.html:30`), READY_NOT_ACTIVATED / READY_FOR_PMO_AUTHORIZATION, ENG not yet authorized.
- `x^y` / `pow` UI handler — **RESOLVED** (implemented and merged via task/06, ORCH merge commit `8351cd7`).
- **Keyboard `^`: NOT currently supported.** `onKeydown` in `events.js` has no `^` branch, and PRD FR-07's keyboard list does not include `^`. Keyboard `^` is out of scope unless PMO formally amends PRD FR-07.
- **Parser/evaluator `^` support: VERIFIED** on main (tokenizer: `^` is in `CalcConstants.OPERATORS`; parser: binary, right-associative `^` rule; evaluator: `^` → `Math.pow`; task/03a post-merge Node run `2^3` → 8).
- **Browser runtime verification for task/06** — open QA/UAT item (manual browser pass of the §9 acceptance rows in `tasks/task-06-power-ui-handler.md`), not a Task 06 blocker.
- QA cannot be considered complete until these gaps are adjudicated later.

## Next in Queue
- Task 07 — contract **FINALIZED** (READY_NOT_ACTIVATED / READY_FOR_PMO_AUTHORIZATION); ENG authorization: **NO**; activates only on explicit PMO authorization.
- QA — integration blocker cleared; QA may be scheduled once authorized. Not activated.
- No task beyond Task 07 is created.

## Key Decisions Log
| Date | Decision | Rationale |
|---|---|---|
| 2025-07-17 | Transition from PLANNING to DESIGN | PRD approved by PMO |
| 2025-07-17 | Transition from DESIGN to IMPLEMENTATION | ADR approved by PMO; tech stack locked |
| 2025-07-17 | task/04 PASSES review and is MERGED to main | IIFE + event delegation + Pub/Sub all correct; selectors match real `src/index.html`. |
| 2025-07-17 | Accepted DOM-selector contract deviation (task/04) | Task/04's injected DOM sketch did NOT match merged `src/index.html`; `src/index.html` is authoritative; ENG correctly used the real selectors. Annotated in `tasks/task-04-ui-binding-events.md`. |
| 2025-07-17 | Parser `parse()` collision CONFIRMED — blocking integration defect from task/03 | Two `function parse` in the same IIFE scope; the later (public) declaration's body survives, so `CalcParser.parse` self-recursed instead of delegating to the internal token parser. Confirmed by static inspection AND Node repro. |
| 2025-07-17 | task/03 created as next active blocker; task/05 and QA halted | Parser must be fixed before evaluation can work. |
| 2025-07-17 | Factorial (`n!`) and `x^y` UI handler still NOT implemented (PRD FR-03 partial gap) | Deferred per task/04 contract. ⚠ **Superseded 2026-10-03:** the "keyboard `^` … already function" clause was STALE — verified absent in merged `events.js` `onKeydown` and absent from PRD FR-07; parser/evaluator `^` support is verified. |
| 2025-07-17 | **task/03a PASSES review and is MERGED to main** (merge commit `692b9ad`) | Diff vs `main` is exactly 2 changed lines in `src/js/parser.js` and nothing else: `function parse(tokens)` → `function parseTokens(tokens)` and the sole call site. Public `CalcParser.parse(expression)` preserved verbatim. Verified by ORCH in Node against the post-merge `main`: 18/18 checks pass. |
| 2025-07-17 | **Hoisting collision mechanism corrected** — ORCH review finding | Per ES2015+, when two function declarations collide in one scope the **later** declaration's body survives, so the surviving binding is the public `parse(expression)`. Decisive runtime evidence: calling `CalcParser.parse(tokenArray)` on pre-fix `main` threw `expression.trim is not a function`. The prescribed remedy (`parse`→`parseTokens`) was correct and executed exactly as specified. |
| 2025-07-17 | Parser parse-collision blocker CLEARED | `main` post-merge verified working end-to-end at the parser/evaluator layer. task/05 and QA are unblocked but remain deliberately NOT activated pending explicit PMO instruction. |
| 2025-07-17 | **task/05 PASSES review and is MERGED to main** (merge commit `2745740`) | Diff vs `main` is exactly 3 files, 85 insertions, 0 deletions: `src/js/errors.js` (new, 51 lines), `src/js/app.js` (new, 25 lines), `src/index.html` (+9 script tags only). IIFE pattern, no global pollution beyond `CalcErrors`/`CalcApp`, no cross-module imports, zero dependencies, JSDoc on all public functions, file sizes within budget. No factorial, no x^y/pow handler, no math engine or events.js changes, no tests, no FACTORY_STATE.md modification by ENG. |
| 2025-07-17 | Accepted ENG's note that `CalcErrors` is NOT wired into `evaluate()` | Task 05's Scope of Work requires only standalone error utilities, the `app.js` bootstrap, and the `index.html` script-order update. The error-display flow already exists in `events.js` from task/04. Wiring `CalcErrors` factories into `evaluate()` is a future task. |
| 2026-10-03 | Factory state corrected for task/06 readiness | ORCH re-inspected merged main: removed STALE claim that keyboard `^` "already function" (verified ABSENT in `events.js` `onKeydown` and absent from PRD FR-07); parser/evaluator `^` support recorded as VERIFIED; task/06 recorded as Active Task (READY_NOT_ACTIVATED, ENG not authorized); factorial (`n!`) remains an open PRD gap — Task 07 expected but NOT created. |
| 2026-10-03 | **task/06 PASSES re-review and is MERGED to main** (merge commit `8351cd7`) | ORCH re-verified the corrected ENG commit `162a093` from local git state (not the ENG report): branch `task/06-power-ui-handler`; remote ref `162a0933f5d0728b7578550f6f4f75d84e2157af`; exactly one commit ahead of main; exact commit message `[ENG] feat: wire x^y power button handler`; diff vs main touches ONLY `src/js/events.js` at 1 file changed, 2 insertions(+), 1 deletion(-). Accepted change present: `handlers['pow'] = () => append('^')` reusing the existing private `append`; delegation path verified (`index.html:29` `data-action="pow"` → `events.js:74`); no new DOM query, listener, or global; `CalcEvents` public surface unchanged except the accepted internal handler. Stale JSDoc corrected (`'pow'` wired, `'fact'` deferred). All forbidden items absent (no factorial/fact handler, no keyboard `^`, no parser/evaluator/constants/state/ui/errors/app/index.html/style.css/test/FACTORY_STATE change, no merge by ENG). The rejected commit `bfde339`'s commit-message deviation is RESOLVED by `162a093`. Browser runtime verification recorded as an open QA/UAT item, not a Task 06 blocker. |
| 2026-10-03 | **task/07 prepared but NOT activated** | After the task/06 merge, ORCH drafted `tasks/task-07-factorial-support.md` (factorial `n!`, PRD FR-03 gap). Task 07 is the new Active Task: assigned ENG, status READY_NOT_ACTIVATED / READY_FOR_PMO_AUTHORIZATION, ENG authorization NO, QA activation NO. No task beyond Task 07 is created. PMO decides whether to authorize ENG for Task 07. |
| 2026-10-03 | **task/07 contract FINALIZED — postfix `!` notation decision locked** | ORCH re-inspected merged main (main @ `4371df5`, working tree clean) and finalized `tasks/task-07-factorial-support.md`. **Notation decision: postfix `!`** (the earlier `fact(n)` draft recommendation is RETRACTED). Evidence: PRD FR-03 `specs/prd.md:33` "factorial (n!)" (no `fact(n)` mentioned anywhere) + button `src/index.html:30` label `n!` / aria-label `Factorial` / `data-action="fact"`. Verified: no `fact` handler in `events.js` (map `52–61`, JSDoc `50` defers it); the `FUNCTIONS` loop (`events.js:64`) would insert `fact(` only if `fact` were in `FUNCTIONS` (it is not, `constants.js:15`), so postfix `!` needs a manual handler. Verified: `!` not tokenized (`parser.js:47` throws `Unexpected character: !`), no postfix rule; no factorial in `evaluator.js` (no `fact` case, no `Factorial` node). Contract now fixes: allowed files = `parser.js`, `evaluator.js`, `events.js` only; precedence = `!` highest (tighter than `^`, unary minus, function calls, parens); max input = 170 (ORCH safe default; `n>170` → overflow error, not `Infinity`); errors inline (existing style, no `errors.js` change); exact ENG commit message `[ENG] feat: add postfix factorial (n!) support`. Status READY_NOT_ACTIVATED / READY_FOR_PMO_AUTHORIZATION; ENG authorization NO; QA activation NO. No task beyond Task 07 created. PMO makes one authorization decision. |
