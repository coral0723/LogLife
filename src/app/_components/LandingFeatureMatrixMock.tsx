export function LandingFeatureMatrixMock() {
  return (
    <div className="rounded-2xl border border-zinc-100 bg-zinc-50 p-5">
      <p className="mb-3 text-sm text-zinc-400">난이도 × 설렘 매트릭스</p>
      <div className="relative aspect-square w-full">
        <div className="grid h-full w-full grid-cols-2 grid-rows-2">
          {/* 고난이도·저설렘 (top-left) */}
          <div className="flex h-full w-full flex-col items-start justify-start gap-1.5 overflow-hidden rounded-tl-2xl bg-[#2cc2f7]/60 p-3">
            <span className="text-sm font-bold text-white">마음먹고 천천히</span>
            <span className="max-w-full truncate rounded-full border border-zinc-200 bg-white/80 px-2 py-0.5 text-[11px] font-medium text-zinc-600">
              마라톤 완주
            </span>
          </div>
          {/* 고난이도·고설렘 (top-right) */}
          <div className="flex h-full w-full flex-col items-end justify-start gap-1.5 overflow-hidden rounded-tr-2xl bg-[#2cc2f7]/85 p-3">
            <span className="text-sm font-bold text-white">버킷리스트의 꽃</span>
            <span className="max-w-full truncate rounded-full border border-zinc-200 bg-white/80 px-2 py-0.5 text-[11px] font-medium text-zinc-600">
              에베레스트 트래킹
            </span>
          </div>
          {/* 저난이도·저설렘 (bottom-left) — 칩 먼저, 라벨 나중 */}
          <div className="flex h-full w-full flex-col items-start justify-end gap-1.5 overflow-hidden rounded-bl-2xl bg-[#2cc2f7]/15 p-3">
            <span className="max-w-full truncate rounded-full border border-zinc-200 bg-white/80 px-2 py-0.5 text-[11px] font-medium text-zinc-600">
              전국 스탬프 투어
            </span>
            <span className="text-sm font-bold text-[#0369a1]">여유있을 때</span>
          </div>
          {/* 저난이도·고설렘 (bottom-right) — 칩 먼저, 라벨 나중 */}
          <div className="flex h-full w-full flex-col items-end justify-end gap-1.5 overflow-hidden rounded-br-2xl bg-[#2cc2f7]/35 p-3">
            <span className="max-w-full truncate rounded-full border border-zinc-200 bg-white/80 px-2 py-0.5 text-[11px] font-medium text-zinc-600">
              오로라 보기
            </span>
            <span className="text-sm font-bold text-[#0284c7]">지금 도전!</span>
          </div>
        </div>

        {/* 좌표축 오버레이 */}
        <div className="pointer-events-none absolute inset-0">
          {/* 세로축 (난이도) */}
          <div className="absolute left-1/2 top-2 bottom-0 w-px -translate-x-1/2 bg-zinc-400" />
          <div className="absolute left-1/2 top-0 h-0 w-0 -translate-x-1/2 border-x-[5px] border-b-8 border-x-transparent border-b-zinc-400" />
          <span className="absolute left-1/2 top-2 translate-x-2 text-[8px] font-medium text-zinc-400">
            난이도
          </span>
          {/* 가로축 (설렘) */}
          <div className="absolute left-0 right-2 top-1/2 h-px -translate-y-1/2 bg-zinc-400" />
          <div className="absolute right-0 top-1/2 h-0 w-0 -translate-y-1/2 border-y-[5px] border-l-8 border-y-transparent border-l-zinc-400" />
          <span className="absolute right-2 top-1/2 translate-y-2 text-[8px] font-medium text-zinc-400">
            설렘
          </span>
        </div>
      </div>
    </div>
  );
}
