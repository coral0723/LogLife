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

export function getRandomAvatarPath(): string {
  const index = Math.floor(Math.random() * AVATAR_PATHS.length);
  return AVATAR_PATHS[index];
}
