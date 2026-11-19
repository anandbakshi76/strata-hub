# Intent: Strata Hub

Author: ____
Status: Draft (Approved by ____ on ____)
Record ID: (optional: the ticket or requirement ID, for example in Jira)

Why this project exists and what good looks like. The spec is built from it. Don't change it after approval: a change of intent is a decision, recorded with the reason.

## The problem today

A scroll-driven launch site for Strata, a fictional modular smart home hub whose modules snap together
A 3D model of the hub that explodes into its modules as you scroll, then snaps back together
One section per module: lights, climate, security and energy, each with a short story and key specs
A compare section for the three bundles with prices
A register-interest form for launch news

## Who it is for

Smart home early adopters and tech press visiting a product launch page, mostly on phones

## What it must do

- A scroll-driven launch site for Strata, a fictional modular smart home hub whose modules snap together
- A 3D model of the hub that explodes into its modules as you scroll, then snaps back together
- One section per module: lights, climate, security and energy, each with a short story and key specs
- A compare section for the three bundles with prices
- A register-interest form for launch news

## How we'll know it worked

- (not given: Step 0 asks)

## Guardrails

It must never:

- (none given: Step 0 asks)

Stop and ask a person when:

- (none given: Step 0 asks)

## Business rules

- The 3D model is procedural or self-made; no copied brand assets or product images

## Not for now

- Online checkout
- User accounts
- A CMS

## Constraints

- Tech stack: Vite with vanilla JavaScript, Three.js for 3D and GSAP ScrollTrigger for motion, static hosting
- Must-haves and limits: Works at 375 px wide and up; Respects reduced motion with a static fallback; Largest Contentful Paint under 2.5 seconds on a mid-range phone
- Key screens or data: Hero with the 3D hub; Module story sections; Bundles compare; Register interest; FAQ
- Look and feel: Design language from collected references, written into DESIGN.md before any build

## Open points for Step 0

- Success can be measured: No success measure. Give at least one, with a number.
- Guardrails: what it must never do: No guardrails. Name at least one thing it must never do.
- When to stop and ask a person: Say when the work must stop for a person to decide.
