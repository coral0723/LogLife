"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CaretDown } from "@phosphor-icons/react";
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";

import { getStatus, STATUS_CONFIG, VISIBILITY_CONFIG } from "@/lib/bucketStatus";
import { ImageWithFallback } from "@/app/(afterLogin)/_components/ImageWithFallback";
import { BucketDetailView } from "./BucketDetailView";
import {
  fetchBucketsByCountry,
  fetchBucketDetail,
  bucketQueryKeys,
  type BucketsByCountryPage,
} from "@/api/bucketlists";

type View =
  | { kind: "list" }
  | { kind: "loadingDetail"; itemId: string }
  | { kind: "detail"; itemId: string };

interface Props {
  countryCode: string | null;
  onClose: () => void;
}

export function CountrySlidePanel({ countryCode, onClose }: Props) {
  const [view, setView] = useState<View>({ kind: "list" });
  const sentinelRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = useInfiniteQuery({
    queryKey: bucketQueryKeys.byCountry(countryCode ?? ""),
    queryFn: ({ pageParam }) =>
      fetchBucketsByCountry(countryCode!, pageParam ?? undefined),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage: BucketsByCountryPage) => lastPage.nextCursor ?? undefined,
    enabled: !!countryCode,
  });

  const items = data?.pages.flatMap((page) => page.items) ?? [];

  const countryKoreanName = useMemo(() => {
    if (!countryCode) return null;
    try {
      return new Intl.DisplayNames(["ko"], { type: "region" }).of(countryCode) ?? countryCode;
    } catch {
      return countryCode;
    }
  }, [countryCode]);

  useEffect(() => {
    setView({ kind: "list" });
  }, [countryCode]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 }
    );
    io.observe(sentinel);
    return () => io.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const handleItemClick = async (itemId: string) => {
    setView({ kind: "loadingDetail", itemId });
    try {
      await queryClient.ensureQueryData({
        queryKey: bucketQueryKeys.detail(itemId),
        queryFn: () => fetchBucketDetail(itemId),
      });
      setView({ kind: "detail", itemId });
    } catch {
      setView({ kind: "list" });
    }
  };

  const isDetail = view.kind === "detail";

  return (
    <AnimatePresence>
      {countryCode && (
        <>
          <motion.div
            className="fixed inset-0 bg-black/40 z-[60]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
          />
          <motion.div
            className="fixed bottom-0 left-0 right-0 mx-auto w-full max-w-md h-[85vh] rounded-t-3xl z-[61] flex flex-col overflow-hidden bg-white"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 32 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* 헤더 — 목록 모드에서만 표시 */}
            {!isDetail && (
              <>
                <div className="flex flex-col items-center pt-3 pb-1 flex-shrink-0">
                  <button
                    className="p-2 text-zinc-400 hover:text-zinc-600 transition-colors"
                    onClick={onClose}
                    aria-label="닫기"
                  >
                    <CaretDown size={22} weight="bold" />
                  </button>
                </div>
                <div className="px-5 pb-3 flex-shrink-0">
                  <p className="text-sm font-semibold tracking-wide text-zinc-500">
                    {countryKoreanName ?? countryCode}
                  </p>
                </div>
              </>
            )}

            {/* 콘텐츠 영역 */}
            <AnimatePresence mode="wait">
              {view.kind !== "detail" ? (
                <motion.div
                  key="list"
                  className="flex-1 overflow-hidden flex flex-col relative"
                  exit={{ x: "-20%", opacity: 0 }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                >
                  <ul className="overflow-y-auto flex-1">
                    {isLoading &&
                      [0, 1, 2].map((i) => (
                        <li
                          key={i}
                          className="flex items-center gap-4 px-5 py-4 border-b border-zinc-100"
                        >
                          <div className="flex-1 space-y-2">
                            <div className="h-4 bg-zinc-100 rounded animate-pulse w-3/4" />
                            <div className="h-3 bg-zinc-100 rounded animate-pulse w-1/2" />
                            <div className="h-3 bg-zinc-100 rounded animate-pulse w-1/3" />
                          </div>
                          <div className="w-16 h-16 rounded-xl bg-zinc-100 animate-pulse flex-shrink-0" />
                        </li>
                      ))}

                    {!isLoading && items.length === 0 && (
                      <li className="flex items-center justify-center h-40 text-sm text-zinc-400">
                        등록된 버킷리스트가 없습니다.
                      </li>
                    )}

                    {!isLoading &&
                      items.map((item) => {
                        const status = getStatus(item);
                        const { label: statusLabel, className: statusClassName } = STATUS_CONFIG[status];
                        const { label: visLabel, Icon: VisIcon } = VISIBILITY_CONFIG[item.visibility];

                        return (
                          <li
                            key={item.id}
                            className="flex items-center gap-4 px-5 py-4 border-b border-zinc-100 cursor-pointer hover:bg-zinc-50 active:scale-[0.99] transition-colors select-none"
                            onClick={() => handleItemClick(item.id)}
                          >
                            <div className="flex-1 min-w-0">
                              <p className="text-[15px] font-medium text-zinc-900 truncate">
                                {item.title}
                              </p>
                              <p className="text-[13px] text-zinc-400 truncate mt-0.5">
                                {item.displayName}
                              </p>
                              <div className="flex items-center gap-2 mt-1.5">
                                <span
                                  className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium ${statusClassName}`}
                                >
                                  {statusLabel}
                                </span>
                                <span className="flex items-center gap-1 text-[11px] text-zinc-400">
                                  <VisIcon size={12} weight="regular" />
                                  {visLabel}
                                </span>
                              </div>
                            </div>
                            <ImageWithFallback
                              src={`/api/places/photo?placeId=${item.placeId}`}
                              containerClassName="w-16 h-16 rounded-xl overflow-hidden bg-zinc-100 flex-shrink-0 flex items-center justify-center"
                              iconSize={24}
                              iconClassName="text-zinc-300"
                            />
                          </li>
                        );
                      })}

                    <div ref={sentinelRef} className="h-1" />
                    {!isLoading && isFetchingNextPage && (
                      <li className="flex items-center justify-center py-4">
                        <div className="h-4 w-4 rounded-full border-2 border-zinc-300 border-t-zinc-600 animate-spin" />
                      </li>
                    )}
                  </ul>

                  {/* 상세 로딩 오버레이 */}
                  {view.kind === "loadingDetail" && (
                    <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
                      <div className="h-6 w-6 rounded-full border-2 border-zinc-300 border-t-zinc-600 animate-spin" />
                    </div>
                  )}
                </motion.div>
              ) : (
                <motion.div
                  key="detail"
                  className="flex-1 overflow-hidden"
                  initial={{ x: "100%", opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: "100%", opacity: 0 }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                >
                  <BucketDetailView
                    bucketId={view.itemId}
                    onBack={() => setView({ kind: "list" })}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
