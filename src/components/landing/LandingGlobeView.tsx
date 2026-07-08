"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import Globe from "react-globe.gl";
import * as topojson from "topojson-client";

function createOceanTexture(): string {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext("2d")!;

  const latGrad = ctx.createLinearGradient(0, 0, 0, 256);
  latGrad.addColorStop(0,    "#0675AB");
  latGrad.addColorStop(0.25, "#1fa4d5");
  latGrad.addColorStop(0.5,  "#38d3ff");
  latGrad.addColorStop(0.75, "#1fa4d5");
  latGrad.addColorStop(1,    "#0675AB");
  ctx.fillStyle = latGrad;
  ctx.fillRect(0, 0, 512, 256);

  const lngGrad = ctx.createLinearGradient(0, 0, 512, 0);
  lngGrad.addColorStop(0,   "rgba(0,40,60,0.12)");
  lngGrad.addColorStop(0.5, "rgba(0,0,0,0)");
  lngGrad.addColorStop(1,   "rgba(0,40,60,0.12)");
  ctx.fillStyle = lngGrad;
  ctx.fillRect(0, 0, 512, 256);

  return canvas.toDataURL();
}

export function LandingGlobeView() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const globeRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isGlobeMounted, setIsGlobeMounted] = useState(false);
  const [polygons, setPolygons] = useState<object[]>([]);
  const [size, setSize] = useState({ width: 0, height: 0 });
  const [oceanTexture] = useState(createOceanTexture);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const globeCallbackRef = useCallback((node: any) => {
    globeRef.current = node;
    if (node !== null) setIsGlobeMounted(true);
  }, []);

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

  useEffect(() => {
    fetch("/geo/countries-110m.json")
      .then((r) => r.json())
      .then((topo) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const fc = topojson.feature(topo as any, (topo as any).objects.land) as any;
        setPolygons(fc.features as object[]);
      });
  }, []);

  // 조명 밝기 보정 + autoRotate controls 설정
  useEffect(() => {
    if (!globeRef.current || polygons.length === 0) return;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    globeRef.current.scene().traverse((obj: any) => {
      if (obj.isAmbientLight) obj.intensity = 4.8;
      if (obj.isDirectionalLight) obj.intensity = 3.4;
    });

    const controls = globeRef.current.controls();
    controls.enableZoom = false;
    controls.enablePan = false;
    controls.enableRotate = false;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.4;

    globeRef.current.pointOfView({ lat: 20, lng: 0, altitude: 2.5 }, 0);
  }, [isGlobeMounted, polygons]);

  return (
    <div ref={containerRef} className="h-full w-full">
      {size.width > 0 && (
        <Globe
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          ref={globeCallbackRef as any}
          width={size.width}
          height={size.height}
          backgroundColor="#060d1f"
          atmosphereAltitude={0.15}
          globeImageUrl={oceanTexture}
          polygonsData={polygons}
          polygonCapColor={() => "#96ff99"}
          polygonSideColor={() => "rgba(50,75,40,0.75)"}
          polygonStrokeColor={() => "rgba(255,255,255,0.04)"}
          polygonAltitude={0.016}
        />
      )}
    </div>
  );
}
