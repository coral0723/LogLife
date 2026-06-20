export function LandingFeature2Mock() {
  return (
    <div className="flex flex-col gap-4">
      {/* BucketCountWidget */}
      <section className="rounded-2xl border border-zinc-100 bg-zinc-50 p-5">
        <p className="text-sm text-zinc-400">작성한 버킷리스트 수</p>
        <p className="mt-2 flex items-baseline gap-1 text-zinc-900">
          <span className="text-4xl font-bold tracking-tight">12</span>
          <span className="text-base font-medium text-zinc-400">개</span>
        </p>
      </section>

      {/* AchievementStatsWidget */}
      <section className="rounded-2xl border border-zinc-100 bg-zinc-50 p-5">
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-zinc-400">평균 달성 소요 기간</span>
            <span className="font-medium text-zinc-900">87일</span>
          </div>
          <div className="flex items-center justify-between gap-3 text-sm">
            <span className="flex-shrink-0 text-zinc-400">가장 오래 미룬 항목</span>
            <span className="min-w-0 truncate font-medium text-zinc-900">
              에베레스트 트래킹 · 180일
            </span>
          </div>
        </div>
      </section>

      {/* UpcomingDeadlinesWidget */}
      <section className="rounded-2xl border border-zinc-100 bg-zinc-50 p-5">
        <p className="mb-3 text-sm text-zinc-400">마감 임박 순 리스트</p>
        <ul className="space-y-2">
          <li className="flex items-center gap-3 rounded-xl bg-white p-3">
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-zinc-100 text-xs font-bold text-zinc-500">
              D-14
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-zinc-900">오로라 보기</p>
              <p className="truncate text-xs text-zinc-400">아이슬란드, 레이캬비크</p>
            </div>
          </li>
          <li className="flex items-center gap-3 rounded-xl bg-white p-3">
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-zinc-100 text-xs font-bold text-zinc-500">
              D-32
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-zinc-900">후지산 등반</p>
              <p className="truncate text-xs text-zinc-400">일본, 시즈오카</p>
            </div>
          </li>
        </ul>
      </section>
    </div>
  );
}
