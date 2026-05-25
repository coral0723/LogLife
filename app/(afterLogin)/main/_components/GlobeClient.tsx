"use client";

import dynamic from "next/dynamic";
import { useState } from "react";

import type { CountryPin } from "@/lib/countryPins";

interface Props {
  pins: CountryPin[];
}

const GlobeView = dynamic(
  () => import("./GlobeView").then((m) => m.GlobeView),
  { ssr: false }
);

export function GlobeClient({ pins }: Props) {
  const [selectedPin, setSelectedPin] = useState<CountryPin | null>(null);

  return (
    <div
      className="relative h-full w-full"
      onClick={() => setSelectedPin(null)}
    >
      <GlobeView pins={pins} onPinClick={setSelectedPin} />

      {selectedPin && (
        <div
          className="absolute bottom-24 left-1/2 z-40 w-72 -translate-x-1/2 rounded-2xl border border-amber-800/25 bg-[#1c1408]/92 p-4 backdrop-blur-xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-widest text-amber-400/70">
                {selectedPin.countryCode}
              </p>
              <p className="mt-1 text-sm font-medium text-amber-50">
                {selectedPin.count}개 등록
              </p>
              <p className="mt-0.5 text-xs text-amber-200/50">
                {selectedPin.achievedCount}개 달성
              </p>
            </div>
            <span
              className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${
                selectedPin.achievedCount === selectedPin.count
                  ? "bg-amber-500/20 text-amber-400"
                  : "bg-slate-700/50 text-slate-400"
              }`}
            >
              {selectedPin.achievedCount === selectedPin.count
                ? "전부 달성"
                : `${selectedPin.achievedCount}/${selectedPin.count}`}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
