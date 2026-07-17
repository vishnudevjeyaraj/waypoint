@AGENTS.md

# Waypoint Master Research Document
*Living document — update as research and decisions evolve*

Last updated: July 17, 2026 (added Implementation Notes — Decomposition Engine v2: milestone model, one-off/habit steps, target-date pacing; deadline/gamification/onboarding-friction research)

---

## Concept
An AI app where users input goals across three horizons — short-term, long-term, and someday/maybe — and the AI recursively breaks each one down into smaller sub-goals until it produces concrete daily tasks that ladder up to the original goal.

---

## App Foundations
*The non-negotiable principles that govern every decision on this project.*

**1. Grounded completely in science.** This is the central theme of the entire project. Almost everything the app does — every feature, every default, every piece of copy, every design choice — must be grounded in real, peer-reviewed scientific data and results. We do not add mechanics because they "feel right" or because competitors do them; we add them because the evidence says they work. This is both a product principle (it's how we get real results) and our core differentiator/marketing position ("results that speak for themselves").

**2. Goals AND behavior change.** The app is not just a goal-decomposition tool. It's equally about helping users build **discipline** and **change their behaviors**, because that's what actually determines whether they succeed at their goals. Achieving the goal is the outcome; changing behavior is the mechanism. (This is why CBT is a priority research area — see roadmap.)

**3. Sustained motivation & engagement.** For any of the science to work, users have to stay motivated and keep coming back to the app and the goal-achieving process long enough to see results. Keeping users engaged — through evidence-based means, not manipulative dark patterns — is a first-class design goal, not an afterthought.

**4. Learn from what works, not just what's broken.** We study competitors' *strengths* as well as their gaps — reading positive user reviews to understand what real users love and why — so we adopt what's proven to work in-market, not only avoid what fails.

---

## Competitive Landscape

### Dreamfora (largest AI goal-breakdown app, 2M+ users)
- App gets cluttered after redesigns — users want the simpler old layout back
- Data loss bugs: tasks/dreams/habits saved then vanish on reopen; one user lost everything
- Account/profile glitches — reverts to old deleted profiles, locking users out of current progress
- Notification bugs — same quote/reminder repeats for days despite in-app content changing
- Users want more frequent, specific reminders throughout the day, not just one daily nudge
- Onboarding flagged as clunky even by positive reviewers

### Reclaim.ai (AI calendar/task scheduler)
- No native mobile app — the #1 complaint; can't adjust priorities or add tasks on the go
- Missed tasks/deadlines don't escalate with strong alerts — easy to silently fall behind
- Free tier has been shrinking over time, frustrating long-time free users
- Outlook support is newer/weaker than Google Calendar support
- Full automation feels "rigid" or "overwhelming" for some users (especially ADHD) who want more control
- Persistent notifications/trouble fully disconnecting even after uninstalling

### Motion (AI task + calendar planner)
- Buggy and slow per multiple reviews
- AI credit system is confusing/expensive — one user burned 12,000 credits in 3 days
- Billing/refund problems, including charges after cancelling a trial
- Subtask ordering bugs — AI sequences steps incorrectly despite a defined order
- Feels like "a product in alpha" given the premium price — slow feature releases, roadmap opacity
- Steep learning curve to configure time-block behavior correctly

### Sunsama (daily planning/time-blocking)
- Price is the #1 complaint — seen as expensive (~$200/yr), "nickel-and-diming" with tiers
- No true automation — manual time-blocking only; falls apart if you stop planning daily
- Weak/disappointing mobile app
- Only plans ~2 weeks ahead — no monthly/quarterly goal view, long-term goals get lost
- Cancellations give store credit, not refunds

### Goaliath (newest, AI roadmap + daily actions)
- Too new for a real independent review base — mostly marketing copy, no substantial complaints surfaced yet
- Blank-slate competitor rather than a proven one — the lane is still open here

### Cross-competitor patterns (the opportunity list)
- Reliability/data-loss bugs are common — a stable backend is a real differentiator
- Gap between "too automated/rigid" (Reclaim, Motion) and "too manual" (Sunsama) — nobody has a good middle ground
- Nobody handles multiple time horizons well (daily + monthly + quarterly + someday) in one clean view
- Mobile experience is a weak point across the board
- Pricing transparency (flat, no credit systems) is a trust point people explicitly reward

---

## Feature List — Built to Close the Gaps

1. **Reliability first**
   - Robust local + cloud sync with conflict resolution — no "everything vanished" bugs
   - Offline mode that queues changes and syncs cleanly when back online

2. **Multi-horizon view in one screen**
   - Daily / Weekly / Monthly / Quarterly / Someday-Maybe all visible and linked to the same root goal
   - Someday/Maybe goals get periodic automatic resurfacing ("still want this?") instead of sitting dead

3. **Adjustable automation — not all-or-nothing**
   - Dial between "fully AI-scheduled" and "I plan it myself"
   - User can lock specific tasks so AI won't reshuffle them

4. **Real escalation on missed tasks**
   - Visible, low-friction escalation instead of silent slippage
   - Options: reschedule / break into smaller step / drop this goal

5. **True recursive re-planning**
   - Falling behind triggers AI to re-decompose the remaining goal with current context, not just push the same task forward

6. **Native mobile app, built first**
   - Full parity with desktop — add/edit/reprioritize on the go

7. **Transparent, flat pricing**
   - No AI-credit metering; clear tiers; real refunds, not store credit

8. **Clean, uncluttered UI with a lock on scope creep**
   - Resist adding social feeds/chat/quotes bloat — stay a goal tool, not a social network

9. **Smart reminders, not spam**
   - Context-aware nudges instead of one repeated generic notification

10. **Free tier that doesn't shrink over time**
    - Publicly lock in free-tier limits so users don't feel bait-and-switched

---

## Scientific Foundation
*The evidence base behind Waypoint. Every core mechanic below traces to peer-reviewed research — this is the app's "grounded in real science" positioning, not marketing hand-waving. Three standalone features are built on this: (1) if-then planning, (2) recursive decomposition into proximal goals, (3) habit formation with anti-streak design.*

### 1. Implementation Intentions (if-then planning)

**Core finding.** Plans in the format "if [situation], then I will [behavior]" — specifying when, where, and how — substantially close the gap between intending and doing. Gollwitzer & Sheeran's 2006 meta-analysis (94 tests, 8,000+ participants) found a mean effect of d = 0.65, medium-to-large, over holding a goal alone.

**Mechanism.** Forming an if-then plan creates a strong associative link between cue and response, so encountering the cue triggers the behavior with features of automaticity (immediacy, efficiency, no conscious deliberation required). It pre-loads the decision so willpower isn't needed in the moment.

**Boundary conditions (what most apps get wrong):**
- A strong goal intention must come first — planning does not help people with weak intentions.
- If-then plans struggle against strong existing habits (the new cue-response link is under-rehearsed vs. the entrenched one).
- "Approach" framing beats "avoidance" framing for changing a behavior.
- Newest evidence (2024 meta-analysis, 642 tests): effects are larger with a genuine contingent if-then format, high motivation, and rehearsal.

**The upgrade — action + coping planning.** Action planning = when/where/how. Coping planning = anticipating the specific barrier and pre-deciding the response. Coping planning aids recovery after lapses and disproportionately helps those with weaker self-control, because control transfers to the pre-made plan.

**Caution against rigidity.** Implementation intentions are "flexibly tenacious" — people stick with the plan when costs are bearable but sensibly abandon it when costs become disproportionate. Robotic adherence is not the goal.

**Bonus — MCII / WOOP.** Pairing if-then plans with mental contrasting (imagine the wish, then confront the inner obstacle) is the WOOP protocol. Positive fantasy *alone* predicts *worse* outcomes (Oettingen & Mayer 2002); the dream must be contrasted against the real obstacle. 2021 meta-analysis of 24 MCII trials: g = 0.34.

**→ Product application:** When Waypoint generates a daily task, don't just hand it over — prompt an if-then plan (when/where/after-what) plus a lightweight coping step (likely barrier + response). This is the signature interaction. Design rules: confirm the user actually wants the goal before generating plans; frame tasks as approach-actions, never "don't" statements.

### 2. Goal Decomposition + Proximal Goals

**Foundational study.** Bandura & Schunk (1981): 40 children behind and disinterested in math, split into proximal-subgoal, distal-goal, or no-goal conditions. The proximal-subgoal group progressed rapidly, mastered the material, and developed genuine self-efficacy and intrinsic interest. The distal-goal group showed no demonstrable benefit over no goals at all. Near-term decomposition was the entire difference.

**Mechanism.** Proximal subgoals build self-efficacy — the belief you can execute the next step — which drives effort and persistence. Each small win is evidence of capability that fuels the next step. Distant goals don't provide steady feedback, so motivation starves. Proximal goals also produce accurate self-knowledge of one's real capabilities (a direct counter to over-ambition).

**Progress display — the small-area hypothesis (Koo & Fishbach 2012).** Motivation is highest when attention is directed to whichever quantity is smaller. Early on, highlight what's *accumulated* ("20% done"); near the end, highlight what *remains* ("20% to go"). The emphasis should flip partway through. A static progress bar leaves motivation on the table.

**Chunking trap (Lembregts 2021).** Showing a large number of *remaining* subgoals can reduce motivation ("10 tasks left" reads as more work than "2 tasks left"). Granularity and counting method affect follow-through.

**→ Product application:** This is the scientific validation of Waypoint's entire core premise — recursive decomposition into near-term steps is the one variable that made or broke performance in the seminal study. (1) Always keep the user's *nearest* subgoal front and center; treat each completion as an explicit self-efficacy signal, not just a checkbox. (2) Make the progress display dynamic (emphasize "completed" early, "remaining" near a milestone) and never dump a demoralizing wall of remaining tasks. Strongest candidate for the "backed by hard science" headline.

### 3. Habit Formation + Anti-Streak Design

**Real timeline.** Lally et al. (2010): median 66 days to automaticity, range 18–254 days. Newest synthesis — Singh et al. (2024), 20 studies, 2,601 participants — confirms durable habits take roughly two to five months and accrue gradually, not at a threshold.

**Determinants (the levers).** Frequency (consistent repetition), timing (consistent time of day), enjoyment, cue consistency, immediate reward, habit stacking (attach to an existing habit), and small time-bound starting goals. Accountability also matters — a 2025 meta-analysis of 42 studies found structured accountability made people 2.8× more likely to maintain a new habit.

**The most important finding for the app.** In Lally's data, missing one opportunity did not materially affect habit formation. Habit-building is not all-or-nothing — roughly 80% consistency still builds the pathway; missing one or two days a week doesn't meaningfully slow it.

**Why streaks are dangerous:**
- "What the hell effect" (abstinence violation effect): breaking a perfect streak makes the brain categorize it as total failure → prone to quitting entirely.
- Benjamin Gardner (King's College London): people who track streaks are *more* likely to quit after breaking one.
- Diet study (*Health Psychology*): breaking perfect adherence made people 47% more likely to binge afterward.
- Run-streak research documents real backfires — injury and stress from refusing to ever miss.

**Evidence-based fix.** The "never miss twice" rule: one miss is noise, two in a row is the risk point. Track weekly completion rate ("5 of 7 — you're on track"), not fragile consecutive-day counts; make a single miss a non-event.

**→ Product application:** Deliberately reject the streak-counter mechanic (and make that a marketing point — "built on how habits actually form, not guilt-trip streaks"). (1) Display weekly consistency, not perfect-day streaks. (2) On a miss, reassure ("one miss doesn't set you back — ~80% consistency still builds the habit") and only escalate before a second consecutive miss. (3) Bake determinants into task generation — habit stacking, consistent timing, small first version, immediate sense of reward. (4) Set honest expectations up front that habits take two to five months, pre-empting the false-hope quit cycle. The accountability finding (2.8×) justifies a *light* social feature — without Dreamfora's clutter.

### 4. Behavior-Change Core (CBT, ACT, procrastination, self-compassion)
*The engine for building discipline and changing behavior, per App Foundations #2. These are not five separate features — they stack into one loop (see "How it stacks" at the end).*

**CBT is a strong base for a digital tool.** A meta-analytic review found CBT-based apps produced larger effects across multiple outcomes than non-CBT apps (Linardon et al. 2019). Three components are directly liftable:

- **Behavioral Activation (BA).** Works by scheduling rewarding, meaningful activities to increase contact with positive reinforcement; mechanism is self-monitoring + activity scheduling. A meta-analysis of 26 RCTs found BA superior to controls (SMD −0.74), effective even standalone and in digital form. Core loop: schedule a rewarding action → do it → notice the mood lift → repeat. **→ Application:** tasks shouldn't be purely instrumental; schedule *rewarding* goal-linked actions and have the user log how it felt. The "notice how it felt" logging step is the active ingredient.
- **Cognitive Restructuring (thought records).** Catch the automatic thought → name the distortion (catastrophizing, all-or-nothing, mind-reading) → generate a balanced alternative. A smartphone-CBT study showed AI/NLP can facilitate thought records (detecting thought-feeling mismatches and prompting refinement). Works best paired with BA. **→ Application:** when a user stalls or logs a discouraged feeling, run a short LLM-guided thought-record. High-value, natural use of the LLM; keep it optional and brief.
- **Relapse Prevention — lapse vs. relapse (Marlatt & Gordon).** The theoretical backbone for anti-streak design. Hard line between a *lapse* (one slip) and *relapse* (abandonment); the **abstinence violation effect** (the "I've blown it" guilt reaction) is what turns one into the other. Interventions: identify each user's *high-risk situations* ahead of time, pre-build *coping responses*, and *reframe* a lapse as recoverable. Negative emotional states are the highest-risk trigger. **→ Application:** (1) at setup, inventory likely derailers + pre-build coping plans (= if-then coping planning); (2) on a miss, actively defuse the abstinence-violation reaction with reframing copy; (3) treat negative-emotion context as elevated-risk. Turns anti-streak from a feature into a system.

**ACT — values & committed action (the "why" layer).** The "third wave" of CBT; two of its six core processes are literally values clarification and committed action. Meta-analyses support it (≈ SMD −0.69 for depression; high-certainty positive effect on psychological flexibility). Mechanism: connecting behavior to personal values sustains action *even while experiencing negative thoughts/emotions* — no need to wait to feel motivated. **Cognitive defusion** (seeing a thought as just a thought) is a lighter cousin of restructuring. Caveat: internet-based ACT is somewhat less effective than face-to-face (experiential/mindfulness exercises need a guide), so lean on the values→action machinery, go light on deep mindfulness. **→ Application:** add a **values layer above each goal** — during onboarding, capture *why* the goal matters and which value it serves; resurface that value when motivation dips; frame daily tasks as "committed action" toward a value, not just steps toward an outcome. A hedge against the false-hope quit cycle.

**Procrastination — the equation that unifies everything.** Steel's Temporal Motivation Theory (2007 meta-analysis, 691 correlations / 216 samples — among the most robust results in the field): **Motivation = (Expectancy × Value) / (1 + Impulsiveness × Delay).** Procrastination is "quintessential self-regulatory failure" — people plan to act, then reverse under the pull of immediate temptation (hyperbolic discounting). It gives four levers *and explains why our other techniques work*: proximal daily tasks shrink **Delay**; if-then plans/distraction removal lower **Impulsiveness**; small wins raise **Expectancy**; ACT values + BA reward raise **Value**. **→ Application:** use TMT as the app's internal diagnostic — when a user repeatedly skips a task, infer *which term* is the bottleneck and respond specifically (distant payoff → smaller step; low confidence → shrink + surface past wins; low value → reconnect to value/add reward; high impulsiveness → tighten the cue/if-then). "Diagnose *why* you're stuck, not just that you're stuck" — a novel, science-grounded feature no competitor frames this way.

**Self-compassion — the science of the "miss" response.** Counterintuitive but well-replicated: self-compassion motivates *better* than self-criticism. Breines & Chen (2012, four studies) — people who responded to failure with self-compassion (vs. a self-esteem boost or nothing) spent *more* time improving and were more optimistic the weakness could change. Self-compassionate people procrastinate and self-handicap *less* (Sirois et al. 2019) and have lower negative affect on days they miss goals (Hope et al. 2014). Mechanism: self-criticism triggers the threat/stress response; self-kindness engages the calming parasympathetic system, enabling recovery. Interventions are tiny (a 3-minute writing prompt shifts mindset). Biggest barrier: users' own belief that being "soft" makes them lazy — which the research refutes. Three components map to copy: **self-kindness**, **common humanity** ("everyone slips"), **mindfulness** ("acknowledge without drowning"). **→ Application:** this is the voice for anti-streak / lapse moments — self-compassionate, not gamified guilt. On a miss: normalize (common humanity), be kind, reframe as a learning data point (mastery). Resolves the tension of being *supportive after a miss without being permissive* — warmth increases follow-through.

**How it stacks (one coherent loop):** ACT values sit on top as the *why* (raises Value) → decomposition into proximal daily tasks shrinks Delay → behavioral activation adds reward, if-then plans cut impulsiveness, small wins raise expectancy (moving every term of the procrastination equation) → when someone stalls, TMT diagnoses the failing lever and cognitive restructuring clears the blocking thought → when someone slips, relapse-prevention (lapse ≠ relapse) + self-compassion handle recovery so one miss doesn't cascade. Motivate → act → diagnose stalls → recover, every stage evidence-backed.

### 5. Engagement & Fit (retention, timing, personalization, neurodivergent design)
*For any of the science to work, users must keep coming back. This section is about staying power — per App Foundations #3 (engagement via evidence, not dark patterns) and #4 (learn from what works).*

**The retention problem is brutal — and defines the real competition.** Roughly 45.7% of users abandon health apps after initial use, and over 30% of mobile health apps are uninstalled within a month. A meta-analysis of 79 RCTs found high uptake (92%) but only moderate sustained adherence; attrition in mental-health apps runs ~25% (Eysenbach's "law of attrition"). The two levers with the most evidence for reducing dropout: **reminders** and **human/accountability support**. Implication: the enemy isn't a competitor's feature list, it's the uninstall. Retention mechanics are a first-class product concern, not polish.

**Just-in-time adaptive interventions (JITAIs) — the science of *good* reminders.** A JITAI delivers the right type/amount of support at the right time by adapting to the user's changing internal and contextual state, targeting moments of "vulnerability and opportunity." Empirically effective across diet, activity, addiction, depression, anxiety, and more. Design anatomy: *decision points*, *tailoring variables*, *decision rules*, *intervention options*. Two critical cautions: content should be concrete and immediately executable ("do X now"), and the system must minimize burden/disruption/habituation — notification fatigue is real and kills engagement. **→ Application:** the evidence base for "smart reminders, not spam." Reminders should fire based on context and receptivity (right moment, tied to the user's stated cue/time from their if-then plan), be specifically actionable, and back off when ignored. Fixes Dreamfora's stale-notification complaint and operationalizes the implementation-intention cue.

**Personalization/tailoring — real but modest; cheap for us.** Meta-analyses show tailored interventions beat generic ones, but effect sizes are modest (r ≈ .07; web-tailored d ≈ .14). Levers: *content-tailoring* (what is said — matching to the person's needs/goals/barriers) and *frame-tailoring* (how it's said — e.g., autonomy-supportive vs. controlling tone). Individually tailored approaches tend to beat allocating people to pre-set packages. **→ Application:** worth doing but not a silver bullet — set expectations accordingly. The advantage: an LLM makes deep, per-user tailoring (content *and* tone) nearly free, where competitors rely on rigid rules. Favor autonomy-supportive framing (also an SDT tie-in). Treat tailoring as a steady multiplier, not a transformation.

**Neurodivergent (ADHD) design — the convergence finding.** ADHD/executive-function needs surfaced repeatedly in competitor reviews, and the principles that help ADHD brains reinforce nearly every choice already in this doc — designing for the hardest case makes the app better for everyone (the "curb-cut" effect). Convergent guidance: reduce decision load by surfacing the *single next step*, not a wall of tasks (validates the Bandura nearest-subgoal design); lower "activation energy" for task initiation (the hardest moment); address time-blindness with visual/temporal cues; use gentle, context-aware reminders that don't nag or shame; and crucially, *don't punish inconsistent use* — tools that shame reinforce the anxiety that worsens executive dysfunction (validates anti-streak + self-compassion). Also valued: minimal manual input (fast/voice capture) and "flexible vs. locked" tasks (validates the task-lock feature). **→ Application:** adopt ADHD-friendly design as a *baseline for all users*, not a special mode — next-step focus, low-friction capture, gentle context-aware nudges, no shame on misses, lock/flex tasks. Same design spine the science already pointed to.

**What competitors do RIGHT — the "sticky factor."** Positive reviews reveal retention comes from a *daily ritual and emotional relief*, not feature count. Sunsama's most-loved elements: a **morning planning ritual + evening shutdown/reflection** (the workflow, not any single feature, is "the sticky factor"); tasks framed as **"to work on today," not "due"** — removing deadline guilt; **not auto-carrying** undone tasks (clean slate); **workload/time estimation with over-commitment warnings** (anti-burnout); **weekly reviews**; and **deliberate simplicity** — users explicitly praise that it *doesn't* drown them in views/tools. One anxious user said it was the only tool that broke their "procrastination, shame, guilt cycle" because the day felt planned and bounded. **→ Application:** these validate Waypoint's science in-market — the daily planning ritual = implementation intentions + behavioral-activation scheduling; "work on today, not due" = self-compassion + anti-streak; workload warnings = anti-false-hope/over-ambition; weekly review = progress monitoring; simplicity = anti-clutter + ADHD load reduction. **Strategic thesis: build the product around a calm daily ritual that produces a feeling of relief and boundedness — that feeling, not the feature set, is what makes people return. This is our retention thesis.**

### 6. Core Product Gaps (goal conflict, disengagement, qualitative-goal measurement, safety)
*Four things the app must handle that the earlier sections didn't cover. The first three are goal-pursuit science; the fourth is safety/duty of care (ethics + liability + regulatory positioning).*

**Goal conflict — the multi-goal problem.** Since Waypoint's whole UX is many goals at once, this is central. A meta-analysis and multiple studies find goal conflict is associated with lower life satisfaction, more depression and anxiety, rumination, hesitation, lower goal commitment, and impaired progress — conflict doesn't just hurt wellbeing, it inhibits the goals themselves. Two distinct kinds: **inherent conflict** (goals whose strategies undermine each other — "be more assertive" vs. "be well-liked") and **resource conflict** (goals competing for finite time/energy — "get ahead at work" vs. "more time with kids"); resource conflict is generally *less* damaging than inherent conflict. The flip side is **goal facilitation** — when goals reinforce each other, people show higher engagement, positive affect, and more persistent pursuit (Riediger & Freund 2004). Self-concordance (pursuing goals for self-determined reasons — the ACT values tie-in) moderates whether juggling multiple goals feels like *strain* or *challenge*. **→ Application:** (1) actively detect conflict between a user's active goals and surface it ("these two may compete for the same evenings — want to sequence them?"); (2) prefer *sequencing* over simultaneous pursuit when goals share resources; (3) hunt for and highlight *facilitation* (goals whose tasks double up); (4) gently cap or de-emphasize the number of simultaneously active goals; (5) use the values layer to raise self-concordance, converting strain into challenge. This is the evidence base for how the multi-horizon view should behave — not just display many goals, but manage their interactions.

**Goal disengagement — when quitting is healthy (resolves the false-hope tension).** Earlier we treated quitting as the enemy (false-hope syndrome). The other half of the truth: Wrosch et al. (2003) show that disengaging from *genuinely unattainable* goals — withdrawing both effort *and* commitment — plus **reengaging** in new meaningful goals is associated with higher subjective well-being, better self-reported health, and healthier cortisol patterns. Failure to let go of unattainable goals produces distress and biological dysregulation. The critical nuance: **disengagement alone isn't adaptive — reengagement is what makes it work.** Dropping a goal frees up resources; the benefit comes when those resources are redirected to another valued goal so life continues with purpose. The reconciliation with false-hope: the deciding variable is **attainability/continued value** — false-hope is quitting *achievable* goals too early; adaptive disengagement is releasing *unattainable or no-longer-valued* ones. **→ Application:** the "drop this goal" feature needs to (1) help the user distinguish "genuinely unattainable / no longer me" from "just hard right now" (tie to the values layer — is this still concordant?); (2) *never* leave a void — pair every disengagement with reengagement by immediately helping redirect that energy to an alternative or existing goal (this is also where the someday/maybe bucket feeds in); (3) frame releasing a truly unattainable goal as an adaptive, healthy choice, not a failure. Handled well, quitting becomes a feature, not a shame moment.

**Measuring qualitative goals — Goal Attainment Scaling (GAS).** The biggest unaddressed gap: how to track "become more confident," "be a better partner," "find my passion." The established answer is **Goal Attainment Scaling** (Kiresuk & Sherman, 1968), used for decades in rehab, mental health, and OT. GAS turns a qualitative goal into measurable data by defining, *in advance*, concrete descriptions of a 5-point ordinal scale — from "much less than expected" through the expected outcome (midpoint) to "much more than expected." It's individualized/criterion-referenced (measured against what's meaningful to this person, not a generic yardstick), has reasonable reliability (neurorehab sensitivity ~70–85%, specificity >80%; significant interrater reliability), and minimizes floor/ceiling effects. Key limitation: it takes skill to write realistic, concrete level-descriptions, and vague adjectives are less reliable than specific behavioral anchors. **→ Application:** this is a natural, high-value LLM job — when a user sets a qualitative goal, the app co-writes concrete behavioral anchors for each attainment level (e.g., for "become more confident": expected = "I speak up once in each weekly meeting"; more = "I volunteer to lead one discussion"). This makes non-numeric goals trackable *and* forces the specificity that goal-setting theory demands. It's also a differentiator — most competitors simply can't handle qualitative goals. Favor concrete behavioral descriptions over subjective sliders.

**Safety & duty of care — guardrails, the therapy line, and harmful goals.** Because the app accepts *any* goal and uses CBT/ACT-derived techniques, safety is an ethics *and* liability *and* regulatory-positioning issue.
- **Regulatory line (stay a "general wellness product").** Mental-health software falls into three buckets: general wellness product (GWP), medical device, and FDA-authorized digital therapeutic. Apps geared toward general wellness *without reference to a specific diagnosis or treatment* are exempt from FDA oversight; the moment an app claims to treat a diagnosed condition or alter medication, it becomes a regulated medical device. The FTC separately polices deceptive/unsubstantiated claims. **→ Application:** deliberately position Waypoint as a general wellness/productivity tool. Use CBT/ACT as "evidence-based techniques for building discipline," *never* as "treatment for depression/anxiety/ADHD"; avoid diagnostic language; keep efficacy claims tied to the techniques' research base, not promises to cure. This keeps us FDA-exempt *and* is the honest framing.
- **Harmful goals — and why anti-streak is itself a safety feature.** The highest-risk category is disordered eating. The National Alliance for Eating Disorders warns that tracking apps can be "accelerants" for at-risk users, precisely because **streaks, badges, and rigid tracking reinforce rigidity where any deviation feels like failure → guilt/shame → restriction or giving up**. This is the *same mechanism* as the abstinence-violation effect — meaning our anti-streak + self-compassion + "80% consistency" design is not only better for engagement, it's a genuine harm-reduction feature. **→ Application:** (1) treat weight/diet/calorie goals with special care — no calorie targets, no restriction "streaks," watch for disordered-eating signals; (2) detect and refuse to optimize clearly dangerous goals (self-harm, extreme restriction, reckless behavior) rather than dutifully decomposing them; (3) keep the anti-streak/self-compassion design as a stated safety principle, not just UX.
- **Crisis pathway.** Access to crisis services is a recognized safety criterion in app-evaluation frameworks (e.g., FASTER). LLM responses to high-risk disclosures (suicidal ideation, self-harm) are an active safety-research area requiring explicit guardrails. **→ Application:** if a user discloses crisis-level distress, the app should *not* treat it as a goal to decompose — it should surface crisis resources (e.g., 988 in the US) and step out of the optimization frame. Build this as an explicit, tested pathway, not an afterthought.
- *(Context: the 2025 Dartmouth Therabot RCT — 210 adults, improvements comparable to outpatient therapy — shows generative-AI mental-health tools are being taken seriously clinically, which raises both the opportunity and the safety bar.)*

### Supporting Principles (design-level, not standalone features)
- **Goal-setting theory (Locke & Latham).** Specific, difficult goals beat vague/easy ones up to the ability ceiling; a 1999 meta-analysis of 183 studies makes this one of the most reliable findings in the field. → The AI should generate specific, appropriately challenging targets, never vague or trivially easy ones.
- **Self-determination theory (Ryan & Deci).** Autonomy, competence, and relatedness sustain motivation. → Maps to adjustable automation (autonomy), achievable next steps (competence), optional social layer (relatedness).
- **Progress monitoring (Harkin et al. 2016, 138 studies).** Monitoring promotes attainment (d+ = 0.40), amplified when progress is physically recorded and optionally made public. → Validates tracking as a core mechanic and a light sharing option.
- **False-hope syndrome (Polivy & Herman).** People set over-ambitious goals, fail, and quit — only 19% of resolvers last two years. → The whole point of decomposition + honest expectation-setting is designing against this failure mode.

### Key Citations
- Bandura, A., & Schunk, D. H. (1981). Cultivating competence, self-efficacy, and intrinsic interest through proximal self-motivation. *Journal of Personality and Social Psychology, 41*, 586–598.
- Gollwitzer, P. M., & Sheeran, P. (2006). Implementation intentions and goal achievement: A meta-analysis of effects and processes. *Advances in Experimental Social Psychology, 38*, 69–119.
- Sheeran, P., Listrom, O., & Gollwitzer, P. M. (2024). The when and how of planning: Meta-analysis of the scope and components of implementation intentions in 642 tests. *European Review of Social Psychology, 36*(1).
- Oettingen, G., & Mayer, D. (2002). The motivating function of thinking about the future: Expectations versus fantasies. *Journal of Personality and Social Psychology, 83*, 1198–1212.
- Koo, M., & Fishbach, A. (2012). The small-area hypothesis: Effects of progress monitoring on goal adherence. *Journal of Consumer Research, 39*(3), 493–509.
- Lally, P., van Jaarsveld, C. H. M., Potts, H. W. W., & Wardle, J. (2010). How are habits formed: Modelling habit formation in the real world. *European Journal of Social Psychology, 40*(6), 998–1009.
- Singh, B., Murphy, A., Maher, C., & Smith, A. E. (2024). Time to form a habit: A systematic review and meta-analysis of health behaviour habit formation and its determinants. *Healthcare, 12*(23), 2488.
- Harkin, B., Webb, T. L., Chang, B. P. I., Prestwich, A., Conner, M., Kellar, I., Benn, Y., & Sheeran, P. (2016). Does monitoring goal progress promote goal attainment? A meta-analysis of the experimental evidence. *Psychological Bulletin, 142*(2), 198–229.
- Locke, E. A., & Latham, G. P. (2002). Building a practically useful theory of goal setting and task motivation. *American Psychologist, 57*(9), 705–717.
- Ryan, R. M., & Deci, E. L. (2000). Self-determination theory and the facilitation of intrinsic motivation, social development, and well-being. *American Psychologist, 55*(1), 68–78.
- Polivy, J., & Herman, C. P. (2000). The false-hope syndrome: Unrealistic expectations of self-change. *Current Directions in Psychological Science, 9*(4), 128–131.
- Linardon, J., Cuijpers, P., Carlbring, P., Messer, M., & Fuller-Tyszkiewicz, M. (2019). The efficacy of app-supported smartphone interventions for mental health problems: A meta-analysis of randomized controlled trials. *World Psychiatry, 18*(3), 325–336.
- Ekers, D., Webster, L., Van Straten, A., Cuijpers, P., Richards, D., & Gilbody, S. (2014). Behavioural activation for depression: An update of meta-analysis of effectiveness and sub-group analysis. *PLoS ONE, 9*(6), e100100.
- Marlatt, G. A., & Gordon, J. R. (1985). *Relapse Prevention: Maintenance Strategies in the Treatment of Addictive Behaviors.* Guilford Press. (See also Larimer, Palmer, & Marlatt, 1999, *Alcohol Research & Health, 23*(2), 151–160.)
- Hayes, S. C., Luoma, J. B., Bond, F. W., Masuda, A., & Lillis, J. (2006). Acceptance and commitment therapy: Model, processes and outcomes. *Behaviour Research and Therapy, 44*(1), 1–25.
- Steel, P. (2007). The nature of procrastination: A meta-analytic and theoretical review of quintessential self-regulatory failure. *Psychological Bulletin, 133*(1), 65–94.
- Steel, P., & König, C. J. (2006). Integrating theories of motivation. *Academy of Management Review, 31*(4), 889–913.
- Breines, J. G., & Chen, S. (2012). Self-compassion increases self-improvement motivation. *Personality and Social Psychology Bulletin, 38*(9), 1133–1143.
- Sirois, F. M., Nauts, S., & Molnar, D. S. (2019). Self-compassion and self-regulation failure. (See Sirois, 2014, *Self and Identity*.)
- Neff, K. D. (2023). Self-compassion: Theory, method, research, and intervention. *Annual Review of Psychology, 74*, 193–218.
- Eysenbach, G. (2005). The law of attrition. *Journal of Medical Internet Research, 7*(1), e11.
- Linardon, J., & Fuller-Tyszkiewicz, M. (2020). Attrition and adherence in smartphone-delivered interventions for mental health problems: A systematic and meta-analytic review. *Journal of Consulting and Clinical Psychology, 88*(1), 1–13.
- Nahum-Shani, I., Smith, S. N., Spring, B. J., Collins, L. M., Witkiewitz, K., Tewari, A., & Murphy, S. A. (2018). Just-in-time adaptive interventions (JITAIs) in mobile health: Key components and design principles for ongoing health behavior support. *Annals of Behavioral Medicine, 52*(6), 446–462.
- Noar, S. M., Benac, C. N., & Harris, M. S. (2007). Does tailoring matter? Meta-analytic review of tailored print health behavior change interventions. *Psychological Bulletin, 133*(4), 673–693.
- Lustria, M. L. A., Noar, S. M., Cortese, J., Van Stee, S. K., Glueckauf, R. L., & Lee, J. (2013). A meta-analysis of web-delivered tailored health behavior change interventions. *Journal of Health Communication, 18*(9), 1039–1069.
- Gray, J. S., Ozer, D. J., & Rosenthal, R. (2017). Goal conflict and psychological well-being: A meta-analysis. *Journal of Research in Personality, 66*, 27–37.
- Riediger, M., & Freund, A. M. (2004). Interference and facilitation among personal goals: Differential associations with subjective well-being and persistent goal pursuit. *Personality and Social Psychology Bulletin, 30*(12), 1511–1523.
- Wrosch, C., Scheier, M. F., Miller, G. E., Schulz, R., & Carver, C. S. (2003). Adaptive self-regulation of unattainable goals: Goal disengagement, goal reengagement, and subjective well-being. *Personality and Social Psychology Bulletin, 29*(12), 1494–1508.
- Kiresuk, T. J., & Sherman, R. E. (1968). Goal attainment scaling: A general method for evaluating comprehensive community mental health programs. *Community Mental Health Journal, 4*(6), 443–453.
- Torous, J., & Roberts, L. W. (2017). Needed innovation in digital health and smartphone applications for mental health: Transparency and trust. *JAMA Psychiatry, 74*(5), 437–438. (On the wellness-vs-medical-device line and app safety/claims.)
- Jacobson, N. C., Kim, H., et al. (2025). Randomized trial of a generative-AI therapy chatbot (Therabot). *NEJM AI.* (Dartmouth Therabot RCT.)

*Note: effect sizes and study details above are drawn from published summaries and abstracts. Before using any specific statistic in public-facing marketing, verify the exact figure against the primary source.*

---

## First-Run Experience (Blueprint)
*The step-by-step path a user takes the first time they open Waypoint. Each stage names the research that drives it. Simplicity is a governing constraint, not a style preference.*

### UI/UX research this is built on
- **The tutorial trap.** Welcome carousels get swiped past unread. Bad onboarding causes up to 80% abandonment; good onboarding can lift retention ~50%. → One welcome screen, one action.
- **Questions must visibly pay off.** Users will answer 5–6 questions only if the output is obviously personalized (MyFitnessPal); they won't for a generic result. Headspace asks 2–3 with small option sets and a progress bar signalling brevity. → Cap intake at 3 questions, each visibly shaping *their* plan.
- **Speed to value.** Benchmark ≈60 seconds to first value; 3–5 screens; one clear purpose per screen (screens that do too much drop completion).
- **Outcome first (Calendly).** Make the outcome visible early rather than front-loading setup.
- **Progressive disclosure (Finch critique).** Finch was criticized as cluttered; the recommended fix was hiding later actions until the current one is complete, so the user focuses on one task and avoids cognitive overload. Independently converges with our nearest-subgoal (Bandura) and ADHD/decision-load findings.

### Ordering decision
Goal capture comes **before** intake. The science requires intention/values *before* planning; the UX requires fast time-to-value and questions that visibly earn their keep. Both are satisfied by: state the goal first (what they came for) → then 3 short questions that are visibly shaping *that* goal's plan.

### The six stages

**1. Welcome.** One screen, one action, no carousel. Sets the tone: calm, science-grounded, no hype. *(Tutorial trap; simplicity.)*

**2. Goal capture.** A single open input. Accepts any goal — vague, qualitative, or concrete. Examples offered as chips to reduce blank-page friction. *(Outcome-first; speed to value.)*

**3. Intake — 3 questions, one per screen, each visibly shaping the plan.**
- *Why does this matter to you?* → the **values layer** (ACT: committed action toward a value; raises Value in the procrastination equation; and confirms a real goal intention exists, without which if-then plans don't work).
- *Realistically, how much time per week?* → **constraint capture**; guards against over-ambition (false-hope syndrome) and enables honest workload framing (Sunsama's loved over-commitment warning).
- *When would you actually do it?* → captures the **cue** that feeds the if-then plan at stage 5, and the JITAI reminder timing.
- Progress bar throughout; every answer visibly annotated as shaping the plan.

**4. Breakdown.** Recursive decomposition (goal → sub-goal → this week → today), revealed with **progressive disclosure**: only the nearest step is prominent; the full route is available but never dumped on the user. The user verifies/adjusts — human-in-the-loop is both a feasibility mechanism and an autonomy (SDT) feature. *(Bandura proximal subgoals; Koo & Fishbach small-area; ADHD decision-load; Lembregts chunking trap.)*

**5. If-then + coping plan.** The signature interaction. "When [cue], I will [task]" — plus "If [obstacle], I'll [fallback]." Approach-framed, never "don't." *(Gollwitzer & Sheeran d = 0.65; coping planning / Marlatt high-risk-situation inventory.)*

**6. Close.** Show one task — today's — and nothing else. Set honest expectations (habits take ~2–5 months; one miss doesn't set you back). No streak counter, ever. *(Lally; anti-streak; self-compassion; false-hope pre-emption; and per §6, anti-streak is a safety feature, not just UX.)*

### Design principle carried through every stage
Only ever one thing is asked for, and only ever one thing is emphasized. Simplicity is enforced structurally (progressive disclosure), not just visually.

---

## Implementation Notes — Decomposition Engine (v2)
*How the built engine works today, so future changes stay consistent. Lives here because the schema encodes several of the research decisions above.*

### Data model
The AI decomposition (`/api/breakdown`) takes `{ goal, why, timePerWeek, targetDate }` and returns:
- **`milestones: [{ title, detail }]`** — an ordered list of concrete checkpoints from *now → goal*. This is the user's **route**, and it is fully **editable** on the Route page (edit / add / remove; SDT autonomy — a plan that feels like yours raises commitment). Stored with an `id` and `done` flag.
- **`steps: [{ text, type }]`** — 5–7 small **daily** actions laddering toward the *nearest* incomplete milestone. The first is today's step.

A second API mode (`nextMilestone` in the request) returns `steps` only — used when the user finishes a milestone ("plan next steps") and when they hit **"re-optimize with AI"** (regenerate the daily steps to fit their edited route, keeping their milestone edits).

### Step types — one-off vs. habit
Each step is typed:
- **`one-off`** = a task done once (e.g. "buy a guitar", "book a lesson"). Shown with the checkbox, no recurring cue.
- **`habit`** = a repeating action (e.g. "practice 15 minutes"). Gets a small "habit" tag and **connects to the if-then cue** (habit stacking / implementation intentions). Many goals start one-off (setup) and become habitual — the engine labels each honestly rather than forcing one type.

### Target date — a *pacing* input, not a deadline
The target date (1 month / 3 months / 6 months / 1 year+) scopes how far the route stretches and how tightly milestones are spaced (shorter → fewer, tighter milestones). It is deliberately **not** framed as a pressure deadline. Rationale: self-imposed deadlines curb procrastination but people set them poorly (Ariely & Wertenbroch 2002; a 2025 replication found weak effects); what reliably helps is **evenly-spaced intermediate** milestones. Pairs with TMT's Delay term and the false-hope/over-ambition guard.

### Newer research applied (2026 UI/engine pass)
- **Deadlines** → target date as pacing, not pressure (above).
- **Gamification / "less bland"** → ground engagement in SDT **competence** (visible progress: the route fills in behind you) and **autonomy** (editable route), *not* points/badges. Meta-analyses show an "engagement–efficacy gap" and real harms from manipulative persuasive design.
- **Guest-first onboarding** → forced signup is the most expensive onboarding mistake (~26% abandon; guest mode lifts activation 15–35%). The app is guest-first; login is deferred.
- **"Show the science" / educational** → providing a rationale in an autonomy-supportive way is itself an evidence-based motivator (SDT), so the science panel is a mechanism, not decoration.

*Citations for this pass: Ariely & Wertenbroch (2002, Psych Science 13:219); gamification-in-health meta-analyses (ScienceDirect S1874944524001035; PMC8391751 on SDT); onboarding/registration-friction evidence; SDT autonomy-support & rationale (PMC2483280). Verify exact figures against primary sources before any public-facing claim.*

---

## Research Roadmap
*Per App Foundations principle #1, every area below is researched with peer-reviewed sources before it informs a product decision. "Done" areas are written up in the Scientific Foundation section above.*

### Done
- [x] Goal-setting theory, proximal goals, habit formation, implementation intentions, progress monitoring, SDT, false-hope syndrome (→ Scientific Foundation §1–3)
- [x] Behavior-change core: CBT (behavioral activation, cognitive restructuring, relapse prevention), ACT, procrastination/TMT, self-compassion (→ Scientific Foundation §4)
- [x] Engagement & fit: retention/attrition, JITAIs (reminder timing), personalization/tailoring, ADHD/neurodivergent design, competitor strengths ("sticky factor") (→ Scientific Foundation §5)
- [x] Core product gaps: goal conflict, goal disengagement, qualitative-goal measurement (Goal Attainment Scaling), safety/duty of care (→ Scientific Foundation §6)
- [x] Initial AI decomposition feasibility (hybrid architecture identified — to be revisited/strengthened, findings not yet written into doc)

### Research areas — still to do
- [ ] **Market validation** — market size, willingness to pay, and a sharp target-user definition (business validation, not academic). The last remaining research area before product decisions.

### Product / legal considerations (not research areas, but don't lose)
- [ ] **Privacy & sensitive personal data** — goals are intimate data; handling, storage, and consent need deliberate treatment.

### Deferred product decisions (until relevant research is done)
- [ ] Revisit & improve AI feasibility / decomposition architecture
- [ ] MVP scope — must-have v1 vs. later roadmap
- [ ] Tech stack for the decomposition engine
- [ ] Pricing tiers
