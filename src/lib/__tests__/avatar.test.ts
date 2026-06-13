import { describe, it, expect, vi, afterEach } from "vitest";

import { AVATAR_PATHS, getRandomAvatarPath } from "../avatar";

describe("getRandomAvatarPath", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("AVATAR_PATHS 중 하나를 반환한다", () => {
    expect(AVATAR_PATHS).toContain(getRandomAvatarPath());
  });

  it("Math.random이 0이면 첫 번째 경로를 반환한다", () => {
    vi.spyOn(Math, "random").mockReturnValue(0);
    expect(getRandomAvatarPath()).toBe(AVATAR_PATHS[0]);
  });

  it("Math.random이 1에 가까우면 마지막 경로를 반환한다", () => {
    vi.spyOn(Math, "random").mockReturnValue(0.999999);
    expect(getRandomAvatarPath()).toBe(AVATAR_PATHS[AVATAR_PATHS.length - 1]);
  });
});
