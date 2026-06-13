"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useQueryClient } from "@tanstack/react-query";
import { CaretDown } from "@phosphor-icons/react";

import { getStatus, STATUS_CONFIG, VISIBILITY_CONFIG } from "@/lib/bucketList/bucketStatus";
import type { DifficultyExcitementItem } from "@/lib/bucketList/difficultyExcitementMatrix";
import { fetchBucketDetail, bucketQueryKeys } from "@/api/bucketlists";
import { BucketDetailView } from "@/app/(afterLogin)/main/_components/BucketDetailView";
import { ImageWithFallback } from "./ImageWithFallback";

type View =
  | { kind: "list" }
  | { kind: "loadingDetail"; itemId: string }
  | { kind: "detail"; itemId: string };

type Props = {
  label: string | null;
  items: DifficultyExcitementItem[];
  onClose: () => void;
};

export function MatrixSlidePanel({ label, items, onClose }: Props) {
  const [view, setView] = useState<View>({ kind: "list" });
  const [prevLabel, setPrevLabel] = useState(label);
  const queryClient = useQueryClient();

  if (label !== prevLabel) {
    setPrevLabel(label);
    setView({ kind: "list" });
  }

  const handleItemClick = async (itemId: string) => {
    setView({ kind: "loadingDetail", itemId });
    try {
      await queryClient.ensureQueryData({
        queryKey: bucketQueryKeys.detail(itemId),
        queryFn: () => fetchBucketDetail(itemId),
      });
      setView((current) =>
        current.kind === "loadingDetail" && current.itemId === itemId
          ? { kind: "detail", itemId }
          : current
      );
    } catch {
      setView((current) =>
        current.kind === "loadingDetail" && current.itemId === itemId ? { kind: "list" } : current
      );
    }
  };

  const isDetail = view.kind === "detail";

  return (
    <AnimatePresence>
      {label && (
        <>
          <motion.div
            className="fixed inset-0 z-[60] bg-black/40"
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
            className="fixed bottom-0 left-0 right-0 z-[61] mx-auto flex h-[85vh] w-full max-w-md flex-col overflow-hidden rounded-t-3xl bg-white"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 32 }}
            onClick={(e) => e.stopPropagation()}
          >
            {!isDetail && (
              <>
                <div className="flex flex-shrink-0 flex-col items-center pt-3 pb-1">
                  <button
                    className="p-2 text-zinc-400 transition-colors hover:text-zinc-600"
                    onClick={onClose}
                    aria-label="닫기"
                  >
                    <CaretDown size={22} weight="bold" />
                  </button>
                </div>
                <div className="flex-shrink-0 px-5 pb-3">
                  <p className="text-sm font-semibold tracking-wide text-zinc-500">{label}</p>
                </div>
              </>
            )}

            <AnimatePresence mode="wait">
              {view.kind !== "detail" ? (
                <motion.div
                  key="list"
                  className="relative flex flex-1 flex-col overflow-hidden"
                  exit={{ x: "-20%", opacity: 0 }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                >
                  <ul className="flex-1 overflow-y-auto">
                    {items.length === 0 ? (
                      <li className="flex h-40 items-center justify-center text-sm text-zinc-400">
                        아직 등록된 항목이 없어요.
                      </li>
                    ) : (
                      items.map((item) => {
                        const status = getStatus({ achieved: false, deadlineAt: item.deadlineAt });
                        const { label: statusLabel, className: statusClassName } = STATUS_CONFIG[status];
                        const { label: visLabel, Icon: VisIcon } = VISIBILITY_CONFIG[item.visibility];

                        return (
                          <li
                            key={item.id}
                            className="flex cursor-pointer select-none items-center gap-4 border-b border-zinc-100 px-5 py-4 transition-colors hover:bg-zinc-50 active:scale-[0.99]"
                            onClick={() => handleItemClick(item.id)}
                          >
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-[15px] font-medium text-zinc-900">{item.title}</p>
                              <p className="mt-0.5 truncate text-[13px] text-zinc-400">{item.displayName}</p>
                              <div className="mt-1.5 flex items-center gap-2">
                                <span
                                  className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${statusClassName}`}
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
                              containerClassName="flex h-16 w-16 flex-shrink-0 items-center justify-center overflow-hidden rounded-xl bg-zinc-100"
                              iconSize={24}
                              iconClassName="text-zinc-300"
                            />
                          </li>
                        );
                      })
                    )}
                  </ul>

                  {view.kind === "loadingDetail" && (
                    <div className="absolute inset-0 flex items-center justify-center bg-white/70">
                      <div className="h-6 w-6 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-600" />
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
                    isOwner
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
