import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";

const SYSTEM_PROMPT = `Given a personal goal, suggest 3 or 4 short, first-person reasons someone might pursue it — the deeper "why" underneath. Each reason is one short phrase, written as the person would say it, e.g. "To feel at home when I travel" or "So I can keep up with my kids". Vary them across practical, emotional, and identity-based motivations.

Return ONLY valid JSON — no prose, no markdown fences:
{"examples":["…","…","…"]}

If the goal involves self-harm, crisis, or is clearly dangerous or harmful, return {"examples":[]} and nothing else.`;

export async function POST(request: Request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const { goal } = body;
  if (!goal) {
    return NextResponse.json({ error: "Goal is required." }, { status: 400 });
  }
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ examples: [] });
  }

  try {
    const client = new Anthropic();
    const message = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 400,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: `Goal: ${goal}` }],
    });

    const raw =
      message.content[0]?.type === "text" ? message.content[0].text : "";
    let cleaned = raw.trim();
    if (cleaned.startsWith("```")) {
      cleaned = cleaned.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
    }

    const data = JSON.parse(cleaned);
    const examples = Array.isArray(data.examples)
      ? data.examples
          .filter((e: unknown) => typeof e === "string" && e.trim().length > 0)
          .slice(0, 4)
      : [];

    return NextResponse.json({ examples });
  } catch {
    // Non-fatal: the why step still works as a plain text box without chips.
    return NextResponse.json({ error: "Couldn't load examples." }, { status: 502 });
  }
}
