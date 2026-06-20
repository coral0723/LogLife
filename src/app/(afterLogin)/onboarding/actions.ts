"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const avatarPathSchema = z
  .string()
  .regex(/^\/avatars\/[\w]+\.png$/, "유효하지 않은 아바타 경로입니다.");

async function requireUserId(): Promise<string> {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) throw new Error("로그인이 필요합니다.");
  return userId;
}

export async function updateAvatar(avatarPath: string) {
  const userId = await requireUserId();
  avatarPathSchema.parse(avatarPath);
  await prisma.user.update({
    where: { id: userId },
    data: { image: avatarPath },
  });
}

export async function completeOnboarding() {
  const userId = await requireUserId();
  await prisma.user.update({
    where: { id: userId },
    data: { isOnboarded: true },
  });
  revalidatePath("/main");
  redirect("/main");
}
