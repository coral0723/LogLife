import { describe, it, expect } from "vitest";

import { groupByQuadrant, type DifficultyExcitementItem } from "../difficultyExcitementMatrix";

function createItem(overrides: Partial<DifficultyExcitementItem> = {}): DifficultyExcitementItem {
  return {
    id: "1",
    title: "항목",
    displayName: "사용자",
    placeId: "place-1",
    difficulty: 1,
    excitement: 1,
    deadlineAt: null,
    visibility: "PUBLIC",
    ...overrides,
  };
}

describe("groupByQuadrant", () => {
  it("고난이도×고설렘 항목은 bucketListGem으로 분류한다", () => {
    const item = createItem({ difficulty: 4, excitement: 4 });

    expect(groupByQuadrant([item]).bucketListGem).toEqual([item]);
  });

  it("저난이도×고설렘 항목은 challengeNow로 분류한다", () => {
    const item = createItem({ difficulty: 2, excitement: 4 });

    expect(groupByQuadrant([item]).challengeNow).toEqual([item]);
  });

  it("저난이도×저설렘 항목은 relaxedTime으로 분류한다", () => {
    const item = createItem({ difficulty: 2, excitement: 2 });

    expect(groupByQuadrant([item]).relaxedTime).toEqual([item]);
  });

  it("고난이도×저설렘 항목은 slowAndSteady로 분류한다", () => {
    const item = createItem({ difficulty: 4, excitement: 2 });

    expect(groupByQuadrant([item]).slowAndSteady).toEqual([item]);
  });

  it("경계값(3,3)은 둘 다 '저'로 취급되어 relaxedTime으로 분류한다", () => {
    const item = createItem({ difficulty: 3, excitement: 3 });

    expect(groupByQuadrant([item]).relaxedTime).toEqual([item]);
  });

  it("빈 배열 입력 시 모든 사분면이 빈 배열이다", () => {
    expect(groupByQuadrant([])).toEqual({
      challengeNow: [],
      bucketListGem: [],
      relaxedTime: [],
      slowAndSteady: [],
    });
  });

  it("여러 항목을 각 사분면으로 분배하고 입력 순서를 유지한다", () => {
    const a = createItem({ id: "a", difficulty: 2, excitement: 4 }); // challengeNow
    const b = createItem({ id: "b", difficulty: 4, excitement: 4 }); // bucketListGem
    const c = createItem({ id: "c", difficulty: 2, excitement: 2 }); // relaxedTime
    const d = createItem({ id: "d", difficulty: 4, excitement: 2 }); // slowAndSteady
    const e = createItem({ id: "e", difficulty: 2, excitement: 5 }); // challengeNow (2번째)

    const result = groupByQuadrant([a, b, c, d, e]);

    expect(result.challengeNow).toEqual([a, e]);
    expect(result.bucketListGem).toEqual([b]);
    expect(result.relaxedTime).toEqual([c]);
    expect(result.slowAndSteady).toEqual([d]);
  });
});
