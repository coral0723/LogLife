"use server";

import { z } from "zod";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const targetIdSchema = z.object({ addresseeId: z.string().min(1) });

async function requireUserId(): Promise<string> {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) throw new Error("로그인이 필요합니다.");
  return userId;
}

export async function sendFriendRequest(
  addresseeId: string,
): Promise<{ status: "PENDING" | "ACCEPTED" }> {
  const userId = await requireUserId();
  const { addresseeId: targetId } = targetIdSchema.parse({ addresseeId });
  if (targetId === userId) {
    throw new Error("자신에게는 친구 요청을 보낼 수 없습니다.");
  }

  const existing = await prisma.friendship.findFirst({
    where: {
      OR: [
        { requesterId: userId, addresseeId: targetId },
        { requesterId: targetId, addresseeId: userId },
      ],
    },
  });

  if (existing) {
    if (existing.status === "ACCEPTED") {
      throw new Error("이미 친구입니다.");
    }
    if (existing.requesterId === userId) {
      throw new Error("이미 요청을 보냈습니다.");
    }
    // 상대방이 이미 보낸 PENDING 요청 → 자동 수락 (상호 요청)
    await prisma.friendship.update({
      where: { id: existing.id },
      data: { status: "ACCEPTED", respondedAt: new Date() },
    });
    return { status: "ACCEPTED" };
  }

  await prisma.friendship.create({
    data: { requesterId: userId, addresseeId: targetId, status: "PENDING" },
  });
  return { status: "PENDING" };
}

export async function acceptFriendRequest(friendshipId: string): Promise<void> {
  const userId = await requireUserId();
  const result = await prisma.friendship.updateMany({
    where: { id: friendshipId, addresseeId: userId, status: "PENDING" },
    data: { status: "ACCEPTED", respondedAt: new Date() },
  });
  if (result.count === 0) {
    throw new Error("요청을 찾을 수 없습니다.");
  }
}

export async function declineFriendRequest(friendshipId: string): Promise<void> {
  const userId = await requireUserId();
  const result = await prisma.friendship.deleteMany({
    where: { id: friendshipId, addresseeId: userId, status: "PENDING" },
  });
  if (result.count === 0) {
    throw new Error("요청을 찾을 수 없습니다.");
  }
}
