import Image from "next/image";

export function LandingFeature3Mock() {
  return (
    <div className="overflow-hidden rounded-2xl border border-zinc-100 bg-white shadow-sm">
      {/* 사진 헤더 */}
      <div className="relative h-48">
        <Image
          src="/landing/everest.jpg"
          alt="에베레스트 트래킹"
          fill
          sizes="(max-width: 1024px) 90vw, 45vw"
          className="object-cover"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-white via-white/20 to-transparent" />
      </div>

      {/* 콘텐츠 */}
      <div className="space-y-4 px-5 py-4">
        {/* 배지 */}
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700">
            달성
          </span>
          <span className="text-xs text-zinc-500">전체 공개</span>
        </div>

        {/* 제목 */}
        <h3 className="text-xl font-semibold leading-snug text-zinc-900">
          에베레스트 트래킹
        </h3>

        {/* 위치 */}
        <p className="text-sm text-zinc-500">네팔, 히말라야</p>

        {/* 설명 */}
        <p className="text-sm leading-relaxed text-zinc-700">
          히말라야 베이스캠프까지 트레킹을 꼭 해보고 싶습니다. 
          <br/>
          오래전부터 꿈꿔왔던 도전입니다.
        </p>

        {/* 난이도 */}
        <div className="space-y-1.5">
          <p className="text-xs font-medium tracking-wide text-zinc-500">난이도</p>
          <div className="flex items-center gap-1.5">
            {[1, 2, 3, 4, 5].map((i) => (
              <span
                key={i}
                className={`h-2.5 w-2.5 rounded-full ${i <= 4 ? "bg-[#2cc2f7]" : "bg-zinc-200"}`}
              />
            ))}
          </div>
        </div>

        {/* 설레임 */}
        <div className="space-y-1.5">
          <p className="text-xs font-medium tracking-wide text-zinc-500">설레임</p>
          <div className="flex items-center gap-1.5">
            {[1, 2, 3, 4, 5].map((i) => (
              <span key={i} className="h-2.5 w-2.5 rounded-full bg-[#2cc2f7]" />
            ))}
          </div>
        </div>

        {/* 달성일 */}
        <p className="text-xs text-zinc-400">달성일: 2025년 10월 15일</p>
      </div>
    </div>
  );
}
