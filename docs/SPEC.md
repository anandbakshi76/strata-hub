# Strata Hub

Status: Approved (Approved by Anand Bakshi on 19 November 2026)
Built from: `docs/INTENT.md`, approved on 19 November 2026
Record ID: (none given in INTENT.md)

A scroll-driven launch page for Strata, a fictional modular smart home hub. It is for smart home early adopters and tech press, mostly on phones. Strata, its modules, prices and specs are made up; the page says so in its footer.

Each requirement names where it comes from: a section of INTENT.md, an answer from Step 0 (19 November 2026, "A1" to "A12"), or "Assumed:".

## 1. How it works today

There is no page yet. Strata is a new, fictional product, so there is no current process, site or content to replace. (Assumed: from INTENT "The problem today", which describes the page to build rather than a current problem.)

## 2. The goal and how we'll measure success

The goal: a visitor understands what Strata is and why its modules matter within one scroll, and registers interest. (INTENT "What it must do")

Acceptance tests (A1):

1. **Registrations:** at least 4% of visitors who reach the page submit the register-interest form. Measured once a form service exists; in the pilot, checked by a test that the form can be completed and confirmed. (A1, A4)
2. **Speed:** Largest Contentful Paint under 2.5 seconds at the 75th percentile on a mid-range Android phone over a 4G profile, measured with Lighthouse mobile. (INTENT "Constraints", A1)
3. **Accessibility:** Lighthouse accessibility score of 95 or more on every section, and no WCAG 2.2 AA failures found by an automated check (axe). (A1, A11)
4. **Smooth 3D:** the 3D section holds 50 frames per second or more while scrolling on the same mid-range phone profile; if it can't, the person is asked (rule 7). (A1, A3)

## 3. Users and what each may do

| User | What they may do |
|------|------------------|
| Visitor (early adopter, tech press), mostly on a phone | Read every section, scroll the 3D story, compare bundles, submit the register-interest form, read the FAQ. (INTENT "Who it is for") |

There are no other roles: no sign-in, no admin screen and no content editing on the site (INTENT "Not for now": user accounts, a CMS). Content changes are made in the code by the team. (Assumed)

## 4. What it must do

1. **A scroll-driven launch page** that tells the Strata story from top to bottom. (INTENT "What it must do")
   Example: on a phone, a visitor scrolls from the hero to the footer in one continuous page, with a "Register interest" button always in the header.
2. **A 3D model of the hub that explodes into its modules as you scroll, then snaps back together.** (INTENT "What it must do")
   Example: after the hero, scrolling moves the hub apart into the lights, climate, security and energy modules; after the fourth module chapter it reassembles. Scrolling back up plays it in reverse.
3. **One section per module** (lights, climate, security, energy), each with a short story and 3 key specs. (INTENT "What it must do", A7)
   Example: "Climate: Learns when you're home and keeps each room at your set temperature, within 0.5°C." Specs: "Temperature range 5 to 35°C", "Humidity sensing 0 to 100%", "Battery-free, powered by the hub". All copy is fictional and is approved by the person before release.
4. **A compare section for the three bundles with prices.** (INTENT "What it must do", A6)
   Example: three cards side by side on desktop and stacked on a phone: Starter $199 (hub and lights), Home $349 (hub, lights, climate and security), Complete $499 (hub and all four modules). Each card lists what is included, with a tick or a dash per module.
5. **A register-interest form for launch news.** (INTENT "What it must do", A4)
   Example: a visitor enters "sam@example.com", picks "Security" as the module that interests them most, ticks consent and presses Register interest. The page shows "Thanks. We'll email you when Strata launches." In the pilot nothing is sent (rule 4).
6. **An FAQ** with 6 questions. (INTENT "Constraints: key screens", A8)
   Example: "Is there a subscription?" "No. Everything works without a monthly fee."

## 5. The main workflow, step by step

The order on the page (A9):

1. **Hero:** a still image of the assembled hub, the headline, one line on what Strata is, and the Register interest button. (Changed 20 November 2026, approved by Anand Bakshi: the 3D hub lives in the look-inside section; a still in the hero keeps the first paint fast, acceptance test 2.)
2. **Look inside:** a "Scroll to look inside" cue. Scrolling explodes the hub into its four modules.
3. **Module chapters:** lights, climate, security, energy. As each chapter comes into view, its module is highlighted in the model, with a thin-line callout naming it, its story and its 3 specs.
4. **Reassemble:** the modules snap back into the hub, with one line: "Start with one module. Add the rest when you're ready."
5. **Bundles:** the three bundle cards.
6. **Register interest:** the form, with its privacy note.
7. **FAQ:** the 6 questions, each opening and closing on its own.
8. **Footer:** "Strata is a fictional product made for a design pilot", and a link back to the top.

The header (logo, section links, Register interest button) stays at the top on every screen. Its button jumps to step 6 and puts the focus in the email field. (A9)

## 6. Records and data

The site stores nothing. (A4, A5)

| Field | Required | Rule | Sensitive |
|-------|----------|------|-----------|
| Email | Yes | A valid address, up to 254 characters | **Yes: personal data** |
| Module of interest | No | One of: Lights, Climate, Security, Energy, Not sure yet | No |
| Consent | Yes | Must be ticked to submit | No |

In the pilot the form keeps these only in the page until it is closed: they are not sent, saved or logged. (A4, A5)

## 7. Business rules

1. **The 3D model is procedural or self-made; no copied brand assets or product images.** (INTENT "Business rules")
   Example: the hub and modules are built from Three.js shapes and our own materials. The design references in `design/references/` are never used as textures, images or layouts.
2. **The content never depends on 3D or JavaScript.** (A2)
   Example: with JavaScript off, every heading, story, spec, bundle and FAQ answer is still readable in order.
3. **Ask for no more than an email address and one optional choice.** (A2, A4)
   Example: no name, phone number or address fields, now or in the pilot.
4. **Form data is never sent anywhere without consent, and in the pilot it is not sent at all.** (A2, A4)
   Example: pressing Register interest without the consent box ticked shows "Tick the box to agree we can email you" next to the box, and nothing is submitted.
5. **No sound plays unless the visitor starts it.** (A2) The pilot has no sound.
6. **No third-party script, tracker or cookie is added without the person's approval.** (A2, A3, A5)
   Example: fonts are self-hosted rather than loaded from a font service. (Assumed: self-hosting keeps rule 6 without asking.)
7. **Prices and product claims change only with the person's approval.** (A3)
   Example: changing Home from $349 to $329 is a hand-over to the person, not a code change the agent makes alone.
8. **If the 3D can't meet the speed and smoothness targets, stop and ask** whether to simplify the model or the motion. (A3)
   Example: the 3D section runs at 38 frames per second on the phone profile: the agent reports the number and offers two simpler options, and does not cut features on its own.

## 8. What the team needs to see

The sections a visitor sees (INTENT "Constraints: key screens", A9):

- **Header:** logo, links to Modules, Bundles and FAQ, and the Register interest button.
- **Hero with the hub:** the headline, one line, the button, and the still image of the assembled hub (the 3D hub appears in the look-inside section).
- **Module story sections:** four chapters, each with a module name, a story of up to 40 words and 3 specs.
- **Bundles compare:** three cards with name, price, included modules and a button that goes to the form.
- **Register interest:** the form and its privacy note.
- **FAQ:** six questions.
- **Footer:** the fictional-product note.

## 9. What can go wrong, and what should happen

| What goes wrong | What should happen |
|-----------------|--------------------|
| The device has no WebGL, or the 3D fails to load | Show still images of the assembled and exploded hub, rendered from our own model by `npm run stills` (changed again 20 November 2026 at the phase 3 design critique, approved by Anand Bakshi: the hand-drawn stills did not match the model), and scroll normally. Nothing is hidden. (A10) |
| The visitor prefers reduced motion | No scroll-driven motion: the still images are shown and sections appear in their final state. (A10, INTENT "Constraints") |
| JavaScript is off | The page reads top to bottom as plain content; the form shows "Turn on JavaScript to register interest." (A2) |
| The 3D model is still loading | The hero shows the still image of the hub in the same place and size, so nothing moves when the model is ready. (Assumed) |
| The email is empty or not valid | "Enter an email address, like name@example.com" next to the field; the focus moves to it. (Brand skill) |
| The consent box is not ticked | "Tick the box to agree we can email you" next to the box. (Rule 4) |
| A slow connection | Text and still images first; the 3D loads after, without blocking reading. (A1, Assumed) |

## 10. Quality needs

- **Privacy:** no cookies, no analytics and no trackers in the pilot. A one-line note under the form: "We only use your email to tell you about the Strata launch. Nothing is sent in this demo." (A5)
- **Security:** a static site with no back end and no secrets. A Content Security Policy that allows only the site's own scripts, styles and fonts. (Assumed)
- **Accessibility:** WCAG 2.2 AA. Keyboard only works everywhere, focus is always visible, text contrast is at least 4.5:1, touch targets are at least 44 by 44 px, and the 3D canvas has a text alternative that describes the hub and its modules. (A11, brand skill)
- **Speed:** LCP under 2.5 s (test 2). The page's JavaScript and the 3D model together stay under 600 KB compressed. (Assumed)
- **Volumes:** a launch page with traffic spikes. Static hosting with a CDN handles it with no limits to set. (Assumed)

## 11. Connections to other systems

None in the pilot. A form service for the register-interest form is a later decision, which needs the person's approval (rule 6). (A4)

## 12. Sign-in, browsers and accessibility

- **Sign-in:** none. (INTENT "Not for now": user accounts)
- **Browsers:** the latest two versions of Chrome, Safari (iOS and macOS), Edge and Firefox, and Chrome on a mid-range Android phone. (A11)
- **Sizes:** from 375 px wide up, with no horizontal scrolling. Checked at 375, 768 and 1280 px. (INTENT "Constraints", A11)
- **Accessibility:** see section 10.

## 13. Observability

- **Time:** LCP under 2.5 s at the 75th percentile; the 3D ready within 4 s on the phone profile. (A1, Assumed)
- **Errors:** zero console errors on load and while scrolling, in every listed browser. (Assumed)
- **Recorded:** nothing about visitors (A5). The build records the Lighthouse and Playwright results for each release in `docs/log/`. (Assumed)

## 14. Not for now

- Online checkout (INTENT)
- User accounts (INTENT)
- A CMS (INTENT)
- Sending the form to a real service (A4)
- Analytics and cookies (A5)

## 15. Assumptions to confirm

- Assumed: section 1 has no current process, because the product is new and fictional.
- Assumed: content changes are made in code by the team.
- Assumed: fonts are self-hosted, so no font service is a third party.
- Assumed: the hero shows a still image while the 3D loads, in the same place and size.
- Assumed: a Content Security Policy that allows only the site's own files.
- Assumed: the page's JavaScript and 3D model stay under 600 KB compressed.
- Assumed: the 3D is ready within 4 s, and there are zero console errors.
- Assumed: Lighthouse and Playwright results are saved in `docs/log/` for each release.

## 16. Open questions

- Open question: the brand name "Strata" is only a working name. Is it the final name for the pilot?
- Open question: the module copy and specs in section 4 are examples. The full copy for all four modules and the six FAQ answers is drafted at Step 3 and needs your approval then. Is that the right time?

## Changes to the intent for you to approve

Your answers fill three open points in INTENT.md. I haven't changed INTENT.md; these need your approval to add:

1. **How we'll know it worked:** the four acceptance tests in section 2.
2. **Guardrails, it must never:** rules 2 to 6 in section 7.
3. **Stop and ask a person when:** rules 6, 7 and 8 in section 7.

## Concerns

None. No requirement conflicts with the `brand` skill: rules 2 and 4 and sections 9, 10 and 12 apply its keyboard, focus, contrast, 375 px and error-message rules.
