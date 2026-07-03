"use client";

import dynamic from "next/dynamic";
import { useCallback, useMemo, useState } from "react";

import type { CountryPin } from "@/lib/countryPins";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { CountrySlidePanel } from "./CountrySlidePanel";

interface Props {
  pins: CountryPin[];
  username?: string;
}

const GlobeView = dynamic(
  () => import("./GlobeView").then((m) => m.GlobeView),
  { ssr: false }
);

// 핀들의 지리적 평균 좌표 (없으면 한국)
function calcInitialPov(pins: CountryPin[]): { lat: number; lng: number } {
  if (pins.length === 0) return { lat: 36, lng: 128 };
  const lat = pins.reduce((s, p) => s + p.lat, 0) / pins.length;
  const lng = pins.reduce((s, p) => s + p.lng, 0) / pins.length;
  return { lat, lng };
}

export function GlobeClient({ pins, username }: Props) {
  const [selectedCountryCode, setSelectedCountryCode] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);
  const handleReady = useCallback(() => setIsReady(true), []);

  const handlePinClick = useCallback((pin: CountryPin) => {
    setSelectedCountryCode(pin.countryCode);
  }, []);

  const isUserPage = !!username;
  const initialPov = useMemo(
    () => (isUserPage ? calcInitialPov(pins) : undefined),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isUserPage]
  );

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
      <GlobeView
        pins={pins}
        onPinClick={handlePinClick}
        onReady={handleReady}
        initialPov={initialPov}
        persistPov={!isUserPage}
      />

      <CountrySlidePanel
        countryCode={selectedCountryCode}
        onClose={() => setSelectedCountryCode(null)}
        username={username}
      />
    </div>
  );
}
