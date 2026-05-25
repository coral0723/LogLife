"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import Globe from "react-globe.gl";
import * as topojson from "topojson-client";

import type { CountryPin } from "@/lib/countryPins";

interface Props {
  pins: CountryPin[];
  onPinClick: (pin: CountryPin) => void;
}

// 브라우저 canvas로 단색 ocean 텍스처 생성 (SSR 없는 클라이언트 전용)
function createOceanTexture(): string {
  const canvas = document.createElement("canvas");
  canvas.width = 4;
  canvas.height = 4;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "#3d75f7";
  ctx.fillRect(0, 0, 4, 4);
  return canvas.toDataURL();
}

function createPinElement(pin: CountryPin, onPinClick: (p: CountryPin) => void): HTMLElement {
  const isAllAchieved = pin.count > 0 && pin.achievedCount === pin.count;
  const bg = isAllAchieved ? "#f59e0b" : "#475569";
  const size = pin.count >= 10 ? "36px" : "32px";

  const el = document.createElement("div");
  el.style.cssText = [
    `width:${size}`,
    `height:${size}`,
    "border-radius:50%",
    `background:${bg}`,
    "color:#fff",
    "font-size:12px",
    "font-weight:700",
    "font-family:-apple-system,BlinkMacSystemFont,sans-serif",
    "display:flex",
    "align-items:center",
    "justify-content:center",
    "cursor:pointer",
    "box-shadow:0 3px 10px rgba(0,0,0,0.6),inset 0 1px 0 rgba(255,255,255,0.2)",
    "border:2px solid rgba(255,255,255,0.3)",
    "transition:transform 0.15s cubic-bezier(0.16,1,0.3,1)",
    "will-change:transform",
    "user-select:none",
    "pointer-events:all",
  ].join(";");

  el.textContent = String(pin.count);
  el.onmouseenter = () => { el.style.transform = "scale(1.2)"; };
  el.onmouseleave = () => { el.style.transform = "scale(1)"; };
  el.onclick = (e) => {
    e.stopPropagation();
    onPinClick(pin);
  };
  return el;
}

export function GlobeView({ pins, onPinClick }: Props) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const globeRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [polygons, setPolygons] = useState<object[]>([]);
  const [size, setSize] = useState({ width: 0, height: 0 });
  const [oceanTexture] = useState(createOceanTexture);

  // 컨테이너 초기 크기 즉시 반영 + resize 추적
  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    setSize({ width: el.clientWidth, height: el.clientHeight });

    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setSize({ width, height });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // 세계 국가 TopoJSON → GeoJSON 폴리곤 1회 로드
  useEffect(() => {
    fetch("/geo/countries-110m.json")
      .then((r) => r.json())
      .then((topo) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const fc = topojson.feature(topo as any, (topo as any).objects.land) as any;
        setPolygons(fc.features as object[]);
      });
  }, []);

  // 초기 카메라 — 동아시아 기준으로 세계가 보이는 고도
  useEffect(() => {
    if (!globeRef.current || size.width === 0) return;
    globeRef.current.pointOfView({ lat: 25, lng: 30, altitude: 2.5 }, 0);
  }, [size.width]);

  return (
    <div ref={containerRef} className="h-full w-full">
      {size.width > 0 && (
        <Globe
          ref={globeRef}
          width={size.width}
          height={size.height}
          backgroundColor="#7ccdff"
          showAtmosphere
          atmosphereColor="#80eaff"
          atmosphereAltitude={0.2}
          globeImageUrl={oceanTexture}
          polygonsData={polygons}
          polygonCapColor={() => "#76f278"}
          polygonSideColor={() => "rgba(0,0,0,0)"}
          polygonStrokeColor={() => "rgba(0,0,0,0)"}
          polygonAltitude={0.006}
          htmlElementsData={pins}
          htmlLat="lat"
          htmlLng="lng"
          htmlAltitude={0.02}
          htmlElement={(d: object) =>
            createPinElement(d as CountryPin, onPinClick)
          }
        />
      )}
    </div>
  );
}
