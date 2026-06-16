import { NextResponse } from "next/server";

import { auth } from "@/auth";
import type { Visibility } from "@/lib/bucketList/bucketStatus";
import { getViewableVisibilities } from "@/lib/bucketList/visibility";
import { areFriends } from "@/lib/friend/relation";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const session = await auth();
  const viewerId = session?.user?.id;

  const username = new URL(req.url).searchParams.get("username");

  let userId: string;
  let visibilityFilter: { in: Visibility[] } | undefined;

  if (username) {
    const target = await prisma.user.findUnique({ where: { username }, select: { id: true } });
    if (!target) {
      return NextResponse.json({ error: "찾을 수 없습니다." }, { status: 404 });
    }

    const isSelf = viewerId === target.id;
    const canSeeFriends = isSelf || (viewerId ? await areFriends(viewerId, target.id) : false);
    userId = target.id;
    visibilityFilter = { in: getViewableVisibilities(canSeeFriends) };
  } else {
    if (!viewerId) {
      return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
    }
    userId = viewerId;
  }

  const count = await prisma.bucketList.count({
    where: { userId, ...(visibilityFilter ? { visibility: visibilityFilter } : {}) },
  });

  return NextResponse.json({ count });
}
