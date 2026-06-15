export async function sendFriendRequest(
  // 실제 서버 액션과 시그니처를 맞추기 위한 더미 매개변수 — 모킹이라 사용하지 않음
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _addresseeId: string,
): Promise<{ status: "PENDING" | "ACCEPTED" }> {
  return { status: "PENDING" };
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function acceptFriendRequest(_friendshipId: string): Promise<void> {}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function declineFriendRequest(_friendshipId: string): Promise<void> {}
