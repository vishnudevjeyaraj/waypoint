"use client";

import { useWaypoint } from "../../../lib/waypoint-context";
import { SCIENCE_NOTES, completionStatus } from "../../../lib/waypoint";
import { MissMessage, ScienceNote, WeekDots } from "../../../components/ui";

export default function ProgressPage() {
  const { state } = useWaypoint();
  const status = completionStatus(state.completedDates);

  // Three contextual states: approaching a second miss, a single earlier miss,
  // or on track. Uses only the reliable weekly signals.
  const completedBeforeToday = status.weekCount - (status.doneToday ? 1 : 0);
  const missedBeforeToday = Math.max(0, status.todayIndex - completedBeforeToday);

  return (
    <div>
      <h1 className="text-[32px] font-semibold tracking-tight leading-tight mb-8">
        Progress
      </h1>

      <div className="rounded-[16px] border border-border bg-surface p-5 md:p-6">
        <p className="text-sm text-muted mb-5">This week</p>
        <WeekDots status={status} size="lg" labels />
        <p className="text-base text-foreground mt-5">
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

      <ScienceNote
        show={state.showScience}
        text={SCIENCE_NOTES.weekly}
        label="Why there's no streak"
      />
    </div>
  );
}
