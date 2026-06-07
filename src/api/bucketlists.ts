import type { Visibility } from "@/lib/bucketList/bucketStatus";

export type BucketListItem = {
  id: string;
  title: string;
  displayName: string;
  achieved: boolean;
  placeId: string;
  visibility: Visibility;
  deadlineAt: string | null;
};

export type BucketsByCountryPage = {
  items: BucketListItem[];
  nextCursor: string | null;
};

export type BucketDetail = {
  id: string;
  title: string;
  description: string | null;
  visibility: Visibility;
  deadlineAt: string | null;
  achievedAt: string | null;
  difficulty: number;
  excitement: number;
  achieved: boolean;
  placeId: string;
  displayName: string;
  countryCode: string;
  shareToken: string;
};

export const bucketQueryKeys = {
  byCountry: (countryCode: string) =>
    ["bucketlists", "by-country", countryCode] as const,
  detail: (id: string) => ["bucketlists", "detail", id] as const,
};

export async function fetchBucketsByCountry(
  countryCode: string,
  cursor?: string,
): Promise<BucketsByCountryPage> {
  const params = new URLSearchParams({ countryCode });
  if (cursor) params.set("cursor", cursor);
  const res = await fetch(`/api/bucketlists/by-country?${params}`);
  if (!res.ok) throw new Error("버킷리스트 목록 조회 실패");
  return res.json();
}

export async function fetchBucketDetail(id: string): Promise<BucketDetail> {
  const res = await fetch(`/api/bucketlists/${id}`);
  if (!res.ok) throw new Error("버킷리스트 상세 조회 실패");
  return res.json();
}
