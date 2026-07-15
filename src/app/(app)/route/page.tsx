"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { useWaypoint } from "../../../lib/waypoint-context";
import { SCIENCE_NOTES, stepProgress } from "../../../lib/waypoint";
import { ScienceNote } from "../../../components/ui";

export default function RoutePage() {
  const { state } = useWaypoint();
  const breakdown = state.breakdown!;
  const total = state.steps.length;
  const nearest = state.steps[Math.min(state.stepsDone, total - 1)] ?? "";

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

      {/* Nearest step — the one accent-adjacent element on this page. */}
      <div className="rounded-[16px] border border-border border-l-2 border-l-accent bg-surface p-6 mb-8">
        <p className="text-[11px] uppercase tracking-[0.08em] text-muted mb-3">
          Your nearest step
        </p>
        <p className="text-lg font-semibold leading-snug">{nearest}</p>
        {total > 0 && (
          <p className="text-sm text-muted mt-3">
            {stepProgress(state.stepsDone, total)}
          </p>
        )}
        <AdjustAffordance />
      </div>

      {/* The wider route, collapsed by default (progressive disclosure). */}
      <div className="space-y-2">
        {tiers.map(([label, text]) => (
          <TierRow key={label} label={label} text={text} />
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

// Human-in-the-loop affordance. A real edit flow is future work; for now this
// is an honest, minimal disclosure rather than a dead button.
function AdjustAffordance() {
  const [open, setOpen] = useState(false);
  return (
    <div className="mt-5">
      <button
        onClick={() => setOpen((o) => !o)}
        className="text-sm text-muted hover:text-foreground transition-colors"
      >
        Adjust
      </button>
      {open && (
        <p className="mt-2 text-sm text-faint leading-relaxed">
          Editing individual steps is coming soon. For now you can plan the next
          week from Today once you finish this one, or start over from Profile.
        </p>
      )}
    </div>
  );
}

function TierRow({ label, text }: { label: string; text: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-[10px] border border-border bg-surface">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="w-full flex items-center justify-between px-4 py-3.5 text-left"
      >
        <span className="text-base">{label}</span>
        <ChevronDown
          size={18}
          className={`text-muted transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <p className="px-4 pb-4 text-sm text-muted leading-relaxed">{text}</p>
      )}
    </div>
  );
}
