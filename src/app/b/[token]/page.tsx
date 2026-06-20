import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { QueryClient, HydrationBoundary, dehydrate } from "@tanstack/react-query";

import { auth } from "@/auth";
import { bucketQueryKeys } from "@/api/bucketlists";
import { areFriends } from "@/lib/friend/relation";
import { getBucketByShareToken } from "@/lib/bucketList/getBucketByShareToken";
import { getPlacePhotoUrl } from "@/lib/getPlacePhotoUrl";
import { BucketDetailView } from "@/components/bucket/BucketDetailView";
import { StarField } from "@/components/globe/StarField";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function BucketSharePage(
  props: { params: Promise<{ token: string }> },
) {
  const { token } = await props.params;
  const item = await getBucketByShareToken(token);

  if (!item) notFound();

  const session = await auth();
  const viewerId = session?.user?.id;
  const isOwner = viewerId === item.userId;

  let canView = item.visibility === "PUBLIC" || isOwner;
  if (!canView && item.visibility === "FRIENDS" && viewerId) {
    canView = await areFriends(viewerId, item.userId);
  }

  if (!canView) {
    return (
      <main className="relative min-h-[100dvh] bg-[#060d1f] flex items-center justify-center overflow-hidden">
        <StarField />
        <p className="relative z-10 text-zinc-400 text-sm">비공개 버킷리스트입니다.</p>
      </main>
    );
  }

  // userId는 서버 전용 — 클라이언트(setQueryData)로 직렬화되지 않도록 제거
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { userId, ...detail } = item;
  const queryClient = new QueryClient();
  queryClient.setQueryData(bucketQueryKeys.detail(detail.id), detail);
  const state = dehydrate(queryClient);
  const photoSrc = await getPlacePhotoUrl(item.placeId);

  return (
    <main className="relative min-h-[100dvh] bg-[#060d1f] flex items-end justify-center overflow-hidden">
      <StarField />
      <div className="relative z-10 w-full max-w-md h-[85vh] rounded-t-3xl bg-white overflow-hidden flex flex-col">
        <HydrationBoundary state={state}>
          <BucketDetailView bucketId={item.id} photoSrc={photoSrc ?? undefined} isOwner={isOwner} />
        </HydrationBoundary>
      </div>
    </main>
  );
}
