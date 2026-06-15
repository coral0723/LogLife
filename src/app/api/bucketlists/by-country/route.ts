import { NextResponse } from "next/server";
import { z } from "zod";

import { auth } from "@/auth";
import { areFriends } from "@/lib/friend/relation";
import { getViewableVisibilities } from "@/lib/bucketList/visibility";
import type { Visibility } from "@/lib/bucketList/bucketStatus";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

const querySchema = z.object({
  countryCode: z.string().min(2).max(3).transform((v) => v.toUpperCase()),
  cursor: z.string().optional(),
  username: z.string().optional(),
});

const PAGE_SIZE = 10;

export async function GET(req: Request) {
  const session = await auth();
  const viewerId = session?.user?.id;

  const url = new URL(req.url);
  let query: z.infer<typeof querySchema>;
  try {
    query = querySchema.parse({
      countryCode: url.searchParams.get("countryCode"),
      cursor: url.searchParams.get("cursor") ?? undefined,
      username: url.searchParams.get("username") ?? undefined,
    });
  } catch {
    return NextResponse.json({ error: "잘못된 요청입니다." }, { status: 400 });
  }

  let userId: string;
  let visibilityFilter: { in: Visibility[] } | undefined;

  if (query.username) {
    const target = await prisma.user.findUnique({
      where: { username: query.username },
      select: { id: true },
    });
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

  const raw = await prisma.bucketList.findMany({
    where: {
      userId,
      countryCode: query.countryCode,
      ...(visibilityFilter ? { visibility: visibilityFilter } : {}),
    },
    select: {
      id: true,
      title: true,
      displayName: true,
      achieved: true,
      placeId: true,
      visibility: true,
      deadlineAt: true,
    },
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    take: PAGE_SIZE + 1,
    ...(query.cursor ? { cursor: { id: query.cursor }, skip: 1 } : {}),
  });

  const hasMore = raw.length === PAGE_SIZE + 1;
  const items = raw.slice(0, PAGE_SIZE);
  const nextCursor = hasMore ? items[items.length - 1].id : null;

  return NextResponse.json({ items, nextCursor });
}
