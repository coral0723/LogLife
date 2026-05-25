import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

import { GlobeClient } from "./_components/GlobeClient";

export default async function MainPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const pins = await prisma.bucketList.findMany({
    where: { userId: session.user.id },
    select: {
      id: true,
      title: true,
      lat: true,
      lng: true,
      achieved: true,
      displayName: true,
    },
  });

  return (
    <main className="relative h-dvh w-full overflow-hidden">
      <GlobeClient pins={pins} />
      <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-44 bg-linear-to-t from-[#110e09]/70 to-transparent" />
      {pins.length === 0 && <EmptyState />}
    </main>
  );
}

function EmptyState() {
  return (
    <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-4">
      <p className="text-sm text-zinc-400">아직 등록한 장소가 없어요.</p>
      <Link
        href="/create"
        className="pointer-events-auto rounded-full border border-amber-400/50 px-5 py-2 text-sm font-medium text-amber-400 transition-colors duration-200 hover:bg-amber-400/10"
      >
        첫 장소 추가하기
      </Link>
    </div>
  );
}
