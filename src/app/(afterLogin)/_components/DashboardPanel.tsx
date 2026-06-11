"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, ArrowUp, CaretDown } from "@phosphor-icons/react";

import { getStatus, STATUS_CONFIG, VISIBILITY_CONFIG } from "@/lib/bucketList/bucketStatus";
import {
  groupByQuadrant,
  QUADRANT_CONFIG,
  type DifficultyExcitementItem,
  type QuadrantKey,
} from "@/lib/bucketList/difficultyExcitementMatrix";
import { BucketCountWidget } from "./BucketCountWidget";
import { ImageWithFallback } from "./ImageWithFallback";
import { UpcomingDeadlinesWidget } from "./UpcomingDeadlinesWidget";

const MAX_VISIBLE_CHIPS = 2;

const DUMMY_MATRIX_ITEMS: DifficultyExcitementItem[] = [
  {
    id: "dummy-1",
    title: "벚꽃 흩날리는 한강 피크닉",
    displayName: "여의도 한강공원",
    placeId: "dummy-place-1",
    difficulty: 2,
    excitement: 5,
    deadlineAt: null,
    visibility: "PUBLIC",
  },
  {
    id: "dummy-2",
    title: "부산 야시장 길거리 음식 투어",
    displayName: "부산 광안리",
    placeId: "dummy-place-2",
    difficulty: 2,
    excitement: 4,
    deadlineAt: "2026-09-12T00:00:00.000Z",
    visibility: "FRIENDS",
  },
  {
    id: "dummy-3",
    title: "스카이다이빙으로 첫 비행",
    displayName: "제주 협재",
    placeId: "dummy-place-3",
    difficulty: 5,
    excitement: 5,
    deadlineAt: null,
    visibility: "PUBLIC",
  },
  {
    id: "dummy-4",
    title: "아이슬란드 오로라 캠핑",
    displayName: "바트나요쿨 국립공원",
    placeId: "dummy-place-4",
    difficulty: 4,
    excitement: 5,
    deadlineAt: "2027-01-10T00:00:00.000Z",
    visibility: "PRIVATE",
  },
  {
    id: "dummy-5",
    title: "킬리만자로 정상에서 일출 보기",
    displayName: "탄자니아 킬리만자로",
    placeId: "dummy-place-5",
    difficulty: 5,
    excitement: 4,
    deadlineAt: "2026-04-01T00:00:00.000Z",
    visibility: "FRIENDS",
  },
  {
    id: "dummy-6",
    title: "정보처리기사 자격증 공부",
    displayName: "동네 스터디카페",
    placeId: "dummy-place-6",
    difficulty: 4,
    excitement: 2,
    deadlineAt: "2026-11-30T00:00:00.000Z",
    visibility: "PRIVATE",
  },
];

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

export function DashboardPanel({ isOpen, onClose }: Props) {
  const [selectedQuadrant, setSelectedQuadrant] = useState<QuadrantKey | null>(null);

  const quadrantGroups = groupByQuadrant(DUMMY_MATRIX_ITEMS);
  const selected = QUADRANT_CONFIG.find((quadrant) => quadrant.key === selectedQuadrant);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0 z-40 bg-black/40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
          />
          <motion.div
            className="fixed inset-y-0 left-0 z-40 flex w-full flex-col bg-white lg:max-w-3xl"
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 32 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex-shrink-0 px-5 pt-6 pb-3">
              <h2 className="text-lg font-semibold text-zinc-900">대시보드</h2>
            </div>

            <div className="flex-1 space-y-4 overflow-y-auto px-5 pb-28">
              <BucketCountWidget isOpen={isOpen} />

              <UpcomingDeadlinesWidget isOpen={isOpen} />

              {/* 난이도 x 설렘 2x2 매트릭스 */}
              <section className="rounded-2xl border border-zinc-100 bg-zinc-50 p-5">
                <p className="mb-3 text-sm text-zinc-400">난이도 × 설렘 매트릭스</p>
                <div className="relative aspect-square">
                  <div className="grid h-full w-full grid-cols-2 grid-rows-2 gap-2">
                    {QUADRANT_CONFIG.map((quadrant, index) => (
                      <MatrixQuadrantCell
                        key={quadrant.key}
                        label={quadrant.label}
                        items={quadrantGroups[quadrant.key]}
                        position={QUADRANT_POSITIONS[index]}
                        onSelect={() => setSelectedQuadrant(quadrant.key)}
                      />
                    ))}
                  </div>

                  {/* 좌표축 오버레이: 세로선(난이도↑) + 가로선(설렘→) */}
                  <div className="pointer-events-none absolute inset-0">
                    <div className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-zinc-300" />
                    <div className="absolute left-0 top-1/2 h-px w-full -translate-y-1/2 bg-zinc-300" />

                    <div className="absolute left-1/2 top-0 flex items-start gap-1">
                      <ArrowUp size={14} weight="bold" className="text-zinc-400" />
                      <span className="text-[10px] font-medium text-zinc-400 sm:text-xs lg:text-sm">난이도</span>
                    </div>

                    <div className="absolute right-0 top-1/2 flex flex-col items-end gap-0.5">
                      <ArrowRight size={14} weight="bold" className="text-zinc-400" />
                      <span className="text-[10px] font-medium text-zinc-400 sm:text-xs lg:text-sm">설렘</span>
                    </div>
                  </div>
                </div>
              </section>

              {/* 달성 통계 */}
              <section className="space-y-3 rounded-2xl border border-zinc-100 bg-zinc-50 p-5">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-zinc-400">평균 달성 소요 기간</span>
                  <span className="font-medium text-zinc-900">-</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-zinc-400">가장 오래 미룬 항목</span>
                  <span className="font-medium text-zinc-900">-</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-zinc-400">달성이 빠른 카테고리</span>
                  <span className="font-medium text-zinc-900">-</span>
                </div>
              </section>
            </div>
          </motion.div>

          <MatrixSlidePanel
            label={selected?.label ?? null}
            items={selected ? quadrantGroups[selected.key] : []}
            onClose={() => setSelectedQuadrant(null)}
          />
        </>
      )}
    </AnimatePresence>
  );
}

type Position = "top-left" | "top-right" | "bottom-left" | "bottom-right";

const QUADRANT_POSITIONS: Position[] = ["top-left", "top-right", "bottom-left", "bottom-right"];

const POSITION_STYLES: Record<
  Position,
  { rounded: string; bg: string; justify: string; items: string; chipsJustify: string }
> = {
  "top-left": {
    rounded: "rounded-tl-2xl",
    bg: "bg-sky-100",
    justify: "justify-start",
    items: "items-start",
    chipsJustify: "justify-start",
  },
  "top-right": {
    rounded: "rounded-tr-2xl",
    bg: "bg-orange-100",
    justify: "justify-start",
    items: "items-end",
    chipsJustify: "justify-end",
  },
  "bottom-left": {
    rounded: "rounded-bl-2xl",
    bg: "bg-sky-50",
    justify: "justify-end",
    items: "items-start",
    chipsJustify: "justify-start",
  },
  "bottom-right": {
    rounded: "rounded-br-2xl",
    bg: "bg-amber-50",
    justify: "justify-end",
    items: "items-end",
    chipsJustify: "justify-end",
  },
};

type MatrixQuadrantCellProps = {
  label: string;
  items: DifficultyExcitementItem[];
  position: Position;
  onSelect: () => void;
};

function MatrixQuadrantCell({ label, items, position, onSelect }: MatrixQuadrantCellProps) {
  const visibleItems = items.slice(0, MAX_VISIBLE_CHIPS);
  const overflowCount = items.length - visibleItems.length;
  const styles = POSITION_STYLES[position];

  return (
    <button
      type="button"
      disabled={items.length === 0}
      onClick={onSelect}
      className={`flex h-full w-full flex-col gap-1.5 overflow-hidden p-3 text-left transition-transform sm:p-4 ${styles.rounded} ${styles.bg} ${styles.justify} ${styles.items} ${
        items.length > 0 ? "active:scale-[0.98]" : "cursor-default"
      }`}
    >
      <span className="text-sm font-bold text-zinc-700 sm:text-base lg:text-lg">{label}</span>
      {items.length === 0 ? (
        <span className="text-xs text-zinc-400 sm:text-sm lg:text-base">아직 없어요</span>
      ) : (
        <div className={`flex flex-wrap gap-1 ${styles.chipsJustify}`}>
          {visibleItems.map((item) => (
            <span
              key={item.id}
              className="max-w-full truncate rounded-full bg-white/70 px-2 py-0.5 text-[11px] text-zinc-600 sm:text-xs lg:text-sm"
            >
              {item.title}
            </span>
          ))}
          {overflowCount > 0 && (
            <span className="text-[11px] font-medium text-zinc-500 sm:text-xs lg:text-sm">+{overflowCount}개 더보기</span>
          )}
        </div>
      )}
    </button>
  );
}

type MatrixSlidePanelProps = {
  label: string | null;
  items: DifficultyExcitementItem[];
  onClose: () => void;
};

function MatrixSlidePanel({ label, items, onClose }: MatrixSlidePanelProps) {
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
                    <li key={item.id} className="flex items-center gap-4 border-b border-zinc-100 px-5 py-4">
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
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
