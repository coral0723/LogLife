// input은 실제 서버 액션과 시그니처를 맞추기 위한 더미 매개변수 — 모킹이라 사용하지 않음
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function createBucketList(_input: unknown) {
  return { id: "mock-id", shareToken: "mock-token" };
}

// id는 실제 서버 액션과 시그니처를 맞추기 위한 더미 매개변수 — 모킹이라 사용하지 않음
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function toggleAchieved(_id: string) {
  return { achieved: true, achievedAt: null as string | null };
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function updateDeadline(_id: string, deadlineAt: Date | null) {
  return { deadlineAt };
}
