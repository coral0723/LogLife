"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

import { StarField } from "@/app/(afterLogin)/main/_components/StarField";

import { AvatarStep } from "./AvatarStep";
import { FirstBucketStep } from "./FirstBucketStep";

type Step = "avatar" | "bucket";

const STEPS: { key: Step; label: string }[] = [
  { key: "avatar", label: "AVATAR" },
  { key: "bucket", label: "BUCKET" },
];

export function OnboardingClient() {
  const [step, setStep] = useState<Step>("avatar");

  return (
    <div className="relative min-h-dvh bg-[#0a0a0a] text-white">
      <div className="pointer-events-none fixed inset-0 -z-20 bg-[#0a0a0a]" />
      <div className="pointer-events-none fixed inset-0 -z-10 opacity-50">
        <StarField />
      </div>
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(ellipse_70%_40%_at_50%_0%,rgba(44,194,247,0.07),transparent_70%)]" />

      <header className="sticky top-0 z-20 flex justify-center px-6 py-5">
        <StepProgress current={step} />
      </header>

      <main className="mx-auto w-full max-w-lg px-6 pb-20">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ x: 56, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -56, opacity: 0 }}
            transition={{ type: "spring", stiffness: 320, damping: 32 }}
          >
            {step === "avatar" ? (
              <AvatarStep onNext={() => setStep("bucket")} />
            ) : (
              <FirstBucketStep />
            )}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}

function StepProgress({ current }: { current: Step }) {
  const currentIndex = STEPS.findIndex((s) => s.key === current);

  return (
    <div className="flex items-center gap-2">
      {STEPS.map((s, i) => (
        <div key={s.key} className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <div
              className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold transition-all duration-500 ${
                i <= currentIndex
                  ? "bg-[#2cc2f7] text-white"
                  : "border border-white/20 text-white/30"
              }`}
            >
              {i + 1}
            </div>
            <span
              className={`text-[11px] font-semibold uppercase tracking-widest transition-colors duration-500 ${
                i === currentIndex
                  ? "text-[#2cc2f7]"
                  : i < currentIndex
                    ? "text-white/50"
                    : "text-white/20"
              }`}
            >
              {s.label}
            </span>
          </div>
          {i < STEPS.length - 1 && (
            <div className="relative h-px w-10 overflow-hidden rounded-full bg-white/10">
              <div
                className={`absolute inset-y-0 left-0 bg-[#2cc2f7] transition-all duration-700 ease-out ${
                  i < currentIndex ? "w-full" : "w-0"
                }`}
              />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
