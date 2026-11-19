# Strata Hub

A scroll-driven launch site for Strata, a fictional modular smart home hub whose modules snap together
A 3D model of the hub that explodes into its modules as you scroll, then snaps back together
One section per module: lights, climate, security and energy, each with a short story and key specs
A compare section for the three bundles with prices
A register-interest form for launch news

## Start here

IMPORTANT: before you plan, build or change anything, or answer questions about the project, read each of these files in full:

1. `docs/INTENT.md`: why the project exists and what good looks like (approved; don't change it)
2. `docs/SPEC.md`: what the business needs
3. `docs/TECH_STACK.md`: the tech choices
4. `docs/CODE_STANDARDS.md`: how to write the code
5. `docs/PROCESS.md`: how to plan, build and check the work
6. `docs/BRAND.md`: the look
7. `docs/STATUS.md`: what is built so far and how to run it
8. `docs/RUNBOOK.md`: how it runs once it's live, and how to investigate a problem
9. `docs/OBSERVABILITY.md`: what the app records about what happened and why: traces, decision records, budgets
10. `REVIEW.md`: how pull requests are reviewed
11. `docs/PLAN.md`: the build plan, once Step 2 has written it

## Your role

The documents in `docs/` are the customer's requirements. Build only what they ask for; don't build ahead.

- **You do:** plan, write the tests first, build, check every criterion, and keep the docs and logs current, as `docs/PROCESS.md` describes.
- **The person checks:** the plan, the tests, the diff and your report, before anything moves on.
- **The person decides:** what to build and in what order, every approval, trade-offs, and anything in `docs/INTENT.md`.

## Verify your work

Run `npm run check` before you report anything as done, and paste the output. A healthy run exits with code 0 and every test passes.

- If a test fails, fix the code, not the test. Never skip, delete or weaken a failing test.
- For screens, open the page in the browser and check it against the criterion.

## Things the agent gets wrong

- (none yet)

When the same mistake happens twice, add one line here saying what to do instead. Keep this file under a page; detail belongs in `docs/`.

## Documentation

Update the docs in the same commit as the change: `README.md` for how to run it, `docs/STATUS.md` for what is built.

## Guardrails

`scripts/agent-guard.mjs` runs before each command and file change (wired up in `.claude/settings.json`) and formats each file after you edit it. It blocks:

- pushing, skipping the pre-commit hook and recursive deletes
- edits to `docs/INTENT.md`, `.env` and the guard's own files
- reading `.env`
- skipped, focused or empty tests, and secrets written into code

If the guard blocks you, don't work around it: stop and tell the person.

## Skills

Use the skills in `.claude/skills/` when the work matches: `brand` for screens.

### What the guard did

Each decision, allow or deny, is added to `.agent-logs/guard.jsonl` (not committed): the time, the agent, the tool, the rule and the target, with secrets masked. Read it to see what was blocked and why. Never edit it.

Optional, and the person's choice because it sends usage data off the machine: Claude Code's own telemetry (CLAUDE_CODE_ENABLE_TELEMETRY=1 with an OpenTelemetry exporter) records tool decisions, cost and tokens. Set it in your user settings or shell: the project's settings can't turn the exporters on. Langfuse's Claude Code hook is another option; keep its keys in `.claude/settings.local.json`, never in `.claude/settings.json`.

## Checking a phase

Before you report a phase as done, ask the verifier subagent (`.claude/agents/verifier.md`) to check it, and put its verdict at the top of your report.

## Folders

- `docs/log/`: dated notes per phase: what was built, choices made and alternatives rejected
- `web/`: web front end (Web)
