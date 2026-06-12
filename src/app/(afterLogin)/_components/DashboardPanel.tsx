"use client";

import { AnimatePresence, motion } from "framer-motion";

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
            <div className="flex-shrink-0 px-5 pt-6 pb-3">
              <h2 className="text-lg font-semibold text-zinc-900">대시보드</h2>
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
