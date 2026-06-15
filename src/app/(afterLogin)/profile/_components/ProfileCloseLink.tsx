"use client";

import Link from "next/link";
import { X } from "@phosphor-icons/react";

type Props = {
  href?: string;
};

export function ProfileCloseLink({ href = "/main" }: Props) {
  return (
    <Link
      href={href}
      aria-label="닫기"
      className="absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-600"
    >
      <X size={20} weight="bold" />
    </Link>
  );
}
