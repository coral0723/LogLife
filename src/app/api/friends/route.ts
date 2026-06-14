import { NextResponse } from "next/server";
import { z } from "zod";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

const querySchema = z.object({
  cursor: z.string().optional(),
});

const PAGE_SIZE = 10;

export async function GET(req: Request) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }

  const url = new URL(req.url);
  let query: z.infer<typeof querySchema>;
  try {
    query = querySchema.parse({
      cursor: url.searchParams.get("cursor") ?? undefined,
    });
  } catch {
    return NextResponse.json({ error: "잘못된 요청입니다." }, { status: 400 });
  }

  const where = {
    status: "ACCEPTED" as const,
    OR: [{ requesterId: userId }, { addresseeId: userId }],
  };

  const [raw, totalCount] = await Promise.all([
    prisma.friendship.findMany({
      where,
      select: {
        id: true,
        requesterId: true,
        addresseeId: true,
        requester: { select: { id: true, username: true, name: true, image: true } },
        addressee: { select: { id: true, username: true, name: true, image: true } },
      },
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      take: PAGE_SIZE + 1,
      ...(query.cursor ? { cursor: { id: query.cursor }, skip: 1 } : {}),
    }),
    prisma.friendship.count({ where }),
  ]);

  const hasMore = raw.length === PAGE_SIZE + 1;
  const friendships = raw.slice(0, PAGE_SIZE);

  const items = friendships.map((friendship) => {
    const friend =
      friendship.requesterId === userId ? friendship.addressee : friendship.requester;
    return {
      friendshipId: friendship.id,
      id: friend.id,
      username: friend.username,
      name: friend.name,
      image: friend.image,
    };
  });

  const nextCursor = hasMore ? items[items.length - 1].friendshipId : null;

  return NextResponse.json({ items, nextCursor, totalCount });
}
