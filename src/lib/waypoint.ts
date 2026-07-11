// Data layer for Waypoint.
//
// This file holds everything that ISN'T React: the shape of the saved state,
// the fixed option lists and copy, the localStorage read/write helpers, and the
// date math for weekly completion tracking. Keeping it here means page.tsx is
// only concerned with what's on screen.

// --- Types ---

export interface Breakdown {
  year: string;
  quarter: string;
  month: string;
  week: string;
  today: string;
}

// The user's if-then plan (the "signature interaction").
// "When [cue], I will [today's task]. If [obstacle], I'll [fallback]."
export interface Plan {
  cue: string;
  obstacle: string;
  fallback: string;
}

// "setup" = the first-run flow; "app" = the returning daily loop / home.
export type Phase = "setup" | "app";

export interface WaypointState {
  step: number; // which setup step (1-6) the user is on
  goal: string;
  why: string;
  timePerWeek: string;
  breakdown: Breakdown | null;
  plan: Plan;
  phase: Phase;
  showScience: boolean;
  completedDates: string[]; // days marked done, as "YYYY-MM-DD" keys
}

// --- Constants ---

// Bumped from "waypoint" so the reshaped state doesn't collide with older saves.
export const STORAGE_KEY = "waypoint-v2";
export const TOTAL_SETUP_STEPS = 6;

export const INITIAL_STATE: WaypointState = {
  step: 1,
  goal: "",
  why: "",
  timePerWeek: "",
  breakdown: null,
  plan: { cue: "", obstacle: "", fallback: "" },
  phase: "setup",
  showScience: false,
  completedDates: [],
};

export const HOURS_OPTIONS = ["~1 hour", "~3 hours", "~5 hours", "10+ hours"];

// Cue options are existing daily anchors — this is "habit stacking", attaching
// the new action to something already in the user's day.
export const CUE_OPTIONS = [
  "After morning coffee",
  "After work",
  "After dinner",
  "Before bed",
];

// The five horizon views, in order. "today" is always the emphasized default.
export const HORIZONS = [
  { key: "today", label: "Today" },
  { key: "week", label: "Week" },
  { key: "month", label: "Month" },
  { key: "quarter", label: "Quarter" },
  { key: "year", label: "Year" },
] as const;

export type HorizonKey = (typeof HORIZONS)[number]["key"];

// Short research notes revealed by the "Show the science" toggle.
export const SCIENCE_NOTES = {
  goal: "We accept any goal, however vague. The breakdown is what turns it concrete — that specificity is one of the most reliable predictors of follow-through in goal-setting research.",
  why: "Connecting a goal to a personal value keeps you acting even on days you don't feel motivated, rather than waiting to feel ready. We bring this back when your motivation dips.",
  hours: "This sizes every task to the time you actually have. Most goal-setting failure comes from over-ambition — steps that don't fit real life.",
  plan: "Deciding in advance exactly when you'll act — and what you'll do if something gets in the way — is one of the most effective ways to close the gap between intending and doing. It lets a cue trigger the action, instead of relying on willpower in the moment.",
  horizons:
    "Your full route is here whenever you want it, but only today's step is asked of you. Goal-setting research finds that near-term subgoals — not distant ones — are what actually build momentum and the belief that you can follow through.",
  // Exact copy requested for the weekly-tracking area.
  weekly:
    "There's no streak here on purpose. Research shows that breaking a perfect streak makes people more likely to quit entirely — and missing a single day doesn't actually set your habit back; about 80% consistency still builds it. So we track your week, not your perfection.",
};

// --- Date + week helpers (local time, keyed as "YYYY-MM-DD") ---

export function dateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function todayKey(): string {
  return dateKey(new Date());
}

function addDays(d: Date, n: number): Date {
  const copy = new Date(d);
  copy.setDate(copy.getDate() + n);
  return copy;
}

// Monday is treated as the first day of the week.
function startOfWeek(d: Date): Date {
  const day = d.getDay(); // 0 = Sunday ... 6 = Saturday
  const daysSinceMonday = (day + 6) % 7;
  return addDays(d, -daysSinceMonday);
}

// The 7 day-keys (Mon..Sun) for the week containing today.
export function weekKeys(now: Date = new Date()): string[] {
  const monday = startOfWeek(now);
  return Array.from({ length: 7 }, (_, i) => dateKey(addDays(monday, i)));
}

export interface CompletionStatus {
  doneToday: boolean;
  weekCount: number; // 0-7
  keys: string[]; // the 7 day-keys of this week (Mon..Sun)
  done: boolean[]; // which of those 7 days are completed
  todayIndex: number; // 0-6 position of today within this week
  nudge: boolean; // gentle "never miss twice" prompt
}

// Derives everything the home screen needs from the raw completed-dates list.
// Note the deliberate rule: a single missed day is a non-event. We only raise a
// gentle nudge when the user is about to miss a SECOND day in a row.
export function completionStatus(completedDates: string[]): CompletionStatus {
  const set = new Set(completedDates);
  const keys = weekKeys();
  const done = keys.map((k) => set.has(k));
  const weekCount = done.filter(Boolean).length;

  const now = new Date();
  const today = todayKey();
  const yesterday = dateKey(addDays(now, -1));

  const doneToday = set.has(today);
  const doneYesterday = set.has(yesterday);
  const hasHistory = completedDates.length > 0;

  // "Never miss twice": nudge only if there's prior history, yesterday was
  // missed, and today isn't done yet. One isolated miss never triggers this.
  const nudge = hasHistory && !doneYesterday && !doneToday;

  return {
    doneToday,
    weekCount,
    keys,
    done,
    todayIndex: keys.indexOf(today),
    nudge,
  };
}

// --- localStorage ---

export function loadState(): WaypointState {
  if (typeof window === "undefined") return INITIAL_STATE;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return INITIAL_STATE;
    const saved = JSON.parse(raw) as Partial<WaypointState>;
    // Merge over defaults so any newly-added field gets a sane value.
    return {
      ...INITIAL_STATE,
      ...saved,
      plan: { ...INITIAL_STATE.plan, ...(saved.plan ?? {}) },
      completedDates: saved.completedDates ?? [],
    };
  } catch {
    return INITIAL_STATE;
  }
}

export function saveState(state: WaypointState): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Ignore quota or serialization errors.
  }
}

export function clearState(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(STORAGE_KEY);
}

// Lowercases the first letter so a cue reads naturally mid-sentence
// ("After dinner" -> "when after dinner, I will...").
export function deCap(s: string): string {
  return s ? s.charAt(0).toLowerCase() + s.slice(1) : s;
}
