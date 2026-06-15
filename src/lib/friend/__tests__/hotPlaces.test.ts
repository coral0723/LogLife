import { describe, it, expect } from "vitest";

import { computeHotPlaces, type HotPlaceGroupInput } from "../hotPlaces";

function createGroup(overrides: Partial<HotPlaceGroupInput> = {}): HotPlaceGroupInput {
  return {
    countryCode: "KR",
    displayName: "서울",
    count: 1,
    placeId: "place-1",
    ...overrides,
  };
}

describe("computeHotPlaces", () => {
  it("count 내림차순으로 정렬한다", () => {
    const groups = [
      createGroup({ displayName: "서울", count: 2 }),
      createGroup({ displayName: "부산", count: 5 }),
      createGroup({ displayName: "대구", count: 3 }),
    ];

    const result = computeHotPlaces(groups);

    expect(result.map((g) => g.displayName)).toEqual(["부산", "대구", "서울"]);
  });

  it("상위 5개만 반환한다", () => {
    const groups = Array.from({ length: 7 }, (_, i) =>
      createGroup({ displayName: `장소${i}`, count: i })
    );

    const result = computeHotPlaces(groups);

    expect(result).toHaveLength(5);
    expect(result.map((g) => g.displayName)).toEqual(["장소6", "장소5", "장소4", "장소3", "장소2"]);
  });

  it("count가 같으면 원래 순서를 유지한다", () => {
    const groups = [
      createGroup({ displayName: "첫번째", count: 3 }),
      createGroup({ displayName: "두번째", count: 3 }),
    ];

    const result = computeHotPlaces(groups);

    expect(result.map((g) => g.displayName)).toEqual(["첫번째", "두번째"]);
  });

  it("입력이 5개 이하면 모두 반환한다", () => {
    const groups = [createGroup({ displayName: "서울" }), createGroup({ displayName: "부산" })];

    expect(computeHotPlaces(groups)).toHaveLength(2);
  });

  it("입력이 비어있으면 빈 배열을 반환한다", () => {
    expect(computeHotPlaces([])).toEqual([]);
  });
});
