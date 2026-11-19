# Process

`npm install` installs everything. `npm run dev` starts it.

`npm run check` runs every check:

- JavaScript and TypeScript: format (Prettier), lint (ESLint), types (tsc), unit tests (Vitest) and browser tests (Playwright with axe, against the production build)

## Planning

When asked to plan, as in "Please plan the build", write the plan to `docs/PLAN.md` and write no code.

- Use the phases given in the planning request, in that order. If a phase should change, say so in the plan with the reason; don't change it yourself.
- Name the spec items each phase delivers.
- For each phase, list the files that change, the order of the work, what it could break, and the proof that it works.
- Mark each phase that doesn't depend on another as "Can run in parallel with", so it can be built in its own worktree.
- Give each phase success criteria you can check yourself: tests that pass, commands and their output, API calls and their responses, and pages you check in the browser. Write each one as a checkbox.
- Under Options not chosen, list the other ways you considered and why you didn't pick them.
- List the choices you made that the person should review.
- Start the plan with its header: Status, Built from and Record ID, as in `docs/INTENT.md`.
- The plan is ready when someone who never saw this conversation could build each phase from it alone.
- Then stop and wait.

## Implementing

When asked to implement a phase, as in "Please implement phase 2 of the plan", build that phase only:

1. Write the tests for its criteria first. Run them and see each one fail for the reason you expect; keep that output for your report.
2. Build until they pass, without changing what the tests check. No stubbed or empty tests: each one checks real behaviour.
3. Check every success criterion and fix whatever fails.
4. Tick off its criteria in `docs/PLAN.md` and update `docs/STATUS.md`.
5. Update the docs the change affects: `README.md`.
6. Write a dated note in `docs/log/`, such as `2026-11-19-phase-1.md`: what was built, choices made and alternatives rejected.
7. Commit.

Then stop and report.

## Branches and reviews

- Work on a branch for each phase or change, named like `phase-2-model-calls`. Never commit to main after the foundation.
- When the phase is done, write a pull request description (what it does, how you checked it, what to review) as the last part of your report. The person pushes the branch and opens the pull request.
- The review follows `REVIEW.md`, in a fresh session or by another person. Fix every Blocker before merge.
- The person approves and merges.

## Releasing and rolling back

- Each release is a git tag, such as `v1.2.0`, made by the person.
- `docs/RUNBOOK.md` gives the deploy and rollback commands. Rehearse the rollback before the first release and after any change to how it deploys, and write the date there.
- Never deploy or roll back yourself unless the person asks in this session.

## Rules

- Write the tests before the code they check, and add tests with each change.
- Run `npm run check` before you hand work over.
- Keep `docs/STATUS.md` up to date.
- Never push.
- Every request goes through the telemetry module (`web/telemetry.ts`), as `docs/OBSERVABILITY.md` describes. Never call the tracing tool directly, and never log a key or personal data.
- `docs/INTENT.md` doesn't change after approval. If the work shows the intent is wrong, stop and ask; a change of intent is a decision.
- Requirements change in `docs/SPEC.md` first, and only when the person asks.
- If the build departs from `docs/PLAN.md`, update the plan in the same commit and say why in the dated note.
- When the person approves `docs/INTENT.md`, `docs/SPEC.md` or `docs/PLAN.md`, set its Status to Approved with their name and the date at the top of the file.
- Commit messages name the phase or change, and the Record ID if the file headers give one, for example "Phase 2: model calls (CLAIM-14)".
- When the same mistake happens twice, add it to Things the agent gets wrong in `AGENTS.md`.
- Before you report a phase as done, have it checked as Checking a phase in `AGENTS.md` says, and report the verdict.
- Everything must work on Windows and Mac.
