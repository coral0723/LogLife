"use client";

import { AnimatePresence, motion } from "framer-motion";
import { X } from "@phosphor-icons/react";

import { AchievementStatsWidget } from "./AchievementStatsWidget";
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
            <div className="flex-shrink-0 flex items-center justify-between px-5 pt-6 pb-3">
              <h2 className="text-lg font-semibold text-zinc-900">대시보드</h2>
              <button
                type="button"
                onClick={onClose}
                aria-label="닫기"
                className="lg:hidden rounded-full p-2 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 space-y-4 overflow-y-auto px-5 pb-28">
              <BucketCountWidget isOpen={isOpen} />

              <UpcomingDeadlinesWidget isOpen={isOpen} />

              <DifficultyExcitementMatrixWidget isOpen={isOpen} />

              <AchievementStatsWidget isOpen={isOpen} />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
