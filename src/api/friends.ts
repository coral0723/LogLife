import type { AchievedTogetherMoment } from "@/lib/friend/achievedTogetherMoments";
import type { CommonMatchItem } from "@/lib/friend/commonBucketMatches";
import type { HotPlaceItem } from "@/lib/friend/hotPlaces";

export type { CommonMatchItem, HotPlaceItem, AchievedTogetherMoment };

export const friendQueryKeys = {
  list: () => ["friends", "list"] as const,
  requests: () => ["friends", "requests"] as const,
  requestsCount: () => ["friends", "requests", "count"] as const,
  search: (q: string) => ["friends", "search", q] as const,
  commonBuckets: () => ["friends", "widgets", "common-buckets"] as const,
  hotPlaces: () => ["friends", "widgets", "hot-places"] as const,
  achievedTogether: () => ["friends", "widgets", "achieved-together"] as const,
};

type UserBasic = {
  id: string;
  username: string;
  name: string | null;
  image: string | null;
};

export type FriendItem = UserBasic & { friendshipId: string };

export type FriendsPage = {
  items: FriendItem[];
  nextCursor: string | null;
  totalCount: number;
};

export type FriendRequestItem = FriendItem & { createdAt: string };

export type FriendRequestsPage = {
  items: FriendRequestItem[];
  nextCursor: string | null;
  totalCount: number;
};

export type UserSearchResult = UserBasic & {
  relation: "none" | "pending_sent" | "pending_received" | "friends";
  friendshipId?: string;
};

export async function fetchFriends(cursor?: string): Promise<FriendsPage> {
  const params = new URLSearchParams();
  if (cursor) params.set("cursor", cursor);
  const res = await fetch(`/api/friends?${params}`);
  if (!res.ok) throw new Error("친구 목록 조회 실패");
  return res.json();
}

export async function fetchFriendRequests(cursor?: string): Promise<FriendRequestsPage> {
  const params = new URLSearchParams();
  if (cursor) params.set("cursor", cursor);
  const res = await fetch(`/api/friends/requests?${params}`);
  if (!res.ok) throw new Error("받은 친구 요청 조회 실패");
  return res.json();
}

export async function fetchFriendRequestsCount(): Promise<number> {
  const { totalCount } = await fetchFriendRequests();
  return totalCount;
}

export async function deleteFriend(friendshipId: string): Promise<void> {
  const res = await fetch("/api/friends", {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ friendshipId }),
  });
  if (!res.ok) throw new Error("친구 삭제 실패");
}

export async function searchUsers(q: string): Promise<UserSearchResult[]> {
  const params = new URLSearchParams({ q });
  const res = await fetch(`/api/friends/search?${params}`);
  if (!res.ok) throw new Error("유저 검색 실패");
  const data = await res.json();
  return data.items;
}

export async function fetchCommonBucketMatches(): Promise<CommonMatchItem[]> {
  const res = await fetch("/api/friends/widgets/common-buckets");
  if (!res.ok) throw new Error("공통 버킷리스트 매칭 조회 실패");
  const data = await res.json();
  return data.items;
}

export async function fetchHotPlaces(): Promise<HotPlaceItem[]> {
  const res = await fetch("/api/friends/widgets/hot-places");
  if (!res.ok) throw new Error("친구 핫플레이스 조회 실패");
  const data = await res.json();
  return data.items;
}

export async function fetchAchievedTogetherMoments(): Promise<AchievedTogetherMoment[]> {
  const res = await fetch("/api/friends/widgets/achieved-together");
  if (!res.ok) throw new Error("함께 달성 모먼트 조회 실패");
  const data = await res.json();
  return data.items;
}
