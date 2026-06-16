export const userQueryKeys = {
  me: () => ["user", "me"] as const,
  profile: (username: string) => ["user", "profile", username] as const,
};

export type CurrentUser = {
  image: string | null;
  name: string | null;
  username: string;
};

export type PublicUser = {
  id: string;
  username: string;
  name: string | null;
  image: string | null;
};

export async function fetchCurrentUser(): Promise<CurrentUser> {
  const res = await fetch("/api/me");
  if (!res.ok) throw new Error("내 정보 조회 실패");
  return res.json();
}

export async function fetchPublicUser(username: string): Promise<PublicUser> {
  const res = await fetch(`/api/users/${username}`);
  if (!res.ok) throw new Error("사용자 정보 조회 실패");
  return res.json();
}
