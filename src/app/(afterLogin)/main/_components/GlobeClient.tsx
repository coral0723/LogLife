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
  const [selectedCountryCode, setSelectedCountryCode] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);
  const handleReady = useCallback(() => setIsReady(true), []);

  const handlePinClick = useCallback((pin: CountryPin) => {
    setSelectedCountryCode(pin.countryCode);
  }, []);

  return (
    <div
      className="relative h-full w-full"
      onClick={() => setSelectedCountryCode(null)}
    >
      {!isReady && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-white">
          <LoadingSpinner />
        </div>
      )}
      <GlobeView pins={pins} onPinClick={handlePinClick} onReady={handleReady} />

      <CountrySlidePanel
        countryCode={selectedCountryCode}
        onClose={() => setSelectedCountryCode(null)}
      />
    </div>
  );
}
