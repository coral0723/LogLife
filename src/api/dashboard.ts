export const dashboardQueryKeys = {
  bucketCount: () => ["dashboard", "bucket-count"] as const,
};

export async function fetchBucketCount(): Promise<number> {
  const res = await fetch("/api/dashboard/bucket-count");
  if (!res.ok) throw new Error("버킷리스트 개수 조회 실패");
  const data = await res.json();
  return data.count;
}
