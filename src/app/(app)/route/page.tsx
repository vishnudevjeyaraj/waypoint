"use client";

import { useState } from "react";
import { useWaypoint } from "../../../lib/waypoint-context";
import { SCIENCE_NOTES, stepProgress } from "../../../lib/waypoint";
import { ScienceNote, usePageTitle } from "../../../components/ui";

export default function RoutePage() {
  const { state, editStep } = useWaypoint();
  usePageTitle("Route · Waypoint");

  const breakdown = state.breakdown!;
  const total = state.steps.length;
  const nearestIdx = Math.min(state.stepsDone, total - 1);
  const nearest = state.steps[nearestIdx] ?? "";

  const tiers: [string, string][] = [
    ["This week", breakdown.week],
    ["This month", breakdown.month],
    ["This quarter", breakdown.quarter],
    ["This year", breakdown.year],
  ];

  return (
    <div>
      <p className="text-[11px] uppercase tracking-[0.08em] text-muted mb-1">
        {state.goal}
      </p>
      <h1 className="text-[32px] font-semibold tracking-tight leading-tight mb-8">
        Route
      </h1>

      {/* The route as a vertical trail of waypoints. */}
      <div>
        <Waypoint accent>
          <NearestStep
            nearest={nearest}
            index={nearestIdx}
            stepsDone={state.stepsDone}
            total={total}
            onSave={editStep}
          />
        </Waypoint>

        {tiers.map(([label, text], i) => (
          <Waypoint key={label} isLast={i === tiers.length - 1}>
            <div className="pt-0.5">
              <p className="text-[11px] uppercase tracking-[0.08em] text-muted">
                {label}
              </p>
              <p className="text-base leading-relaxed mt-1.5">{text}</p>
            </div>
          </Waypoint>
        ))}
      </div>

      <ScienceNote
        show={state.showScience}
        text={SCIENCE_NOTES.horizons}
        label="Why this page"
      />
    </div>
  );
}

// One stop on the trail: a dot (accent for the nearest step, muted otherwise)
// with a connecting line down to the next, and the content to the right.
function Waypoint({
  children,
  accent = false,
  isLast = false,
}: {
  children: React.ReactNode;
  accent?: boolean;
  isLast?: boolean;
}) {
  return (
    <div className="flex gap-4">
      <div className="flex flex-col items-center pt-1">
        <span
          className={`w-3 h-3 rounded-full border-2 ${
            accent ? "bg-accent border-accent" : "bg-bg border-border"
          }`}
        />
        {!isLast && <span className="w-px flex-1 bg-border my-1.5" />}
      </div>
      <div className={`flex-1 ${isLast ? "" : "pb-8"}`}>{children}</div>
    </div>
  );
}

// The nearest step, prominent and editable in place (human-in-the-loop).
function NearestStep({
  nearest,
  index,
  stepsDone,
  total,
  onSave,
}: {
  nearest: string;
  index: number;
  stepsDone: number;
  total: number;
  onSave: (index: number, text: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(nearest);

  return (
    <div className="rounded-[16px] border border-border bg-surface p-5">
      <p className="text-[11px] uppercase tracking-[0.08em] text-muted mb-2">
        Your nearest step
      </p>

      {editing ? (
        <div>
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            autoFocus
            rows={3}
            className="w-full bg-transparent border border-border rounded-[10px] p-3 text-base leading-relaxed outline-none focus:border-accent transition-colors resize-none"
          />
          <div className="flex items-center gap-5 mt-3">
            <button
              onClick={() => {
                onSave(index, draft);
                setEditing(false);
              }}
              disabled={!draft.trim()}
              className="text-sm font-medium text-foreground hover:opacity-70 transition-opacity disabled:opacity-35"
            >
              Save
            </button>
            <button
              onClick={() => {
                setDraft(nearest);
                setEditing(false);
              }}
              className="text-sm text-muted hover:text-foreground transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <>
          <p className="text-lg font-semibold leading-snug">{nearest}</p>
          {total > 0 && (
            <p className="text-sm text-muted mt-3">
              {stepProgress(stepsDone, total)}
            </p>
          )}
          <button
            onClick={() => {
              setDraft(nearest);
              setEditing(true);
            }}
            className="mt-4 text-sm text-muted hover:text-foreground transition-colors"
          >
            Adjust
          </button>
        </>
      )}
    </div>
  );
}
