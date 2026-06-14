import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET() {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }

  const requests = await prisma.friendship.findMany({
    where: { addresseeId: userId, status: "PENDING" },
    select: {
      id: true,
      createdAt: true,
      requester: { select: { id: true, username: true, name: true, image: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const items = requests.map((request) => ({
    friendshipId: request.id,
    id: request.requester.id,
    username: request.requester.username,
    name: request.requester.name,
    image: request.requester.image,
    createdAt: request.createdAt,
  }));

  return NextResponse.json({ items });
}
