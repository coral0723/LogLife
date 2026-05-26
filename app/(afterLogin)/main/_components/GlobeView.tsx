"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import Globe from "react-globe.gl";
import * as topojson from "topojson-client";

import type { CountryPin } from "@/lib/countryPins";

interface Props {
  pins: CountryPin[];
  onPinClick: (pin: CountryPin) => void;
  onReady?: () => void;
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
  const id = `pin-${pin.countryCode}`;

  // 우선순위: 마감 초과 → 전달성 → 미달성
  type PinState = "expired" | "achieved" | "pending";
  const state: PinState = pin.hasExpiredDeadline ? "expired"
    : isAllAchieved ? "achieved"
    : "pending";

  const colors = {
    achieved: { bodyLight: "#fcd34d", bodyDark: "#92400e", innerLight: "#fde68a", innerDark: "#d97706" },
    expired:  { bodyLight: "#ff7d8e", bodyDark: "#b5002a", innerLight: "#ffaab5", innerDark: "#e62040" },
    pending:  { bodyLight: "#e0e0e0", bodyDark: "#7f7f7f", innerLight: "#c8c8c8", innerDark: "#8c8c8c" },
  }[state];

  const glow = state === "achieved"
    ? "drop-shadow(0 0 7px rgba(251,191,36,0.8)) drop-shadow(0 3px 6px rgba(0,0,0,0.5))"
    : "drop-shadow(0 3px 6px rgba(0,0,0,0.5))";

  const fontSize = pin.count >= 10 ? 10.5 : 13;

  // CSS2DRenderer가 transform을 매 프레임 직접 덮어쓰므로, 외부 컨테이너에는
  // transition을 두지 않는다. hover 애니메이션은 내부 래퍼에서 별도로 처리.
  const el = document.createElement("div");
  el.style.cssText = [
    "width:28px",
    "height:40px",
    "margin-top:-20px",  // 꼬리 끝이 좌표를 가리키도록 위로 오프셋
    "user-select:none",
    "pointer-events:all",
  ].join(";");

  const inner = document.createElement("div");
  inner.style.cssText = [
    "width:100%",
    "height:100%",
    "cursor:pointer",
    "transition:transform 0.15s cubic-bezier(0.16,1,0.3,1)",
    "transform-origin:center bottom",
    `filter:${glow}`,
  ].join(";");

  inner.innerHTML = `
    <svg width="28" height="40" viewBox="0 0 28 40" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="${id}-body" cx="38%" cy="28%" r="72%">
          <stop offset="0%" stop-color="${colors.bodyLight}"/>
          <stop offset="100%" stop-color="${colors.bodyDark}"/>
        </radialGradient>
        <radialGradient id="${id}-inner" cx="38%" cy="32%" r="68%">
          <stop offset="0%" stop-color="${colors.innerLight}"/>
          <stop offset="100%" stop-color="${colors.innerDark}"/>
        </radialGradient>
      </defs>
      <path d="M14,1 C6.82,1 1,6.82 1,14 C1,22.73 14,39 14,39 C14,39 27,22.73 27,14 C27,6.82 21.18,1 14,1 Z"
            fill="url(#${id}-body)"
            stroke="rgba(255,255,255,0.12)"
            stroke-width="0.8"/>
      <circle cx="14" cy="13" r="8.5" fill="url(#${id}-inner)"/>
      <text x="14" y="13"
            text-anchor="middle"
            dominant-baseline="central"
            fill="#ffffff"
            font-size="${fontSize}"
            font-weight="500"
            font-family="-apple-system,BlinkMacSystemFont,sans-serif">
        ${pin.count}
      </text>
    </svg>
  `;

  el.onmouseenter = () => { inner.style.transform = "scale(1.2)"; };
  el.onmouseleave = () => { inner.style.transform = ""; };
  el.onclick = (e) => {
    e.stopPropagation();
    onPinClick(pin);
  };

  el.appendChild(inner);
  return el;
}

export function GlobeView({ pins, onPinClick, onReady }: Props) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const globeRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const onReadyRef = useRef(onReady);
  onReadyRef.current = onReady;
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

  // 초기 카메라 — 동아시아 기준, 지구본 양옆 최소 8px 여백 보장
  // globe.gl: FOV=50°(수직), 지구 반지름=100, 카메라거리=100*(1+altitude)
  // 시각 지름(px) = (2 * arcsin(1/(1+alt)) / 50°) * height
  useEffect(() => {
    if (!globeRef.current || size.width === 0 || size.height === 0) return;

    const MARGIN = 8;
    const maxDiameter = size.width - MARGIN * 2;
    const halfAngleRad = (maxDiameter / size.height) * (25 * Math.PI / 180);
    const minAltitude = 1 / Math.sin(halfAngleRad) - 1;
    const altitude = Math.max(2.5, minAltitude);

    globeRef.current.pointOfView({ lat: 36, lng: 128, altitude }, 0);
  }, [size.width, size.height]);

  // react-globe.gl 기본 조명이 어두워 밝기 보정 + 지구본 준비 완료 알림
  useEffect(() => {
    if (!globeRef.current || polygons.length === 0) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    globeRef.current.scene().traverse((obj: any) => {
      if (obj.isAmbientLight) obj.intensity = 4.8;
      if (obj.isDirectionalLight) obj.intensity = 3.4;
    });
    onReadyRef.current?.();
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
