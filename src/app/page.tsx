import type { Metadata } from "next";
import Link from "next/link";
import { LandingHeader } from "./_components/LandingHeader";
import { LandingGlobe } from "./_components/LandingGlobe";
import { ScrollReveal } from "./_components/ScrollReveal";
import { StarField } from "./(afterLogin)/main/_components/StarField";

export const metadata: Metadata = {
  title: "LogLife — 버킷리스트를 지구본 위에 기록하세요",
  description: "버킷리스트를 지구본 위에 기록하고 달성해가는 인생 아카이브",
  openGraph: {
    title: "LogLife",
    description: "버킷리스트를 지구본 위에 기록하세요",
    images: [{ url: "/logo.png" }],
  },
};

export default function Home() {
  return (
    <main className="min-h-dvh text-white">
      <div className="fixed inset-0 -z-20 bg-[#0a0a0a]" />
      <div className="fixed inset-0 -z-10 opacity-50">
        <StarField />
      </div>
      <LandingHeader />

      {/* Hero */}
      <section className="relative h-dvh overflow-hidden flex flex-col items-center">
        <div className="pointer-events-none absolute bottom-0 left-1/2 h-150 w-150 -translate-x-1/2 translate-y-1/4 rounded-full bg-[#2cc2f7]/8 blur-[120px]" />

        <div className="z-10 shrink-0 flex flex-col items-center px-6 pb-6 pt-32 text-center">
          <p className="mb-4 text-xs font-medium uppercase tracking-[0.2em] text-[#2cc2f7]">
            당신의 버킷리스트를 지구본 위에 기록해보세요
          </p>
          <h1 className="mb-4 text-3xl font-bold leading-tight tracking-tight text-white md:text-6xl lg:text-7xl">
            죽기 전에 하고 싶은 것들,
            <br className="block" />
            하나씩 이뤄나가요
          </h1>
          <p className="mb-8 max-w-sm text-base text-zinc-400 md:text-lg">
            버킷리스트를 지구본 위에 
            <br className="block" />
            기록하고 달성해가는 인생 아카이브
          </p>
          <Link
            href="/login"
            className="rounded-full bg-white px-8 py-3 text-sm font-semibold text-[#0a0a0a] transition hover:bg-[#1aade0]"
          >
            지금 시작하기
          </Link>
        </div>

        {/* bottom-0 + translate-y-1/3 → 지구본 하단 1/3이 섹션 아래로 잘림 */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-[30%] h-207.5 w-screen lg:h-225 lg:w-[min(1020px,90vw)] lg:translate-y-[45%]">
          <LandingGlobe />
        </div>
      </section>

      {/* 피처 1 — 기록 */}
      <section className="py-24 px-6 lg:px-20">
        <div className="mx-auto max-w-6xl grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          <ScrollReveal>
            <p className="mb-3 text-xs font-medium uppercase tracking-widest text-[#2cc2f7]">RECORD</p>
            <h2 className="mb-4 text-3xl font-bold leading-snug text-white lg:text-5xl">
              가고 싶은 곳을<br />기록하세요
            </h2>
            <p className="text-base leading-relaxed text-zinc-400">
              원하는 장소를 검색하고 난이도, 설레임 지수와 함께 버킷리스트를 등록하세요.
            </p>
          </ScrollReveal>

          <ScrollReveal>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
              <p className="mb-4 text-xs text-zinc-400">버킷리스트 작성</p>
              <div className="mb-3 rounded-lg bg-white/10 px-4 py-3 text-sm text-white">
                에베레스트 트레킹
              </div>
              <div className="mb-4 rounded-lg bg-white/10 px-4 py-3 text-sm text-zinc-300">
                📍 네팔, 히말라야
              </div>
              <div className="mb-3 flex items-center gap-6 text-sm text-zinc-300">
                <span>
                  난이도&nbsp;
                  <span className="text-[#2cc2f7]">●●●</span>
                  <span className="text-white/20">○○</span>
                </span>
                <span>
                  설레임&nbsp;
                  <span className="text-[#2cc2f7]">●●●●</span>
                  <span className="text-white/20">○</span>
                </span>
              </div>
              <div className="mb-5 text-sm text-zinc-400">마감일&nbsp; 2026-12-31</div>
              <div className="flex justify-end">
                <button className="rounded-full bg-[#2cc2f7] px-5 py-2 text-sm font-semibold text-[#0a0a0a]">
                  등록하기
                </button>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* 피처 2 — 현황 */}
      <section className="py-24 px-6 lg:px-20">
        <div className="mx-auto max-w-6xl grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          <ScrollReveal>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
              <div className="mb-5 grid grid-cols-2 gap-4">
                <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-center">
                  <p className="text-3xl font-bold text-white">12</p>
                  <p className="mt-1 text-xs text-zinc-400">등록한 꿈의 수</p>
                  <p className="text-xs text-zinc-500">전체 버킷리스트</p>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-center">
                  <p className="text-3xl font-bold text-[#2cc2f7]">5</p>
                  <p className="mt-1 text-xs text-zinc-400">이뤄낸 경험</p>
                  <p className="text-xs text-zinc-500">달성</p>
                </div>
              </div>
              <p className="mb-2 text-xs font-medium text-zinc-400">마감 임박</p>
              <div className="border-t border-white/10 pt-3 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#2cc2f7]" />
                    오로라 보기
                  </span>
                  <span className="text-xs text-zinc-400">D-14</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#2cc2f7]" />
                    후지산 등반
                  </span>
                  <span className="text-xs text-zinc-400">D-32</span>
                </div>
              </div>
            </div>
          </ScrollReveal>

          <ScrollReveal className="lg:order-last">
            <p className="mb-3 text-xs font-medium uppercase tracking-widest text-[#2cc2f7]">TRACK</p>
            <h2 className="mb-4 text-3xl font-bold leading-snug text-white lg:text-5xl">
              달성 현황을<br />한눈에
            </h2>
            <p className="text-base leading-relaxed text-zinc-400">
              등록한 버킷리스트의 달성률과 마감 임박 항목을 한눈에 확인하세요.
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* 피처 3 — 아카이브 */}
      <section className="py-24 px-6 lg:px-20">
        <div className="mx-auto max-w-6xl grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          <ScrollReveal>
            <p className="mb-3 text-xs font-medium uppercase tracking-widest text-[#2cc2f7]">ARCHIVE</p>
            <h2 className="mb-4 text-3xl font-bold leading-snug text-white lg:text-5xl">
              소중한 경험을<br />간직하세요
            </h2>
            <p className="text-base leading-relaxed text-zinc-400">
              달성한 버킷리스트는 영원히 지구본에 새겨집니다. 언제든 다시 꺼내보세요.
            </p>
          </ScrollReveal>

          <ScrollReveal>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
              <div className="mb-4 flex items-center justify-between">
                <span className="flex items-center gap-2 text-sm font-medium text-white">
                  <span className="text-[#2cc2f7]">✓</span>
                  에베레스트 트레킹
                </span>
                <span className="rounded-full bg-[#2cc2f7]/20 px-3 py-1 text-xs font-medium text-[#2cc2f7]">
                  달성
                </span>
              </div>
              <p className="mb-1 text-sm text-zinc-400">📍 네팔, 히말라야</p>
              <p className="mb-3 text-sm text-zinc-400">📅 2025년 10월 달성</p>
              <div className="mb-3 flex items-center gap-6 text-sm text-zinc-300">
                <span>
                  난이도&nbsp;
                  <span className="text-[#2cc2f7]">●●●●●</span>
                </span>
                <span>
                  설레임&nbsp;
                  <span className="text-[#2cc2f7]">●●●●●</span>
                </span>
              </div>
              <div className="border-t border-white/10 pt-3 text-sm leading-relaxed text-zinc-400">
                에베레스트 베이스캠프까지의 트레킹은<br />
                평생 잊지 못할 경험이었습니다.
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* 하단 CTA */}
      <section className="relative py-32 text-center">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(44,194,247,0.06),transparent_65%)]" />
        <ScrollReveal className="relative z-10">
          <h2 className="mb-4 text-4xl font-bold leading-tight text-white lg:text-6xl">
            지금, 당신의 이야기를
            <br />
            지구에 새겨보세요
          </h2>
          <p className="mb-8 text-base text-zinc-400">
            로그라이프와 함께 버킷리스트를 시작하세요.
          </p>
          <Link
            href="/login"
            className="rounded-full bg-[#2cc2f7] px-8 py-3 text-sm font-semibold text-white transition hover:bg-[#1aade0]"
          >
            무료로 시작하기
          </Link>
        </ScrollReveal>
      </section>

      <footer className="border-t border-white/5 py-8 text-center text-xs text-zinc-600">
        © 2026 LogLife
      </footer>
    </main>
  );
}
