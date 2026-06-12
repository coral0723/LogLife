"use client";

import { AnimatePresence, motion } from "framer-motion";

import { BucketCountWidget } from "./BucketCountWidget";
import { DifficultyExcitementMatrixWidget } from "./DifficultyExcitementMatrixWidget";
import { UpcomingDeadlinesWidget } from "./UpcomingDeadlinesWidget";

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

export function DashboardPanel({ isOpen, onClose }: Props) {
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
            className="fixed inset-y-0 left-0 z-40 flex w-full flex-col bg-white lg:max-w-2xl"
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

              <DifficultyExcitementMatrixWidget isOpen={isOpen} />

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
        </>
      )}
    </AnimatePresence>
  );
}
