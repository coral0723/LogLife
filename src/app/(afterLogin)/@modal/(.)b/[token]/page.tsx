import { notFound } from "next/navigation";
import { QueryClient, HydrationBoundary, dehydrate } from "@tanstack/react-query";

import { auth } from "@/auth";
import { bucketQueryKeys } from "@/api/bucketlists";
import { areFriends } from "@/lib/friend/relation";
import { getBucketByShareToken } from "@/lib/bucketList/getBucketByShareToken";
import { ModalDetailClient } from "./_components/ModalDetailClient";

export default async function BucketModalPage(
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

  if (!canView) notFound();

  // userId는 서버 전용 — 클라이언트(setQueryData)로 직렬화되지 않도록 제거
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { userId, ...detail } = item;
  const queryClient = new QueryClient();
  queryClient.setQueryData(bucketQueryKeys.detail(detail.id), detail);
  const state = dehydrate(queryClient);

  return (
    <HydrationBoundary state={state}>
      <ModalDetailClient bucketId={item.id} isOwner={isOwner} />
    </HydrationBoundary>
  );
}
