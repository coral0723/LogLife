import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET(
  _req: Request,
  props: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }

  const { id } = await props.params;

  const item = await prisma.bucketList.findFirst({
    where: { id, userId },
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
      cityName: true,
      admin1Code: true,
      countryCode: true,
      shareToken: true,
    },
  });

  if (!item) {
    return NextResponse.json({ error: "찾을 수 없습니다." }, { status: 404 });
  }

  return NextResponse.json(item);
}
