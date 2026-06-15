import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { areFriends } from "@/lib/friend/relation";
import { getViewableVisibilities } from "@/lib/bucketList/visibility";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET(
  _req: Request,
  props: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  const viewerId = session?.user?.id;

  const { id } = await props.params;

  const item = await prisma.bucketList.findUnique({
    where: { id },
    select: {
      id: true,
      title: true,
      description: true,
      visibility: true,
      deadlineAt: true,
      achievedAt: true,
      difficulty: true,
      excitement: true,
      achieved: true,
      placeId: true,
      displayName: true,
      countryCode: true,
      shareToken: true,
      userId: true,
      user: { select: { username: true, name: true, image: true } },
    },
  });

  if (!item) {
    return NextResponse.json({ error: "찾을 수 없습니다." }, { status: 404 });
  }

  const isOwner = viewerId === item.userId;
  if (!isOwner) {
    const canSeeFriendsContent = viewerId ? await areFriends(viewerId, item.userId) : false;
    if (!getViewableVisibilities(canSeeFriendsContent).includes(item.visibility)) {
      return NextResponse.json({ error: "찾을 수 없습니다." }, { status: 404 });
    }
  }

  // userId는 서버 전용 — 클라이언트로 직렬화되지 않도록 제거
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { userId, ...detail } = item;
  return NextResponse.json(detail);
}
