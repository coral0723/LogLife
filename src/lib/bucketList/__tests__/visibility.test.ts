import { describe, it, expect } from "vitest";

import { getViewableVisibilities } from "../visibility";

describe("getViewableVisibilities", () => {
  it("canSeeFriendsContent=true → PUBLIC, FRIENDS 포함", () => {
    expect(getViewableVisibilities(true)).toEqual(["PUBLIC", "FRIENDS"]);
  });

  it("canSeeFriendsContent=false → PUBLIC만", () => {
    expect(getViewableVisibilities(false)).toEqual(["PUBLIC"]);
  });
});
