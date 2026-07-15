"use client";

import { useState } from "react";
import { useWaypoint } from "../../../lib/waypoint-context";
import {
  Feeling,
  SCIENCE_NOTES,
  STUCK_OPTIONS,
  StuckKey,
  completionStatus,
  deCap,
  stepProgress,
  stuckResponse,
  todayKey,
} from "../../../lib/waypoint";
import {
  MissMessage,
  PrimaryButton,
  ScienceNote,
  WeekDots,
} from "../../../components/ui";

export default function TodayPage() {
  const { state, loading, error, toggleToday, logFeeling, planNext } =
    useWaypoint();
  const [diagnosing, setDiagnosing] = useState(false);

  const status = completionStatus(state.completedDates);
  const steps = state.steps;
  const stepsDone = state.stepsDone;
  const total = steps.length;
  const allDone = stepsDone >= total;
  const plan = state.plan;
  const why = state.why;
  const feeling = state.feelings[todayKey()];
  const showScience = state.showScience;

  const dateLabel = new Date().toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });

  return (
    <div>
      <p className="text-xs uppercase tracking-[0.08em] text-muted mb-1">
        {dateLabel}
      </p>
      <h1 className="text-[32px] font-semibold tracking-tight leading-tight mb-8">
        Today
      </h1>

      {loading ? (
        <p className="text-lg text-muted animate-pulse">
          Planning your next steps...
        </p>
      ) : allDone && !status.doneToday ? (
        <CompletionCard
          monthGoal={state.breakdown?.month ?? ""}
          error={error}
          status={status}
          onPlanNext={planNext}
        />
      ) : (
        <>
          <TaskCard
            task={steps[status.doneToday ? Math.max(0, stepsDone - 1) : stepsDone] ?? ""}
            plan={plan}
            why={why}
            done={status.doneToday}
            feeling={feeling}
            diagnosing={diagnosing}
            showScience={showScience}
            totalDone={state.completedDates.length}
            onToggle={toggleToday}
            onLogFeeling={logFeeling}
            onDiagnose={() => setDiagnosing(true)}
            onCloseDiagnose={() => setDiagnosing(false)}
          />

          <div className="mt-10">
            {total > 0 && (
              <p className="text-sm text-muted mb-4">
                {stepProgress(stepsDone, total)}
              </p>
            )}
            <WeekDots status={status} labels />
            <p className="text-sm text-muted mt-3">
              This week: {status.weekCount} of 7
            </p>
            {status.nudge && <MissMessage why={why} fallback={plan.fallback} />}
            <ScienceNote
              show={showScience}
              text={SCIENCE_NOTES.progress}
              label="Why one small step at a time"
            />
          </div>
        </>
      )}
    </div>
  );
}

function TaskCard({
  task,
  plan,
  why,
  done,
  feeling,
  diagnosing,
  showScience,
  totalDone,
  onToggle,
  onLogFeeling,
  onDiagnose,
  onCloseDiagnose,
}: {
  task: string;
  plan: { cue: string; obstacle: string; fallback: string };
  why: string;
  done: boolean;
  feeling: Feeling | undefined;
  diagnosing: boolean;
  showScience: boolean;
  totalDone: number;
  onToggle: () => void;
  onLogFeeling: (f: Feeling) => void;
  onDiagnose: () => void;
  onCloseDiagnose: () => void;
}) {
  return (
    <div className="rounded-[16px] border border-border bg-surface p-5 md:p-6">
      <p className="text-sm text-muted mb-3">Your one thing for today</p>
      <p className="text-xl font-semibold tracking-tight leading-snug mb-4">
        {task}
      </p>

      {why.trim() && (
        <p className="text-sm text-muted leading-relaxed mb-2">
          Why this matters to you: {why.trim()}
        </p>
      )}
      {plan.cue && (
        <p className="text-sm text-muted leading-relaxed mb-6">
          When {deCap(plan.cue)}, you&apos;ll do this.
        </p>
      )}

      {diagnosing ? (
        <StuckDiagnostic
          why={why}
          cue={plan.cue}
          totalDone={totalDone}
          showScience={showScience}
          onClose={onCloseDiagnose}
        />
      ) : done ? (
        <div>
          <div className="flex items-center gap-3 mb-6">
            <Checkbox checked onClick={onToggle} />
            <span className="text-base text-foreground">
              That&apos;s today. Nothing else is due.
            </span>
          </div>
          <FeelingPrompt feeling={feeling} onLog={onLogFeeling} />
          <ScienceNote
            show={showScience}
            text={SCIENCE_NOTES.feeling}
            label="Why we ask how it felt"
          />
        </div>
      ) : (
        <div className="flex items-center gap-3">
          <Checkbox checked={false} onClick={onToggle} />
          <button
            onClick={onDiagnose}
            className="text-sm text-muted hover:text-foreground transition-colors"
          >
            Stuck on this step?
          </button>
        </div>
      )}
    </div>
  );
}

// Custom circular checkbox. Accent fill + white check when done, with a brief
// scale confirmation (no confetti — calm, per the anti-dark-pattern principle).
function Checkbox({
  checked,
  onClick,
}: {
  checked: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      aria-pressed={checked}
      aria-label={checked ? "Mark today not done" : "Mark today done"}
      className={`shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
        checked
          ? "bg-accent border-accent scale-100"
          : "border-border hover:border-muted"
      }`}
    >
      {checked && (
        <svg
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none"
          className="text-white"
        >
          <path
            d="M2.5 6.5L5 9L9.5 3.5"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
    </button>
  );
}

function FeelingPrompt({
  feeling,
  onLog,
}: {
  feeling: Feeling | undefined;
  onLog: (feeling: Feeling) => void;
}) {
  if (feeling) {
    return <p className="text-sm text-muted">Noted — it felt {feeling}.</p>;
  }
  return (
    <div>
      <p className="text-sm text-muted mb-2">How did that feel?</p>
      <div className="flex gap-2">
        {(["good", "okay", "hard"] as const).map((f) => (
          <button
            key={f}
            onClick={() => onLog(f)}
            className="px-4 py-1.5 rounded-[10px] border border-border bg-surface hover:bg-surface-hover text-sm capitalize transition-colors"
          >
            {f}
          </button>
        ))}
      </div>
    </div>
  );
}

function StuckDiagnostic({
  why,
  cue,
  totalDone,
  showScience,
  onClose,
}: {
  why: string;
  cue: string;
  totalDone: number;
  showScience: boolean;
  onClose: () => void;
}) {
  const [choice, setChoice] = useState<StuckKey | null>(null);

  if (choice) {
    return (
      <div>
        <p className="text-base leading-relaxed mb-8">
          {stuckResponse(choice, { why, cue, totalDone })}
        </p>
        <div className="flex items-center gap-6">
          <button
            onClick={onClose}
            className="text-sm text-foreground underline underline-offset-2 hover:opacity-70 transition-opacity"
          >
            Got it
          </button>
          <button
            onClick={() => setChoice(null)}
            className="text-sm text-muted hover:text-foreground transition-colors"
          >
            Something else
          </button>
        </div>
        <ScienceNote
          show={showScience}
          text={SCIENCE_NOTES.stuck}
          label="Why we ask this"
        />
      </div>
    );
  }

  return (
    <div>
      <p className="text-sm text-muted mb-4">
        What&apos;s making it hard right now?
      </p>
      <div className="space-y-3">
        {STUCK_OPTIONS.map((o) => (
          <button
            key={o.key}
            onClick={() => setChoice(o.key)}
            className="w-full text-left px-4 py-3 rounded-[10px] border border-border bg-surface hover:bg-surface-hover text-sm transition-colors"
          >
            {o.label}
          </button>
        ))}
      </div>
      <button
        onClick={onClose}
        className="mt-6 text-sm text-muted hover:text-foreground transition-colors"
      >
        Never mind
      </button>
      <ScienceNote
        show={showScience}
        text={SCIENCE_NOTES.stuck}
        label="Why we ask this"
      />
    </div>
  );
}

// Shown when the week's ladder is finished — offers the next week.
function CompletionCard({
  monthGoal,
  error,
  status,
  onPlanNext,
}: {
  monthGoal: string;
  error: string | null;
  status: ReturnType<typeof completionStatus>;
  onPlanNext: () => void;
}) {
  return (
    <div>
      <div className="rounded-[16px] border border-border bg-surface p-5 md:p-6 mb-10">
        <p className="text-sm text-muted mb-3">This week</p>
        <p className="text-xl font-semibold tracking-tight leading-snug mb-4">
          You&apos;ve finished this week&apos;s steps. Nice work.
        </p>
        {monthGoal.trim() && (
          <p className="text-sm text-muted leading-relaxed mb-6">
            Real progress toward {monthGoal.trim()}.
          </p>
        )}
        {error && <p className="text-sm text-muted mb-4">{error}</p>}
        <PrimaryButton onClick={onPlanNext}>Plan next week</PrimaryButton>
      </div>
      <WeekDots status={status} labels />
      <p className="text-sm text-muted mt-3">
        This week: {status.weekCount} of 7
      </p>
    </div>
  );
}
