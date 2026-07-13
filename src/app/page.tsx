"use client";

import { useEffect, useState } from "react";
import {
  Breakdown,
  CompletionStatus,
  CUE_OPTIONS,
  HORIZONS,
  HorizonKey,
  HOURS_OPTIONS,
  INITIAL_STATE,
  Plan,
  SCIENCE_NOTES,
  TOTAL_SETUP_STEPS,
  WaypointState,
  clearState,
  completionStatus,
  deCap,
  loadState,
  saveState,
  todayKey,
} from "../lib/waypoint";

// =============================================================================
// Orchestrator — holds the saved state and decides between the setup flow and
// the returning-user app.
// =============================================================================

export default function Home() {
  const [state, setState] = useState<WaypointState>(INITIAL_STATE);
  const [input, setInput] = useState(""); // current answer for text/button steps
  const [loaded, setLoaded] = useState(false);
  const [loading, setLoading] = useState(false); // AI request in flight
  const [error, setError] = useState<string | null>(null);

  // Ask the API to decompose the goal. Only needs goal / why / hours — the cue
  // is collected later, in the plan step.
  async function fetchBreakdown(data: {
    goal: string;
    why: string;
    timePerWeek: string;
  }) {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/breakdown", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error || "Something went wrong. Please try again.");
      }
      const breakdown: Breakdown = await res.json();
      setState((prev) => ({ ...prev, breakdown }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  // Load saved state once, on first render.
  useEffect(() => {
    const saved = loadState();
    setState(saved);
    if (saved.phase === "setup") {
      const fields: Record<number, string> = {
        2: saved.goal,
        3: saved.why,
        4: saved.timePerWeek,
      };
      setInput(fields[saved.step] ?? "");
      // If we reloaded on the breakdown screen without a result, re-request it.
      if (saved.step === 5 && !saved.breakdown) {
        fetchBreakdown({
          goal: saved.goal,
          why: saved.why,
          timePerWeek: saved.timePerWeek,
        });
      }
    }
    setLoaded(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Persist on every change (after the initial load).
  useEffect(() => {
    if (loaded) saveState(state);
  }, [state, loaded]);

  function advance() {
    const value = input.trim();

    setState((prev) => {
      const next = { ...prev, step: prev.step + 1 };
      if (prev.step === 2) next.goal = value;
      if (prev.step === 3) next.why = value;
      if (prev.step === 4) next.timePerWeek = value;
      return next;
    });

    // Moving off the hours step is when we have enough to call the AI.
    if (state.step === 4) {
      fetchBreakdown({ goal: state.goal, why: state.why, timePerWeek: value });
    }

    setInput("");
  }

  function goBack() {
    const target = state.step - 1;
    const fields: Record<number, string> = {
      2: state.goal,
      3: state.why,
      4: state.timePerWeek,
    };
    setInput(fields[target] ?? "");
    setState((prev) => ({ ...prev, step: target }));
  }

  // Finishing the plan step enters the app.
  function finishPlan(plan: Plan) {
    setState((prev) => ({ ...prev, plan, phase: "app" }));
  }

  // Toggle today's completion (checkbox on the home screen).
  function toggleToday() {
    setState((prev) => {
      const key = todayKey();
      const has = prev.completedDates.includes(key);
      return {
        ...prev,
        completedDates: has
          ? prev.completedDates.filter((d) => d !== key)
          : [...prev.completedDates, key],
      };
    });
  }

  function startOver() {
    setState((prev) => ({ ...INITIAL_STATE, showScience: prev.showScience }));
    setInput("");
    setError(null);
    clearState();
  }

  function toggleScience() {
    setState((prev) => ({ ...prev, showScience: !prev.showScience }));
  }

  if (!loaded) return null;

  const inApp = state.phase === "app" && state.breakdown;
  const canContinue = input.trim().length > 0; // used by steps 2-4

  return (
    <>
      {!inApp && (
        <RouteRail current={state.step} total={TOTAL_SETUP_STEPS} />
      )}

      <main className="flex-1 flex items-center justify-center px-6 py-16">
        {inApp ? (
          <AppHome
            state={state}
            status={completionStatus(state.completedDates)}
            onToggleToday={toggleToday}
            onStartOver={startOver}
          />
        ) : (
          <div className="w-full max-w-md">
            {state.step > 1 && (
              <button
                onClick={goBack}
                className="mb-8 text-sm text-muted hover:text-foreground transition-colors"
              >
                Back
              </button>
            )}

            {state.step === 1 && <StepWelcome onContinue={advance} />}

            {state.step === 2 && (
              <StepText
                question="What's one goal you want to make progress on?"
                placeholder="Learn Spanish, run a marathon, write a book..."
                value={input}
                onChange={setInput}
                onContinue={advance}
                canContinue={canContinue}
                scienceNote={SCIENCE_NOTES.goal}
                showScience={state.showScience}
              />
            )}

            {state.step === 3 && (
              <StepText
                question="Why does this matter to you?"
                placeholder="In your own words — the reason underneath it..."
                value={input}
                onChange={setInput}
                onContinue={advance}
                canContinue={canContinue}
                scienceNote={SCIENCE_NOTES.why}
                showScience={state.showScience}
              />
            )}

            {state.step === 4 && (
              <StepChoice
                question="How many hours a week can you give this?"
                options={HOURS_OPTIONS}
                selected={input}
                onSelect={setInput}
                onContinue={advance}
                canContinue={canContinue}
                scienceNote={SCIENCE_NOTES.hours}
                showScience={state.showScience}
              />
            )}

            {state.step === 5 && (
              <StepBreakdown
                breakdown={state.breakdown}
                loading={loading}
                error={error}
                onRetry={() =>
                  fetchBreakdown({
                    goal: state.goal,
                    why: state.why,
                    timePerWeek: state.timePerWeek,
                  })
                }
                onContinue={advance}
                showScience={state.showScience}
              />
            )}

            {state.step === 6 && state.breakdown && (
              <StepPlan
                goal={state.goal}
                why={state.why}
                breakdown={state.breakdown}
                initial={state.plan}
                onFinish={finishPlan}
                showScience={state.showScience}
              />
            )}
          </div>
        )}
      </main>

      <button
        onClick={toggleScience}
        className="fixed bottom-6 right-6 text-sm text-muted hover:text-foreground border border-border rounded-full px-4 py-2 bg-background transition-colors"
      >
        {state.showScience ? "Hide the science" : "Show the science"}
      </button>
    </>
  );
}

// =============================================================================
// Returning-user app: five horizon views + the daily loop.
// =============================================================================

function AppHome({
  state,
  status,
  onToggleToday,
  onStartOver,
}: {
  state: WaypointState;
  status: CompletionStatus;
  onToggleToday: () => void;
  onStartOver: () => void;
}) {
  const [tab, setTab] = useState<HorizonKey>("today");
  const [confirmingReset, setConfirmingReset] = useState(false);
  const breakdown = state.breakdown!; // guaranteed in the app phase

  return (
    <div className="w-full max-w-md">
      {/* Tabs are neutral on purpose — the accent stays reserved for today's
          action, not navigation. */}
      <nav className="flex gap-5 mb-12 border-b border-border">
        {HORIZONS.map((h) => (
          <button
            key={h.key}
            onClick={() => setTab(h.key)}
            className={`pb-3 text-sm transition-colors ${
              tab === h.key
                ? "text-foreground border-b-2 border-foreground -mb-px"
                : "text-muted hover:text-foreground"
            }`}
          >
            {h.label}
          </button>
        ))}
      </nav>

      {tab === "today" ? (
        <TodayView
          breakdown={breakdown}
          plan={state.plan}
          why={state.why}
          status={status}
          onToggleToday={onToggleToday}
          showScience={state.showScience}
        />
      ) : (
        <HorizonView
          label={HORIZONS.find((h) => h.key === tab)!.label}
          text={breakdown[tab]}
          showScience={state.showScience}
        />
      )}

      {/* One goal at a time: starting a new goal means replacing this one.
          We reuse the existing "start over" reset, behind a calm confirm. */}
      <div className="mt-16 border-t border-border pt-8">
        {confirmingReset ? (
          <div>
            <p className="text-sm text-muted leading-relaxed mb-5">
              Waypoint keeps you focused on one goal at a time for now. Starting
              over replaces your current goal and clears its progress. You can
              set a new one right after.
            </p>
            <div className="flex items-center gap-6">
              <button
                onClick={onStartOver}
                className="text-sm text-foreground underline underline-offset-2 hover:opacity-70 transition-opacity"
              >
                Replace my goal
              </button>
              <button
                onClick={() => setConfirmingReset(false)}
                className="text-sm text-muted hover:text-foreground transition-colors"
              >
                Keep my goal
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setConfirmingReset(true)}
            className="text-sm text-muted hover:text-foreground transition-colors"
          >
            Start over with a new goal
          </button>
        )}
      </div>
    </div>
  );
}

function TodayView({
  breakdown,
  plan,
  why,
  status,
  onToggleToday,
  showScience,
}: {
  breakdown: Breakdown;
  plan: Plan;
  why: string;
  status: CompletionStatus;
  onToggleToday: () => void;
  showScience: boolean;
}) {
  return (
    <div>
      <p className="text-sm text-muted mb-3">Your one thing for today</p>
      {/* The task is emphasized by size/weight; the accent is saved for the
          action below it. */}
      <p className="text-2xl font-semibold tracking-tight leading-snug mb-6">
        {breakdown.today}
      </p>

      {/* Values layer: a quiet, ongoing reminder of why this matters. */}
      {why.trim() && (
        <p className="text-sm text-muted leading-relaxed mb-3">
          Why this matters to you: {why.trim()}
        </p>
      )}

      {plan.cue && (
        <p className="text-sm text-muted leading-relaxed mb-10">
          When {deCap(plan.cue)}, I will do this.
        </p>
      )}

      {status.doneToday ? (
        <div className="text-base">
          <span className="text-foreground">Done for today.</span>{" "}
          <button
            onClick={onToggleToday}
            className="text-muted hover:text-foreground transition-colors underline underline-offset-2"
          >
            Undo
          </button>
        </div>
      ) : (
        <PrimaryButton onClick={onToggleToday}>Mark today done</PrimaryButton>
      )}

      {/* Weekly completion — quiet and neutral, never a scoreboard. */}
      <div className="mt-14">
        <WeekDots status={status} />
        <p className="text-sm text-muted mt-3">
          {status.weekCount} of 7 this week
        </p>
        {status.nudge && <MissMessage why={why} fallback={plan.fallback} />}
        <ScienceNote
          show={showScience}
          text={SCIENCE_NOTES.weekly}
          label="Why there's no streak"
        />
      </div>
    </div>
  );
}

// A warm, self-compassionate response to a missed day — never guilt. Covers the
// three evidenced components (self-kindness, common humanity, mindful
// acknowledgement), resurfaces the "why", and surfaces the user's own backup
// plan right when it's useful.
function MissMessage({ why, fallback }: { why: string; fallback: string }) {
  return (
    <div className="mt-5 space-y-2">
      <p className="text-sm text-muted leading-relaxed">
        Missing a day is part of how this actually works — not a setback.
        Everyone slips; picking it back up is the whole skill.
      </p>
      {why.trim() && (
        <p className="text-sm text-muted leading-relaxed">
          Remember why you started: {why.trim()}
        </p>
      )}
      {fallback.trim() && (
        <p className="text-sm text-muted leading-relaxed">
          Your plan for a day like this: {fallback.trim()}
        </p>
      )}
    </div>
  );
}

// Seven quiet dots (Mon..Sun). Filled = completed, hollow = not. Today gets a
// faint ring. No accent — this is a progress signal, not the main action.
function WeekDots({ status }: { status: CompletionStatus }) {
  const initials = ["M", "T", "W", "T", "F", "S", "S"];
  return (
    <div className="flex gap-3">
      {status.done.map((done, i) => (
        <div key={i} className="flex flex-col items-center gap-1.5">
          <span
            className={`w-2.5 h-2.5 rounded-full border ${
              done ? "bg-muted border-muted" : "bg-transparent border-border"
            } ${i === status.todayIndex ? "ring-2 ring-border" : ""}`}
          />
          <span className="text-[10px] text-muted">{initials[i]}</span>
        </div>
      ))}
    </div>
  );
}

function HorizonView({
  label,
  text,
  showScience,
}: {
  label: string;
  text: string;
  showScience: boolean;
}) {
  return (
    <div>
      <p className="text-sm text-muted mb-3">This {label.toLowerCase()}</p>
      <p className="text-xl font-medium leading-relaxed">{text}</p>
      <ScienceNote
        show={showScience}
        text={SCIENCE_NOTES.horizons}
        label="Why only today is emphasized"
      />
    </div>
  );
}

// =============================================================================
// Setup steps.
// =============================================================================

function StepWelcome({ onContinue }: { onContinue: () => void }) {
  return (
    <div className="text-center">
      <h1 className="text-4xl font-semibold tracking-tight mb-4">Waypoint</h1>
      <p className="text-lg text-muted mb-12">
        Break any goal into one thing you can do today.
      </p>
      <PrimaryButton onClick={onContinue}>Get started</PrimaryButton>
    </div>
  );
}

// Free-text question (goal and why).
function StepText({
  question,
  placeholder,
  value,
  onChange,
  onContinue,
  canContinue,
  scienceNote,
  showScience,
}: {
  question: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  onContinue: () => void;
  canContinue: boolean;
  scienceNote: string;
  showScience: boolean;
}) {
  return (
    <div>
      <h2 className="text-2xl font-medium tracking-tight mb-8">{question}</h2>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && canContinue) onContinue();
        }}
        placeholder={placeholder}
        autoFocus
        className="w-full text-lg bg-transparent border-b-2 border-border pb-2 outline-none focus:border-accent transition-colors placeholder:text-muted/50"
      />
      <div className="mt-8">
        <PrimaryButton onClick={onContinue} disabled={!canContinue}>
          Continue
        </PrimaryButton>
      </div>
      <ScienceNote show={showScience} text={scienceNote} />
    </div>
  );
}

// Multiple-choice question (hours).
function StepChoice({
  question,
  options,
  selected,
  onSelect,
  onContinue,
  canContinue,
  scienceNote,
  showScience,
}: {
  question: string;
  options: string[];
  selected: string;
  onSelect: (v: string) => void;
  onContinue: () => void;
  canContinue: boolean;
  scienceNote: string;
  showScience: boolean;
}) {
  return (
    <div>
      <h2 className="text-2xl font-medium tracking-tight mb-8">{question}</h2>
      <ChoiceButtons options={options} selected={selected} onSelect={onSelect} />
      <div className="mt-8">
        <PrimaryButton onClick={onContinue} disabled={!canContinue}>
          Continue
        </PrimaryButton>
      </div>
      <ScienceNote show={showScience} text={scienceNote} />
    </div>
  );
}

// The AI result. Shows today prominently and the rest of the route compactly —
// deliberately not a wall of tasks.
function StepBreakdown({
  breakdown,
  loading,
  error,
  onRetry,
  onContinue,
  showScience,
}: {
  breakdown: Breakdown | null;
  loading: boolean;
  error: string | null;
  onRetry: () => void;
  onContinue: () => void;
  showScience: boolean;
}) {
  if (loading) {
    return (
      <div className="text-center">
        <p className="text-lg text-muted animate-pulse">Building your route...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <p className="text-lg mb-6">{error}</p>
        <PrimaryButton onClick={onRetry}>Try again</PrimaryButton>
      </div>
    );
  }

  if (!breakdown) return null;

  const rows: [string, string][] = [
    ["This year", breakdown.year],
    ["This quarter", breakdown.quarter],
    ["This month", breakdown.month],
    ["This week", breakdown.week],
  ];

  return (
    <div>
      <p className="text-sm text-muted mb-3">Here's your route</p>
      <p className="text-sm text-muted mb-1">Today</p>
      <p className="text-xl font-semibold leading-snug mb-8">{breakdown.today}</p>

      <div className="border-t border-border pt-6 space-y-3 text-sm">
        {rows.map(([label, text]) => (
          <div key={label}>
            <span className="text-muted">{label}: </span>
            <span>{text}</span>
          </div>
        ))}
      </div>

      <div className="mt-8">
        <PrimaryButton onClick={onContinue}>Continue</PrimaryButton>
      </div>
      <ScienceNote
        show={showScience}
        text={SCIENCE_NOTES.horizons}
        label="Why only today is emphasized"
      />
    </div>
  );
}

// The signature interaction: attach today's task to a cue, plus an optional
// coping plan for when something gets in the way.
function StepPlan({
  goal,
  why,
  breakdown,
  initial,
  onFinish,
  showScience,
}: {
  goal: string;
  why: string;
  breakdown: Breakdown;
  initial: Plan;
  onFinish: (plan: Plan) => void;
  showScience: boolean;
}) {
  const [cue, setCue] = useState(initial.cue);
  const [obstacle, setObstacle] = useState(initial.obstacle);
  const [fallback, setFallback] = useState(initial.fallback);
  const canFinish = cue.trim().length > 0;

  return (
    <div>
      <h2 className="text-2xl font-medium tracking-tight mb-8">
        One last thing: your plan
      </h2>

      {/* WOOP — wish + outcome. A brief, factual reminder of the goal and why,
          held right next to the obstacle below so the two contrast (mental
          contrasting). Kept low-key on purpose: positive daydreaming *alone*
          tends to backfire; it's the contrast with the obstacle that works. */}
      <p className="text-sm text-muted mb-1">You're working toward</p>
      <p className="text-base font-medium leading-snug mb-4">
        {goal || "your goal"}
      </p>
      {why.trim() && (
        <p className="text-sm text-muted leading-relaxed mb-8">
          Why it matters: {why.trim()}. Take a second to really picture that.
        </p>
      )}

      <p className="text-sm text-muted mb-1">Today's step</p>
      <p className="text-base font-medium leading-snug mb-8">
        {breakdown.today}
      </p>

      {/* Plan — when you'll act (an implementation intention). */}
      <p className="text-sm text-muted mb-3">When will you do it?</p>
      <ChoiceButtons
        options={CUE_OPTIONS}
        selected={cue}
        onSelect={setCue}
        allowCustom
        customPlaceholder="Some other moment already in your day..."
      />
      {cue.trim() && (
        <p className="text-base leading-relaxed mt-6 text-muted">
          When {deCap(cue.trim())}, I will do this.
        </p>
      )}

      {/* Obstacle + coping plan — the contrast, and what you'll do when it hits. */}
      <div className="mt-10">
        <p className="text-sm text-muted mb-3">
          What&apos;s most likely to get in the way?
        </p>
        <input
          type="text"
          value={obstacle}
          onChange={(e) => setObstacle(e.target.value)}
          placeholder="I'm too tired, I talk myself out of it..."
          className="w-full text-base bg-transparent border-b border-border pb-2 mb-5 outline-none focus:border-accent transition-colors placeholder:text-muted/50"
        />
        <p className="text-sm text-muted mb-3">When it does, I&apos;ll</p>
        <input
          type="text"
          value={fallback}
          onChange={(e) => setFallback(e.target.value)}
          placeholder="do just five minutes"
          className="w-full text-base bg-transparent border-b border-border pb-2 outline-none focus:border-accent transition-colors placeholder:text-muted/50"
        />
      </div>

      <div className="mt-10">
        <PrimaryButton
          onClick={() =>
            onFinish({
              cue: cue.trim(),
              obstacle: obstacle.trim(),
              fallback: fallback.trim(),
            })
          }
          disabled={!canFinish}
        >
          Save plan
        </PrimaryButton>
      </div>
      <ScienceNote show={showScience} text={SCIENCE_NOTES.plan} />
    </div>
  );
}

// =============================================================================
// Shared UI.
// =============================================================================

// The one accent-colored control: reserved for the primary action on a screen.
function PrimaryButton({
  onClick,
  disabled,
  children,
}: {
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="bg-accent text-white px-8 py-3 rounded-lg text-base font-medium hover:opacity-90 transition-opacity disabled:opacity-30 disabled:cursor-not-allowed"
    >
      {children}
    </button>
  );
}

// A list of selectable option buttons, with an optional "Something else…" that
// reveals a free-text input. Selected option is the only accent besides the
// primary action.
function ChoiceButtons({
  options,
  selected,
  onSelect,
  allowCustom = false,
  customPlaceholder,
}: {
  options: string[];
  selected: string;
  onSelect: (v: string) => void;
  allowCustom?: boolean;
  customPlaceholder?: string;
}) {
  const [customMode, setCustomMode] = useState(
    () => allowCustom && selected !== "" && !options.includes(selected)
  );

  return (
    <>
      <div className="space-y-3">
        {options.map((opt) => {
          const active = !customMode && selected === opt;
          return (
            <button
              key={opt}
              onClick={() => {
                setCustomMode(false);
                onSelect(opt);
              }}
              className={`w-full text-left px-4 py-3 rounded-lg border transition-colors ${
                active
                  ? "border-accent bg-accent/10"
                  : "border-border hover:border-muted"
              }`}
            >
              {opt}
            </button>
          );
        })}

        {allowCustom && (
          <button
            onClick={() => {
              setCustomMode(true);
              onSelect("");
            }}
            className={`w-full text-left px-4 py-3 rounded-lg border transition-colors ${
              customMode
                ? "border-accent bg-accent/10"
                : "border-border hover:border-muted"
            }`}
          >
            Something else…
          </button>
        )}
      </div>

      {customMode && (
        <input
          type="text"
          value={selected}
          onChange={(e) => onSelect(e.target.value)}
          placeholder={customPlaceholder}
          autoFocus
          className="w-full text-lg bg-transparent border-b-2 border-border pb-2 mt-4 outline-none focus:border-accent transition-colors placeholder:text-muted/50"
        />
      )}
    </>
  );
}

// The vertical "route rail" shown during setup: one dot per step joined by a
// dashed line. Done = muted fill, current = accent, upcoming = hollow.
function RouteRail({ current, total }: { current: number; total: number }) {
  return (
    <div className="fixed left-6 sm:left-10 top-1/2 -translate-y-1/2 flex flex-col items-center">
      {Array.from({ length: total }).map((_, i) => {
        const step = i + 1;
        const status =
          step < current ? "done" : step === current ? "current" : "upcoming";
        const dot =
          status === "current"
            ? "bg-accent border-accent"
            : status === "done"
              ? "bg-muted border-muted"
              : "bg-transparent border-border";
        return (
          <div key={step} className="flex flex-col items-center">
            <span className={`w-3 h-3 rounded-full border ${dot}`} />
            {step < total && (
              <span className="w-px h-8 border-l border-dashed border-border" />
            )}
          </div>
        );
      })}
    </div>
  );
}

// A short, muted research note set off by a divider. Only shown when "Show the
// science" is on. Kept neutral so it never competes with the accent action.
function ScienceNote({
  show,
  text,
  label = "Why this step",
}: {
  show: boolean;
  text: string;
  label?: string;
}) {
  if (!show) return null;
  return (
    <div className="mt-10 pt-5 border-t border-border">
      <p className="text-xs uppercase tracking-wide text-muted mb-2">{label}</p>
      <p className="text-sm text-muted leading-relaxed">{text}</p>
    </div>
  );
}
