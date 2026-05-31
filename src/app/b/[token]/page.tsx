import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { prisma } from "@/lib/prisma";
import type { BucketDetail } from "@/app/(afterLogin)/main/_components/BucketDetailView";
import { BucketDetailView } from "@/app/(afterLogin)/main/_components/BucketDetailView";
import { StarField } from "@/app/(afterLogin)/main/_components/StarField";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

async function getPlacePhotoUrl(placeId: string): Promise<string | null> {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey) return null;
  try {
    const detailsRes = await fetch(
      `https://places.googleapis.com/v1/places/${encodeURIComponent(placeId)}`,
      {
        headers: {
          "X-Goog-Api-Key": apiKey,
          "X-Goog-FieldMask": "photos",
        },
        next: { revalidate: 86400 },
      },
    );
    if (!detailsRes.ok) return null;
    const data = (await detailsRes.json()) as { photos?: { name: string }[] };
    const photoName = data.photos?.[0]?.name;
    if (!photoName) return null;

    // skipHttpRedirect=true → JSON { photoUri } 반환 (API key 클라이언트 미노출)
    const mediaRes = await fetch(
      `https://places.googleapis.com/v1/${photoName}/media?maxHeightPx=800&skipHttpRedirect=true&key=${apiKey}`,
      { next: { revalidate: 86400 } },
    );
    if (!mediaRes.ok) return null;
    const { photoUri } = (await mediaRes.json()) as { photoUri?: string };
    return photoUri ?? null;
  } catch {
    return null;
  }
}

export default async function BucketSharePage(
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
      cityName: true,
      admin1Code: true,
      countryCode: true,
      shareToken: true,
    },
  });

  if (!item) notFound();

  if (item.visibility !== "PUBLIC") {
    return (
      <main className="relative min-h-[100dvh] bg-[#060d1f] flex items-center justify-center overflow-hidden">
        <StarField />
        <p className="relative z-10 text-zinc-400 text-sm">
          비공개 버킷리스트입니다.
        </p>
      </main>
    );
  }

  const photoSrc = await getPlacePhotoUrl(item.placeId);

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
    cityName: item.cityName,
    admin1Code: item.admin1Code,
    countryCode: item.countryCode,
    shareToken: item.shareToken,
  };

  return (
    <main className="relative min-h-[100dvh] bg-[#060d1f] flex items-end justify-center overflow-hidden">
      <StarField />
      <div className="relative z-10 w-full max-w-md h-[85vh] rounded-t-3xl bg-white overflow-hidden flex flex-col">
        <BucketDetailView detail={detail} photoSrc={photoSrc ?? undefined} />
      </div>
    </main>
  );
}
