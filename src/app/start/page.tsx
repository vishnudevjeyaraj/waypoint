"use client";

// Onboarding (the linear first-run flow). Stays full-screen with no app nav.
// When a goal exists, it hands off to /today.

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw } from "lucide-react";
import { hasGoal, useWaypoint } from "../../lib/waypoint-context";
import {
  CUE_OPTIONS,
  GOAL_EXAMPLES,
  HOURS_OPTIONS,
  Milestone,
  Plan,
  Safety,
  SCIENCE_NOTES,
  Step,
  TARGET_DATE_OPTIONS,
  TOTAL_SETUP_STEPS,
  deCap,
  sample,
} from "../../lib/waypoint";
import {
  ChoiceButtons,
  Loading,
  PrimaryButton,
  ScienceNote,
  usePageTitle,
} from "../../components/ui";

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
    whyExamples,
    whyLoading,
    fetchWhyExamples,
  } = useWaypoint();

  usePageTitle("Waypoint");

  // A refreshable handful of example goals below the goal input.
  const [goalExamples, setGoalExamples] = useState<string[]>([]);
  useEffect(() => {
    setGoalExamples(sample(GOAL_EXAMPLES, 4));
  }, []);

  // Once onboarding is complete, move into the app.
  useEffect(() => {
    if (loaded && hasGoal(state)) router.replace("/today");
  }, [loaded, state, router]);

  if (!loaded) return <Loading />;
  if (hasGoal(state)) return null; // redirecting to /today

  const canContinue = input.trim().length > 0; // steps 2-4

  return (
    <>
      <RouteRail current={state.step} total={TOTAL_SETUP_STEPS} />

      <main className="flex-1 flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-md">
          {/* Progress indicator for phones (desktop shows the rail instead). */}
          <div className="sm:hidden mb-8">
            <p className="text-[11px] uppercase tracking-[0.08em] text-muted mb-2">
              Step {state.step} of {TOTAL_SETUP_STEPS}
            </p>
            <div className="h-1 rounded-full bg-surface overflow-hidden">
              <div
                className="h-full bg-muted rounded-full transition-all duration-300"
                style={{
                  width: `${(state.step / TOTAL_SETUP_STEPS) * 100}%`,
                }}
              />
            </div>
          </div>

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
            <StepTextWithExamples
              question="What's one goal you want to make progress on?"
              placeholder="Learn Spanish, run a marathon, write a book..."
              value={input}
              onChange={setInput}
              onContinue={advance}
              canContinue={canContinue}
              examples={goalExamples}
              onRefresh={() => setGoalExamples(sample(GOAL_EXAMPLES, 4))}
              scienceNote={SCIENCE_NOTES.goal}
              showScience={state.showScience}
            />
          )}

          {state.step === 3 && (
            <StepChoice
              question="When do you want to achieve this by?"
              options={TARGET_DATE_OPTIONS}
              selected={input}
              onSelect={setInput}
              onContinue={advance}
              canContinue={canContinue}
              scienceNote={SCIENCE_NOTES.target}
              showScience={state.showScience}
            />
          )}

          {state.step === 4 && (
            <StepTextWithExamples
              question="Why does this matter to you?"
              placeholder="In your own words — the reason underneath it..."
              value={input}
              onChange={setInput}
              onContinue={advance}
              canContinue={canContinue}
              examples={whyExamples}
              loading={whyLoading}
              onRefresh={() => fetchWhyExamples(state.goal)}
              scienceNote={SCIENCE_NOTES.why}
              showScience={state.showScience}
            />
          )}

          {state.step === 5 && (
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

          {state.step === 6 &&
            (safety ? (
              <SafetyScreen safety={safety} onChangeGoal={changeGoal} />
            ) : (
              <StepBreakdown
                milestones={state.milestones}
                steps={state.steps}
                loading={loading}
                error={error}
                onRetry={() =>
                  fetchBreakdown({
                    goal: state.goal,
                    why: state.why,
                    timePerWeek: state.timePerWeek,
                    targetDate: state.targetDate,
                  })
                }
                onContinue={advance}
                showScience={state.showScience}
              />
            ))}

          {state.step === 7 && state.milestones.length > 0 && (
            <StepPlan
              goal={state.goal}
              why={state.why}
              firstStep={state.steps[0]?.text ?? ""}
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

// A free-text step (goal, why). The text box is the primary way to answer;
// optional example chips sit below it.
function StepTextWithExamples({
  question,
  placeholder,
  value,
  onChange,
  onContinue,
  canContinue,
  examples,
  loading = false,
  onRefresh,
  scienceNote,
  showScience,
}: {
  question: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  onContinue: () => void;
  canContinue: boolean;
  examples: string[];
  loading?: boolean;
  onRefresh: () => void;
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

      <ExampleChips
        examples={examples}
        loading={loading}
        onRefresh={onRefresh}
        onPick={onChange}
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

// Optional example suggestions below the text input, with a refresh button.
// Tapping one fills the input; the text box stays the main path.
function ExampleChips({
  examples,
  loading,
  onRefresh,
  onPick,
}: {
  examples: string[];
  loading: boolean;
  onRefresh: () => void;
  onPick: (v: string) => void;
}) {
  return (
    <div className="mt-6">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-[11px] uppercase tracking-[0.08em] text-muted">
          Or start from an example
        </span>
        <button
          onClick={onRefresh}
          aria-label="Show different examples"
          className="text-muted hover:text-foreground transition-colors"
        >
          <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
        </button>
      </div>
      {loading && examples.length === 0 ? (
        <p className="text-sm text-faint">Finding a few examples…</p>
      ) : examples.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {examples.map((ex) => (
            <button
              key={ex}
              onClick={() => onPick(ex)}
              className="px-3 py-1.5 rounded-full border border-border bg-surface text-sm text-muted hover:text-foreground hover:border-muted transition-colors"
            >
              {ex}
            </button>
          ))}
        </div>
      ) : null}
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
  milestones,
  steps,
  loading,
  error,
  onRetry,
  onContinue,
  showScience,
}: {
  milestones: Milestone[];
  steps: Step[];
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

  if (milestones.length === 0) return null;

  return (
    <div>
      <p className="text-sm text-muted mb-3">Here's your route</p>
      <p className="text-sm text-muted mb-1">Today</p>
      <p className="text-xl font-semibold leading-snug mb-8">
        {steps[0]?.text ?? ""}
      </p>

      <div className="border-t border-border pt-6 space-y-3 text-sm">
        {milestones.map((m, i) => (
          <div key={m.id}>
            <span className="text-muted">{i + 1}. </span>
            <span>{m.title}</span>
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
