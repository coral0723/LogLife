"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, ArrowUp, Confetti } from "@phosphor-icons/react";

import { dashboardQueryKeys, fetchDifficultyExcitementMatrix } from "@/api/dashboard";
import {
  groupByQuadrant,
  QUADRANT_CONFIG,
  type DifficultyExcitementItem,
  type QuadrantKey,
} from "@/lib/bucketList/difficultyExcitementMatrix";
import { MatrixSlidePanel } from "./MatrixSlidePanel";

const MAX_VISIBLE_CHIPS = 2;

type Props = {
  isOpen: boolean;
};

export function DifficultyExcitementMatrixWidget({ isOpen }: Props) {
  const [selectedQuadrant, setSelectedQuadrant] = useState<QuadrantKey | null>(null);

  const {
    data: difficultyExcitementItems = [],
    isLoading: isDifficultyExcitementLoading,
    isError: isDifficultyExcitementError,
  } = useQuery({
    queryKey: dashboardQueryKeys.difficultyExcitement(),
    queryFn: fetchDifficultyExcitementMatrix,
    enabled: isOpen,
  });

  const quadrantGroups = groupByQuadrant(difficultyExcitementItems);
  const selected = QUADRANT_CONFIG.find((quadrant) => quadrant.key === selectedQuadrant);

  return (
    <>
      <section className="rounded-2xl border border-zinc-100 bg-zinc-50 p-5">
        <p className="mb-3 text-sm text-zinc-400">난이도 × 설렘 매트릭스</p>

        {isDifficultyExcitementLoading ? (
          <div className="grid aspect-square grid-cols-2 grid-rows-2 gap-2">
            {QUADRANT_POSITIONS.map((position) => (
              <div
                key={position}
                className={`h-full w-full animate-pulse bg-zinc-200 ${POSITION_STYLES[position].rounded}`}
              />
            ))}
          </div>
        ) : isDifficultyExcitementError ? (
          <div className="flex aspect-square flex-col items-center justify-center gap-2 rounded-xl bg-white text-center">
            <p className="text-sm font-medium text-zinc-900">매트릭스를 불러오지 못했어요</p>
          </div>
        ) : difficultyExcitementItems.length === 0 ? (
          <div className="flex aspect-square flex-col items-center justify-center gap-2 rounded-xl bg-white text-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50 text-emerald-500">
              <Confetti size={20} weight="bold" />
            </div>
            <p className="text-sm font-medium text-zinc-900">아직 표시할 항목이 없어요</p>
            <p className="text-xs text-zinc-400">새로운 버킷리스트를 추가해보세요</p>
          </div>
        ) : (
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
        )}
      </section>

      {typeof document !== "undefined" &&
        createPortal(
          <MatrixSlidePanel
            label={selected?.label ?? null}
            items={selected ? quadrantGroups[selected.key] : []}
            onClose={() => setSelectedQuadrant(null)}
          />,
          document.body
        )}
    </>
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
