"use client";

import { useRouter } from "next/navigation";
import { X } from "@phosphor-icons/react";

import { FriendsView } from "@/app/(afterLogin)/friends/_components/FriendsView";

export function FriendsModalClient() {
  const router = useRouter();

  return (
    <div className="fixed inset-0 z-70 flex flex-col bg-zinc-950 md:items-center md:justify-center">
      <div className="relative flex w-full flex-1 flex-col overflow-y-auto bg-white md:max-h-[90vh] md:max-w-lg md:flex-none md:rounded-3xl">
        <button
          type="button"
          onClick={() => router.back()}
          aria-label="닫기"
          className="absolute right-4 top-4 z-10 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-600"
        >
          <X size={20} weight="bold" />
        </button>
        <FriendsView />
      </div>
    </div>
  );
}
