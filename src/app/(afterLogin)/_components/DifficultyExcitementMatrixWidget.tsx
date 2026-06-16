"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { useQuery } from "@tanstack/react-query";
import { Confetti } from "@phosphor-icons/react";

import { dashboardQueryKeys, fetchDifficultyExcitementMatrix } from "@/api/dashboard";
import {
  groupByQuadrant,
  QUADRANT_CONFIG,
  type DifficultyExcitementItem,
  type QuadrantKey,
} from "@/lib/bucketList/difficultyExcitementMatrix";
import { MatrixSlidePanel } from "./MatrixSlidePanel";

const MAX_VISIBLE_CHIPS_MOBILE = 2;
const MAX_VISIBLE_CHIPS_DESKTOP = 5;

type Props = {
  isOpen: boolean;
  username?: string;
};

export function DifficultyExcitementMatrixWidget({ isOpen, username }: Props) {
  const [selectedQuadrant, setSelectedQuadrant] = useState<QuadrantKey | null>(null);

  const {
    data: difficultyExcitementItems = [],
    isLoading: isDifficultyExcitementLoading,
    isError: isDifficultyExcitementError,
  } = useQuery({
    queryKey: dashboardQueryKeys.difficultyExcitement(username),
    queryFn: () => fetchDifficultyExcitementMatrix(username),
    enabled: isOpen,
  });

  const quadrantGroups = groupByQuadrant(difficultyExcitementItems);
  const selected = QUADRANT_CONFIG.find((quadrant) => quadrant.key === selectedQuadrant);

  return (
    <>
      <section className="rounded-2xl border border-zinc-100 bg-zinc-50 p-5">
        <p className="mb-3 text-sm text-zinc-400">난이도 × 설렘 매트릭스</p>

        {isDifficultyExcitementLoading ? (
          <div className="grid aspect-square grid-cols-2 grid-rows-2">
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
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#e0f7fe] text-[#2cc2f7]">
              <Confetti size={20} weight="bold" />
            </div>
            <p className="text-sm font-medium text-zinc-900">아직 표시할 항목이 없어요</p>
            <p className="text-xs text-zinc-400">새로운 버킷리스트를 추가해보세요</p>
          </div>
        ) : (
          <div className="relative aspect-square">
            <div className="grid h-full w-full grid-cols-2 grid-rows-2">
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
              {/* 세로축: 난이도 (위쪽 화살표) */}
              <div className="absolute left-1/2 top-2 bottom-0 w-px -translate-x-1/2 bg-zinc-400 md:top-3 md:w-0.5" />
              <div className="absolute left-1/2 top-0 h-0 w-0 -translate-x-1/2 border-x-[5px] border-b-8 border-x-transparent border-b-zinc-400 md:border-x-[7px] md:border-b-12" />
              <span className="absolute left-1/2 top-2 translate-x-2 text-[8px] font-medium text-zinc-400 md:top-3 md:translate-x-3 md:text-sm lg:text-base">
                난이도
              </span>

              {/* 가로축: 설렘 (오른쪽 화살표) */}
              <div className="absolute left-0 right-2 top-1/2 h-px -translate-y-1/2 bg-zinc-400 md:right-3 md:h-0.5" />
              <div className="absolute right-0 top-1/2 h-0 w-0 -translate-y-1/2 border-y-[5px] border-l-8 border-y-transparent border-l-zinc-400 md:border-y-[7px] md:border-l-12" />
              <span className="absolute right-2 top-1/2 translate-y-2 text-[8px] font-medium text-zinc-400 md:right-3 md:translate-y-3 md:text-sm lg:text-base">
                설렘
              </span>
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

// 대각선 그라데이션: 왼쪽 하단(연함) → 오른쪽 상단(진함)
const POSITION_STYLES: Record<
  Position,
  {
    rounded: string;
    bg: string;
    justify: string;
    items: string;
    chipsJustify: string;
    labelText: string;
  }
> = {
  "top-left": {
    rounded: "rounded-tl-2xl",
    bg: "bg-[#2cc2f7]/60",
    justify: "justify-start",
    items: "items-start",
    chipsJustify: "justify-start",
    labelText: "text-white",
  },
  "top-right": {
    rounded: "rounded-tr-2xl",
    bg: "bg-[#2cc2f7]/85",
    justify: "justify-start",
    items: "items-end",
    chipsJustify: "justify-end",
    labelText: "text-white",
  },
  "bottom-left": {
    rounded: "rounded-bl-2xl",
    bg: "bg-[#2cc2f7]/15",
    justify: "justify-end",
    items: "items-start",
    chipsJustify: "justify-start",
    labelText: "text-[#0369a1]",
  },
  "bottom-right": {
    rounded: "rounded-br-2xl",
    bg: "bg-[#2cc2f7]/35",
    justify: "justify-end",
    items: "items-end",
    chipsJustify: "justify-end",
    labelText: "text-[#0284c7]",
  },
};

type MatrixQuadrantCellProps = {
  label: string;
  items: DifficultyExcitementItem[];
  position: Position;
  onSelect: () => void;
};

function MatrixQuadrantCell({ label, items, position, onSelect }: MatrixQuadrantCellProps) {
  const visibleItems = items.slice(0, MAX_VISIBLE_CHIPS_DESKTOP);
  const mobileOverflow = items.length - MAX_VISIBLE_CHIPS_MOBILE;
  const desktopOverflow = items.length - MAX_VISIBLE_CHIPS_DESKTOP;
  const styles = POSITION_STYLES[position];
  const isBottom = position === "bottom-left" || position === "bottom-right";
  const hasItems = items.length > 0;

  const labelEl = (
    <span className={`text-sm font-bold md:text-lg lg:text-xl ${hasItems ? styles.labelText : "text-zinc-400"}`}>{label}</span>
  );

  const contentEl =
    items.length === 0 ? (
      <span className="text-xs text-zinc-400 md:text-base lg:text-lg">아직 없어요</span>
    ) : (
      <div className={`flex flex-wrap gap-1.5 md:gap-2 ${styles.chipsJustify}`}>
        {visibleItems.map((item, index) => (
          <span
            key={item.id}
            className={`max-w-full truncate rounded-full border font-medium border-zinc-200 bg-white/80 px-2 py-0.5 text-[11px] text-zinc-600 md:px-3 md:py-1 md:text-sm lg:text-base ${
              index >= MAX_VISIBLE_CHIPS_MOBILE ? "hidden md:inline-flex" : ""
            }`}
          >
            {item.title}
          </span>
        ))}
        {mobileOverflow > 0 && (
          <span className="text-[11px] font-medium text-zinc-400 md:hidden">
            +{mobileOverflow}개 더보기
          </span>
        )}
        {desktopOverflow > 0 && (
          <span className="hidden text-sm font-medium text-zinc-400 md:inline-flex lg:text-base">
            +{desktopOverflow}개 더보기
          </span>
        )}
      </div>
    );

  return (
    <button
      type="button"
      disabled={items.length === 0}
      onClick={onSelect}
      className={`flex h-full w-full flex-col gap-1.5 overflow-hidden p-3 text-left transition-transform md:gap-2 md:p-5 lg:p-6 ${styles.rounded} ${hasItems ? styles.bg : "bg-zinc-100"} ${styles.justify} ${styles.items} ${
        hasItems ? "active:scale-[0.98] cursor-pointer" : "cursor-default"
      }`}
    >
      {isBottom ? (
        <>
          {contentEl}
          {labelEl}
        </>
      ) : (
        <>
          {labelEl}
          {contentEl}
        </>
      )}
    </button>
  );
}
