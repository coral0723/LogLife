"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import Globe from "react-globe.gl";
import * as topojson from "topojson-client";

import type { CountryPin } from "@/lib/countryPins";

interface Props {
  pins: CountryPin[];
  onPinClick: (pin: CountryPin) => void;
}

// 512×256 그라데이션 ocean 텍스처 — 위도별 깊이감 표현
function createOceanTexture(): string {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext("2d")!;

  // 극지방(#0675AB) → 적도(#38d3ff) → 극지방
  const latGrad = ctx.createLinearGradient(0, 0, 0, 256);
  latGrad.addColorStop(0,    "#0675AB");
  latGrad.addColorStop(0.25, "#1fa4d5");
  latGrad.addColorStop(0.5,  "#38d3ff");
  latGrad.addColorStop(0.75, "#1fa4d5");
  latGrad.addColorStop(1,    "#0675AB");
  ctx.fillStyle = latGrad;
  ctx.fillRect(0, 0, 512, 256);

  // 경도 양끝 약한 암화로 구면 깊이감 보조
  const lngGrad = ctx.createLinearGradient(0, 0, 512, 0);
  lngGrad.addColorStop(0,   "rgba(0,40,60,0.12)");
  lngGrad.addColorStop(0.5, "rgba(0,0,0,0)");
  lngGrad.addColorStop(1,   "rgba(0,40,60,0.12)");
  ctx.fillStyle = lngGrad;
  ctx.fillRect(0, 0, 512, 256);

  return canvas.toDataURL();
}

// 위도 중심에 따른 클레이 톤 육지 색상 — 적도(따뜻한 세이지) → 극지방(쿨한 올리브)
function getLandColor(d: object): string {
  const feat = d as { bbox?: [number, number, number, number] };
  const lat = feat.bbox ? (feat.bbox[1] + feat.bbox[3]) / 2 : 0;
  const t = Math.abs(lat) / 90; // 0=적도, 1=극지방

  // 적도: #96ff99 = rgb(150,255,153) → 극지방: 쿨한 민트 rgb(120,190,158)
  const r = Math.round(150 - t * 29);
  const g = Math.round(255 - t * 33);
  const b = Math.round(153 + t * 12);
  return `rgb(${r},${g},${b})`;
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

  // react-globe.gl 기본 조명이 어두워 밝기 보정
  useEffect(() => {
    if (!globeRef.current || polygons.length === 0) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    globeRef.current.scene().traverse((obj: any) => {
      if (obj.isAmbientLight) obj.intensity = 4.8;
      if (obj.isDirectionalLight) obj.intensity = 3.4;
    });
  }, [polygons]);

  return (
    <div ref={containerRef} className="h-full w-full">
      {size.width > 0 && (
        <Globe
          ref={globeRef}
          width={size.width}
          height={size.height}
          backgroundColor="rgba(0,0,0,0)"
          atmosphereAltitude={0.15}
          globeImageUrl={oceanTexture}
          polygonsData={polygons}
          polygonCapColor={getLandColor}
          polygonSideColor={() => "rgba(50,75,40,0.75)"}
          polygonStrokeColor={() => "rgba(255,255,255,0.04)"}
          polygonAltitude={0.016}
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
