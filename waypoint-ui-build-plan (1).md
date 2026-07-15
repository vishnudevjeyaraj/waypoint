# Waypoint — UI Build Plan
*Companion to `waypoint-ui-spec.md`. Execute in order. Each phase should leave the app in a working, testable state — stop and let the owner check before moving to the next phase. Deadline: tomorrow night, so favor shipping a working phase over polishing one that isn't done.*

---

## Phase 1 — App shell & routing
Set up the structural skeleton everything else lives in.

- Create real routes: `/today`, `/route`, `/progress`, `/profile`. Move existing logic into `/today` (or wherever "today's task" currently renders) and `/route` (existing breakdown view). The existing onboarding flow stays at `/` (or wherever it lives now) and, on completion, redirects into `/today` — don't move or restructure onboarding itself in this phase.
- Build the nav component once, with the four destinations from the spec (icons: `Sun`, `Map`, `TrendingUp`, `User` from `lucide-react`), rendered as a **left sidebar by default**, collapsing to a **bottom bar at narrow widths**.
- Wire up the redirect guard: visiting any of the four routes without a completed goal sends the user back into onboarding.
- Apply the design tokens from the spec (colors, radius, spacing) at a global level — even if pages aren't fully restyled yet, the shell (background, sidebar/bar, base typography) should already look right.

**Done when:** you can navigate between four real pages via sidebar (or bottom bar if narrow), the URL changes, refresh keeps you on the same page, and it already looks like "an app," even if page contents are still rough.

---

## Phase 2 — Today page
The most important page — this is what a returning user sees, and the fastest way to make the app feel real.

- Build to the spec: task card, checkbox with the 200ms confirm micro-interaction, if-then sentence beneath in muted text, weekly 7-dot strip, calm completed state.
- Pull from existing state/logic (today's task, if-then plan, weekly completion) — this is a restyle + relayout of data you already have, not new logic.
- Apply the single-accent rule: accent color appears only on the checkbox/primary state, nothing else on this page.

**Done when:** Today looks and feels like the spec's description — calm, one focal point, no clutter.

---

## Phase 3 — Route & Progress pages
Give the other two data views a proper home.

- **Route:** relocate the existing breakdown component here. Nearest-tier card prominent; year/quarter/month/week collapsed behind progressive disclosure, matching the existing onboarding breakdown style. Add the "Adjust" ghost button on the nearest step (can be a simple stub if a real edit flow isn't feasible tonight — it should exist as a UI affordance even if minimally functional).
- **Progress:** larger weekly view (7 dots + day labels), contextual miss-response copy (on-track / one-miss reassurance / approaching-second-miss nudge) using the copy already written for this. Skip the multi-week history — cut it, not worth the time tonight.

**Done when:** all three data pages (Today, Route, Progress) are reachable, styled consistently, and show real data.

---

## Phase 4 — Profile page & global "Show the science"
Consolidate settings and move the science toggle out of per-screen and into one global place.

- Profile page: goal + "why" card, "Start over" action with a confirm step (don't let this be a misclick — destructive action).
- Global science toggle: one switch, stored in state/localStorage, that — when on — shows a small "Why this page" note at the bottom of Today/Route/Progress using the science copy already written for each concept, remapped to its new page.
- Remove old per-screen science toggles from onboarding if they conflict with this global one (onboarding can keep its own inline notes as-is — those were designed for the linear flow and don't need to change).

**Done when:** Profile works, start-over has a confirm step, and toggling the science switch actually shows/hides notes across the app.

---

## Phase 5 — Design pass & polish
Final consistency sweep across everything built in phases 1–4.

- Walk every page against the design tokens: correct colors, spacing scale, radius, type scale. Fix anything that drifted.
- Confirm the single-accent rule holds everywhere — audit for any screen with two blue things.
- Check responsive behavior: resize down to confirm the bottom bar takes over cleanly from the sidebar.
- Sanity-check empty/edge states (fresh user, no goal yet) don't break.
- Remove any leftover placeholder/debug UI.

**Done when:** clicking through the whole app feels cohesive, calm, and intentional — nothing looks like a work-in-progress.

---

## If time runs out
Stop after whichever phase you finish last — each phase leaves the app in a working state. Priority order if you must cut: **Phase 1 and 2 are non-negotiable** (shell + Today is what makes it feel like an app at all). Phase 3 is next-most-important. Phases 4 and 5 are the first to sacrifice if the clock runs out — a working 3-page app beats a broken 4-page one.
