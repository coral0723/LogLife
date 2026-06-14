import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { getAcceptedFriendIds } from "@/lib/friend/friendIds";
import { computeHotPlaces } from "@/lib/friend/hotPlaces";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET() {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }

  const friendIds = await getAcceptedFriendIds(userId);
  if (friendIds.length === 0) {
    return NextResponse.json({ items: [] });
  }

  const groups = await prisma.bucketList.groupBy({
    by: ["countryCode", "displayName"],
    where: { userId: { in: friendIds }, visibility: { in: ["FRIENDS", "PUBLIC"] } },
    _count: { _all: true },
  });

  const items = computeHotPlaces(
    groups.map((group) => ({
      countryCode: group.countryCode,
      displayName: group.displayName,
      count: group._count._all,
    })),
  );

  return NextResponse.json({ items });
}
