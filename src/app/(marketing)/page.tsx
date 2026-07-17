import Link from "next/link";
import type { Metadata } from "next";
import { GoalPathVisual } from "../../components/GoalPathVisual";

export const metadata: Metadata = {
  title: "Waypoint — break any goal into one thing you can do today",
  description:
    "Waypoint turns a big goal into a clear route, then asks for one small step a day. Calm, science-backed, no streaks.",
};

const STEPS = [
  [
    "Name your goal",
    "Anything — vague or concrete. We also ask why it matters and when you'd like to get there.",
  ],
  [
    "Get your route",
    "The AI breaks it into a timeline of milestones and today's one small step. Reshape it freely — it's yours.",
  ],
  [
    "One step a day",
    "Do today's step, notice how it felt, and watch the route fill in behind you. Miss a day? That's fine.",
  ],
];

const SCIENCE = [
  [
    "Near-term steps, not distant dreams",
    "Breaking a goal into the next small step is the one variable that made or broke follow-through in the seminal research.",
  ],
  [
    "No streaks",
    "Perfect-streak tracking makes people quit after a single miss. We track your week, not your perfection — about 80% consistency still builds the habit.",
  ],
  [
    "A plan for when it's hard",
    "Deciding in advance when you'll act, and what you'll do when it gets tough, closes much of the gap between intending and doing.",
  ],
  [
    "Made yours",
    "You can reshape your whole route. A plan that feels like yours is one you actually stick with.",
  ],
];

export default function Landing() {
  return (
    <div>
      {/* Hero */}
      <section className="mx-auto max-w-5xl px-5 md:px-8 pt-16 md:pt-24 pb-16 grid md:grid-cols-2 gap-12 items-center">
        <div>
          <h1 className="text-4xl md:text-5xl font-semibold tracking-tight leading-[1.1] mb-5">
            Break any goal into one thing you can do today.
          </h1>
          <p className="text-lg text-muted leading-relaxed mb-8">
            Waypoint turns a big, vague goal into a clear route — then asks for
            one small step a day. Calm, science-backed, and no streaks to break.
          </p>
          <div className="flex items-center gap-5">
            <Link
              href="/start"
              className="bg-accent text-white px-6 py-3 rounded-[10px] text-base font-medium hover:opacity-90 transition-opacity"
            >
              Get started
            </Link>
            <span className="text-sm text-faint">Log in — coming soon</span>
          </div>
          <p className="text-xs text-faint mt-4">No account needed. Free to use.</p>
        </div>
        <div className="rounded-[16px] border border-border bg-surface p-6">
          <GoalPathVisual />
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-5xl px-5 md:px-8 py-16 border-t border-border">
        <h2 className="text-[11px] uppercase tracking-[0.08em] text-muted mb-8">
          How it works
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          {STEPS.map(([t, d]) => (
            <div key={t}>
              <p className="text-base font-medium mb-2">{t}</p>
              <p className="text-sm text-muted leading-relaxed">{d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Grounded in science */}
      <section className="mx-auto max-w-5xl px-5 md:px-8 py-16 border-t border-border">
        <h2 className="text-2xl font-semibold tracking-tight mb-4">
          Grounded in science, not guilt
        </h2>
        <p className="text-muted leading-relaxed max-w-2xl mb-10">
          Every part of Waypoint traces to peer-reviewed research on how people
          actually change behavior — not to whatever keeps you scrolling.
        </p>
        <div className="grid md:grid-cols-2 gap-x-10 gap-y-7 max-w-3xl">
          {SCIENCE.map(([t, d]) => (
            <div key={t}>
              <p className="text-base font-medium mb-1">{t}</p>
              <p className="text-sm text-muted leading-relaxed">{d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-5xl px-5 md:px-8 py-20 border-t border-border text-center">
        <h2 className="text-3xl font-semibold tracking-tight mb-6">
          Start with one small step.
        </h2>
        <Link
          href="/start"
          className="inline-block bg-accent text-white px-6 py-3 rounded-[10px] text-base font-medium hover:opacity-90 transition-opacity"
        >
          Get started
        </Link>
      </section>
    </div>
  );
}
