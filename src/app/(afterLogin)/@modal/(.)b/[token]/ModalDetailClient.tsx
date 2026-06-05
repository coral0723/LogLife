"use client";

import { useRouter } from "next/navigation";

import { BucketDetailView } from "@/app/(afterLogin)/main/_components/BucketDetailView";
import { type BucketDetail } from "@/api/bucketlists";

interface Props {
  detail: BucketDetail;
}

export function ModalDetailClient({ detail }: Props) {
  const router = useRouter();

  return (
    <div className="fixed inset-0 z-70 bg-zinc-950">
      <BucketDetailView detail={detail} onBack={() => router.back()} />
    </div>
  );
}
