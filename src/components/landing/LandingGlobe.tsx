"use client";

import dynamic from "next/dynamic";

const LandingGlobeView = dynamic(
  () => import("./LandingGlobeView").then((m) => m.LandingGlobeView),
  { ssr: false, loading: () => <div className="h-full w-full" /> }
);

export function LandingGlobe() {
  return (
    <div className="h-full w-full">
      <LandingGlobeView />
    </div>
  );
}
