"use client";

import { useWaypoint } from "../../../lib/waypoint-context";
import { SCIENCE_NOTES, completionStatus, dateKey } from "../../../lib/waypoint";
import {
  MissMessage,
  ScienceNote,
  WeekDots,
  usePageTitle,
} from "../../../components/ui";

export default function ProgressPage() {
  const { state } = useWaypoint();
  usePageTitle("Progress · Waypoint");
  const status = completionStatus(state.completedDates);

  // Three contextual states: approaching a second miss, a single earlier miss,
  // or on track — using only the reliable weekly signals.
  const completedBeforeToday = status.weekCount - (status.doneToday ? 1 : 0);
  const missedBeforeToday = Math.max(0, status.todayIndex - completedBeforeToday);

  return (
    <div>
      <h1 className="text-[32px] font-semibold tracking-tight leading-tight mb-8">
        Progress
      </h1>

      <div className="rounded-[16px] border border-border bg-surface p-6">
        <p className="text-[11px] uppercase tracking-[0.08em] text-muted mb-5">
          This week
        </p>
        <WeekDots status={status} size="lg" labels />
        <p className="text-base text-foreground mt-6">
          {status.weekCount} of 7 days
        </p>
      </div>

      <div className="mt-8">
        {status.nudge ? (
          <MissMessage why={state.why} fallback={state.plan.fallback} />
        ) : missedBeforeToday >= 1 ? (
          <p className="text-sm text-muted leading-relaxed">
            One miss doesn&apos;t set you back — about 80% consistency still
            builds the habit. Keep going; the next day is the one that counts.
          </p>
        ) : status.doneToday ? (
          <p className="text-sm text-muted leading-relaxed">
            You showed up today. That&apos;s the whole game — small and
            repeated.
          </p>
        ) : (
          <p className="text-sm text-muted leading-relaxed">
            You&apos;re on track this week. One small step is all today asks.
          </p>
        )}
      </div>

      <div className="mt-8">
        <MonthHistory completedDates={state.completedDates} />
      </div>

      <ScienceNote
        show={state.showScience}
        text={SCIENCE_NOTES.weekly}
        label="Why this page"
      />
    </div>
  );
}

// A calm month calendar of check-ins, built from the days already stored.
// Completed days are filled; today gets a faint ring. No accent scoreboard.
function MonthHistory({ completedDates }: { completedDates: string[] }) {
  const done = new Set(completedDates);
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startOffset = (new Date(year, month, 1).getDay() + 6) % 7; // Mon = 0
  const today = dateKey(now);
  const monthLabel = now.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  const cells: (number | null)[] = [];
  for (let i = 0; i < startOffset; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  return (
    <div className="rounded-[16px] border border-border bg-surface p-6">
      <p className="text-[11px] uppercase tracking-[0.08em] text-muted mb-4">
        {monthLabel}
      </p>
      <div className="grid grid-cols-7 gap-1.5">
        {["M", "T", "W", "T", "F", "S", "S"].map((l, i) => (
          <span key={i} className="text-center text-[10px] text-faint pb-1">
            {l}
          </span>
        ))}
        {cells.map((day, i) => {
          if (day === null) return <span key={i} />;
          const key = dateKey(new Date(year, month, day));
          const isDone = done.has(key);
          const isToday = key === today;
          return (
            <div key={i} className="flex items-center justify-center">
              <span
                className={`w-8 h-8 flex items-center justify-center rounded-full text-xs ${
                  isDone ? "bg-muted text-bg font-medium" : "text-muted"
                } ${isToday ? "ring-1 ring-border" : ""}`}
              >
                {day}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
