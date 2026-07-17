import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";

const SYSTEM_PROMPT = `You are a goal-decomposition engine for a wellness and productivity app. First assess the goal for safety, then decompose.

SAFETY TRIAGE (do this first):
- If the person expresses self-harm, suicidal thoughts, or crisis-level distress, return ONLY: {"concern":"crisis"}
- If the goal is clearly dangerous or self-destructive — extreme food restriction or disordered eating, losing an unsafe amount of weight very fast, harming another person, or seriously reckless or illegal harm — return ONLY: {"concern":"harmful","message":"<one warm, non-judgmental sentence, with no diagnosis, that gently declines and points toward support>"}
- Never decompose a crisis or harmful goal, under any circumstances.

Otherwise return ONLY valid JSON — no prose, no markdown fences.

TWO MODES:

A) FULL ROUTE (default). Return:
{"milestones":[{"title":"…","detail":"…"}],"steps":[{"text":"…","type":"one-off"}]}
- "milestones": an ordered list of concrete checkpoints from now to the goal — this is the user's route. Each has a short title and a one-sentence detail. Space them evenly and PACE THEM BY THE TARGET DATE: a short target (e.g. 1 month) → fewer, tighter milestones; a long target (e.g. 1 year+) → more milestones with more room. Aim for 4–7 milestones.
- "steps": 5–7 small, specific DAILY actions toward the FIRST (nearest) milestone — the first is today, the next is the day after, and so on.

B) NEXT STEPS. When a "NEXT MILESTONE" is given in the message, return ONLY:
{"steps":[{"text":"…","type":"habit"}]}
- 5–7 daily steps toward that specific milestone, building on what's already done. Do NOT include a "milestones" key.

STEP TYPE — label each step honestly:
- "one-off" = a task done once (e.g. "buy a guitar", "book your first lesson").
- "habit" = a repeating action (e.g. "practice for 15 minutes"). Many goals begin with one-off setup steps and then become habitual — recognize that rather than forcing one type.

RULES:
1. Each step is one concrete thing finishable in a single day, sized to the person's daily share of the weekly time budget. Never prescribe more time than they have in a day.
2. Steps must be specific and proximal — real actions in sequence. Never generic filler like "research options" or "write down what success looks like".
3. Approach framing only — something to do, never "don't" or "avoid".
4. Use the person's motivation to keep it meaningful, but don't restate it.
5. For any goal about food, weight, eating, or body image: sustainable, behavior-based actions only — never calorie targets, weigh-in numbers, or restriction.`;

const CRISIS_PATTERNS =
  /\b(kill(ing)? myself|end(ing)? my life|want(ing)? to die|wanna die|hurt(ing)? myself|harm(ing)? myself|self[-\s]?harm|cut(ting)? myself|better off dead|no reason to live)\b/i;

type RawStep = { text: string; type: "one-off" | "habit" };
type RawMilestone = { title: string; detail: string };

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function parseSteps(value: any): RawStep[] | null {
  if (!Array.isArray(value) || value.length === 0) return null;
  const out: RawStep[] = [];
  for (const s of value) {
    if (!s || typeof s.text !== "string" || !s.text.trim()) return null;
    out.push({ text: s.text.trim(), type: s.type === "habit" ? "habit" : "one-off" });
  }
  return out;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function parseMilestones(value: any): RawMilestone[] | null {
  if (!Array.isArray(value) || value.length === 0) return null;
  const out: RawMilestone[] = [];
  for (const m of value) {
    if (!m || typeof m.title !== "string" || !m.title.trim()) return null;
    out.push({
      title: m.title.trim(),
      detail: typeof m.detail === "string" ? m.detail.trim() : "",
    });
  }
  return out;
}

export async function POST(request: Request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const { goal, why, timePerWeek, targetDate, nextMilestone, doneMilestones } =
    body;

  if (!goal || !why || !timePerWeek) {
    return NextResponse.json(
      { error: "All fields are required." },
      { status: 400 }
    );
  }

  if (CRISIS_PATTERNS.test(`${goal} ${why}`)) {
    return NextResponse.json({ concern: "crisis" });
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json(
      { error: "API key not configured. Add ANTHROPIC_API_KEY to .env.local." },
      { status: 500 }
    );
  }

  const continuation = nextMilestone && nextMilestone.title;

  let userContent = `Goal: ${goal}\nWhy it matters: ${why}\nTime budget: ${timePerWeek} per week`;
  if (targetDate) userContent += `\nTarget date: ${targetDate}`;
  if (continuation) {
    userContent +=
      `\n\nNEXT MILESTONE to work toward now: ${nextMilestone.title}` +
      (nextMilestone.detail ? ` — ${nextMilestone.detail}` : "") +
      "." +
      (Array.isArray(doneMilestones) && doneMilestones.length
        ? `\nAlready completed: ${doneMilestones.join("; ")}.`
        : "") +
      `\nReturn ONLY the daily steps toward this milestone (mode B).`;
  }

  try {
    const client = new Anthropic();
    const message = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 2048,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: userContent }],
    });

    const raw =
      message.content[0]?.type === "text" ? message.content[0].text : "";
    let cleaned = raw.trim();
    if (cleaned.startsWith("```")) {
      cleaned = cleaned.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
    }

    const data = JSON.parse(cleaned);

    if (data.concern === "crisis" || data.concern === "harmful") {
      return NextResponse.json({
        concern: data.concern,
        message: typeof data.message === "string" ? data.message : "",
      });
    }

    const steps = parseSteps(data.steps);
    if (!steps) {
      return NextResponse.json(
        { error: "The AI returned an incomplete response. Please try again." },
        { status: 502 }
      );
    }

    if (continuation) {
      return NextResponse.json({ steps });
    }

    const milestones = parseMilestones(data.milestones);
    if (!milestones) {
      return NextResponse.json(
        { error: "The AI returned an incomplete response. Please try again." },
        { status: 502 }
      );
    }

    return NextResponse.json({ milestones, steps });
  } catch (err) {
    if (err instanceof SyntaxError) {
      return NextResponse.json(
        { error: "Failed to understand the AI response. Please try again." },
        { status: 502 }
      );
    }
    if (err instanceof Anthropic.APIError) {
      return NextResponse.json(
        { error: "AI service error. Please try again in a moment." },
        { status: 502 }
      );
    }
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Something went wrong." },
      { status: 500 }
    );
  }
}
