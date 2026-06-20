"use client";

import { useEffect, useRef } from "react";

const STAR_COUNT = 160;

// XorShift32 — Math.random() 대신 시드 고정 난수 사용 (테스팅 가이드 준수)
function createRng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s ^= s << 13;
    s ^= s >> 17;
    s ^= s << 5;
    return (s >>> 0) / 4294967296;
  };
}

export function StarField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    const ctx = canvas.getContext("2d")!;
    const rand = createRng(0xdeadbeef);

    for (let i = 0; i < STAR_COUNT; i++) {
      const x = rand() * canvas.width;
      const y = rand() * canvas.height;
      const r = rand() * 1.5 + 0.5;
      const opacity = rand() * 0.55 + 0.25;

      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,255,255,${opacity})`;
      ctx.fill();
    }
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute inset-0 h-full w-full"
    />
  );
}
