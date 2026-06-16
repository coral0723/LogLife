import type { Visibility } from "@/lib/bucketList/bucketStatus";

export function getViewableVisibilities(canSeeFriendsContent: boolean): Visibility[] {
  return canSeeFriendsContent ? ["PUBLIC", "FRIENDS"] : ["PUBLIC"];
}
