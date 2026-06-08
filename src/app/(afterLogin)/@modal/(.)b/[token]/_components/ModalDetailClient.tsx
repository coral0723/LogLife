"use client";

import { useRouter } from "next/navigation";

import { BucketDetailView } from "@/app/(afterLogin)/main/_components/BucketDetailView";

type Props = {
  bucketId: string;
  isOwner?: boolean;
}

export function ModalDetailClient({ bucketId, isOwner }: Props) {
  const router = useRouter();

  return (
    <div className="fixed inset-0 z-70 bg-zinc-950">
      <BucketDetailView bucketId={bucketId} onBack={() => router.back()} isOwner={isOwner} />
    </div>
  );
}
