import { describe, expect, it } from "vitest";

import { getCountryCentroid } from "../countryCentroids";

describe("getCountryCentroid", () => {
  it("KR 좌표 반환", () => {
    const result = getCountryCentroid("KR");
    expect(result).not.toBeNull();
    expect(result!.lat).toBeCloseTo(35.9, 0);
    expect(result!.lng).toBeCloseTo(127.8, 0);
  });

  it("JP 좌표 반환", () => {
    const result = getCountryCentroid("JP");
    expect(result).not.toBeNull();
    expect(result!.lat).toBeCloseTo(36.2, 0);
    expect(result!.lng).toBeCloseTo(138.3, 0);
  });

  it("US 좌표 반환", () => {
    const result = getCountryCentroid("US");
    expect(result).not.toBeNull();
    expect(result!.lat).toBeCloseTo(37.1, 0);
    expect(result!.lng).toBeCloseTo(-95.7, 0);
  });

  it("존재하지 않는 코드는 null 반환", () => {
    expect(getCountryCentroid("XX")).toBeNull();
    expect(getCountryCentroid("")).toBeNull();
    expect(getCountryCentroid("ZZZ")).toBeNull();
  });

  it("200개 이상 국가 데이터 포함", async () => {
    const { COUNTRY_CENTROIDS } = await import("../countryCentroids");
    expect(Object.keys(COUNTRY_CENTROIDS).length).toBeGreaterThanOrEqual(200);
  });
});
