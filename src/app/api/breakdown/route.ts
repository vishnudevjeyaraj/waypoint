import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";

const SYSTEM_PROMPT = `You are a goal-decomposition engine. Given a user's goal and context, break it down into a concrete roadmap with exactly five tiers.

Return ONLY valid JSON in exactly this shape — no prose, no explanation, no markdown code fences:
{"year":"…","quarter":"…","month":"…","week":"…","today":"…"}

Rules:
1. Each tier is a single concrete milestone that ladders up to the goal.
2. "today" is ONE small, specific action the person could actually do today.
3. Steps must be specific and proximal — near-term and concrete. Never use generic filler like "research options" or "write down what success looks like."
4. Size the "today" action to the user's stated weekly time budget. Never prescribe more time than they have.
5. Frame everything as an approach action (something to do), never as "don't" or "avoid."
6. Use the user's motivation to keep steps personally meaningful, but don't restate it in the output.`;

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

  const { goal, why, timePerWeek } = body;

  if (!goal || !why || !timePerWeek) {
    return NextResponse.json(
      { error: "All fields are required." },
      { status: 400 }
    );
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json(
      { error: "API key not configured. Add ANTHROPIC_API_KEY to .env.local." },
      { status: 500 }
    );
  }

  try {
    const client = new Anthropic();

    const message = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: `Goal: ${goal}\nWhy it matters: ${why}\nTime budget: ${timePerWeek} per week`,
        },
      ],
    });

    const raw =
      message.content[0]?.type === "text" ? message.content[0].text : "";

    let cleaned = raw.trim();
    if (cleaned.startsWith("```")) {
      cleaned = cleaned.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
    }

    const breakdown = JSON.parse(cleaned);

    if (
      !breakdown.year ||
      !breakdown.quarter ||
      !breakdown.month ||
      !breakdown.week ||
      !breakdown.today
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
