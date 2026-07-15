"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { useWaypoint } from "../../../lib/waypoint-context";
import { SCIENCE_NOTES } from "../../../lib/waypoint";
import { ScienceNote } from "../../../components/ui";

export default function RoutePage() {
  const { state } = useWaypoint();
  const breakdown = state.breakdown!;
  const nearest =
    state.steps[Math.min(state.stepsDone, state.steps.length - 1)] ?? "";

  const tiers: [string, string][] = [
    ["This week", breakdown.week],
    ["This month", breakdown.month],
    ["This quarter", breakdown.quarter],
    ["This year", breakdown.year],
  ];

  return (
    <div>
      <p className="text-xs uppercase tracking-[0.08em] text-muted mb-1">
        {state.goal}
      </p>
      <h1 className="text-[32px] font-semibold tracking-tight leading-tight mb-8">
        Route
      </h1>

      {/* Nearest step — the one accent-adjacent element on this page. */}
      <div className="rounded-[16px] border border-border border-l-2 border-l-accent bg-surface p-5 md:p-6 mb-8">
        <p className="text-sm text-muted mb-2">Your nearest step</p>
        <p className="text-lg font-semibold leading-snug mb-4">{nearest}</p>
        <button className="text-sm text-muted hover:text-foreground transition-colors">
          Adjust
        </button>
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
        label="Why only today is emphasized"
      />
    </div>
  );
}

function TierRow({ label, text }: { label: string; text: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-[10px] border border-border bg-surface">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-4 py-3 text-left"
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
