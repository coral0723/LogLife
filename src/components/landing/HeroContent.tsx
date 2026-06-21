"use client";

import { motion } from "framer-motion";
import Link from "next/link";

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.11 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } },
};

export function HeroContent() {
  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="z-10 shrink-0 flex flex-col items-center px-6 pb-6 pt-32 text-center"
    >
      <motion.div
        variants={fadeUp}
        className="mb-6 flex items-center gap-2.5 rounded-full border border-[#2cc2f7]/25 bg-[#2cc2f7]/[0.07] px-4 py-1.5"
      >
        <span className="relative flex h-1.5 w-1.5 shrink-0">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#2cc2f7] opacity-70" />
          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#2cc2f7]" />
        </span>
        <span className="text-[11px] font-medium tracking-[0.12em] text-[#2cc2f7] uppercase">
          당신의 버킷리스트를 지구본 위에 기록해보세요
        </span>
      </motion.div>

      <motion.h1
        variants={fadeUp}
        className="mb-5 text-balance text-3xl font-bold leading-[1.1] tracking-[-0.02em] text-white md:text-6xl lg:text-[76px]"
      >
        죽기 전에 하고 싶은 것들,
        <br />
        하나씩 이뤄나가요
      </motion.h1>

      <motion.p
        variants={fadeUp}
        className="mb-9 max-w-70 text-base leading-relaxed text-zinc-400 md:max-w-sm md:text-lg"
      >
        버킷리스트를 지구본 위에 기록하고
        <br />
        달성해가는 인생 아카이브
      </motion.p>

      <motion.div variants={fadeUp} className="flex flex-col items-center gap-4 sm:flex-row">
        <Link
          href="/login"
          className="rounded-full bg-[#2cc2f7] px-8 py-3.5 text-sm font-semibold text-white shadow-[0_0_28px_rgba(44,194,247,0.4)] transition-all duration-200 hover:bg-[#1aade0] hover:shadow-[0_0_44px_rgba(44,194,247,0.55)] active:scale-[0.97]"
        >
          지금 시작하기
        </Link>
      </motion.div>
    </motion.div>
  );
}
