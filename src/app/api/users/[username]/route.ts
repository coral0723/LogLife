import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET(
  _req: Request,
  props: { params: Promise<{ username: string }> },
) {
  const { username } = await props.params;

  const user = await prisma.user.findUnique({
    where: { username },
    select: { id: true, username: true, name: true, image: true },
  });

  if (!user) {
    return NextResponse.json({ error: "찾을 수 없습니다." }, { status: 404 });
  }

  return NextResponse.json(user);
}
