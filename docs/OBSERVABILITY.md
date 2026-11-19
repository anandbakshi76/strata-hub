# Observability

Author: Anand Bakshi. Status: Draft. Built from `docs/SPEC.md`.

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
| p95 time per request | Not used: a static site has no requests. Instead, Largest Contentful Paint under 2.5 s at the 75th percentile on a mid-range phone (SPEC 2 and 13), measured by Lighthouse at each release | above target in a release check | Anand Bakshi |
| Error rate | Zero console errors on load and while scrolling, in every listed browser (SPEC 13), checked by Playwright | any error in a test run | Anand Bakshi |

## Privacy

- Emails, phone numbers, card numbers and keys are masked before anything is exported.
- With LOG_CONTENT=false (the default) traces keep sizes and hashes, not request or response text. Turn it on only while developing, never with real personal data.
- Traces stay on the machine or server that writes them; `logs/` is never committed.

## Where to look

- Traces: in `logs/traces/` as JSON lines.
- From an error or a user report, find the request by the trace ID shown in the error and the logs.

## Reports

Weekly: time and errors. Each release: the slowest requests and the errors by class. Each report gives the period, the figures against the budgets above, the trend and the worst requests by trace ID.

## Concern for the person (Step 1, 19 November 2026)

Strata Hub is a static site with no server, and SPEC section 13 says nothing is recorded about visitors. So the request, session and user rows above don't apply. Approved at Step 1: `web/telemetry.ts` traces build and test runs only (JSON lines in `logs/traces/`, masked); in the browser `trace()` only runs the function and records nothing.
