"use client";

import { useState } from "react";
import { ShareNetwork } from "@phosphor-icons/react";

type Props = {
  username: string;
};

const BADGE_CLASSNAME =
  "fixed right-4 top-14 z-30 flex h-8 w-8 items-center justify-center rounded-3xl md:rounded-4xl border-2 border-[#A1A1AA] bg-[#F3F4F6] shadow-[0_8px_32px_rgba(0,0,0,0.12)] backdrop-blur-xl md:right-8 md:top-8 md:h-10 md:w-10 lg:right-14 lg:top-14";

export function ShareProfileButton({ username }: Props) {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/u/${username}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      alert("클립보드에 오류가 발생했습니다.");
    }
  };

  return (
    <div className={BADGE_CLASSNAME}>
      <button
        type="button"
        onClick={handleShare}
        aria-label="프로필 공유"
        className="flex h-full w-full items-center justify-center cursor-pointer transition-transform duration-150 active:scale-[0.98]"
      >
        <ShareNetwork weight="regular" className="text-[#7b7b81] w-4 h-4" />
      </button>
      {copied && (
        <span className="absolute right-0 top-11 whitespace-nowrap text-xs bg-[#2cc2f7] text-white px-2.5 py-1.5 rounded-lg shadow-lg">
          링크 복사됨
        </span>
      )}
    </div>
  );
}
