"use client";

import { useState, useTransition } from "react";
import Image from "next/image";

import { Button } from "@/components/ui/Button";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { updateAvatar } from "@/app/(afterLogin)/onboarding/actions";

const AVATAR_PATHS: { src: string; label: string }[] = [
  { src: "/avatars/astronaut.png", label: "우주인" },
  { src: "/avatars/cat.png", label: "고양이" },
  { src: "/avatars/dog.png", label: "강아지" },
  { src: "/avatars/fox.png", label: "여우" },
  { src: "/avatars/gray_robot.png", label: "로봇" },
  { src: "/avatars/green_dinosaur.png", label: "공룡" },
  { src: "/avatars/owl.png", label: "올빼미" },
  { src: "/avatars/panda.png", label: "판다" },
  { src: "/avatars/penguin.png", label: "펭귄" },
  { src: "/avatars/wizard.png", label: "마법사" },
];

type Props = { onNext: () => void };

export function AvatarStep({ onNext }: Props) {
  const [selected, setSelected] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleNext = () => {
    if (!selected) return;
    startTransition(async () => {
      try {
        await updateAvatar(selected);
        onNext();
      } catch {
        setError("아바타 저장에 실패했어요. 다시 시도해주세요.");
      }
    });
  };

  return (
    <div className="flex flex-col items-center pt-4 pb-4">
      {/* 스텝 레이블 */}
      <div className="mb-8 text-center">
        <p className="mb-1 select-none text-[72px] font-bold leading-none tracking-tighter text-white/[0.12]">
          01
        </p>
        <p className="mb-4 flex items-center justify-center gap-2.5 text-xs font-semibold uppercase tracking-[0.2em] text-[#2cc2f7]">
          <span className="h-px w-5 bg-[#2cc2f7]/50" />
          AVATAR
          <span className="h-px w-5 bg-[#2cc2f7]/50" />
        </p>
        <h1 className="mb-2 text-2xl font-bold tracking-tight text-white sm:text-3xl">
          프로필을 꾸며보세요
        </h1>
        <p className="text-sm leading-relaxed text-zinc-400">
          당신을 대표할 아바타를 선택하세요
        </p>
      </div>

      {/* 아바타 그리드 */}
      <div className="mb-10 grid grid-cols-5 gap-3">
        {AVATAR_PATHS.map(({ src, label }) => {
          const isSelected = selected === src;
          return (
            <button
              key={src}
              type="button"
              aria-label={label}
              aria-pressed={isSelected}
              onClick={() => setSelected(src)}
              className={`cursor-pointer relative h-18 w-14 overflow-hidden rounded-2xl border-2 transition-all duration-200 sm:h-24 sm:w-18 ${
                isSelected
                  ? "border-[#2cc2f7] shadow-[0_0_18px_rgba(44,194,247,0.45)] scale-105"
                  : "border-white/10 hover:border-white/30 hover:scale-[1.03]"
              }`}
            >
              <Image
                src={src}
                alt={label}
                fill
                className="object-cover"
                sizes="64px"
              />
            </button>
          );
        })}
      </div>

      {/* 선택 안내 */}
      <p
        className={`mb-6 text-xs text-zinc-500 transition-opacity duration-300 ${selected ? "opacity-0" : "opacity-100"}`}
      >
        아바타를 선택하면 다음 단계로 진행할 수 있어요
      </p>

      <Button
        type="button"
        variant="primary"
        shape="pill"
        disabled={!selected || isPending}
        onClick={handleNext}
        className="flex items-center gap-2 px-10 py-3.5 text-sm font-semibold shadow-[0_0_24px_rgba(44,194,247,0.3)] transition-shadow hover:shadow-[0_0_36px_rgba(44,194,247,0.5)] active:scale-[0.97]"
      >
        {isPending && <LoadingSpinner size="xs" />}
        다음으로
      </Button>
      {error && <p className="mt-3 text-xs text-red-400">{error}</p>}
    </div>
  );
}
