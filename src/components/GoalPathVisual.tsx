"use client";

// A calm, lightly interactive "route" for the landing hero: the trail draws in,
// waypoints pop in sequence, the goal gently pulses, and each waypoint scales on
// hover. Self-contained (no API) — SDT competence: a visible sense of progress.

const POINTS = [
  { x: 40, y: 150, label: "Today" },
  { x: 130, y: 105 },
  { x: 210, y: 135 },
  { x: 300, y: 70 },
  { x: 380, y: 45, label: "Your goal" },
];

export function GoalPathVisual() {
  const d = POINTS.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");

  return (
    <svg
      viewBox="0 0 420 190"
      className="w-full h-auto"
      role="img"
      aria-label="A route from today to your goal, marked by waypoints"
    >
      {/* the trail */}
      <path
        d={d}
        fill="none"
        stroke="var(--border)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray="620"
        strokeDashoffset="620"
        style={{ animation: "draw-path 1.6s ease-out 0.2s forwards" }}
      />

      {POINTS.map((p, i) => {
        const isGoal = i === POINTS.length - 1;
        return (
          <g key={i} className="wp">
            <circle
              cx={p.x}
              cy={p.y}
              r={isGoal ? 8 : 5.5}
              fill={isGoal ? "var(--accent)" : "var(--surface)"}
              stroke={isGoal ? "var(--accent)" : "var(--text-muted)"}
              strokeWidth="2"
              style={{
                transformBox: "fill-box",
                transformOrigin: "center",
                opacity: 0,
                animation: `wp-pop 0.4s ease-out ${0.5 + i * 0.28}s forwards${
                  isGoal ? ", wp-pulse 2.4s ease-in-out 2.2s infinite" : ""
                }`,
                transition: "transform 0.2s ease-out",
              }}
            />
            {p.label && (
              <text
                x={p.x}
                y={p.y - 16}
                textAnchor="middle"
                fill="var(--text-muted)"
                fontSize="11"
                style={{
                  opacity: 0,
                  animation: `wp-pop 0.4s ease-out ${0.7 + i * 0.28}s forwards`,
                }}
              >
                {p.label}
              </text>
            )}
          </g>
        );
      })}

      <style>{`.wp:hover circle { transform: scale(1.35); }`}</style>
    </svg>
  );
}
