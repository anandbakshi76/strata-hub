# Runbook

How Strata Hub is run once it's live. Keep it current: the review checks it when deployment changes.

## Deploy

- Command: (to be filled in when deployment is built)
- Where it runs: (to be filled in)

## Roll back

- Command: (to be filled in: deploy the previous tag)
- Last rehearsed on: ____ by ____

## Health

- Health check: (to be filled in)
- Logs and traces: traces are in `logs/traces/` as JSON lines. Find a request by the trace ID shown in errors.
- Dashboards and alerts: as set in `docs/OBSERVABILITY.md`, Budgets and alerts.
- Who to call: (to be filled in)

## Limits for an agent reading logs

- Read only. Never change production data, settings or deployments.
- Don't copy personal data into notes, briefs or chats.
- Stop and ask the person before running anything against production.
- The same limits apply to traces: read only, and nothing exported.

## Investigating a problem

Paste one of these into your coding agent, filled in.

### Errors on one part

```
Context: Strata Hub is live. Users report errors on <endpoint or screen> since <time>. Read AGENTS.md and docs/RUNBOOK.md first.
Instruction: Find the cause. Read the traces and logs (read only), reproduce the error locally, and find the commit or change that caused it. Change no code.
Input:
- EVIDENCE: <error messages, log lines, trace IDs>
- LIMITS: as in Limits for an agent reading logs
Output:
- A timeline: when it started and what changed then
- The cause, with evidence
- Who and what is affected
- A suggested fix, as the start of a Next change
```

### A spike after a deploy

```
Context: After the deploy of <tag> at <time>, <errors, latency or cost> rose. Read AGENTS.md and docs/RUNBOOK.md first.
Instruction: Compare <tag> with the previous tag: the diff, the config and the dependencies. Say whether to roll back now. Change nothing.
Output:
- Roll back or not, with the reason
- The likely cause, with evidence
```

### Incident drill

```
Context: This is a drill. Nothing is broken. Read AGENTS.md and docs/RUNBOOK.md first.
Instruction: Walk through Roll back as if <the last deploy> failed: check each command exists and would work, without running anything against production. List every gap in this runbook.
Output:
- The gaps, each with a suggested fix to docs/RUNBOOK.md
- The date to write under Last rehearsed, once the person has run the real rollback
```
