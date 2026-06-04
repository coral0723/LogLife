"use client";

import dynamic from "next/dynamic";
import { useCallback, useState } from "react";

import type { CountryPin } from "@/lib/countryPins";
import LoadingSpinner from "@/app/(afterLogin)/_components/LoadingSpinner";
import { CountrySlidePanel } from "./CountrySlidePanel";

interface Props {
  pins: CountryPin[];
}

const GlobeView = dynamic(
  () => import("./GlobeView").then((m) => m.GlobeView),
  { ssr: false }
);

export function GlobeClient({ pins }: Props) {
  const [selectedPin, setSelectedPin] = useState<CountryPin | null>(null);
  const [selectedCountryCode, setSelectedCountryCode] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);
  const handleReady = useCallback(() => setIsReady(true), []);

  const handlePinClick = useCallback((pin: CountryPin) => {
    setSelectedPin(pin);
  }, []);

  return (
    <div
      className="relative h-full w-full"
      onClick={() => setSelectedPin(null)}
    >
      {!isReady && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-white">
          <LoadingSpinner />
        </div>
      )}
      <GlobeView pins={pins} onPinClick={handlePinClick} onReady={handleReady} />

      {selectedPin && (
        <div
          className="absolute bottom-8 left-1/2 -translate-x-1/2 z-50 bg-white rounded-2xl shadow-xl px-5 py-4 min-w-[180px] flex flex-col gap-1"
          onClick={(e) => e.stopPropagation()}
        >
          <p className="text-base font-bold text-zinc-900">{selectedPin.countryCode}</p>
          <p className="text-sm text-zinc-500">{selectedPin.count}개 등록</p>
          <p className="text-sm text-zinc-500">{selectedPin.achievedCount}개 달성</p>
          {selectedPin.achievedCount < selectedPin.count && (
            <span className="text-xs font-medium text-amber-500">
              {selectedPin.achievedCount}/{selectedPin.count}
            </span>
          )}
        </div>
      )}

      <CountrySlidePanel
        countryCode={selectedCountryCode}
        onClose={() => setSelectedCountryCode(null)}
      />
    </div>
  );
}
