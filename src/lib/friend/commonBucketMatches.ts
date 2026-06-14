export type BucketMatchInput = {
  id: string;
  placeId: string;
  title: string;
  displayName: string;
  achieved: boolean;
};

export type FriendBucketInput = BucketMatchInput & {
  friendId: string;
  friendUsername: string;
  friendName: string | null;
};

export type CommonMatchItem = {
  placeId: string;
  displayName: string;
  myItem: { id: string; title: string; achieved: boolean };
  friends: { id: string; username: string; name: string | null; title: string; achieved: boolean }[];
};

export function computeCommonBucketMatches(
  myItems: BucketMatchInput[],
  friendItems: FriendBucketInput[]
): CommonMatchItem[] {
  const friendItemsByPlaceId = new Map<string, FriendBucketInput[]>();
  for (const item of friendItems) {
    const items = friendItemsByPlaceId.get(item.placeId) ?? [];
    items.push(item);
    friendItemsByPlaceId.set(item.placeId, items);
  }

  const matches: CommonMatchItem[] = [];

  for (const myItem of myItems) {
    const matchedFriendItems = friendItemsByPlaceId.get(myItem.placeId);
    if (!matchedFriendItems || matchedFriendItems.length === 0) continue;

    matches.push({
      placeId: myItem.placeId,
      displayName: myItem.displayName,
      myItem: { id: myItem.id, title: myItem.title, achieved: myItem.achieved },
      friends: matchedFriendItems.map((friendItem) => ({
        id: friendItem.friendId,
        username: friendItem.friendUsername,
        name: friendItem.friendName,
        title: friendItem.title,
        achieved: friendItem.achieved,
      })),
    });
  }

  // 둘 다 미달성인 항목을 우선 정렬 (Array.sort는 안정 정렬이므로 동순위 내 원래 순서 유지)
  return matches.sort((a, b) => {
    const aBothUnachieved = !a.myItem.achieved && a.friends.some((friend) => !friend.achieved);
    const bBothUnachieved = !b.myItem.achieved && b.friends.some((friend) => !friend.achieved);
    if (aBothUnachieved === bBothUnachieved) return 0;
    return aBothUnachieved ? -1 : 1;
  });
}
