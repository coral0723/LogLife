"use client";

import Link from "next/link";
import { Users } from "@phosphor-icons/react";

const BADGE_CLASSNAME =
  "fixed right-4 top-14 z-30 flex h-8 w-8 items-center justify-center rounded-3xl md:rounded-4xl border-2 border-[#A1A1AA] bg-[#F3F4F6] shadow-[0_8px_32px_rgba(0,0,0,0.12)] backdrop-blur-xl md:right-8 md:top-8 md:h-10 md:w-10 lg:right-14 lg:top-14";

export function FriendBadge() {
  return (
    <Link
      href="/friends"
      aria-label="친구"
      className={`${BADGE_CLASSNAME} transition-transform duration-150 active:scale-[0.98]`}
    >
      <Users weight="regular" className="text-[#7b7b81] w-4 h-4" />
    </Link>
  );
}
