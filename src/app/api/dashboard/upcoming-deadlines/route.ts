import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

const LIMIT = 3;

export async function GET() {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }

  const items = await prisma.bucketList.findMany({
    where: { userId, achieved: false, deadlineAt: { gte: new Date() } },
    select: { id: true, title: true, displayName: true, deadlineAt: true },
    orderBy: { deadlineAt: "asc" },
    take: LIMIT,
  });

  return NextResponse.json({ items });
}
