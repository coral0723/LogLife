import type { Visibility } from "./bucketStatus";

export const QUADRANT_THRESHOLD = 3;

export type DifficultyExcitementItem = {
  id: string;
  title: string;
  displayName: string;
  placeId: string;
  difficulty: number;
  excitement: number;
  deadlineAt: string | null;
  visibility: Visibility;
};

export type QuadrantKey = "challengeNow" | "bucketListGem" | "relaxedTime" | "slowAndSteady";

export const QUADRANT_CONFIG: { key: QuadrantKey; label: string }[] = [
  { key: "slowAndSteady", label: "마음먹고 천천히" },
  { key: "bucketListGem", label: "버킷리스트의 꽃" },
  { key: "relaxedTime", label: "여유 있을 때" },
  { key: "challengeNow", label: "지금 도전!" },
];

export function groupByQuadrant(
  items: DifficultyExcitementItem[]
): Record<QuadrantKey, DifficultyExcitementItem[]> {
  const groups: Record<QuadrantKey, DifficultyExcitementItem[]> = {
    challengeNow: [],
    bucketListGem: [],
    relaxedTime: [],
    slowAndSteady: [],
  };

  for (const item of items) {
    const isHighDifficulty = item.difficulty > QUADRANT_THRESHOLD;
    const isHighExcitement = item.excitement > QUADRANT_THRESHOLD;

    if (!isHighDifficulty && isHighExcitement) groups.challengeNow.push(item);
    else if (isHighDifficulty && isHighExcitement) groups.bucketListGem.push(item);
    else if (!isHighDifficulty && !isHighExcitement) groups.relaxedTime.push(item);
    else groups.slowAndSteady.push(item);
  }

  return groups;
}
