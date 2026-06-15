import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { computeCommonBucketMatches } from "@/lib/friend/commonBucketMatches";
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

  const myItems = await prisma.bucketList.findMany({
    where: { userId },
    select: { id: true, placeId: true, title: true, displayName: true, achieved: true },
  });

  if (myItems.length === 0) {
    return NextResponse.json({ items: [] });
  }

  const placeIds = [...new Set(myItems.map((item) => item.placeId))];

  const friendItems = await prisma.bucketList.findMany({
    where: {
      userId: { in: friendIds },
      placeId: { in: placeIds },
      visibility: { in: ["FRIENDS", "PUBLIC"] },
    },
    select: {
      id: true,
      placeId: true,
      title: true,
      displayName: true,
      achieved: true,
      userId: true,
      user: { select: { username: true, name: true } },
    },
  });

  const items = computeCommonBucketMatches(
    myItems,
    friendItems.map((item) => ({
      id: item.id,
      placeId: item.placeId,
      title: item.title,
      displayName: item.displayName,
      achieved: item.achieved,
      friendId: item.userId,
      friendUsername: item.user.username,
      friendName: item.user.name,
    })),
  );

  return NextResponse.json({ items });
}
