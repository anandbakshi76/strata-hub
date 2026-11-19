# Observability

Author: (to be filled in). Status: Draft. Built from `docs/SPEC.md`.

How Strata Hub records what happened (traces). Tracing tool: the built-in tracer, chosen by TRACE_BACKEND in `.env`. The code is in `web/telemetry.ts`; nothing else talks to the tracing tool.

## What we capture

| Signal | From | Kept for |
|---|---|---|
| A trace per request, with a span for each handler, query and call to another system | the telemetry module | 30 days |
| Time per span; p50 and p95 per feature | spans | 13 months, as totals |
| Errors, with their class | spans | 30 days |

## Trace layout

    request        trace_id, session_id, user (hashed), feature, app version
      span         each handler, query and call to another system: name, time, success

## Budgets and alerts

| Measure | Target | Alert when | Who is told |
|---|---|---|---|
| p95 time per request | (to be filled in) | above target for 15 minutes | on-call |
| Error rate | (to be filled in) | above target for 15 minutes | on-call |

## Privacy

- Emails, phone numbers, card numbers and keys are masked before anything is exported.
- With LOG_CONTENT=false (the default) traces keep sizes and hashes, not request or response text. Turn it on only while developing, never with real personal data.
- Traces stay on the machine or server that writes them; `logs/` is never committed.

## Where to look

- Traces: in `logs/traces/` as JSON lines.
- From an error or a user report, find the request by the trace ID shown in the error and the logs.

## Reports

Weekly: time and errors. Each release: the slowest requests and the errors by class. Each report gives the period, the figures against the budgets above, the trend and the worst requests by trace ID.
