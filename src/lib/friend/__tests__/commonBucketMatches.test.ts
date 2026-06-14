import { describe, it, expect } from "vitest";

import {
  computeCommonBucketMatches,
  type BucketMatchInput,
  type FriendBucketInput,
} from "../commonBucketMatches";

function createMyItem(overrides: Partial<BucketMatchInput> = {}): BucketMatchInput {
  return {
    id: "my-item-1",
    placeId: "place-1",
    title: "내 항목",
    displayName: "장소",
    achieved: false,
    ...overrides,
  };
}

function createFriendItem(overrides: Partial<FriendBucketInput> = {}): FriendBucketInput {
  return {
    id: "friend-item-1",
    placeId: "place-1",
    title: "친구 항목",
    displayName: "장소",
    achieved: false,
    friendId: "friend-1",
    friendUsername: "friend1",
    friendName: "친구1",
    ...overrides,
  };
}

describe("computeCommonBucketMatches", () => {
  it("placeId가 일치하는 친구 항목이 없으면 빈 배열을 반환한다", () => {
    const myItems = [createMyItem()];
    const friendItems = [createFriendItem({ placeId: "place-2" })];

    expect(computeCommonBucketMatches(myItems, friendItems)).toEqual([]);
  });

  it("placeId가 일치하면 myItem과 friends를 포함한 매치를 반환한다", () => {
    const myItems = [createMyItem()];
    const friendItems = [createFriendItem()];

    expect(computeCommonBucketMatches(myItems, friendItems)).toEqual([
      {
        placeId: "place-1",
        displayName: "장소",
        myItem: { id: "my-item-1", title: "내 항목", achieved: false },
        friends: [
          { id: "friend-1", username: "friend1", name: "친구1", title: "친구 항목", achieved: false },
        ],
      },
    ]);
  });

  it("한 placeId에 여러 친구의 항목이 있으면 friends 배열에 모두 포함한다", () => {
    const myItems = [createMyItem()];
    const friendItems = [
      createFriendItem({ friendId: "friend-1", friendUsername: "friend1" }),
      createFriendItem({ friendId: "friend-2", friendUsername: "friend2", friendName: "친구2" }),
    ];

    const result = computeCommonBucketMatches(myItems, friendItems);

    expect(result[0].friends).toHaveLength(2);
    expect(result[0].friends.map((f) => f.username)).toEqual(["friend1", "friend2"]);
  });

  it("내 항목이 여러 개면 placeId가 일치하는 항목 각각에 대해 매치를 생성한다", () => {
    const myItems = [
      createMyItem({ id: "my-item-1", placeId: "place-1" }),
      createMyItem({ id: "my-item-2", placeId: "place-2" }),
    ];
    const friendItems = [
      createFriendItem({ placeId: "place-1" }),
      createFriendItem({ placeId: "place-2" }),
    ];

    const result = computeCommonBucketMatches(myItems, friendItems);

    expect(result).toHaveLength(2);
    expect(result.map((m) => m.placeId)).toEqual(["place-1", "place-2"]);
  });

  it("둘 다 미달성인 항목을 앞쪽으로 정렬한다", () => {
    const myItems = [
      createMyItem({ id: "achieved-place", placeId: "place-achieved", achieved: true }),
      createMyItem({ id: "unachieved-place", placeId: "place-unachieved", achieved: false }),
    ];
    const friendItems = [
      createFriendItem({ placeId: "place-achieved", achieved: true }),
      createFriendItem({ placeId: "place-unachieved", achieved: false }),
    ];

    const result = computeCommonBucketMatches(myItems, friendItems);

    expect(result.map((m) => m.placeId)).toEqual(["place-unachieved", "place-achieved"]);
  });

  it("내가 미달성이지만 친구가 모두 달성한 항목은 우선 정렬되지 않는다", () => {
    const myItems = [
      createMyItem({ id: "mine-unachieved-friend-achieved", placeId: "place-a", achieved: false }),
      createMyItem({ id: "both-unachieved", placeId: "place-b", achieved: false }),
    ];
    const friendItems = [
      createFriendItem({ placeId: "place-a", achieved: true }),
      createFriendItem({ placeId: "place-b", achieved: false }),
    ];

    const result = computeCommonBucketMatches(myItems, friendItems);

    expect(result.map((m) => m.placeId)).toEqual(["place-b", "place-a"]);
  });

  it("내 항목이 비어있으면 빈 배열을 반환한다", () => {
    const friendItems = [createFriendItem()];

    expect(computeCommonBucketMatches([], friendItems)).toEqual([]);
  });

  it("우선순위가 같은 항목은 원래 순서를 유지한다", () => {
    const myItems = [
      createMyItem({ id: "first", placeId: "place-1", achieved: false }),
      createMyItem({ id: "second", placeId: "place-2", achieved: false }),
    ];
    const friendItems = [
      createFriendItem({ placeId: "place-1", achieved: false }),
      createFriendItem({ placeId: "place-2", achieved: false }),
    ];

    const result = computeCommonBucketMatches(myItems, friendItems);

    expect(result.map((m) => m.myItem.id)).toEqual(["first", "second"]);
  });
});
