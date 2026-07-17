"use client";

// The app shell: persistent nav + a guard that bounces you back to onboarding
// if no goal exists yet. Wraps /today, /route, /progress, /profile.

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { hasGoal, useWaypoint } from "../../lib/waypoint-context";
import { Nav } from "../../components/Nav";
import { Loading, SciencePanel } from "../../components/ui";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { state, loaded } = useWaypoint();

  useEffect(() => {
    if (loaded && !hasGoal(state)) router.replace("/");
  }, [loaded, state, router]);

  if (!loaded) return <Loading />;
  if (!hasGoal(state)) return null; // redirecting to onboarding

  const science = state.showScience;

  return (
    <>
      <Nav />
      <main className="flex-1 md:pl-[220px] pb-24 md:pb-0">
        <div
          className={`mx-auto px-5 md:px-8 py-10 ${
            science ? "max-w-5xl lg:flex lg:gap-10" : "max-w-2xl"
          }`}
        >
          <div className={science ? "lg:flex-1 lg:min-w-0 lg:max-w-2xl" : ""}>
            {children}
          </div>
          {science && (
            <aside className="mt-10 lg:mt-0 lg:w-72 lg:shrink-0 lg:sticky lg:top-10 lg:self-start">
              <SciencePanel />
            </aside>
          )}
        </div>
      </main>
    </>
  );
}
