import type { Metadata } from "next";
import Link from "next/link";
import { LandingHeader } from "./_components/LandingHeader";
import { LandingGlobe } from "./_components/LandingGlobe";
import { LandingFeature1Mock } from "./_components/LandingFeature1Mock";
import { LandingFeature2Mock } from "./_components/LandingFeature2Mock";
import { LandingFeatureMatrixMock } from "./_components/LandingFeatureMatrixMock";
import { LandingFeature3Mock } from "./_components/LandingFeature3Mock";
import { ScrollReveal } from "./_components/ScrollReveal";
import { StarField } from "./(afterLogin)/main/_components/StarField";
import { HeroContent } from "./_components/HeroContent";

export const metadata: Metadata = {
  title: "LogLife — 버킷리스트를 지구본 위에 기록하세요",
  description: "버킷리스트를 지구본 위에 기록하고 달성해가는 인생 아카이브",
  openGraph: {
    title: "LogLife",
    description: "버킷리스트를 지구본 위에 기록하세요",
    images: [{ url: "/logo.png" }],
  },
};

function SectionDivider() {
  return (
    <div className="pointer-events-none mx-auto max-w-6xl px-6 lg:px-20">
      <div className="h-px w-full bg-gradient-to-r from-transparent via-zinc-800 to-transparent" />
    </div>
  );
}

type FeatureLabelProps = { step: string; label: string };

function FeatureLabel({ step, label }: FeatureLabelProps) {
  return (
    <>
      <p className="mb-1 select-none text-[72px] font-bold leading-none tracking-tighter text-white/[0.14]">
        {step}
      </p>
      <p className="mb-3 flex items-center gap-2.5 text-xs font-medium uppercase tracking-widest text-[#2cc2f7]">
        <span className="h-px w-5 bg-[#2cc2f7]/60" />
        {label}
      </p>
    </>
  );
}

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

        <HeroContent />

        {/* 지구본 하단 1/3이 섹션 아래로 잘림 */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-[30%] h-207.5 w-screen md:h-225 md:w-[min(1020px,90vw)] md:translate-y-[45%]">
          <LandingGlobe />
        </div>
      </section>

      {/* 피처 섹션 앵커 */}
      <div id="features" />

      {/* 피처 1 — 기록 */}
      <section>
        <div className="mx-auto max-w-6xl lg:min-h-dvh flex flex-col lg:flex-row items-center gap-12 lg:gap-20 px-6 lg:px-20 py-16">
          <ScrollReveal className="w-full lg:flex-1">
            <FeatureLabel step="01" label="RECORD" />
            <h2 className="mb-5 text-3xl font-bold leading-[1.15] tracking-tight text-white lg:text-5xl">
              가고 싶은 곳을<br />기록하세요
            </h2>
            <p className="max-w-sm text-base leading-relaxed text-zinc-400">
              원하는 장소를 검색하고 난이도, 설레임 지수와 함께 
              <br/>
              버킷리스트를 등록하세요.
            </p>
          </ScrollReveal>

          <ScrollReveal className="w-full lg:flex-1">
            <LandingFeature1Mock />
          </ScrollReveal>
        </div>
      </section>

      <SectionDivider />

      {/* 피처 2 — 현황 */}
      <section>
        <div className="mx-auto max-w-6xl lg:min-h-dvh flex flex-col lg:flex-row items-center gap-12 lg:gap-20 px-6 lg:px-20 py-16">
          <ScrollReveal className="w-full lg:flex-1">
            <LandingFeature2Mock />
          </ScrollReveal>

          <ScrollReveal className="w-full lg:flex-1">
            <FeatureLabel step="02" label="TRACK" />
            <h2 className="mb-5 text-3xl font-bold leading-[1.15] tracking-tight text-white lg:text-5xl">
              달성 현황을<br />한눈에
            </h2>
            <p className="max-w-sm text-base leading-relaxed text-zinc-400">
              등록한 버킷리스트의 달성률과 마감 임박 항목을 
              <br/>
              한눈에 확인하세요.
            </p>
          </ScrollReveal>
        </div>
      </section>

      <SectionDivider />

      {/* 피처 2.5 — 매트릭스 분석 */}
      <section>
        <div className="mx-auto max-w-6xl lg:min-h-dvh flex flex-col lg:flex-row items-center gap-12 lg:gap-20 px-6 lg:px-20 py-16">
          <ScrollReveal className="w-full lg:flex-1">
            <FeatureLabel step="03" label="ANALYZE" />
            <h2 className="mb-5 text-3xl font-bold leading-[1.15] tracking-tight text-white lg:text-5xl">
              나만의 버킷리스트<br />전략을 세워보세요
            </h2>
            <p className="max-w-sm text-base leading-relaxed text-zinc-400">
              난이도와 설렘 지수로 목표를 분석하고, 
              <br/>
              나에게 딱 맞는 다음 도전을 찾아보세요.
            </p>
          </ScrollReveal>

          <ScrollReveal className="w-full lg:flex-1">
            <LandingFeatureMatrixMock />
          </ScrollReveal>
        </div>
      </section>

      <SectionDivider />

      {/* 피처 3 — 아카이브 */}
      <section>
        <div className="mx-auto max-w-6xl lg:min-h-dvh flex flex-col lg:flex-row items-center gap-12 lg:gap-20 px-6 lg:px-20 py-16">
          <ScrollReveal className="w-full lg:flex-1">
            <LandingFeature3Mock />
          </ScrollReveal>

          <ScrollReveal className="w-full lg:flex-1">
            <FeatureLabel step="04" label="ARCHIVE" />
            <h2 className="mb-5 text-3xl font-bold leading-[1.15] tracking-tight text-white lg:text-5xl">
              소중한 경험을<br />간직하세요
            </h2>
            <p className="max-w-sm text-base leading-relaxed text-zinc-400">
              달성한 버킷리스트는 영원히 지구본에 새겨집니다. 
              <br/>
              언제든 다시 꺼내보세요.
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* 하단 CTA */}
      <section className="relative flex min-h-dvh items-center justify-center overflow-hidden text-center">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_60%_at_50%_50%,rgba(44,194,247,0.08),transparent_70%)]" />
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.8) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.8) 1px,transparent 1px)",
            backgroundSize: "64px 64px",
          }}
        />
        <ScrollReveal className="relative z-10 px-6">
          <p className="mb-5 flex items-center justify-center gap-3 text-xs font-medium uppercase tracking-[0.2em] text-[#2cc2f7]">
            <span className="h-px w-10 bg-gradient-to-r from-transparent to-[#2cc2f7]/50" />
            지금 시작하세요
            <span className="h-px w-10 bg-gradient-to-l from-transparent to-[#2cc2f7]/50" />
          </p>
          <h2 className="mb-5 text-balance text-4xl font-bold leading-[1.1] tracking-tight text-white lg:text-[60px]">
            지금, 당신의 이야기를
            <br />
            지구에 새겨보세요
          </h2>
          <p className="mb-10 text-base leading-relaxed text-zinc-400">
            로그라이프와 함께 버킷리스트를 시작하세요.
          </p>
          <Link
            href="/login"
            className="inline-block rounded-full bg-[#2cc2f7] px-10 py-4 text-sm font-semibold text-white shadow-[0_0_32px_rgba(44,194,247,0.45)] transition-all duration-200 hover:bg-[#1aade0] hover:shadow-[0_0_52px_rgba(44,194,247,0.6)] active:scale-[0.97]"
          >
            무료로 시작하기
          </Link>
        </ScrollReveal>
      </section>

      <footer className="border-t border-white/5 py-10 text-center">
        <p className="mb-3 text-xs text-zinc-600">© 2026 LogLife</p>
      </footer>
    </main>
  );
}
