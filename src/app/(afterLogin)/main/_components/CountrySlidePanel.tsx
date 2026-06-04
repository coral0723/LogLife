"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Camera, CaretDown } from "@phosphor-icons/react";

import { getStatus, STATUS_CONFIG, VISIBILITY_CONFIG, type Visibility } from "@/lib/bucketStatus";
import { BucketDetailView, type BucketDetail } from "./BucketDetailView";

type BucketItem = {
  id: string;
  title: string;
  displayName: string;
  achieved: boolean;
  placeId: string;
  visibility: Visibility;
  deadlineAt: string | null;
};

type View =
  | { kind: "list" }
  | { kind: "loadingDetail"; itemId: string }
  | { kind: "detail"; detail: BucketDetail };

function PhotoCell({ placeId }: { placeId: string }) {
  const [error, setError] = useState(false);

  return (
    <div className="w-16 h-16 rounded-xl overflow-hidden bg-zinc-100 flex-shrink-0 flex items-center justify-center">
      {error ? (
        <Camera size={24} className="text-zinc-300" weight="regular" />
      ) : (
        <img
          src={`/api/places/photo?placeId=${placeId}`}
          alt=""
          className="w-full h-full object-cover"
          onError={() => setError(true)}
        />
      )}
    </div>
  );
}

interface Props {
  countryCode: string | null;
  onClose: () => void;
}

export function CountrySlidePanel({ countryCode, onClose }: Props) {
  const [items, setItems] = useState<BucketItem[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [view, setView] = useState<View>({ kind: "list" });
  const sentinelRef = useRef<HTMLDivElement>(null);
  const loadingMoreRef = useRef(false);

  const countryKoreanName = useMemo(() => {
    if (!countryCode) return null;
    try {
      return new Intl.DisplayNames(["ko"], { type: "region" }).of(countryCode) ?? countryCode;
    } catch {
      return countryCode;
    }
  }, [countryCode]);

  useEffect(() => {
    if (!countryCode) return;
    let active = true;
    setLoading(true);
    setItems([]);
    setNextCursor(null);
    setView({ kind: "list" });
    fetch(`/api/bucketlists/by-country?countryCode=${countryCode}`)
      .then((r) => r.json())
      .then(({ items: data, nextCursor: nc }: { items: BucketItem[]; nextCursor: string | null }) => {
        if (!active) return;
        setItems(data);
        setNextCursor(nc);
      })
      .catch(() => {
        if (!active) return;
        setItems([]);
      })
      .finally(() => {
        if (!active) return;
        setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [countryCode]);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el || !nextCursor) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || loadingMoreRef.current) return;
        loadingMoreRef.current = true;
        setLoadingMore(true);
        fetch(`/api/bucketlists/by-country?countryCode=${countryCode}&cursor=${nextCursor}`)
          .then((r) => r.json())
          .then(({ items: more, nextCursor: nc }: { items: BucketItem[]; nextCursor: string | null }) => {
            setItems((prev) => [...prev, ...more]);
            setNextCursor(nc);
          })
          .catch(() => {})
          .finally(() => {
            loadingMoreRef.current = false;
            setLoadingMore(false);
          });
      },
      { threshold: 0.1 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [countryCode, nextCursor]);

  const handleItemClick = async (itemId: string) => {
    setView({ kind: "loadingDetail", itemId });
    try {
      const res = await fetch(`/api/bucketlists/${itemId}`);
      if (!res.ok) throw new Error();
      const detail: BucketDetail = await res.json();
      setView({ kind: "detail", detail });
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
                    {loading &&
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

                    {!loading && items.length === 0 && (
                      <li className="flex items-center justify-center h-40 text-sm text-zinc-400">
                        등록된 버킷리스트가 없습니다.
                      </li>
                    )}

                    {!loading &&
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
                            <PhotoCell placeId={item.placeId} />
                          </li>
                        );
                      })}

                    <div ref={sentinelRef} className="h-1" />
                    {!loading && loadingMore && (
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
                    detail={view.detail}
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
