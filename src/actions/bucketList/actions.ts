"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const visibilitySchema = z.enum(["PRIVATE", "FRIENDS", "PUBLIC"]);

const bucketListInputSchema = z.object({
  title: z.string().trim().min(1, "제목을 입력해주세요.").max(20),
  description: z.string().trim().max(1000).optional().nullable(),
  visibility: visibilitySchema.default("PRIVATE"),
  deadlineAt: z.coerce.date(),
  difficulty: z.number().int().min(1).max(5),
  excitement: z.number().int().min(1).max(5),
  placeId: z.string().min(1, "위치를 선택해주세요."),
  lat: z.number().gte(-90).lte(90),
  lng: z.number().gte(-180).lte(180),
  countryCode: z.string().min(2).max(3),

  displayName: z.string().min(1),
});

export type BucketListInput = z.infer<typeof bucketListInputSchema>;

async function requireUserId(): Promise<string> {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) throw new Error("로그인이 필요합니다.");
  return userId;
}

export async function createBucketList(input: BucketListInput) {
  const userId = await requireUserId();
  const data = bucketListInputSchema.parse(input);
  const created = await prisma.bucketList.create({
    data: { ...data, userId },
    select: { id: true, shareToken: true },
  });
  revalidatePath("/main");
  return created;
}

export async function updateBucketList(id: string, input: BucketListInput) {
  const userId = await requireUserId();
  const data = bucketListInputSchema.parse(input);
  const result = await prisma.bucketList.updateMany({
    where: { id, userId },
    data,
  });
  if (result.count === 0) {
    throw new Error("수정할 버킷리스트를 찾을 수 없습니다.");
  }
  revalidatePath("/main");
}

export async function deleteBucketList(id: string) {
  const userId = await requireUserId();
  const result = await prisma.bucketList.deleteMany({
    where: { id, userId },
  });
  if (result.count === 0) {
    throw new Error("삭제할 버킷리스트를 찾을 수 없습니다.");
  }
  revalidatePath("/main");
}

export async function updateDeadline(id: string, deadlineAt: Date | null) {
  const userId = await requireUserId();
  const parsed = z.coerce.date().nullable().parse(deadlineAt);
  const result = await prisma.bucketList.updateMany({
    where: { id, userId },
    data: { deadlineAt: parsed },
  });
  if (result.count === 0) {
    throw new Error("수정할 버킷리스트를 찾을 수 없습니다.");
  }
  revalidatePath("/main");
  return { deadlineAt: parsed };
}

export async function toggleAchieved(id: string) {
  const userId = await requireUserId();
  const current = await prisma.bucketList.findFirst({
    where: { id, userId },
    select: { achieved: true },
  });
  if (!current) {
    throw new Error("버킷리스트를 찾을 수 없습니다.");
  }
  const nextAchieved = !current.achieved;
  await prisma.bucketList.update({
    where: { id },
    data: {
      achieved: nextAchieved,
      achievedAt: nextAchieved ? new Date() : null,
    },
  });
  revalidatePath("/main");
  return { achieved: nextAchieved };
}
