# Waypoint — UI Spec
*For implementation by Claude Code. Goal: make the existing MVP feel like a real, polished app — persistent navigation, distinct pages, consistent design system. This is a **website build** (desktop-primary; responsive as a bonus, not native mobile). No new product features here; this is presentation and structure on top of what's already built.*

---

## 1. What this changes

**Before:** a single linear flow (welcome → goal → why → hours → when → breakdown → if-then → today), then nothing — no persistent shell.

**After:** the linear flow becomes **one-time onboarding**. Once complete, the user lands inside a persistent **app shell** — a sidebar (or bottom bar at narrow widths) with four destinations. Onboarding never reappears unless they start over.

```
[Onboarding — full screen, no nav]
   Welcome → Goal → Why → Hours → When → Breakdown → If-Then → (done)
        ↓
[App shell — sidebar nav, 4 destinations]
   Today · Route · Progress · Profile
```

---

## 2. Navigation architecture

**This is a website, not a native mobile app.** The primary experience is a **left sidebar**, visible whenever a viewport is wide enough for one (desktop/laptop — this is what a reviewer clicking your link will see). At narrow widths, the same four destinations collapse into a **bottom tab bar** as a responsive fallback — good practice, but secondary to getting the desktop experience right first.

Same four destinations, same icons, same order, in both layouts:

| Tab | Icon (lucide-react) | Shows |
|---|---|---|
| **Today** | `Sun` | Today's one task, checkbox, weekly X-of-7 strip |
| **Route** | `Map` | Full breakdown, progressive disclosure (year → today) |
| **Progress** | `TrendingUp` | Weekly completion, miss-response messaging, simple history |
| **Profile** | `User` | Goal + "why", start over, "Show the science" toggle (global) |

**Real routing, not just view-switching.** Each tab is an actual page/route (`/today`, `/route`, `/progress`, `/profile`), using the framework's router. Refreshing on any tab keeps you there; the back button works; the URL reflects where you are. This is what makes it feel like a real site rather than a single page toggling state.

- Sidebar (desktop, primary): fixed left, ~220px wide, `--surface` background, icon + label per item, generous vertical spacing, logo/wordmark at top.
- Bottom bar (narrow width, secondary): fixed bottom, 64px + safe-area, icon + 11px label, evenly spaced.
- Active destination: accent color icon + label. Inactive: muted gray.
- Both are the *same nav data* rendered two ways — don't build two separate nav systems or duplicate logic.
- Tapping/clicking the current destination again scrolls that page to top.
- Guard: if no goal exists yet (e.g., direct URL visit, or mid-onboarding), any of these four routes should redirect into onboarding rather than show an empty page.

---

## 3. Design tokens

Keep the app's existing dark background and blue accent — don't reinvent, formalize.

```css
--bg:            #0B0D10;   /* page background, near-black */
--surface:       #14171C;   /* cards, the tab bar, raised panels */
--surface-hover: #1B1F26;
--border:        #262B33;   /* hairline dividers */

--text:          #F2F3F5;   /* primary text */
--text-muted:    #9BA1AC;   /* secondary text, inactive nav */
--text-faint:    #5B616C;   /* placeholders, timestamps */

--accent:        #3B82F6;   /* the ONE accent — primary actions, active nav, today's task */
--accent-soft:   rgba(59,130,246,0.12);  /* accent backgrounds, e.g. selected chip */
--accent-text:   #93BBFC;   /* accent color when used as text on dark surface */

--success:       #4ADE80;   /* used sparingly — task completion only */
--warning:       #F5A524;   /* used sparingly — over-commitment / gentle miss note */

--radius-sm: 6px;
--radius-md: 10px;
--radius-lg: 16px;
--radius-pill: 999px;
```

**Single-accent rule carries over from the original design principle: accent blue appears on exactly one thing per screen** — the primary action or the single most important piece of information (today's task, the active tab). Everything else stays neutral. If a screen has two blue things, that's a bug.

### Typography
- Font: keep existing (Geist, already in the project).
- Scale: `32px/1.2` page titles · `20px/1.3` section headers · `16px/1.5` body · `13px/1.4` meta/labels.
- Weight: 600 for titles, 500 for emphasis/buttons, 400 for body.
- Sentence case everywhere. No all-caps except small eyebrow labels (11px, letter-spacing 0.08em, `--text-muted`).

### Spacing
- Base unit 4px. Page padding: 20px mobile / 32px desktop. Section gaps: 24–32px. Card padding: 16–20px.

### Components
- **Primary button:** `--accent` fill, white text, `--radius-md`, 12px/22px padding, weight 500. Hover: slightly lighter. Disabled: 35% opacity.
- **Secondary/ghost button:** transparent, `--text-muted`, no border, underline or color shift on hover.
- **Card:** `--surface`, `--radius-lg`, 1px `--border`, no heavy shadow — depth comes from color contrast, not shadow, to keep it calm.
- **Chip (multiple-choice option):** `--surface` + `--border` default; selected state = `--accent-soft` background + `--accent-text` text + `--accent` 1px border.
- **Checkbox (today's task):** custom circular checkbox, 24px, `--border` outline unchecked, `--accent` filled with white check when checked. Completing it triggers a brief (200ms) scale + fade confirmation — small, not celebratory (no confetti — see Foundations, no dark-pattern reward mechanics).

---

## 4. Page-by-page spec

### Today
- Header: "Today" (eyebrow: today's date, e.g. "Wed, Jul 15").
- One task card: the single task, checkbox, the if-then sentence beneath it in muted text ("When after dinner, you'll…").
- Below: a slim weekly strip — 7 small dots/segments, filled for completed days, hollow for remaining, muted for missed (never red/alarming). Label: "This week: 4 of 7."
- If task is complete: card shows a calm completed state (checkmark, muted card, no "streak" language) and a short line: "That's today. Nothing else is due."
- Empty/edge state (no goal yet — shouldn't happen post-onboarding, but handle gracefully): prompt back into onboarding.

### Route
- Header: "Route" + the goal as subtitle.
- Nearest-tier card prominent (accent-adjacent styling, same as onboarding's breakdown "today" tier).
- Below, collapsed by default: This week → This month → This quarter → This year, each a plain row (progressive disclosure — matches existing breakdown component, just given a permanent home).
- Small "Adjust" ghost button on the nearest step (human-in-the-loop, already a principle — even if it just reopens a simple edit for now).

### Progress
- Header: "Progress."
- Large weekly view: same 7-dot strip as Today, bigger, with day labels (M T W T F S S).
- Beneath: the kind miss-response copy, shown contextually — if they're on track, an encouraging neutral line; if they've missed once, the calm reassurance copy already written ("one miss doesn't set you back…"); if approaching a second consecutive miss, the gentle nudge.
- Optional simple history: last 2–3 weeks as small compressed strips underneath (nice-to-have if time allows — cut first if short on time).

### Profile
- Header: "Profile."
- Goal card: current goal, the "why," a "Start over" ghost/destructive-toned action (with a confirm step — this is destructive, don't let it be a misclick).
- Preferences: "Show the science" toggle — **global now, not per-screen**. When on, every page gets a small "Why this page" note at the bottom (reuse the science-note copy already written for each stage, remapped to Today/Route/Progress).
- Footer: small, quiet — app name/version, nothing else. No settings you don't have yet (no fake toggles).

---

## 5. Motion & feel

- Page transitions: simple fade/slide, 200–250ms, ease-out. No bouncy/playful easing — calm, not gamified.
- Respect `prefers-reduced-motion`.
- Loading states (AI breakdown call): use the existing "Building your route…" pattern; keep it text-based and quiet, not a flashy spinner.
- No confetti, no celebratory sound, no badge pop-ups — consistent with the anti-dark-pattern principle already established.

---

## 6. What NOT to do (guardrails for this pass)

- Don't add features. This spec restructures existing functionality into a shell — it doesn't add habits, multi-goal, reminders, etc.
- Don't introduce a second accent color "just for Progress" or "just for badges." One accent, everywhere.
- Don't make onboarding tabbed. It's linear, full-screen, no nav bar, by design (keeps setup focused).
- Don't build two separate nav implementations for sidebar vs. bottom bar — one nav data source, two responsive layouts.
- Don't build a native mobile app or PWA install flow. This is a website; mobile responsiveness is a nice-to-have, not the target.
