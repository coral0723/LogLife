import { NextResponse } from "next/server";
import { z } from "zod";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

const querySchema = z.object({ q: z.string().optional() });

type Relation = "none" | "pending_sent" | "pending_received" | "friends";

export async function GET(req: Request) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }

  const url = new URL(req.url);
  let query: z.infer<typeof querySchema>;
  try {
    query = querySchema.parse({ q: url.searchParams.get("q") ?? undefined });
  } catch {
    return NextResponse.json({ error: "잘못된 요청입니다." }, { status: 400 });
  }

  const q = query.q?.trim() ?? "";
  if (!q) {
    return NextResponse.json({ items: [] });
  }

  const users = await prisma.user.findMany({
    where: {
      id: { not: userId },
      OR: [
        { username: { contains: q, mode: "insensitive" } },
        { name: { contains: q, mode: "insensitive" } },
      ],
    },
    select: { id: true, username: true, name: true, image: true },
    take: 20,
  });

  if (users.length === 0) {
    return NextResponse.json({ items: [] });
  }

  const userIds = users.map((user) => user.id);
  const friendships = await prisma.friendship.findMany({
    where: {
      OR: [
        { requesterId: userId, addresseeId: { in: userIds } },
        { addresseeId: userId, requesterId: { in: userIds } },
      ],
    },
    select: { id: true, requesterId: true, addresseeId: true, status: true },
  });

  const relationByUserId = new Map<string, { relation: Relation; friendshipId: string }>();
  for (const friendship of friendships) {
    const otherId =
      friendship.requesterId === userId ? friendship.addresseeId : friendship.requesterId;
    const relation: Relation =
      friendship.status === "ACCEPTED"
        ? "friends"
        : friendship.requesterId === userId
          ? "pending_sent"
          : "pending_received";
    relationByUserId.set(otherId, { relation, friendshipId: friendship.id });
  }

  const items = users.map((user) => {
    const relation = relationByUserId.get(user.id);
    return {
      id: user.id,
      username: user.username,
      name: user.name,
      image: user.image,
      relation: relation?.relation ?? "none",
      ...(relation ? { friendshipId: relation.friendshipId } : {}),
    };
  });

  return NextResponse.json({ items });
}
