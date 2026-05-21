export type UsernameExistsCheck = (username: string) => Promise<boolean>;

export async function generateUsername(
  email: string,
  exists: UsernameExistsCheck,
): Promise<string> {
  const base = email.split("@")[0].toLowerCase().replace(/[^a-z0-9_]/g, "_");
  const normalized = base.length >= 3 ? base : `user_${base}`;
  let username = normalized;
  let suffix = 0;
  while (await exists(username)) {
    suffix += 1;
    username = `${normalized}_${suffix}`;
  }
  return username;
}
