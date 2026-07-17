import { sql } from "@vercel/postgres";
import { NextResponse } from "next/server";

// Stores website feedback in a small isolated Postgres table. This is the one
// server-side store in the app (separate from any future accounts system).
// Until a Postgres database is provisioned on Vercel (which sets POSTGRES_URL),
// this returns a clear "not set up yet" so the form fails gracefully.
export async function POST(request: Request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const { message, name, email } = body;
  if (!message || typeof message !== "string" || !message.trim()) {
    return NextResponse.json(
      { error: "A message is required." },
      { status: 400 }
    );
  }

  if (!process.env.POSTGRES_URL) {
    return NextResponse.json(
      { error: "Feedback isn't wired up to storage yet — check back soon." },
      { status: 503 }
    );
  }

  try {
    await sql`
      CREATE TABLE IF NOT EXISTS feedback (
        id SERIAL PRIMARY KEY,
        message TEXT NOT NULL,
        name TEXT,
        email TEXT,
        created_at TIMESTAMPTZ DEFAULT now()
      )
    `;
    await sql`
      INSERT INTO feedback (message, name, email)
      VALUES (
        ${message.trim().slice(0, 4000)},
        ${typeof name === "string" && name.trim() ? name.trim().slice(0, 200) : null},
        ${typeof email === "string" && email.trim() ? email.trim().slice(0, 200) : null}
      )
    `;
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "Couldn't save your feedback right now. Please try again." },
      { status: 502 }
    );
  }
}
