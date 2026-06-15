import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { computeAchievedTogetherMoments } from "@/lib/friend/achievedTogetherMoments";
import { getAcceptedFriendIds } from "@/lib/friend/friendIds";
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

  const myAchieved = await prisma.bucketList.findMany({
    where: { userId, achieved: true, achievedAt: { not: null } },
    select: { id: true, placeId: true, title: true, displayName: true, achievedAt: true },
  });

  if (myAchieved.length === 0) {
    return NextResponse.json({ items: [] });
  }

  const placeIds = [...new Set(myAchieved.map((item) => item.placeId))];

  const friendAchieved = await prisma.bucketList.findMany({
    where: {
      userId: { in: friendIds },
      placeId: { in: placeIds },
      achieved: true,
      achievedAt: { not: null },
      visibility: { in: ["FRIENDS", "PUBLIC"] },
    },
    select: {
      id: true,
      placeId: true,
      title: true,
      displayName: true,
      achievedAt: true,
      userId: true,
      user: { select: { username: true, name: true } },
    },
  });

  const items = computeAchievedTogetherMoments(
    myAchieved.map((item) => ({ ...item, achievedAt: item.achievedAt! })),
    friendAchieved.map((item) => ({
      id: item.id,
      placeId: item.placeId,
      title: item.title,
      displayName: item.displayName,
      achievedAt: item.achievedAt!,
      friendId: item.userId,
      friendUsername: item.user.username,
      friendName: item.user.name,
    })),
  );

  return NextResponse.json({ items });
}
