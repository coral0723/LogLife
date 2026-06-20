import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { buildCountryPins } from "@/lib/countryPins";
import { prisma } from "@/lib/prisma";

import { BottomNav } from "../_components/BottomNav";
import { FriendBadge } from "../_components/FriendBadge";
import { ProfileBadge } from "../_components/ProfileBadge";
import { GlobeClient } from "./_components/GlobeClient";
import { StarField } from "./_components/StarField";

export default async function MainPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const userId = session.user.id;

  const [user, byCountry, byAchieved, byExpired] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId }, select: { isOnboarded: true } }),
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

  if (!user?.isOnboarded) redirect("/onboarding");

  const pins = buildCountryPins(byCountry, byAchieved, byExpired);

  return (
    <main className="relative h-dvh w-full overflow-hidden bg-[#060d1f]">
      <StarField />
      <GlobeClient pins={pins} />
      <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-44 bg-linear-to-t from-[#060d1f]/70 to-transparent" />
      <ProfileBadge />
      <FriendBadge />
      <BottomNav />
    </main>
  );
}
