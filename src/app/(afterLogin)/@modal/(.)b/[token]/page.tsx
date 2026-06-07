import { notFound } from "next/navigation";
import { QueryClient, HydrationBoundary, dehydrate } from "@tanstack/react-query";

import { bucketQueryKeys } from "@/api/bucketlists";
import { getBucketByShareToken } from "@/lib/bucketList/getBucketByShareToken";
import { ModalDetailClient } from "./_components/ModalDetailClient";

export default async function BucketModalPage(
  props: { params: Promise<{ token: string }> },
) {
  const { token } = await props.params;
  const item = await getBucketByShareToken(token);
  if (!item || item.visibility !== "PUBLIC") notFound();

  const queryClient = new QueryClient();
  queryClient.setQueryData(bucketQueryKeys.detail(item.id), item);
  const state = dehydrate(queryClient);

  return (
    <HydrationBoundary state={state}>
      <ModalDetailClient bucketId={item.id} />
    </HydrationBoundary>
  );
}
