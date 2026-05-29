"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import Globe from "react-globe.gl";
import * as topojson from "topojson-client";

import type { CountryPin } from "@/lib/countryPins";
import { createPinElement } from "./createPinElement";

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

export function GlobeView({ pins, onPinClick, onReady }: Props) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const globeRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const onReadyRef = useRef(onReady);
  onReadyRef.current = onReady;
  const currentScaleRef = useRef(1);
  const [isGlobeMounted, setIsGlobeMounted] = useState(false);
  const hasSetInitialPov = useRef(false);

  // globeRef와 isGlobeMounted를 동시에 갱신하는 callback ref
  // useRef 단독으로는 Globe 마운트 시 effect 재실행이 트리거되지 않아 race condition 발생
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const globeCallbackRef = useCallback((node: any) => {
    globeRef.current = node;
    if (node !== null) setIsGlobeMounted(true);
  }, []);

  // altitude 1.5 이상: scale=1, 0.3 이하: scale=2, 그 사이: 선형 보간
  const handleZoom = useCallback(
    ({ altitude }: { lat: number; lng: number; altitude: number }) => {
      const SCALE_START = 1.5;
      const SCALE_END = 0.3;
      const newScale =
        altitude >= SCALE_START
          ? 1
          : altitude <= SCALE_END
            ? 2
            : 1 + (SCALE_START - altitude) / (SCALE_START - SCALE_END);

      currentScaleRef.current = newScale;
      const scaleStr = newScale.toFixed(3);
      containerRef.current
        ?.querySelectorAll<HTMLElement>(".pin-scale-wrapper")
        .forEach((el) => {
          el.style.transform = `scale(${scaleStr})`;
        });
    },
    []
  );
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
      })
      .catch(() => {
        alert("지도 데이터를 불러오지 못했습니다. 잠시 후 다시 시도해주세요.");
        window.location.href = "/";
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

    if (!hasSetInitialPov.current) {
      globeRef.current.pointOfView({ lat: 36, lng: 128, altitude }, 0);
      hasSetInitialPov.current = true;
    } else {
      // 리사이즈 시 사용자의 lat/lng는 유지하고 altitude만 조정
      const { lat, lng } = globeRef.current.pointOfView();
      globeRef.current.pointOfView({ lat, lng, altitude }, 0);
    }
  }, [size.width, size.height]);

  // react-globe.gl 기본 조명이 어두워 밝기 보정 + 지구본 준비 완료 알림
  // isGlobeMounted를 deps에 추가 — polygons 로드 후 Globe 마운트 시에도 effect 재실행
  useEffect(() => {
    if (!globeRef.current || polygons.length === 0) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    globeRef.current.scene().traverse((obj: any) => {
      if (obj.isAmbientLight) obj.intensity = 4.8;
      if (obj.isDirectionalLight) obj.intensity = 3.4;
    });
    onReadyRef.current?.();
  }, [isGlobeMounted, polygons]);

  return (
    <div ref={containerRef} className="h-full w-full">
      {size.width > 0 && (
        <Globe
          ref={globeCallbackRef as any /* react-globe.gl 타입이 callback ref 미지원, 런타임 동작은 정상 */}
          width={size.width}
          height={size.height}
          backgroundColor="rgba(0,0,0,0)"
          atmosphereAltitude={0.15}
          globeImageUrl={oceanTexture}
          polygonsData={polygons}
          polygonCapColor={() => "#96ff99"}
          polygonSideColor={() => "rgba(50,75,40,0.75)"}
          polygonStrokeColor={() => "rgba(255,255,255,0.04)"}
          polygonAltitude={0.016}
          htmlElementsData={pins}
          htmlLat="lat"
          htmlLng="lng"
          htmlAltitude={0.02}
          htmlElement={(d: object) => {
            const el = createPinElement(d as CountryPin, onPinClick);
            // 핀 생성 시점의 현재 줌 스케일 즉시 적용 (transition 없이)
            if (currentScaleRef.current !== 1) {
              const sw = el.querySelector<HTMLElement>(".pin-scale-wrapper");
              if (sw) {
                sw.style.transition = "none";
                sw.style.transform = `scale(${currentScaleRef.current.toFixed(3)})`;
                requestAnimationFrame(() => { sw.style.transition = ""; });
              }
            }
            return el;
          }}
          onZoom={handleZoom}
        />
      )}
    </div>
  );
}
