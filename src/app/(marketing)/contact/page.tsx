"use client";

import { useState } from "react";

type Status = "idle" | "sending" | "sent" | "error";

export default function Contact() {
  const [message, setMessage] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function submit() {
    if (!message.trim()) return;
    setStatus("sending");
    setErrorMsg("");
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, name, email }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error || "Something went wrong.");
      }
      setStatus("sent");
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong.");
      setStatus("error");
    }
  }

  return (
    <div className="mx-auto max-w-xl px-5 md:px-8 py-16 md:py-20">
      <h1 className="text-[32px] font-semibold tracking-tight leading-tight mb-3">
        Send feedback
      </h1>
      <p className="text-muted leading-relaxed mb-10">
        Waypoint is a work in progress. If something felt off, confusing, or
        great — I&apos;d genuinely like to hear it.
      </p>

      {status === "sent" ? (
        <div className="rounded-[16px] border border-border bg-surface p-6">
          <p className="text-lg font-medium mb-1">Thank you.</p>
          <p className="text-sm text-muted leading-relaxed">
            Your feedback came through. It really does help shape what gets built
            next.
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          <div>
            <label className="block text-sm text-muted mb-2">
              Your feedback
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={5}
              placeholder="What worked, what didn't, what you'd want..."
              className="w-full bg-transparent border border-border rounded-[10px] p-3 text-base leading-relaxed outline-none focus:border-accent transition-colors resize-none placeholder:text-faint"
            />
          </div>
          <div className="grid sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm text-muted mb-2">
                Name (optional)
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-transparent border border-border rounded-[10px] px-3 py-2.5 text-base outline-none focus:border-accent transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm text-muted mb-2">
                Email (optional)
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="If you'd like a reply"
                className="w-full bg-transparent border border-border rounded-[10px] px-3 py-2.5 text-base outline-none focus:border-accent transition-colors placeholder:text-faint"
              />
            </div>
          </div>

          {status === "error" && (
            <p className="text-sm text-muted">{errorMsg}</p>
          )}

          <button
            onClick={submit}
            disabled={!message.trim() || status === "sending"}
            className="bg-accent text-white px-6 py-3 rounded-[10px] text-base font-medium hover:opacity-90 transition-opacity disabled:opacity-35 disabled:cursor-not-allowed"
          >
            {status === "sending" ? "Sending…" : "Send feedback"}
          </button>
        </div>
      )}
    </div>
  );
}
