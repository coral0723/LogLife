import { describe, it, expect } from "vitest";

import { computeAchievementStats, type AchievedItem } from "../achievementStats";

function createItem(overrides: Partial<AchievedItem> = {}): AchievedItem {
  return {
    title: "항목",
    displayName: "사용자",
    createdAt: new Date("2026-01-01"),
    achievedAt: new Date("2026-01-02"),
    ...overrides,
  };
}

describe("computeAchievementStats", () => {
  it("달성 항목이 없고 totalCount가 0이면 achievementRate 0, avgDays/longestItem은 null이다", () => {
    expect(computeAchievementStats([], 0)).toEqual({
      achievementRate: 0,
      avgDays: null,
      longestItem: null,
    });
  });

  it("달성 항목이 없고 totalCount가 0보다 크면 achievementRate는 0이고 avgDays/longestItem은 null이다", () => {
    expect(computeAchievementStats([], 5)).toEqual({
      achievementRate: 0,
      avgDays: null,
      longestItem: null,
    });
  });

  it("달성률은 달성 항목 수 / 전체 항목 수를 백분율로 반올림한다", () => {
    const items = [createItem()];

    expect(computeAchievementStats(items, 3).achievementRate).toBe(33);
  });

  it("avgDays는 각 항목의 달성 소요 일수 평균을 반올림한 값이다", () => {
    const items = [
      createItem({ createdAt: new Date("2026-01-01"), achievedAt: new Date("2026-01-02") }), // 1일
      createItem({ createdAt: new Date("2026-01-01"), achievedAt: new Date("2026-01-04") }), // 3일
    ];

    expect(computeAchievementStats(items, 2).avgDays).toBe(2);
  });

  it("longestItem은 달성 소요 일수가 가장 큰 항목의 title/displayName/days를 반환한다", () => {
    const items = [
      createItem({
        title: "짧은 항목",
        createdAt: new Date("2026-01-01"),
        achievedAt: new Date("2026-01-02"), // 1일
      }),
      createItem({
        title: "긴 항목",
        displayName: "다른 사용자",
        createdAt: new Date("2026-01-01"),
        achievedAt: new Date("2026-01-10"), // 9일
      }),
    ];

    expect(computeAchievementStats(items, 2).longestItem).toEqual({
      title: "긴 항목",
      displayName: "다른 사용자",
      days: 9,
    });
  });

  it("달성 소요 일수가 같은 항목이 여럿이면 먼저 등장한 항목을 유지한다", () => {
    const items = [
      createItem({ title: "첫 항목", createdAt: new Date("2026-01-01"), achievedAt: new Date("2026-01-05") }), // 4일
      createItem({ title: "두번째 항목", createdAt: new Date("2026-01-01"), achievedAt: new Date("2026-01-05") }), // 4일
    ];

    expect(computeAchievementStats(items, 2).longestItem?.title).toBe("첫 항목");
  });

  it("항목이 1개면 avgDays와 longestItem.days가 동일하다", () => {
    const items = [
      createItem({ createdAt: new Date("2026-01-01"), achievedAt: new Date("2026-01-08") }), // 7일
    ];

    const result = computeAchievementStats(items, 1);

    expect(result.avgDays).toBe(7);
    expect(result.longestItem?.days).toBe(7);
  });
});
