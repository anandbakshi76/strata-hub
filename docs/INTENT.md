# Intent: Strata Hub

Author: Anand Bakshi
Status: Approved (Approved by Anand Bakshi____ on 19th Nov 2026____)
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

## Design intent

- The feeling: [to confirm] calm, precise, premium hardware. The product is the hero, and the page stays quiet around it.
- References: 3 to 6 screenshots in `design/references/`, each with its source link. We take principles from them (mood, type, colour, spacing, motion), never layouts, images or brand assets.
- Design system: UI/UX Pro Max turns the intent and references into `DESIGN.md` at Step 0. `docs/BRAND.md` and the `brand` skill follow it.
- Motion: the static page must work first. GSAP motion is added after Playwright passes on the static build, and reduced motion gets a still version.
- Checks: Playwright tests layout at 375, 768 and 1280 px, keyboard use and the form. Impeccable reviews the look once before the evidence gate.

## Open points for Step 0

- Success can be measured: No success measure. Give at least one, with a number.
- Guardrails: what it must never do: No guardrails. Name at least one thing it must never do.
- When to stop and ask a person: Say when the work must stop for a person to decide.

## Changes after approval

Recorded on 19 November 2026, approved by Anand Bakshi with the spec (QG2). Reason: Step 0 answered the three open points above; the original lines stay as they were.

- **How we'll know it worked:** at least 4% of visitors register interest; LCP under 2.5 s at the 75th percentile on a mid-range phone; Lighthouse accessibility 95 or more; the 3D section at 50 frames per second or more on that phone.
- **It must never:** hide content when 3D or JavaScript fails; use copied brand assets; ask for more than an email and one optional choice; send form data anywhere without consent; autoplay sound.
- **Stop and ask a person when:** adding any third-party script or tracker; changing a price or product claim; the 3D can't meet the speed targets.

Recorded on 20 November 2026, approved by Anand Bakshi at the phase 2b review. Reason: a faster first paint and a simpler, sharper fallback; the intent's lines above stay as they were.

- **Key screens:** "Hero with the 3D hub" is built as the hero with a still of the hub; the 3D hub appears in the look-inside section, where it comes apart. SPEC 5.1 and 8 updated.
- **Stills:** the fallback stills are self-made drawings matching the model, not renders of it. SPEC 9 updated.
- **Phones:** the 3D hub is a band at the top with a label naming the module, not a full-screen canvas. DESIGN.md 8 updated.
