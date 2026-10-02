# AGENTS.md — Factory Rules of Engagement

## Project
- **Name:** [PROJECT_NAME]
- **Repo:** [GITHUB_URL]
- **Created:** [DATE]

## Directory Structure
```
project/
├── AGENTS.md          ← You are here. Factory rules.
├── FACTORY_STATE.md   ← ORCH-owned. Current project state.
├── specs/             ← PM owns. PRDs, user stories.
├── design/            ← UI-UX owns. Wireframes, design specs.
├── adr/               ← ARCH owns. Architecture decisions.
├── tasks/             ← ORCH owns. Task contracts.
├── src/               ← ENG owns. Source code.
├── tests/             ← QA owns. Test suites.
├── reports/           ← QA/SEC owns. Audit reports.
├── analysis/          ← DA owns. Metrics, feedback.
├── docs/              ← TW owns. User/dev documentation.
└── infra/             ← OPS owns. CI/CD, deployment.
```

## Persona Roster
| Persona | Role | Primary Deliverable | Directory |
|---|---|---|---|
| PM | Product Manager | PRD | specs/ |
| UI-UX | UI/UX Architect | Design Spec | design/ |
| ARCH | Software Architect | ADR | adr/ |
| ORCH | Orchestrator | Task Contracts + Reviews | tasks/ |
| ENG | Software Engineer | Source Code | src/ |
| QA | QA Engineer | Test Reports | tests/, reports/ |
| SEC | Security Engineer | Security Audit | reports/ |
| OPS | SRE | Deployment Config | infra/ |
| DA | Data Analyst | Metrics Report | analysis/ |
| TW | Technical Writer | Documentation | docs/ |

## Git Rules
1. `main` is sacred. Only ORCH merges to main.
2. All work happens on `task/<id>-<short-name>` branches.
3. Commit format: `[PERSONA] <type>: <description>`
4. Types: feat, fix, docs, test, chore, refactor

## Handoff Protocol
- Every persona MUST end their deliverable with a `## Handoff` section.
- The Handoff section states: who reviews this, who consumes this next, and what file path to read.
- ORCH reviews ALL deliverables before the next persona begins.

## Context Rules
- Worker personas (ENG, QA, UI-UX) read ONLY the files listed in their task contract.
- Do NOT read the entire repo unless ORCH explicitly instructs it.
- If a task requires context from more than 3 files, ORCH must summarize the context INTO the task file.

## Human Gates
- Human (PMO) approves: PRD, ADR, WBS, final UAT.
- ORCH approves: all micro-task outputs, code reviews, test reports.