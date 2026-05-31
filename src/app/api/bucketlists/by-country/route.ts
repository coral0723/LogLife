import { NextResponse } from "next/server";
import { z } from "zod";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

const querySchema = z.object({
  countryCode: z.string().min(2).max(3),
});

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
      countryCode: url.searchParams.get("countryCode"),
    });
  } catch {
    return NextResponse.json({ error: "잘못된 요청입니다." }, { status: 400 });
  }

  const items = await prisma.bucketList.findMany({
    where: { userId, countryCode: query.countryCode },
    select: {
      id: true,
      title: true,
      displayName: true,
      achieved: true,
      placeId: true,
      visibility: true,
      deadlineAt: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(items);
}
