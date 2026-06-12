export const userQueryKeys = {
  me: () => ["user", "me"] as const,
};

export type CurrentUser = {
  image: string | null;
  name: string | null;
  username: string;
};

export async function fetchCurrentUser(): Promise<CurrentUser> {
  const res = await fetch("/api/me");
  if (!res.ok) throw new Error("내 정보 조회 실패");
  return res.json();
}
