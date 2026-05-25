"use client";

import dynamic from "next/dynamic";
import { useState } from "react";

interface BucketPin {
  id: string;
  lat: number;
  lng: number;
  title: string;
  displayName: string;
  achieved: boolean;
}

interface Props {
  pins: BucketPin[];
}

const MapView = dynamic(() => import("./MapView").then((m) => m.MapView), {
  ssr: false,
});

export function GlobeClient({ pins }: Props) {
  const [selectedPin, setSelectedPin] = useState<BucketPin | null>(null);

  return (
    <div className="relative h-full w-full" onClick={() => setSelectedPin(null)}>
      <MapView pins={pins} onPinClick={setSelectedPin} />
      {selectedPin && (
        <div
          className="absolute bottom-24 left-1/2 z-40 w-72 -translate-x-1/2 rounded-2xl border border-amber-800/25 bg-[#1c1408]/92 p-4 backdrop-blur-xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-sm font-medium leading-snug text-amber-50">
                {selectedPin.title}
              </p>
              <p className="mt-0.5 text-xs text-amber-200/60">
                {selectedPin.displayName}
              </p>
            </div>
            <span
              className={`shrink-0 rounded-full px-2 py-0.5 text-xs ${
                selectedPin.achieved
                  ? "bg-amber-500/20 text-amber-400"
                  : "bg-amber-900/30 text-amber-600/70"
              }`}
            >
              {selectedPin.achieved ? "완료" : "미완료"}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
