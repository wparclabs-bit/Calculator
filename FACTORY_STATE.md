# Factory State

**Project:** Scientific Calculator
**Last Updated:** 2025-07-17 by ORCH
**Current Phase:** IMPLEMENTATION

---

## Active Task
| Field | Value |
|---|---|
| Task ID | task/03a-parser-parse-collision |
| Assigned to | ENG |
| Branch | task/03a-parser-parse-collision |
| Status | READY (BLOCKING — next active task) |

## Completed Tasks
- [x] task/00 — PRD Approved (Merged to main)
- [x] task/01 — Architecture Decision Record (Merged to main)
- [x] task/02 — UI Layout (Merged to main)
- [x] task/03 — Core Math Engine (Merged to main) — ⚠ reintroduced parse() collision defect merged on ORCH merge (see Blocked)
- [x] task/04 — UI Binding & Events (Reviewed & Merged to main)

## Blocked / Rejected
- **task/03a-parser-parse-collision (BLOCKING, READY)** — Bug confirmed: `src/js/parser.js` has two `function parse` declarations in the same IIFE scope (line 58 internal `parse(tokens)`, line 134 public `parse(expression)`). The later one shadows the earlier, so `CalcParser.parse` is bound to the internal token-parsing function. Verified in Node: `CalcParser.parse('2+2')` throws `expression.trim is not a function`. Affects the real UI evaluation path (`events.js` → `CalcParser.parse`). Defect originates in task/03 code already on main (parser.js is byte-identical on main and task/04). **DO NOT proceed to task/05 or QA until task/03a is merged.**

## Next in Queue
- task/03a — Fix `parse` name collision in CalcParser (ENG) — READY; next active task (see Active Task above).
- task/05 — Error Handling & Bootstrap (ENG) — BLOCKED by task/03a. Do not start until the parser defect is resolved or explicitly dismissed with evidence.
- QA — BLOCKED by task/03a (integration is broken).

## Key Decisions Log
| Date | Decision | Rationale |
|---|---|---|
| 2025-07-17 | Transition from PLANNING to DESIGN | PRD approved by PMO |
| 2025-07-17 | Transition from DESIGN to IMPLEMENTATION | ADR approved by PMO; tech stack locked |
| 2025-07-17 | task/04 PASSES review and is MERGED to main | IIFE + event delegation + Pub/Sub all correct; selectors match real `src/index.html`. |
| 2025-07-17 | Accepted DOM-selector contract deviation (task/04) | Task/04's injected DOM sketch (`#expression-display`, `#result-display`, `#button-container`, `data-action="digit"/"operator"/"function"`) did NOT match merged `src/index.html` (`#expression`, `#result`, `.buttons`, `data-action="digit-7"`, `op-add/…`, `sin/…`). `src/index.html` is authoritative; ENG correctly used the real selectors. Annotated in `tasks/task-04-ui-binding-events.md` so future task contracts reference real IDs. |
| 2025-07-17 | Parser `parse()` collision CONFIRMED — blocking integration defect from task/03 | Two `function parse` in the same IIFE scope; public `CalcParser.parse` shadows the internal one. Confirmed by static inspection AND Node repro. Merged into main via ORCH. |
| 2025-07-17 | task/03 created as next active blocker; task/05 and QA halted | Parser must be fixed before evaluation can work. |
| 2025-07-17 | Factorial (`!!`) and `x^y` UI handler still NOT implemented (PRD FR-03 partial gap) | Deferred per task/04 contract. To be tracked as follow-up work; keyboard `^` and parser/evaluator `^` already function; UI `x^y` button has no handler yet. |