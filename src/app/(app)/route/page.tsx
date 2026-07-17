"use client";

import { useState } from "react";
import { useWaypoint } from "../../../lib/waypoint-context";
import { Milestone, stepProgress } from "../../../lib/waypoint";
import { usePageTitle } from "../../../components/ui";

export default function RoutePage() {
  const {
    state,
    editStep,
    editMilestone,
    addMilestone,
    removeMilestone,
    reoptimize,
    reoptimizing,
  } = useWaypoint();
  usePageTitle("Route · Waypoint");

  const total = state.steps.length;
  const nearestIdx = Math.min(state.stepsDone, Math.max(0, total - 1));
  const nearest = state.steps[nearestIdx]?.text ?? "";
  const milestones = state.milestones;

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

        {milestones.map((m, i) => (
          <MilestoneWaypoint
            key={m.id}
            milestone={m}
            index={i}
            isLast={false}
            onEdit={editMilestone}
            onRemove={removeMilestone}
          />
        ))}

        {/* Add-a-milestone lives at the end of the trail. */}
        <Waypoint isLast add>
          <AddMilestone onAdd={addMilestone} />
        </Waypoint>
      </div>

      {/* Re-optimize keeps the user's milestone edits and regenerates the daily
          steps to fit them. Neutral styling — the accent stays on the trail. */}
      <div className="mt-10 pt-8 border-t border-border">
        <button
          onClick={reoptimize}
          disabled={reoptimizing}
          className="px-5 py-2.5 rounded-[10px] border border-border bg-surface hover:bg-surface-hover text-sm font-medium transition-colors disabled:opacity-50"
        >
          {reoptimizing ? "Re-optimizing…" : "Re-optimize with AI"}
        </button>
        <p className="text-sm text-muted mt-3 leading-relaxed">
          Regenerates today&apos;s steps to fit any changes you&apos;ve made to
          your route.
        </p>
      </div>
    </div>
  );
}

// One stop on the trail: a dot (accent = nearest step, muted = done, hollow =
// upcoming) with a connecting line down to the next, and content to the right.
function Waypoint({
  children,
  accent = false,
  done = false,
  add = false,
  isLast = false,
}: {
  children: React.ReactNode;
  accent?: boolean;
  done?: boolean;
  add?: boolean;
  isLast?: boolean;
}) {
  const dot = accent
    ? "bg-accent border-accent"
    : done
      ? "bg-muted border-muted"
      : add
        ? "bg-bg border-dashed border-border"
        : "bg-bg border-border";
  return (
    <div className="flex gap-4">
      <div className="flex flex-col items-center pt-1">
        <span className={`w-3 h-3 rounded-full border-2 ${dot}`} />
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

// An editable / removable milestone on the trail.
function MilestoneWaypoint({
  milestone,
  index,
  isLast,
  onEdit,
  onRemove,
}: {
  milestone: Milestone;
  index: number;
  isLast: boolean;
  onEdit: (id: string, updates: { title?: string; detail?: string }) => void;
  onRemove: (id: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(milestone.title);
  const [detail, setDetail] = useState(milestone.detail);

  return (
    <Waypoint done={milestone.done} isLast={isLast}>
      <div className="pt-0.5">
        <p className="text-[11px] uppercase tracking-[0.08em] text-muted mb-1">
          Milestone {index + 1}
        </p>

        {editing ? (
          <div>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              autoFocus
              className="w-full bg-transparent border border-border rounded-[10px] px-3 py-2 text-base outline-none focus:border-accent transition-colors mb-2"
            />
            <textarea
              value={detail}
              onChange={(e) => setDetail(e.target.value)}
              rows={2}
              placeholder="Optional detail…"
              className="w-full bg-transparent border border-border rounded-[10px] px-3 py-2 text-sm leading-relaxed outline-none focus:border-accent transition-colors resize-none placeholder:text-faint"
            />
            <div className="flex items-center gap-5 mt-2">
              <button
                onClick={() => {
                  if (!title.trim()) return;
                  onEdit(milestone.id, {
                    title: title.trim(),
                    detail: detail.trim(),
                  });
                  setEditing(false);
                }}
                disabled={!title.trim()}
                className="text-sm font-medium text-foreground hover:opacity-70 transition-opacity disabled:opacity-35"
              >
                Save
              </button>
              <button
                onClick={() => {
                  setTitle(milestone.title);
                  setDetail(milestone.detail);
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
            <p
              className={`text-base leading-relaxed ${
                milestone.done ? "text-muted line-through" : ""
              }`}
            >
              {milestone.title}
            </p>
            {milestone.detail && (
              <p className="text-sm text-muted mt-1 leading-relaxed">
                {milestone.detail}
              </p>
            )}
            <div className="flex items-center gap-5 mt-2">
              <button
                onClick={() => {
                  setTitle(milestone.title);
                  setDetail(milestone.detail);
                  setEditing(true);
                }}
                className="text-sm text-muted hover:text-foreground transition-colors"
              >
                Edit
              </button>
              <button
                onClick={() => onRemove(milestone.id)}
                className="text-sm text-muted hover:text-foreground transition-colors"
              >
                Remove
              </button>
            </div>
          </>
        )}
      </div>
    </Waypoint>
  );
}

// Appends a new milestone to the end of the route.
function AddMilestone({ onAdd }: { onAdd: (title: string, detail: string) => void }) {
  const [adding, setAdding] = useState(false);
  const [title, setTitle] = useState("");

  if (!adding) {
    return (
      <button
        onClick={() => setAdding(true)}
        className="text-sm text-muted hover:text-foreground transition-colors pt-0.5"
      >
        Add a milestone
      </button>
    );
  }

  return (
    <div className="pt-0.5">
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        autoFocus
        placeholder="New milestone…"
        className="w-full bg-transparent border border-border rounded-[10px] px-3 py-2 text-base outline-none focus:border-accent transition-colors placeholder:text-faint"
        onKeyDown={(e) => {
          if (e.key === "Enter" && title.trim()) {
            onAdd(title, "");
            setTitle("");
            setAdding(false);
          }
        }}
      />
      <div className="flex items-center gap-5 mt-2">
        <button
          onClick={() => {
            if (!title.trim()) return;
            onAdd(title, "");
            setTitle("");
            setAdding(false);
          }}
          disabled={!title.trim()}
          className="text-sm font-medium text-foreground hover:opacity-70 transition-opacity disabled:opacity-35"
        >
          Add
        </button>
        <button
          onClick={() => {
            setTitle("");
            setAdding(false);
          }}
          className="text-sm text-muted hover:text-foreground transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
