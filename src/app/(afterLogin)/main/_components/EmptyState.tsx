import Link from "next/link";

import { CirclePlusIcon } from "@/app/(afterLogin)/_components/CirclePlusIcon";

export function EmptyState() {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
      <Link
        href="/create"
        aria-label="첫 장소 추가하기"
        className="transition-opacity duration-200 hover:opacity-75"
      >
        <CirclePlusIcon size={96} />
      </Link>
      <p className="text-sm text-zinc-400">첫 버킷리스트를 추가해보세요</p>
    </div>
  );
}
