"use client";

import { useRouter } from "next/navigation";

import { BucketDetailView } from "@/app/(afterLogin)/main/_components/BucketDetailView";

interface Props {
  bucketId: string;
}

export function ModalDetailClient({ bucketId }: Props) {
  const router = useRouter();

  return (
    <div className="fixed inset-0 z-70 bg-zinc-950">
      <BucketDetailView bucketId={bucketId} onBack={() => router.back()} />
    </div>
  );
}
