"use client";

// The app "brain". All of Waypoint's state and the handlers that mutate it live
// here, in one provider, so every route (/today, /route, /progress, /profile)
// and onboarding read and write the same localStorage-backed state.

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  Breakdown,
  Feeling,
  INITIAL_STATE,
  Plan,
  Safety,
  WaypointState,
  clearState,
  loadState,
  saveState,
  todayKey,
} from "./waypoint";

interface WaypointContextValue {
  state: WaypointState;
  loaded: boolean;
  loading: boolean;
  error: string | null;
  safety: Safety | null;
  // onboarding
  input: string;
  setInput: (v: string) => void;
  advance: () => void;
  goBack: () => void;
  changeGoal: () => void;
  fetchBreakdown: (data: {
    goal: string;
    why: string;
    timePerWeek: string;
  }) => void;
  finishPlan: (plan: Plan) => void;
  // AI-suggested "why" reasons, tailored to the goal
  whyExamples: string[];
  whyLoading: boolean;
  fetchWhyExamples: (goal: string) => void;
  // app
  planNext: () => void;
  toggleToday: () => void;
  logFeeling: (feeling: Feeling) => void;
  editStep: (index: number, text: string) => void;
  startOver: () => void;
  toggleScience: () => void;
}

const WaypointContext = createContext<WaypointContextValue | null>(null);

export function WaypointProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<WaypointState>(INITIAL_STATE);
  const [input, setInput] = useState("");
  const [loaded, setLoaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [safety, setSafety] = useState<Safety | null>(null);
  const [whyExamples, setWhyExamples] = useState<string[]>([]);
  const [whyLoading, setWhyLoading] = useState(false);

  // Generate first-person "why" suggestions tailored to the goal. Prefetched
  // when leaving the goal step, and re-callable via the refresh button.
  async function fetchWhyExamples(goal: string) {
    if (!goal.trim()) return;
    setWhyLoading(true);
    try {
      const res = await fetch("/api/why-examples", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ goal }),
      });
      const data = await res.json().catch(() => null);
      setWhyExamples(res.ok && Array.isArray(data?.examples) ? data.examples : []);
    } catch {
      setWhyExamples([]); // non-fatal: the why step is a plain text box
    } finally {
      setWhyLoading(false);
    }
  }

  async function requestBreakdown(
    payload: Record<string, unknown>,
    isContinuation: boolean
  ) {
    setLoading(true);
    setError(null);
    setSafety(null);
    try {
      const res = await fetch("/api/breakdown", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error || "Something went wrong. Please try again.");
      }
      const data = await res.json();
      if (data.concern === "crisis" || data.concern === "harmful") {
        setSafety({
          concern: data.concern,
          message: typeof data.message === "string" ? data.message : "",
        });
        return;
      }
      setState((prev) => {
        const keep = isContinuation ? prev.breakdown : null;
        const breakdown: Breakdown = {
          year: keep ? keep.year : data.year,
          quarter: keep ? keep.quarter : data.quarter,
          month: keep ? keep.month : data.month,
          week: data.week,
        };
        return { ...prev, breakdown, steps: data.steps, stepsDone: 0 };
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  function fetchBreakdown(data: {
    goal: string;
    why: string;
    timePerWeek: string;
  }) {
    requestBreakdown(data, false);
  }

  function planNext() {
    requestBreakdown(
      {
        goal: state.goal,
        why: state.why,
        timePerWeek: state.timePerWeek,
        previousWeek: state.breakdown?.week,
        completedSteps: state.steps,
        monthGoal: state.breakdown?.month,
      },
      true
    );
  }

  // Load once on mount.
  useEffect(() => {
    const saved = loadState();
    setState(saved);
    if (saved.phase === "setup") {
      const fields: Record<number, string> = {
        2: saved.goal,
        3: saved.why,
        4: saved.timePerWeek,
      };
      setInput(fields[saved.step] ?? "");
      if (saved.step === 5 && !saved.breakdown) {
        fetchBreakdown({
          goal: saved.goal,
          why: saved.why,
          timePerWeek: saved.timePerWeek,
        });
      }
    }
    setLoaded(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Persist on every change (after initial load).
  useEffect(() => {
    if (loaded) saveState(state);
  }, [state, loaded]);

  function advance() {
    const value = input.trim();
    setState((prev) => {
      const next = { ...prev, step: prev.step + 1 };
      if (prev.step === 2) next.goal = value;
      if (prev.step === 3) next.why = value;
      if (prev.step === 4) next.timePerWeek = value;
      return next;
    });
    // Leaving the goal step: prefetch tailored "why" suggestions.
    if (state.step === 2) {
      fetchWhyExamples(value);
    }
    if (state.step === 4) {
      fetchBreakdown({ goal: state.goal, why: state.why, timePerWeek: value });
    }
    setInput("");
  }

  function goBack() {
    const target = state.step - 1;
    const fields: Record<number, string> = {
      2: state.goal,
      3: state.why,
      4: state.timePerWeek,
    };
    setInput(fields[target] ?? "");
    setState((prev) => ({ ...prev, step: target }));
  }

  // Return to the goal step from a declined (safety) result.
  function changeGoal() {
    setSafety(null);
    setInput(state.goal);
    setState((p) => ({ ...p, step: 2, breakdown: null, steps: [] }));
  }

  function finishPlan(plan: Plan) {
    setState((prev) => ({ ...prev, plan, phase: "app" }));
  }

  function toggleToday() {
    setState((prev) => {
      const key = todayKey();
      const has = prev.completedDates.includes(key);
      if (has) {
        const feelings = { ...prev.feelings };
        delete feelings[key];
        return {
          ...prev,
          completedDates: prev.completedDates.filter((d) => d !== key),
          stepsDone: Math.max(0, prev.stepsDone - 1),
          feelings,
        };
      }
      return {
        ...prev,
        completedDates: [...prev.completedDates, key],
        stepsDone: prev.stepsDone + 1,
      };
    });
  }

  function logFeeling(feeling: Feeling) {
    setState((prev) => ({
      ...prev,
      feelings: { ...prev.feelings, [todayKey()]: feeling },
    }));
  }

  // Edit a step in the current ladder (human-in-the-loop).
  function editStep(index: number, text: string) {
    setState((prev) => {
      if (index < 0 || index >= prev.steps.length || !text.trim()) return prev;
      const steps = [...prev.steps];
      steps[index] = text.trim();
      return { ...prev, steps };
    });
  }

  function startOver() {
    setState((prev) => ({ ...INITIAL_STATE, showScience: prev.showScience }));
    setInput("");
    setError(null);
    setSafety(null);
    clearState();
  }

  function toggleScience() {
    setState((prev) => ({ ...prev, showScience: !prev.showScience }));
  }

  const value: WaypointContextValue = {
    state,
    loaded,
    loading,
    error,
    safety,
    input,
    setInput,
    advance,
    goBack,
    changeGoal,
    fetchBreakdown,
    finishPlan,
    whyExamples,
    whyLoading,
    fetchWhyExamples,
    planNext,
    toggleToday,
    logFeeling,
    editStep,
    startOver,
    toggleScience,
  };

  return (
    <WaypointContext.Provider value={value}>
      {children}
    </WaypointContext.Provider>
  );
}

export function useWaypoint(): WaypointContextValue {
  const ctx = useContext(WaypointContext);
  if (!ctx) throw new Error("useWaypoint must be used within WaypointProvider");
  return ctx;
}

// Convenience: is onboarding complete (a real goal exists)?
export function hasGoal(state: WaypointState): boolean {
  return state.phase === "app" && state.breakdown !== null;
}
