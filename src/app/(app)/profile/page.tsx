"use client";

import { useState } from "react";
import { useWaypoint } from "../../../lib/waypoint-context";
import { SCIENCE_NOTES } from "../../../lib/waypoint";
import { ScienceNote, usePageTitle } from "../../../components/ui";

export default function ProfilePage() {
  const { state, startOver, toggleScience } = useWaypoint();
  usePageTitle("Profile · Waypoint");

  return (
    <div>
      <h1 className="text-[32px] font-semibold tracking-tight leading-tight mb-8">
        Profile
      </h1>

      {/* Goal + why */}
      <div className="rounded-[16px] border border-border bg-surface p-5 md:p-6 mb-8">
        <p className="text-xs uppercase tracking-[0.08em] text-muted mb-2">
          Your goal
        </p>
        <p className="text-lg font-medium leading-snug mb-4">{state.goal}</p>
        {state.why.trim() && (
          <p className="text-sm text-muted leading-relaxed">
            Why it matters: {state.why.trim()}
          </p>
        )}
      </div>

      {/* Preferences */}
      <div className="rounded-[16px] border border-border bg-surface p-5 md:p-6 mb-8">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-base">Show the science</p>
            <p className="text-sm text-muted mt-1">
              Reveal a short research note on each page.
            </p>
          </div>
          <Switch checked={state.showScience} onClick={toggleScience} />
        </div>
      </div>

      {/* Start over — destructive, behind the disengagement reflection. */}
      <StartOver onStartOver={startOver} showScience={state.showScience} />

      <p className="mt-16 text-xs text-faint">Waypoint · v0.1.0</p>
    </div>
  );
}

function Switch({
  checked,
  onClick,
}: {
  checked: boolean;
  onClick: () => void;
}) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={onClick}
      className={`shrink-0 w-11 h-6 rounded-full p-0.5 transition-colors ${
        checked ? "bg-accent" : "bg-border"
      }`}
    >
      <span
        className={`block w-5 h-5 rounded-full bg-white transition-transform ${
          checked ? "translate-x-5" : "translate-x-0"
        }`}
      />
    </button>
  );
}

// Starting a new goal is framed as a reflective fork: adaptive disengagement
// (goal no longer fits) vs. false-hope quitting (still your goal, just hard).
function StartOver({
  onStartOver,
  showScience,
}: {
  onStartOver: () => void;
  showScience: boolean;
}) {
  const [stage, setStage] = useState<
    "idle" | "reflect" | "adaptive" | "keepgoing"
  >("idle");

  return (
    <div>
      {stage === "idle" && (
        <button
          onClick={() => setStage("reflect")}
          className="text-sm text-muted hover:text-foreground transition-colors"
        >
          Start over with a new goal
        </button>
      )}

      {stage === "reflect" && (
        <div>
          <p className="text-sm text-muted leading-relaxed mb-5">
            Before you switch — where&apos;s this coming from?
          </p>
          <div className="space-y-3">
            <button
              onClick={() => setStage("adaptive")}
              className="w-full text-left px-4 py-3 rounded-[10px] border border-border bg-surface hover:bg-surface-hover text-sm transition-colors"
            >
              This goal isn&apos;t the right one for me anymore
            </button>
            <button
              onClick={() => setStage("keepgoing")}
              className="w-full text-left px-4 py-3 rounded-[10px] border border-border bg-surface hover:bg-surface-hover text-sm transition-colors"
            >
              It&apos;s still my goal — it&apos;s just been hard lately
            </button>
          </div>
          <button
            onClick={() => setStage("idle")}
            className="mt-5 text-sm text-muted hover:text-foreground transition-colors"
          >
            Never mind
          </button>
          <ScienceNote
            show={showScience}
            text={SCIENCE_NOTES.disengage}
            label="Why we ask"
          />
        </div>
      )}

      {stage === "adaptive" && (
        <div>
          <p className="text-sm text-muted leading-relaxed mb-5">
            Letting go of a goal that no longer fits is a deliberate, healthy
            choice — not a failure. What matters is putting that energy into
            something that fits better, and that&apos;s your next step.
          </p>
          <div className="flex items-center gap-6">
            <button
              onClick={onStartOver}
              className="text-sm text-foreground underline underline-offset-2 hover:opacity-70 transition-opacity"
            >
              Choose a new goal
            </button>
            <button
              onClick={() => setStage("idle")}
              className="text-sm text-muted hover:text-foreground transition-colors"
            >
              Keep this one
            </button>
          </div>
        </div>
      )}

      {stage === "keepgoing" && (
        <div>
          <p className="text-sm text-muted leading-relaxed mb-5">
            Then it might not be the goal that needs to change — just the
            approach. A hard stretch is normal; habits take months, and swapping
            goals every time it gets tough is the false-start cycle Waypoint is
            built to avoid. Try the &quot;stuck on this step?&quot; check-in on
            today&apos;s task.
          </p>
          <div className="flex items-center gap-6">
            <button
              onClick={() => setStage("idle")}
              className="text-sm text-foreground underline underline-offset-2 hover:opacity-70 transition-opacity"
            >
              Keep my goal
            </button>
            <button
              onClick={onStartOver}
              className="text-sm text-muted hover:text-foreground transition-colors"
            >
              Replace anyway
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
