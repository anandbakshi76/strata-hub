# Review

How a pull request for Strata Hub is reviewed. The reviewer never wrote the code: use a fresh session, the verifier, or another person.

## The passes, in order

1. **Plan and spec.** The diff delivers the phase in `docs/PLAN.md`: the files it names, its criteria, nothing from Not for now. Every business rule it touches matches `docs/SPEC.md`.
2. **Tests.** Each criterion has a test that was written first and tests real behaviour. None is skipped, empty or always passing. The test count didn't go down.
3. **Security.** No secrets in code; every input from outside is validated; who may do what is checked before data is touched.
4. **Data and rules.** Personal data is handled as the spec says. Business rules are enforced where `docs/TECH_STACK.md` says.
5. **Docs.** `docs/STATUS.md`, `README.md` match the change, and `docs/RUNBOOK.md` matches any change to deployment; the dated note is there.
6. **Traces.** Every new request is traced through the telemetry module. One sample trace holds no key, no personal data, and no request text unless LOG_CONTENT is on. A missing trace is a Blocker.

## Severity

- **Blocker**: wrong behaviour, a security or privacy hole, data loss, a failing check, or a criterion with no test. Fixed before merge.
- **Should fix**: a real problem that isn't urgent. Fixed in this pull request unless the person agrees to a follow-up.
- **Note**: style or a suggestion. Optional.

Each finding gives the file and line, what is wrong, why it matters and a suggested fix. No finding without evidence.

## Who approves

- A person approves every merge. Nobody merges their own pull request.
- `npm run check` must pass first.
- A change to `docs/INTENT.md`, the guard or the hooks needs the person's explicit approval in the pull request.
