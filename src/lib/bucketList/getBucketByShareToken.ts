import { prisma } from "@/lib/prisma";
import type { BucketDetail } from "@/api/bucketlists";

// shareToken으로 조회. 없으면 null, visibility 판단은 호출자가 담당
export async function getBucketByShareToken(
  token: string,
): Promise<(BucketDetail & { userId: string }) | null> {
  const item = await prisma.bucketList.findUnique({
    where: { shareToken: token },
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
      countryCode: true,
      shareToken: true,
      userId: true,
    },
  });
  if (!item) return null;
  return {
    ...item,
    deadlineAt: item.deadlineAt?.toISOString() ?? null,
    achievedAt: item.achievedAt?.toISOString() ?? null,
  };
}
