# Factory State

**Project:** Scientific Calculator
**Last Updated:** 2025-07-17 by ORCH
**Current Phase:** IMPLEMENTATION

---

## Active Task
| Field | Value |
|---|---|
| Task ID | — (none active) |
| Assigned to | — |
| Branch | — |
| Status | IDLE — task/03a approved & merged. Awaiting PMO authorization for the next task (task/05). Do NOT auto-start. |

**Note:** task/03a is CLOSED. The parser blocker is CLEARED. The next task (task/05 — Error Handling & Bootstrap) is queued but deliberately NOT activated; ORCH must not start task/05, QA, or assign Task 05 without explicit PMO instruction.

## Completed Tasks
- [x] task/00 — PRD Approved (Merged to main)
- [x] task/01 — Architecture Decision Record (Merged to main)
- [x] task/02 — UI Layout (Merged to main)
- [x] task/03 — Core Math Engine (Merged to main) — ⚠ carried the `parse()` collision defect into main; superseded by task/03a (see Key Decisions Log).
- [x] task/04 — UI Binding & Events (Reviewed & Merged to main)
- [x] **task/03a — Parser `parse` Collision Fix (Reviewed & Merged to main)** — branch `task/03a-parser-parse-collision`, ENG commit `a43cadc`, ORCH merge commit `692b9ad`. 2-line rename only (`parse`→`parseTokens` + call site). Verified: 18/18 Node checks pass on `main` post-merge.

## Blocked / Rejected
- _(none — parser parse-collision blocker CLEARED by task/03a merge, ORCH merge commit `692b9ad`.)_

## Next in Queue
- task/05 — Error Handling & Bootstrap (ENG) — queued, NOT activated. Awaiting PMO/ORCH authorization.
- QA — integration blocker cleared; QA may be scheduled once authorized. Not started.

## Key Decisions Log
| Date | Decision | Rationale |
|---|---|---|
| 2025-07-17 | Transition from PLANNING to DESIGN | PRD approved by PMO |
| 2025-07-17 | Transition from DESIGN to IMPLEMENTATION | ADR approved by PMO; tech stack locked |
| 2025-07-17 | task/04 PASSES review and is MERGED to main | IIFE + event delegation + Pub/Sub all correct; selectors match real `src/index.html`. |
| 2025-07-17 | Accepted DOM-selector contract deviation (task/04) | Task/04's injected DOM sketch (`#expression-display`, `#result-display`, `#button-container`, `data-action="digit"/"operator"/"function"`) did NOT match merged `src/index.html` (`#expression`, `#result`, `.buttons`, `data-action="digit-7"`, `op-add/…`, `sin/…`). `src/index.html` is authoritative; ENG correctly used the real selectors. Annotated in `tasks/task-04-ui-binding-events.md` so future task contracts reference real IDs. |
| 2025-07-17 | Parser `parse()` collision CONFIRMED — blocking integration defect from task/03 | Two `function parse` in the same IIFE scope; the later (public) declaration's body survives, so `CalcParser.parse` self-recursed instead of delegating to the internal token parser. Confirmed by static inspection AND Node repro. Defect had already been merged into main by ORCH. |
| 2025-07-17 | task/03 created as next active blocker; task/05 and QA halted | Parser must be fixed before evaluation can work. |
| 2025-07-17 | Factorial (`!!`) and `x^y` UI handler still NOT implemented (PRD FR-03 partial gap) | Deferred per task/04 contract. To be tracked as follow-up work; keyboard `^` and parser/evaluator `^` already function; UI `x^y` button has no handler yet. |
| 2025-07-17 | **task/03a PASSES review and is MERGED to main** (merge commit `692b9ad`) | Diff vs `main` is exactly 2 changed lines in `src/js/parser.js` and nothing else: `function parse(tokens)` → `function parseTokens(tokens)` (line 58) and the sole call site `return parse(tokenize(expression));` → `return parseTokens(tokenize(expression));` (line 136). Public `CalcParser.parse(expression)` preserved verbatim; `return { parse }` unchanged. No grammar/tokenizer/evaluator/UI change, no new files, no tests added. Verified by ORCH in Node against the post-merge `main`: 18/18 checks pass — `parse('2+2')` returns the exact expected AST, `parse('sqrt(4)')`→`FunctionCall`, `parse('2^3')`→`Operator ^`, `parse('')`/`parse('   ')`→`null`, precedence and unary intact, evaluator integration returns 4/2/8/10, and all five malformed-input error paths still throw the original messages. Control run against pre-fix `main` reproduced the original `expression.trim is not a function` throw, proving the fix addresses the reported defect. |
| 2025-07-17 | **Hoisting collision mechanism corrected** — ORCH review finding | The task contract's *impact* claim was right but its *mechanism* description was inverted. Per ES2015+, when two function declarations collide in one scope the **later** declaration's body survives (the earlier one is overwritten), so the surviving binding is line 134, the public `parse(expression)` — **not** the internal token parser as the task file states. Decisive runtime evidence: calling `CalcParser.parse(tokenArray)` on pre-fix `main` threw `expression.trim is not a function`; only the public function calls `.trim()`, so the bound body was the public one. `CalcParser.parse` therefore called itself at line 136 (self-recursion) instead of the internal parser, throwing before any AST work. Net observable effect is identical to what the contract claims and the prescribed remedy (`parse`→`parseTokens`) was correct and was executed exactly as specified. Task file left as-is; this log entry supersedes its mechanism wording. |
| 2025-07-17 | Parser parse-collision blocker CLEARED | `main` post-merge verified working end-to-end at the parser/evaluator layer. task/05 and QA are unblocked but remain deliberately NOT activated pending explicit PMO instruction. |