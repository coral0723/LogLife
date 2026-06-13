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

  const items = await prisma.bucketList.findMany({
    where: { userId, achieved: false },
    select: {
      id: true,
      title: true,
      displayName: true,
      placeId: true,
      difficulty: true,
      excitement: true,
      deadlineAt: true,
      visibility: true,
    },
  });

  return NextResponse.json({ items });
}
