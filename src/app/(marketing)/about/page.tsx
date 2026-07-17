import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About · Waypoint",
  description:
    "Why Waypoint exists: a calm, science-grounded way to turn goals into daily action — without streaks or guilt.",
};

export default function About() {
  return (
    <div className="mx-auto max-w-2xl px-5 md:px-8 py-16 md:py-20">
      <h1 className="text-[32px] font-semibold tracking-tight leading-tight mb-8">
        About Waypoint
      </h1>

      <div className="space-y-6 text-[17px] leading-relaxed text-muted">
        <p>
          Most goal apps fail in the same two ways: they either overwhelm you
          with everything at once, or they hook you with streaks and badges that
          feel great until the day you slip — and then you quit. Waypoint is
          built to avoid both.
        </p>
        <p>
          The idea is simple. You bring a goal — however big or vague. Waypoint
          breaks it into a <span className="text-foreground">route</span> of
          milestones and asks for just{" "}
          <span className="text-foreground">one small step today</span>. You do
          it, notice how it felt, and the route fills in behind you. That&apos;s
          the whole loop.
        </p>

        <h2 className="text-xl font-semibold tracking-tight text-foreground pt-4">
          Grounded completely in science
        </h2>
        <p>
          Almost every choice in Waypoint traces to peer-reviewed research on how
          people actually change behavior: near-term sub-goals build the belief
          you can follow through; implementation intentions turn plans into
          action; and self-compassion after a slip motivates better than
          guilt. We don&apos;t add mechanics because they &quot;feel
          right&quot; — we add them because the evidence says they work.
        </p>

        <h2 className="text-xl font-semibold tracking-tight text-foreground pt-4">
          No streaks, on purpose
        </h2>
        <p>
          Breaking a perfect streak makes people more likely to quit entirely,
          and missing a single day doesn&apos;t actually set your habit back —
          roughly 80% consistency still builds it. So we track your week, not
          your perfection, and we meet a missed day with encouragement, not a
          broken chain.
        </p>

        <h2 className="text-xl font-semibold tracking-tight text-foreground pt-4">
          What Waypoint is — and isn&apos;t
        </h2>
        <p>
          Waypoint is a general wellness and productivity tool. It uses
          evidence-based techniques for building discipline and following
          through on goals. It is{" "}
          <span className="text-foreground">
            not medical or mental-health treatment
          </span>
          , and it isn&apos;t a substitute for professional care. If a goal
          touches on something that needs real support, Waypoint will point you
          toward it rather than pretend to solve it.
        </p>
      </div>

      <div className="mt-12">
        <Link
          href="/start"
          className="inline-block bg-accent text-white px-6 py-3 rounded-[10px] text-base font-medium hover:opacity-90 transition-opacity"
        >
          Get started
        </Link>
      </div>
    </div>
  );
}
