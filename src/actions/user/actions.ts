"use server";

import { z } from "zod";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { AVATAR_PATHS } from "@/lib/avatar";

const avatarPathSchema = z.enum(AVATAR_PATHS);

async function requireUserId(): Promise<string> {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) throw new Error("로그인이 필요합니다.");
  return userId;
}

export async function updateAvatar(avatarPath: string) {
  const userId = await requireUserId();
  const image = avatarPathSchema.parse(avatarPath);

  return prisma.user.update({
    where: { id: userId },
    data: { image },
    select: { image: true },
  });
}
