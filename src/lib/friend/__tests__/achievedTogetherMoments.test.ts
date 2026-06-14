import { describe, it, expect } from "vitest";

import {
  computeAchievedTogetherMoments,
  type AchievedItemInput,
  type FriendAchievedItemInput,
} from "../achievedTogetherMoments";

function createMyItem(overrides: Partial<AchievedItemInput> = {}): AchievedItemInput {
  return {
    id: "my-item-1",
    placeId: "place-1",
    title: "내 항목",
    displayName: "장소",
    achievedAt: new Date("2026-01-01"),
    ...overrides,
  };
}

function createFriendItem(overrides: Partial<FriendAchievedItemInput> = {}): FriendAchievedItemInput {
  return {
    id: "friend-item-1",
    placeId: "place-1",
    title: "친구 항목",
    displayName: "장소",
    achievedAt: new Date("2026-01-01"),
    friendId: "friend-1",
    friendUsername: "friend1",
    friendName: "친구1",
    ...overrides,
  };
}

describe("computeAchievedTogetherMoments", () => {
  it("placeId가 다르면 모먼트를 생성하지 않는다", () => {
    const myItems = [createMyItem({ placeId: "place-1" })];
    const friendItems = [createFriendItem({ placeId: "place-2" })];

    expect(computeAchievedTogetherMoments(myItems, friendItems)).toEqual([]);
  });

  it("같은 placeId & 30일 이내면 모먼트를 생성한다", () => {
    const myItems = [createMyItem({ achievedAt: new Date("2026-01-01") })];
    const friendItems = [createFriendItem({ achievedAt: new Date("2026-01-10") })];

    const result = computeAchievedTogetherMoments(myItems, friendItems);

    expect(result).toEqual([
      {
        placeId: "place-1",
        displayName: "장소",
        myItem: { id: "my-item-1", title: "내 항목", achievedAt: new Date("2026-01-01").toISOString() },
        friendItem: {
          id: "friend-item-1",
          title: "친구 항목",
          achievedAt: new Date("2026-01-10").toISOString(),
          friendId: "friend-1",
          friendUsername: "friend1",
          friendName: "친구1",
        },
        daysApart: 9,
      },
    ]);
  });

  it("30일 초과 차이는 모먼트에서 제외한다", () => {
    const myItems = [createMyItem({ achievedAt: new Date("2026-01-01") })];
    const friendItems = [createFriendItem({ achievedAt: new Date("2026-02-01") })]; // 31일 차이

    expect(computeAchievedTogetherMoments(myItems, friendItems)).toEqual([]);
  });

  it("정확히 30일 차이는 포함한다", () => {
    const myItems = [createMyItem({ achievedAt: new Date("2026-01-01") })];
    const friendItems = [createFriendItem({ achievedAt: new Date("2026-01-31") })]; // 30일 차이

    const result = computeAchievedTogetherMoments(myItems, friendItems);

    expect(result).toHaveLength(1);
    expect(result[0].daysApart).toBe(30);
  });

  it("daysApart 오름차순(가장 가까운 순)으로 정렬한다", () => {
    const myItems = [
      createMyItem({ id: "my-1", placeId: "place-1", achievedAt: new Date("2026-01-01") }),
      createMyItem({ id: "my-2", placeId: "place-2", achievedAt: new Date("2026-01-01") }),
    ];
    const friendItems = [
      createFriendItem({ placeId: "place-1", achievedAt: new Date("2026-01-20") }), // 19일
      createFriendItem({ placeId: "place-2", achievedAt: new Date("2026-01-03") }), // 2일
    ];

    const result = computeAchievedTogetherMoments(myItems, friendItems);

    expect(result.map((m) => m.daysApart)).toEqual([2, 19]);
    expect(result.map((m) => m.placeId)).toEqual(["place-2", "place-1"]);
  });

  it("한 myItem에 여러 친구 항목이 매칭되면 모두 모먼트로 생성한다", () => {
    const myItems = [createMyItem({ achievedAt: new Date("2026-01-01") })];
    const friendItems = [
      createFriendItem({ friendId: "friend-1", friendUsername: "friend1", achievedAt: new Date("2026-01-05") }),
      createFriendItem({ friendId: "friend-2", friendUsername: "friend2", achievedAt: new Date("2026-01-10") }),
    ];

    const result = computeAchievedTogetherMoments(myItems, friendItems);

    expect(result).toHaveLength(2);
    expect(result.map((m) => m.friendItem.friendUsername)).toEqual(["friend1", "friend2"]);
  });

  it("입력이 비어있으면 빈 배열을 반환한다", () => {
    expect(computeAchievedTogetherMoments([], [])).toEqual([]);
  });
});
