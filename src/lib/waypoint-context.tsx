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
  Feeling,
  INITIAL_STATE,
  Plan,
  Safety,
  WaypointState,
  buildMilestones,
  clearState,
  loadState,
  makeId,
  nearestMilestoneIndex,
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
    targetDate: string;
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
  // editable route (Route timeline)
  editMilestone: (id: string, updates: { title?: string; detail?: string }) => void;
  addMilestone: (title: string, detail: string) => void;
  removeMilestone: (id: string) => void;
  reoptimize: () => void;
  reoptimizing: boolean;
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
  const [reoptimizing, setReoptimizing] = useState(false);

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
        if (isContinuation) {
          // Steps toward the next milestone; milestones already updated.
          return { ...prev, steps: data.steps, stepsDone: 0 };
        }
        return {
          ...prev,
          milestones: buildMilestones(data.milestones),
          steps: data.steps,
          stepsDone: 0,
        };
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
    targetDate: string;
  }) {
    requestBreakdown(data, false);
  }

  // Finished the steps toward the nearest milestone: mark it done, then fetch
  // daily steps toward the next one (or finish, if it was the last).
  function planNext() {
    const idx = nearestMilestoneIndex(state.milestones);
    const next = state.milestones[idx + 1];
    const done = state.milestones.slice(0, idx + 1).map((m) => m.title);

    setState((prev) => ({
      ...prev,
      milestones: prev.milestones.map((m, i) =>
        i === idx ? { ...m, done: true } : m
      ),
    }));

    if (next) {
      requestBreakdown(
        {
          goal: state.goal,
          why: state.why,
          timePerWeek: state.timePerWeek,
          targetDate: state.targetDate,
          nextMilestone: { title: next.title, detail: next.detail },
          doneMilestones: done,
        },
        true
      );
    }
  }

  // Load once on mount.
  useEffect(() => {
    const saved = loadState();
    setState(saved);
    if (saved.phase === "setup") {
      const fields: Record<number, string> = {
        2: saved.goal,
        3: saved.targetDate,
        4: saved.why,
        5: saved.timePerWeek,
      };
      setInput(fields[saved.step] ?? "");
      if (saved.step === 6 && saved.milestones.length === 0) {
        fetchBreakdown({
          goal: saved.goal,
          why: saved.why,
          timePerWeek: saved.timePerWeek,
          targetDate: saved.targetDate,
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
      if (prev.step === 3) next.targetDate = value;
      if (prev.step === 4) next.why = value;
      if (prev.step === 5) next.timePerWeek = value;
      return next;
    });
    // Leaving the goal step: prefetch tailored "why" suggestions.
    if (state.step === 2) {
      fetchWhyExamples(value);
    }
    // Leaving the hours step: we now have everything to build the route.
    if (state.step === 5) {
      fetchBreakdown({
        goal: state.goal,
        why: state.why,
        timePerWeek: value,
        targetDate: state.targetDate,
      });
    }
    setInput("");
  }

  function goBack() {
    const target = state.step - 1;
    const fields: Record<number, string> = {
      2: state.goal,
      3: state.targetDate,
      4: state.why,
      5: state.timePerWeek,
    };
    setInput(fields[target] ?? "");
    setState((prev) => ({ ...prev, step: target }));
  }

  // Return to the goal step from a declined (safety) result.
  function changeGoal() {
    setSafety(null);
    setInput(state.goal);
    setState((p) => ({ ...p, step: 2, milestones: [], steps: [] }));
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
      const steps = prev.steps.map((s, i) =>
        i === index ? { ...s, text: text.trim() } : s
      );
      return { ...prev, steps };
    });
  }

  function editMilestone(
    id: string,
    updates: { title?: string; detail?: string }
  ) {
    setState((prev) => ({
      ...prev,
      milestones: prev.milestones.map((m) =>
        m.id === id ? { ...m, ...updates } : m
      ),
    }));
  }

  function addMilestone(title: string, detail: string) {
    if (!title.trim()) return;
    setState((prev) => ({
      ...prev,
      milestones: [
        ...prev.milestones,
        { id: makeId(), title: title.trim(), detail: detail.trim(), done: false },
      ],
    }));
  }

  function removeMilestone(id: string) {
    setState((prev) => ({
      ...prev,
      milestones: prev.milestones.filter((m) => m.id !== id),
    }));
  }

  // Regenerate the daily steps to fit the user's edited route (toward the
  // nearest milestone). Their milestone edits are kept; only the steps refresh.
  async function reoptimize() {
    const idx = nearestMilestoneIndex(state.milestones);
    const next = state.milestones[idx];
    if (!next) return;
    const done = state.milestones.slice(0, idx).map((m) => m.title);
    setReoptimizing(true);
    try {
      const res = await fetch("/api/breakdown", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          goal: state.goal,
          why: state.why,
          timePerWeek: state.timePerWeek,
          targetDate: state.targetDate,
          nextMilestone: { title: next.title, detail: next.detail },
          doneMilestones: done,
        }),
      });
      const data = await res.json().catch(() => null);
      if (res.ok && Array.isArray(data?.steps)) {
        setState((prev) => ({ ...prev, steps: data.steps, stepsDone: 0 }));
      }
    } catch {
      // Non-fatal: keep the existing steps.
    } finally {
      setReoptimizing(false);
    }
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
    editMilestone,
    addMilestone,
    removeMilestone,
    reoptimize,
    reoptimizing,
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
  return state.phase === "app" && state.milestones.length > 0;
}
