"use client";

// Shared presentational primitives used across onboarding and the app pages.

import { useState } from "react";
import { CompletionStatus } from "../lib/waypoint";

// The one accent-colored control: reserved for the primary action on a screen.
export function PrimaryButton({
  onClick,
  disabled,
  children,
}: {
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="bg-accent text-white px-8 py-3 rounded-[10px] text-base font-medium hover:opacity-90 transition-opacity disabled:opacity-35 disabled:cursor-not-allowed"
    >
      {children}
    </button>
  );
}

// A list of selectable option buttons, with an optional "Something else…" that
// reveals a free-text input. Selected chip is the only accent besides the
// primary action.
export function ChoiceButtons({
  options,
  selected,
  onSelect,
  allowCustom = false,
  customPlaceholder,
}: {
  options: readonly string[];
  selected: string;
  onSelect: (v: string) => void;
  allowCustom?: boolean;
  customPlaceholder?: string;
}) {
  const [customMode, setCustomMode] = useState(
    () => allowCustom && selected !== "" && !options.includes(selected)
  );

  const chip = (active: boolean) =>
    `w-full text-left px-4 py-3 rounded-[10px] border transition-colors ${
      active
        ? "border-accent bg-accent-soft text-accent-text"
        : "border-border bg-surface hover:bg-surface-hover"
    }`;

  return (
    <>
      <div className="space-y-3">
        {options.map((opt) => (
          <button
            key={opt}
            onClick={() => {
              setCustomMode(false);
              onSelect(opt);
            }}
            className={chip(!customMode && selected === opt)}
          >
            {opt}
          </button>
        ))}
        {allowCustom && (
          <button
            onClick={() => {
              setCustomMode(true);
              onSelect("");
            }}
            className={chip(customMode)}
          >
            Something else…
          </button>
        )}
      </div>

      {customMode && (
        <input
          type="text"
          value={selected}
          onChange={(e) => onSelect(e.target.value)}
          placeholder={customPlaceholder}
          autoFocus
          className="w-full text-lg bg-transparent border-b-2 border-border pb-2 mt-4 outline-none focus:border-accent transition-colors placeholder:text-text-faint"
        />
      )}
    </>
  );
}

// A short, muted research note set off by a divider. Only shown when "Show the
// science" is on. Kept neutral so it never competes with the accent action.
export function ScienceNote({
  show,
  text,
  label = "Why this step",
}: {
  show: boolean;
  text: string;
  label?: string;
}) {
  if (!show) return null;
  return (
    <div className="mt-10 pt-5 border-t border-border">
      <p className="text-xs uppercase tracking-[0.08em] text-muted mb-2">
        {label}
      </p>
      <p className="text-sm text-muted leading-relaxed">{text}</p>
    </div>
  );
}

// Seven quiet dots (Mon..Sun). Filled = completed, hollow = not. Today gets a
// faint ring. No accent — a progress signal, not the main action.
export function WeekDots({
  status,
  size = "sm",
  labels = false,
}: {
  status: CompletionStatus;
  size?: "sm" | "lg";
  labels?: boolean;
}) {
  const initials = ["M", "T", "W", "T", "F", "S", "S"];
  const dot = size === "lg" ? "w-3.5 h-3.5" : "w-2.5 h-2.5";
  const gap = size === "lg" ? "gap-4" : "gap-3";
  return (
    <div className={`flex ${gap}`}>
      {status.done.map((done, i) => (
        <div key={i} className="flex flex-col items-center gap-1.5">
          <span
            className={`${dot} rounded-full border ${
              done ? "bg-muted border-muted" : "bg-transparent border-border"
            } ${i === status.todayIndex ? "ring-2 ring-border" : ""}`}
          />
          {labels && (
            <span className="text-[10px] text-text-faint">{initials[i]}</span>
          )}
        </div>
      ))}
    </div>
  );
}

// A warm, self-compassionate response to a missed day — never guilt. Covers the
// three evidenced components (self-kindness, common humanity, mindful
// acknowledgement), resurfaces the "why", and surfaces the user's own backup
// plan when it's useful.
export function MissMessage({
  why,
  fallback,
}: {
  why: string;
  fallback: string;
}) {
  return (
    <div className="mt-5 space-y-2">
      <p className="text-sm text-muted leading-relaxed">
        Missing a day is part of how this actually works — not a setback.
        Everyone slips; picking it back up is the whole skill.
      </p>
      {why.trim() && (
        <p className="text-sm text-muted leading-relaxed">
          Remember why you started: {why.trim()}
        </p>
      )}
      {fallback.trim() && (
        <p className="text-sm text-muted leading-relaxed">
          Your plan for a day like this: {fallback.trim()}
        </p>
      )}
    </div>
  );
}
