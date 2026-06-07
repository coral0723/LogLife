import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { buildCountryPins } from "@/lib/countryPins";
import { prisma } from "@/lib/prisma";

import { BottomNav } from "../_components/BottomNav";
import { EmptyState } from "./_components/EmptyState";
import { GlobeClient } from "./_components/GlobeClient";
import { StarField } from "./_components/StarField";

export default async function MainPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const userId = session.user.id;

  const [byCountry, byAchieved, byExpired] = await Promise.all([
    prisma.bucketList.groupBy({
      by: ["countryCode"],
      where: { userId },
      _count: { _all: true },
    }),
    prisma.bucketList.groupBy({
      by: ["countryCode"],
      where: { userId, achieved: true },
      _count: { _all: true },
    }),
    prisma.bucketList.groupBy({
      by: ["countryCode"],
      where: {
        userId,
        achieved: false,
        deadlineAt: { lt: new Date(new Date().setUTCHours(0, 0, 0, 0)) },
      },
      _count: { _all: true },
    }),
  ]);

  const pins = buildCountryPins(byCountry, byAchieved, byExpired);

  return (
    <main className="relative h-dvh w-full overflow-hidden bg-[#060d1f]">
      <StarField />
      {pins.length > 0 ? (
        <GlobeClient pins={pins} />
      ) : (
        <EmptyState />
      )}
      <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-44 bg-linear-to-t from-[#060d1f]/70 to-transparent" />
      {pins.length > 0 && <BottomNav />}
    </main>
  );
}
