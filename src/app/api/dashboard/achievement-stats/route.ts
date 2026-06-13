import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { computeAchievementStats } from "@/lib/bucketList/achievementStats";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET() {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }

  const [totalCount, achievedItems] = await Promise.all([
    prisma.bucketList.count({ where: { userId } }),
    prisma.bucketList.findMany({
      where: { userId, achieved: true, achievedAt: { not: null } },
      select: { title: true, displayName: true, createdAt: true, achievedAt: true },
    }),
  ]);

  const stats = computeAchievementStats(
    achievedItems.map((item) => ({ ...item, achievedAt: item.achievedAt! })),
    totalCount
  );

  return NextResponse.json(stats);
}
