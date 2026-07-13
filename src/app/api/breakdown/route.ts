import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";

const SYSTEM_PROMPT = `You are a goal-decomposition engine for a wellness and productivity app. First assess the goal for safety, then — only if it is fine — decompose it.

SAFETY TRIAGE (do this first):
- If the person expresses self-harm, suicidal thoughts, or crisis-level distress, return ONLY: {"concern":"crisis"}
- If the goal is clearly dangerous or self-destructive — extreme food restriction or disordered eating, losing an unsafe amount of weight very fast, harming another person, or seriously reckless or illegal harm — return ONLY: {"concern":"harmful","message":"<one warm, non-judgmental sentence, with no diagnosis, that gently declines and points toward support>"}
- Never decompose a crisis or harmful goal into steps, under any circumstances.

If the goal is fine, return ONLY valid JSON in exactly this shape — no prose, no explanation, no markdown code fences:
{"year":"…","quarter":"…","month":"…","week":"…","steps":["…","…","…","…","…"]}

Rules:
1. year, quarter, month, and week are each a single concrete milestone that ladders up to the goal.
2. "steps" is an ordered list of 5 to 7 small, specific daily actions that ladder toward the "week" milestone — the first step is what they would do today, the next the day after, and so on.
3. Each step is one concrete thing the person could finish in a single day, sized to their daily share of the weekly time budget. Never prescribe more time than they have in one day.
4. Steps must be specific and proximal — real actions in sequence. Never use generic filler like "research options" or "write down what success looks like."
5. Frame everything as an approach action (something to do), never as "don't" or "avoid."
6. Use the user's motivation to keep steps personally meaningful, but don't restate it in the output.
7. For any goal about food, weight, eating, or body image, keep steps to sustainable, behavior-based actions only. Never include calorie targets, weigh-in numbers, or restriction — favor habits like cooking, balanced meals, and movement the person enjoys.
8. If told the person has already completed a week of steps, generate the NEXT week's milestone and its daily steps that build on that progress, toward the same month goal.`;

// Deterministic backstop for the clearest self-harm disclosures, so a crisis is
// caught even before the model is called. Kept high-precision on purpose;
// subtler cases are left to the model's triage above.
const CRISIS_PATTERNS =
  /\b(kill(ing)? myself|end(ing)? my life|want(ing)? to die|wanna die|hurt(ing)? myself|harm(ing)? myself|self[-\s]?harm|cut(ting)? myself|better off dead|no reason to live)\b/i;

export async function POST(request: Request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid request." },
      { status: 400 }
    );
  }

  const { goal, why, timePerWeek, previousWeek, completedSteps, monthGoal } =
    body;

  if (!goal || !why || !timePerWeek) {
    return NextResponse.json(
      { error: "All fields are required." },
      { status: 400 }
    );
  }

  // Crisis backstop: surface resources immediately, without decomposing and
  // without depending on the model (or even the API key).
  if (CRISIS_PATTERNS.test(`${goal} ${why}`)) {
    return NextResponse.json({ concern: "crisis" });
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json(
      { error: "API key not configured. Add ANTHROPIC_API_KEY to .env.local." },
      { status: 500 }
    );
  }

  let userContent = `Goal: ${goal}\nWhy it matters: ${why}\nTime budget: ${timePerWeek} per week`;
  if (previousWeek) {
    userContent +=
      `\n\nThey have already completed this week's milestone: ${previousWeek}.` +
      (Array.isArray(completedSteps) && completedSteps.length
        ? `\nSteps they finished: ${completedSteps.join("; ")}.`
        : "") +
      (monthGoal ? `\nKeep laddering toward this month's goal: ${monthGoal}.` : "") +
      `\nGenerate the NEXT week's milestone and its daily steps.`;
  }

  try {
    const client = new Anthropic();

    const message = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 1536,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: userContent }],
    });

    const raw =
      message.content[0]?.type === "text" ? message.content[0].text : "";

    let cleaned = raw.trim();
    if (cleaned.startsWith("```")) {
      cleaned = cleaned.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
    }

    const breakdown = JSON.parse(cleaned);

    // The model may decline instead of decomposing.
    if (breakdown.concern === "crisis" || breakdown.concern === "harmful") {
      return NextResponse.json({
        concern: breakdown.concern,
        message:
          typeof breakdown.message === "string" ? breakdown.message : "",
      });
    }

    if (
      !breakdown.year ||
      !breakdown.quarter ||
      !breakdown.month ||
      !breakdown.week ||
      !Array.isArray(breakdown.steps) ||
      breakdown.steps.length === 0 ||
      !breakdown.steps.every(
        (s: unknown) => typeof s === "string" && s.trim().length > 0
      )
    ) {
      return NextResponse.json(
        { error: "The AI returned an incomplete response. Please try again." },
        { status: 502 }
      );
    }

    return NextResponse.json(breakdown);
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
      {
        error:
          err instanceof Error ? err.message : "Something went wrong.",
      },
      { status: 500 }
    );
  }
}
