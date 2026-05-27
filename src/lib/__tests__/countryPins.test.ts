import { describe, it, expect } from "vitest";

import { buildCountryPins } from "../countryPins";

describe("buildCountryPins", () => {
  it("정상 다국가 — 핀 배열 길이, 각 필드 값", () => {
    const result = buildCountryPins(
      [
        { countryCode: "KR", _count: { _all: 3 } },
        { countryCode: "JP", _count: { _all: 5 } },
      ],
      [{ countryCode: "KR", _count: { _all: 2 } }],
      [],
    );
    expect(result).toHaveLength(2);
    const kr = result.find((p) => p.countryCode === "KR")!;
    expect(kr.lat).toBe(35.9);
    expect(kr.lng).toBe(127.8);
    expect(kr.count).toBe(3);
    expect(kr.achievedCount).toBe(2);
    expect(kr.hasExpiredDeadline).toBe(false);
  });

  it("센트로이드 없는 국가 — 결과에 포함되지 않음", () => {
    const result = buildCountryPins(
      [
        { countryCode: "XX", _count: { _all: 2 } },
        { countryCode: "KR", _count: { _all: 1 } },
      ],
      [],
      [],
    );
    expect(result.find((p) => p.countryCode === "XX")).toBeUndefined();
    expect(result).toHaveLength(1);
  });

  it("전부 달성 — achievedCount === count", () => {
    const result = buildCountryPins(
      [{ countryCode: "US", _count: { _all: 4 } }],
      [{ countryCode: "US", _count: { _all: 4 } }],
      [],
    );
    expect(result[0].achievedCount).toBe(result[0].count);
  });

  it("마감 초과 항목 — hasExpiredDeadline === true", () => {
    const result = buildCountryPins(
      [{ countryCode: "FR", _count: { _all: 2 } }],
      [],
      [{ countryCode: "FR", _count: { _all: 1 } }],
    );
    expect(result[0].hasExpiredDeadline).toBe(true);
  });

  it("빈 입력 배열 — 빈 배열 반환", () => {
    expect(buildCountryPins([], [], [])).toEqual([]);
  });

  it("achievedMap 기본값 — 달성 기록 없는 국가 → achievedCount === 0", () => {
    const result = buildCountryPins(
      [{ countryCode: "DE", _count: { _all: 3 } }],
      [],
      [],
    );
    expect(result[0].achievedCount).toBe(0);
  });
});
