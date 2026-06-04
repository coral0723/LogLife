import { notFound } from "next/navigation";

import { prisma } from "@/lib/prisma";
import type { BucketDetail } from "@/app/(afterLogin)/main/_components/BucketDetailView";
import { ModalDetailClient } from "./ModalDetailClient";

export default async function BucketModalPage(
  props: { params: Promise<{ token: string }> },
) {
  const { token } = await props.params;

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
    },
  });

  if (!item || item.visibility !== "PUBLIC") notFound();

  const detail: BucketDetail = {
    id: item.id,
    title: item.title,
    description: item.description,
    visibility: item.visibility,
    deadlineAt: item.deadlineAt?.toISOString() ?? null,
    achievedAt: item.achievedAt?.toISOString() ?? null,
    difficulty: item.difficulty,
    excitement: item.excitement,
    achieved: item.achieved,
    placeId: item.placeId,
    displayName: item.displayName,
    countryCode: item.countryCode,
    shareToken: item.shareToken,
  };

  return <ModalDetailClient detail={detail} />;
}
