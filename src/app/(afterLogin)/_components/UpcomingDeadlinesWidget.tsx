"use client";

import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { Confetti } from "@phosphor-icons/react";

import { dashboardQueryKeys, fetchUpcomingDeadlines } from "@/api/dashboard";

type Props = {
  isOpen: boolean;
  username?: string;
};

function getDDay(deadlineAt: string) {
  const today = new Date().setHours(0, 0, 0, 0);
  const deadline = new Date(deadlineAt).setHours(0, 0, 0, 0);
  return Math.round((deadline - today) / (1000 * 60 * 60 * 24));
}

function getDeadlineBadgeStyle(dDay: number) {
  if (dDay <= 3) return "bg-rose-50 text-rose-600";
  if (dDay <= 7) return "bg-amber-50 text-amber-600";
  return "bg-zinc-100 text-zinc-500";
}

export function UpcomingDeadlinesWidget({ isOpen, username }: Props) {
  const {
    data: upcomingDeadlines = [],
    isLoading: isUpcomingDeadlinesLoading,
    isError: isUpcomingDeadlinesError,
  } = useQuery({
    queryKey: dashboardQueryKeys.upcomingDeadlines(username),
    queryFn: () => fetchUpcomingDeadlines(username),
    enabled: isOpen,
  });

  return (
    <section className="rounded-2xl border border-zinc-100 bg-zinc-50 p-5">
      <p className="mb-3 text-sm text-zinc-400">마감 임박 순 리스트</p>

      {isUpcomingDeadlinesLoading ? (
        <ul className="space-y-2">
          {[0, 1, 2].map((i) => (
            <li key={i} className="flex items-center gap-3 rounded-xl bg-white p-3">
              <div className="h-12 w-12 flex-shrink-0 animate-pulse rounded-xl bg-zinc-200" />
              <div className="min-w-0 flex-1 space-y-2">
                <div className="h-4 w-3/4 animate-pulse rounded bg-zinc-200" />
                <div className="h-3 w-1/2 animate-pulse rounded bg-zinc-200" />
              </div>
            </li>
          ))}
        </ul>
      ) : isUpcomingDeadlinesError ? (
        <div className="flex flex-col items-center gap-2 rounded-xl bg-white py-10 text-center">
          <p className="text-sm font-medium text-zinc-900">목록을 불러오지 못했어요</p>
        </div>
      ) : upcomingDeadlines.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-xl bg-white py-10 text-center">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50 text-emerald-500">
            <Confetti size={20} weight="bold" />
          </div>
          <p className="text-sm font-medium text-zinc-900">마감 임박한 항목이 없어요</p>
          <p className="text-xs text-zinc-400">여유롭게 다음 목표를 계획해보세요</p>
        </div>
      ) : (
        <ul className="space-y-2">
          {upcomingDeadlines.map((item, index) => {
            const dDay = getDDay(item.deadlineAt);
            return (
              <motion.li
                key={item.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05, duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                className="flex items-center gap-3 rounded-xl bg-white p-3"
              >
                <div
                  className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl text-xs font-bold ${getDeadlineBadgeStyle(dDay)}`}
                >
                  {dDay <= 0 ? "D-DAY" : `D-${dDay}`}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-zinc-900">{item.title}</p>
                  <p className="truncate text-xs text-zinc-400">{item.displayName}</p>
                </div>
              </motion.li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
