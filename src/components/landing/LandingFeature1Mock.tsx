export function LandingFeature1Mock() {
  return (
    <div className="overflow-hidden rounded-2xl border border-zinc-100 bg-white shadow-sm">
      <div className="space-y-4 px-5 py-4">
        <div>
          <span className="mb-1 block text-sm font-medium text-zinc-700">제목</span>
          <div className="rounded-xl border border-zinc-200 px-3 py-2.5 text-sm text-zinc-700">
            에베레스트 트래킹
          </div>
          <p className="mt-1 text-right text-xs text-zinc-400">8/20</p>
        </div>

        <div>
          <span className="mb-1 block text-sm font-medium text-zinc-700">내용</span>
          <div className="rounded-xl border border-zinc-200 px-3 pt-2.5 pb-20 text-sm text-zinc-700">
            히말라야 베이스캠프까지 트레킹을 꼭 해보고 싶습니다. 
            <br/>
            오래전부터 꿈꿔왔던 도전입니다.
          </div>
        </div>

        <div>
          <span className="mb-1 block text-sm font-medium text-zinc-700">위치</span>
          <div className="rounded-xl border border-zinc-200 px-3 py-2.5 text-sm text-zinc-700">
            네팔, 히말라야
          </div>
        </div>

        <div>
          <span className="mb-1 block text-sm font-medium text-zinc-700">마감일</span>
          <div className="rounded-xl border border-zinc-200 px-3 py-2.5 text-sm text-zinc-900">
            2026-12-31
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <span className="mb-2 block text-sm font-medium text-zinc-700">난이도</span>
            <div className="flex items-center gap-2.5">
              {[1, 2, 3, 4, 5].map((i) => (
                <span
                  key={i}
                  className={`h-6 w-6 rounded-full ${i <= 4 ? "bg-[#2cc2f7]" : "bg-zinc-200"}`}
                />
              ))}
            </div>
          </div>
          <div>
            <span className="mb-2 block text-sm font-medium text-zinc-700">설레임</span>
            <div className="flex items-center gap-2.5">
              {[1, 2, 3, 4, 5].map((i) => (
                <span key={i} className="h-6 w-6 rounded-full bg-[#2cc2f7]" />
              ))}
            </div>
          </div>
        </div>

        <div>
          <span className="mb-1 block text-sm font-medium text-zinc-700">공개 범위</span>
          <div className="rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-sm text-zinc-700">
            전체 공개
          </div>
        </div>
      </div>

      <div className="border-t border-zinc-100 bg-white px-5 py-3">
        <div className="flex w-full items-center justify-center rounded-full bg-[#2cc2f7] py-3 text-sm font-medium text-white">
          작성하기
        </div>
      </div>
    </div>
  );
}
