import { Globe, Lock, Users } from "@phosphor-icons/react";

export type Visibility = "PUBLIC" | "FRIENDS" | "PRIVATE";

export function getStatus(item: { achieved: boolean; deadlineAt: string | null }): "achieved" | "expired" | "pending" {
  if (item.achieved) return "achieved";
  if (item.deadlineAt && new Date(item.deadlineAt) < new Date()) return "expired";
  return "pending";
}

export const STATUS_CONFIG = {
  achieved: { label: "달성",    className: "bg-amber-100 text-amber-700" },
  expired:  { label: "마감",    className: "bg-rose-100 text-rose-600" },
  pending:  { label: "진행 중", className: "bg-zinc-100 text-zinc-500" },
} as const;

export const VISIBILITY_CONFIG = {
  PUBLIC:  { label: "전체 공개", Icon: Globe },
  FRIENDS: { label: "친구 공개", Icon: Users },
  PRIVATE: { label: "비공개",   Icon: Lock },
} as const;
