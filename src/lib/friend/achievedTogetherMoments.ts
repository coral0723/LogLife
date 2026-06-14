const MS_PER_DAY = 1000 * 60 * 60 * 24;
const MAX_DAYS_APART = 30;

export type AchievedItemInput = {
  id: string;
  placeId: string;
  title: string;
  displayName: string;
  achievedAt: Date;
};

export type FriendAchievedItemInput = AchievedItemInput & {
  friendId: string;
  friendUsername: string;
  friendName: string | null;
};

export type AchievedTogetherMoment = {
  placeId: string;
  displayName: string;
  myItem: { id: string; title: string; achievedAt: string };
  friendItem: {
    id: string;
    title: string;
    achievedAt: string;
    friendId: string;
    friendUsername: string;
    friendName: string | null;
  };
  daysApart: number;
};

export function computeAchievedTogetherMoments(
  myAchieved: AchievedItemInput[],
  friendAchieved: FriendAchievedItemInput[]
): AchievedTogetherMoment[] {
  const friendItemsByPlaceId = new Map<string, FriendAchievedItemInput[]>();
  for (const item of friendAchieved) {
    const items = friendItemsByPlaceId.get(item.placeId) ?? [];
    items.push(item);
    friendItemsByPlaceId.set(item.placeId, items);
  }

  const moments: AchievedTogetherMoment[] = [];

  for (const myItem of myAchieved) {
    const candidates = friendItemsByPlaceId.get(myItem.placeId);
    if (!candidates) continue;

    for (const friendItem of candidates) {
      const daysApart = Math.round(
        Math.abs(myItem.achievedAt.getTime() - friendItem.achievedAt.getTime()) / MS_PER_DAY
      );
      if (daysApart > MAX_DAYS_APART) continue;

      moments.push({
        placeId: myItem.placeId,
        displayName: myItem.displayName,
        myItem: { id: myItem.id, title: myItem.title, achievedAt: myItem.achievedAt.toISOString() },
        friendItem: {
          id: friendItem.id,
          title: friendItem.title,
          achievedAt: friendItem.achievedAt.toISOString(),
          friendId: friendItem.friendId,
          friendUsername: friendItem.friendUsername,
          friendName: friendItem.friendName,
        },
        daysApart,
      });
    }
  }

  return moments.sort((a, b) => a.daysApart - b.daysApart);
}
