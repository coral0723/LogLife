"use client";

import { useEffect } from "react";
import { animate, motion, useMotionValue, useTransform } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { ListChecks } from "@phosphor-icons/react";

import { dashboardQueryKeys, fetchBucketCount } from "@/api/dashboard";

type Props = {
  isOpen: boolean;
};

export function BucketCountWidget({ isOpen }: Props) {
  const {
    data: bucketCount,
    isLoading: isBucketCountLoading,
    isError: isBucketCountError,
  } = useQuery({
    queryKey: dashboardQueryKeys.bucketCount(),
    queryFn: () => fetchBucketCount(),
    enabled: isOpen,
  });

  const animatedBucketCount = useMotionValue(0);
  const roundedBucketCount = useTransform(animatedBucketCount, (value) => Math.round(value));

  useEffect(() => {
    if (!isOpen || bucketCount === undefined) return;
    const controls = animate(animatedBucketCount, bucketCount, {
      duration: 0.8,
      ease: [0.16, 1, 0.3, 1],
    });
    return () => controls.stop();
  }, [isOpen, bucketCount, animatedBucketCount]);

  return (
    <section className="rounded-2xl border border-zinc-100 bg-zinc-50 p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-zinc-400">작성한 버킷리스트 수</p>
          {isBucketCountLoading ? (
            <div className="mt-3 h-9 w-16 animate-pulse rounded-md bg-zinc-200" />
          ) : (
            <p className="mt-2 flex items-baseline gap-1 text-zinc-900">
              <motion.span className="text-4xl font-bold tracking-tight">
                {isBucketCountError ? "-" : roundedBucketCount}
              </motion.span>
              {!isBucketCountError && (
                <span className="text-base font-medium text-zinc-400">개</span>
              )}
            </p>
          )}
        </div>
        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-amber-50 text-amber-600">
          <ListChecks size={20} weight="bold" />
        </div>
      </div>
    </section>
  );
}
