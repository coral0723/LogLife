import { describe, it, expect } from "vitest";

import { generateUsername } from "../username";

const noConflict = async () => false;
const conflictSet = (taken: Set<string>) => async (u: string) => taken.has(u);

describe("generateUsername", () => {
  it("이메일 prefix를 username으로 사용한다", async () => {
    expect(await generateUsername("san9901ho@gmail.com", noConflict)).toBe(
      "san9901ho",
    );
  });

  it("대문자는 소문자로 정규화한다", async () => {
    expect(await generateUsername("MixedCase@gmail.com", noConflict)).toBe(
      "mixedcase",
    );
  });

  it("허용되지 않는 문자(영문/숫자/underscore 외)는 underscore로 치환한다", async () => {
    expect(await generateUsername("first.last+tag@gmail.com", noConflict)).toBe(
      "first_last_tag",
    );
  });

  it("3자 미만 prefix는 user_ 접두사를 붙인다", async () => {
    expect(await generateUsername("ab@gmail.com", noConflict)).toBe("user_ab");
  });

  it("충돌 시 _1, _2 순으로 suffix를 증가시킨다", async () => {
    const taken = new Set(["alice", "alice_1"]);
    expect(
      await generateUsername("alice@gmail.com", conflictSet(taken)),
    ).toBe("alice_2");
  });

  it("첫 충돌만 발생하면 _1로 끝낸다", async () => {
    const taken = new Set(["bob"]);
    expect(await generateUsername("bob@gmail.com", conflictSet(taken))).toBe(
      "bob_1",
    );
  });
});
