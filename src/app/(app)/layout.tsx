"use client";

// The app shell: persistent nav + a guard that bounces you back to onboarding
// if no goal exists yet. Wraps /today, /route, /progress, /profile.

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { hasGoal, useWaypoint } from "../../lib/waypoint-context";
import { Nav } from "../../components/Nav";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { state, loaded } = useWaypoint();

  useEffect(() => {
    if (loaded && !hasGoal(state)) router.replace("/");
  }, [loaded, state, router]);

  if (!loaded || !hasGoal(state)) return null;

  return (
    <>
      <Nav />
      <main className="flex-1 md:pl-[220px] pb-24 md:pb-0">
        <div className="mx-auto max-w-2xl px-5 md:px-8 py-10">{children}</div>
      </main>
    </>
  );
}
