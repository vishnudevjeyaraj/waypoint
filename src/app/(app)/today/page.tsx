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
  stuckResponse,
  todayKey,
} from "../../../lib/waypoint";
import {
  PrimaryButton,
  ScienceNote,
  WeekDots,
  usePageTitle,
} from "../../../components/ui";

export default function TodayPage() {
  const { state, loading, error, toggleToday, logFeeling, planNext } =
    useWaypoint();
  const [diagnosing, setDiagnosing] = useState(false);
  usePageTitle("Today · Waypoint");

  const status = completionStatus(state.completedDates);
  const { steps, stepsDone, plan } = state;
  const allDone = stepsDone >= steps.length;
  const done = status.doneToday;
  const currentStep = steps[done ? Math.max(0, stepsDone - 1) : stepsDone];

  const dateLabel = new Date().toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });

  return (
    <div>
      <p className="text-[11px] uppercase tracking-[0.08em] text-muted mb-1">
        {dateLabel}
      </p>
      <h1 className="text-[32px] font-semibold tracking-tight leading-tight mb-8">
        Today
      </h1>

      {loading ? (
        <p className="text-base text-muted animate-pulse">
          Planning your next steps...
        </p>
      ) : allDone && !done ? (
        <CompletionCard
          goal={state.goal}
          error={error}
          status={status}
          onPlanNext={planNext}
        />
      ) : (
        <>
          <TaskCard
            task={currentStep?.text ?? ""}
            type={currentStep?.type ?? "one-off"}
            cue={plan.cue}
            done={done}
            feeling={state.feelings[todayKey()]}
            showScience={state.showScience}
            onToggle={toggleToday}
            onLogFeeling={logFeeling}
          />

          {!done &&
            (diagnosing ? (
              <div className="mt-8">
                <StuckDiagnostic
                  why={state.why}
                  cue={plan.cue}
                  totalDone={state.completedDates.length}
                  showScience={state.showScience}
                  onClose={() => setDiagnosing(false)}
                />
              </div>
            ) : (
              <button
                onClick={() => setDiagnosing(true)}
                className="mt-5 text-sm text-muted hover:text-foreground transition-colors"
              >
                Stuck on this step?
              </button>
            ))}

          {!diagnosing && (
            <div className="mt-10">
              <WeekDots status={status} labels />
              <p className="text-sm text-muted mt-3">
                This week: {status.weekCount} of 7
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// The single focal card: task, if-then sentence, and the one accent control
// (the checkbox). Calm, muted completed state — no streak language.
function TaskCard({
  task,
  type,
  cue,
  done,
  feeling,
  showScience,
  onToggle,
  onLogFeeling,
}: {
  task: string;
  type: "one-off" | "habit";
  cue: string;
  done: boolean;
  feeling: Feeling | undefined;
  showScience: boolean;
  onToggle: () => void;
  onLogFeeling: (f: Feeling) => void;
}) {
  return (
    <div className="rounded-[16px] border border-border bg-surface p-6">
      <div className="flex items-center justify-between mb-3">
        <p className="text-[11px] uppercase tracking-[0.08em] text-muted">
          Your one thing for today
        </p>
        {type === "habit" && (
          <span className="text-[10px] uppercase tracking-[0.08em] text-muted border border-border rounded-full px-2 py-0.5">
            habit
          </span>
        )}
      </div>
      <p
        className={`text-xl font-semibold tracking-tight leading-snug ${
          done ? "text-muted" : "text-foreground"
        }`}
      >
        {task}
      </p>
      {/* The if-then cue is for recurring (habit) steps; a one-off doesn't need
          a repeating cue. */}
      {cue && type === "habit" && (
        <p className="text-sm text-muted leading-relaxed mt-3">
          When {deCap(cue)}, you&apos;ll do this.
        </p>
      )}

      <div className="mt-6 pt-6 border-t border-border">
        {done ? (
          <div>
            <div className="flex items-center gap-3">
              <button onClick={onToggle} aria-label="Mark not done">
                <Checkbox checked />
              </button>
              <span className="text-base text-foreground">
                That&apos;s today. Nothing else is due.
              </span>
            </div>
            <div className="mt-6">
              <FeelingPrompt feeling={feeling} onLog={onLogFeeling} />
              <ScienceNote
                show={showScience}
                text={SCIENCE_NOTES.feeling}
                label="Why we ask how it felt"
              />
            </div>
          </div>
        ) : (
          <button
            onClick={onToggle}
            className="flex items-center gap-3 group"
            aria-label="Mark today done"
          >
            <Checkbox checked={false} />
            <span className="text-base text-muted group-hover:text-foreground transition-colors">
              Mark done
            </span>
          </button>
        )}
      </div>
    </div>
  );
}

// Custom 24px circular checkbox: border outline unchecked, accent fill + white
// check when checked, with a brief scale+fade confirmation.
function Checkbox({ checked }: { checked: boolean }) {
  return (
    <span
      className={`shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors duration-200 ${
        checked
          ? "bg-accent border-accent"
          : "border-border group-hover:border-muted"
      }`}
    >
      {checked && (
        <svg
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none"
          className="text-white"
          style={{ animation: "check-pop 200ms ease-out" }}
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
    </span>
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

// Shown when the steps toward the nearest milestone are finished — offers the
// steps for the next milestone.
function CompletionCard({
  goal,
  error,
  status,
  onPlanNext,
}: {
  goal: string;
  error: string | null;
  status: ReturnType<typeof completionStatus>;
  onPlanNext: () => void;
}) {
  return (
    <div>
      <div className="rounded-[16px] border border-border bg-surface p-6 mb-10">
        <p className="text-[11px] uppercase tracking-[0.08em] text-muted mb-3">
          Milestone reached
        </p>
        <p className="text-xl font-semibold tracking-tight leading-snug mb-4">
          You&apos;ve finished this stretch of steps. Nice work.
        </p>
        {goal.trim() && (
          <p className="text-sm text-muted leading-relaxed mb-6">
            Real progress toward {goal.trim()}.
          </p>
        )}
        {error && <p className="text-sm text-muted mb-4">{error}</p>}
        <PrimaryButton onClick={onPlanNext}>Plan next steps</PrimaryButton>
      </div>
      <WeekDots status={status} labels />
      <p className="text-sm text-muted mt-3">
        This week: {status.weekCount} of 7
      </p>
    </div>
  );
}
