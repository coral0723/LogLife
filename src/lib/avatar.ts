export const AVATAR_PATHS = [
  "/avatars/cat.png",
  "/avatars/dog.png",
  "/avatars/fox.png",
  "/avatars/panda.png",
  "/avatars/owl.png",
  "/avatars/penguin.png",
  "/avatars/green_dinosaur.png",
  "/avatars/gray_robot.png",
  "/avatars/wizard.png",
  "/avatars/astronaut.png",
] as const;

export const AVATAR_LABELS: Record<string, string> = {
  "/avatars/cat.png": "고양이",
  "/avatars/dog.png": "강아지",
  "/avatars/fox.png": "여우",
  "/avatars/panda.png": "판다",
  "/avatars/owl.png": "부엉이",
  "/avatars/penguin.png": "펭귄",
  "/avatars/green_dinosaur.png": "초록 공룡",
  "/avatars/gray_robot.png": "회색 로봇",
  "/avatars/wizard.png": "마법사",
  "/avatars/astronaut.png": "우주비행사",
};

export function getRandomAvatarPath(): string {
  const index = Math.floor(Math.random() * AVATAR_PATHS.length);
  return AVATAR_PATHS[index];
}
