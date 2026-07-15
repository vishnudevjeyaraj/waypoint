"use client";

// Onboarding (the linear first-run flow). Stays full-screen with no app nav.
// When a goal exists, it hands off to /today.

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { hasGoal, useWaypoint } from "../lib/waypoint-context";
import {
  Breakdown,
  CUE_OPTIONS,
  HOURS_OPTIONS,
  Plan,
  Safety,
  SCIENCE_NOTES,
  TOTAL_SETUP_STEPS,
  deCap,
} from "../lib/waypoint";
import { ChoiceButtons, PrimaryButton, ScienceNote } from "../components/ui";

export default function Onboarding() {
  const router = useRouter();
  const {
    state,
    loaded,
    loading,
    error,
    safety,
    input,
    setInput,
    advance,
    goBack,
    changeGoal,
    fetchBreakdown,
    finishPlan,
    toggleScience,
  } = useWaypoint();

  // Once onboarding is complete, move into the app.
  useEffect(() => {
    if (loaded && hasGoal(state)) router.replace("/today");
  }, [loaded, state, router]);

  if (!loaded || hasGoal(state)) return null;

  const canContinue = input.trim().length > 0; // steps 2-4

  return (
    <>
      <RouteRail current={state.step} total={TOTAL_SETUP_STEPS} />

      <main className="flex-1 flex items-center justify-center px-6 py-16">
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

          {state.step === 5 &&
            (safety ? (
              <SafetyScreen safety={safety} onChangeGoal={changeGoal} />
            ) : (
              <StepBreakdown
                breakdown={state.breakdown}
                steps={state.steps}
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
            ))}

          {state.step === 6 && state.breakdown && (
            <StepPlan
              goal={state.goal}
              why={state.why}
              firstStep={state.steps[0] ?? ""}
              initial={state.plan}
              onFinish={finishPlan}
              showScience={state.showScience}
            />
          )}
        </div>
      </main>

      <button
        onClick={toggleScience}
        className="fixed bottom-6 right-6 text-sm text-muted hover:text-foreground border border-border rounded-full px-4 py-2 bg-surface transition-colors"
      >
        {state.showScience ? "Hide the science" : "Show the science"}
      </button>
    </>
  );
}

// --- Onboarding steps ---

function StepWelcome({ onContinue }: { onContinue: () => void }) {
  return (
    <div className="text-center">
      <h1 className="text-4xl font-semibold tracking-tight mb-4">Waypoint</h1>
      <p className="text-lg text-muted mb-12">
        Break any goal into one thing you can do today.
      </p>
      <PrimaryButton onClick={onContinue}>Get started</PrimaryButton>
      <p className="mt-12 text-xs text-muted leading-relaxed max-w-xs mx-auto">
        Waypoint is a wellness and productivity tool, not medical or
        mental-health treatment.
      </p>
    </div>
  );
}

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
        className="w-full text-lg bg-transparent border-b-2 border-border pb-2 outline-none focus:border-accent transition-colors placeholder:text-faint"
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
  options: readonly string[];
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

function StepBreakdown({
  breakdown,
  steps,
  loading,
  error,
  onRetry,
  onContinue,
  showScience,
}: {
  breakdown: Breakdown | null;
  steps: string[];
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
      <p className="text-xl font-semibold leading-snug mb-8">{steps[0] ?? ""}</p>

      <div className="border-t border-border pt-6 space-y-3 text-sm">
        {rows.map(([label, text]) => (
          <div key={label}>
            <span className="text-muted">{label}: </span>
            <span>{text}</span>
          </div>
        ))}
      </div>

      <p className="mt-8 text-sm text-muted leading-relaxed">
        This is a long game — most habits take two to five months to settle, and
        missing a day here and there won&apos;t set you back.
      </p>

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

function StepPlan({
  goal,
  why,
  firstStep,
  initial,
  onFinish,
  showScience,
}: {
  goal: string;
  why: string;
  firstStep: string;
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
      <p className="text-base font-medium leading-snug mb-8">{firstStep}</p>

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

      <div className="mt-10">
        <p className="text-sm text-muted mb-3">
          What&apos;s most likely to get in the way?
        </p>
        <input
          type="text"
          value={obstacle}
          onChange={(e) => setObstacle(e.target.value)}
          placeholder="I'm too tired, I talk myself out of it..."
          className="w-full text-base bg-transparent border-b border-border pb-2 mb-5 outline-none focus:border-accent transition-colors placeholder:text-faint"
        />
        <p className="text-sm text-muted mb-3">When it does, I&apos;ll</p>
        <input
          type="text"
          value={fallback}
          onChange={(e) => setFallback(e.target.value)}
          placeholder="do just five minutes"
          className="w-full text-base bg-transparent border-b border-border pb-2 outline-none focus:border-accent transition-colors placeholder:text-faint"
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

function SafetyScreen({
  safety,
  onChangeGoal,
}: {
  safety: Safety;
  onChangeGoal: () => void;
}) {
  if (safety.concern === "crisis") {
    return (
      <div>
        <h2 className="text-2xl font-medium tracking-tight mb-4">
          It sounds like you&apos;re carrying something heavy right now.
        </h2>
        <p className="text-base text-muted leading-relaxed mb-8">
          Waypoint isn&apos;t the right tool for this, and that&apos;s okay — you
          don&apos;t have to face it alone. If you&apos;re in the US, people are
          ready to help, any time:
        </p>
        <div className="space-y-4 mb-10">
          <p className="text-base leading-relaxed">
            <span className="text-foreground">
              988 Suicide &amp; Crisis Lifeline
            </span>
            <br />
            <span className="text-muted">Call or text 988</span>
          </p>
          <p className="text-base leading-relaxed">
            <span className="text-foreground">Crisis Text Line</span>
            <br />
            <span className="text-muted">Text HOME to 741741</span>
          </p>
          <p className="text-base leading-relaxed">
            <span className="text-muted">Outside the US: </span>
            <span className="text-foreground">findahelpline.com</span>
          </p>
        </div>
        <button
          onClick={onChangeGoal}
          className="text-sm text-muted hover:text-foreground transition-colors"
        >
          Set a different goal
        </button>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-medium tracking-tight mb-4">
        Let&apos;s not turn this one into a plan.
      </h2>
      <p className="text-base text-muted leading-relaxed mb-8">
        {safety.message.trim() ||
          "Some goals can do more harm than good when they're turned into daily targets and tracking, so Waypoint doesn't build plans around them. If this has been weighing on you, talking with someone you trust or a professional can genuinely help."}
      </p>
      <button
        onClick={onChangeGoal}
        className="text-sm text-foreground underline underline-offset-2 hover:opacity-70 transition-opacity"
      >
        Set a different goal
      </button>
    </div>
  );
}

// The vertical "route rail" shown during setup: one dot per step joined by a
// dashed line. Done = muted fill, current = accent, upcoming = hollow.
function RouteRail({ current, total }: { current: number; total: number }) {
  return (
    <div className="fixed left-6 sm:left-10 top-1/2 -translate-y-1/2 hidden sm:flex flex-col items-center">
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
