"use server";

import { z } from "zod";

import { auth, signOut } from "@/auth";
import { prisma } from "@/lib/prisma";
import { AVATAR_PATHS } from "@/lib/avatar";

export async function logout() {
  await signOut({ redirectTo: "/" });
}

const avatarPathSchema = z.enum(AVATAR_PATHS);
const nicknameSchema = z.string().trim().min(1).max(15);

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

export async function updateNickname(nickname: string) {
  const userId = await requireUserId();
  const name = nicknameSchema.parse(nickname);

  const duplicate = await prisma.user.findFirst({
    where: { name, NOT: { id: userId } },
    select: { id: true },
  });
  if (duplicate) {
    throw new Error("이미 존재하는 닉네임입니다.");
  }

  return prisma.user.update({
    where: { id: userId },
    data: { name },
    select: { name: true },
  });
}

export async function deleteAccount() {
  const userId = await requireUserId();

  await prisma.user.delete({ where: { id: userId } });
}
