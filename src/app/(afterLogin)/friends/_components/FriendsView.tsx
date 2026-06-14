"use client";

import { FriendListSection } from "./FriendListSection";
import { FriendRequestsSection } from "./FriendRequestsSection";

export function FriendsView() {
  return (
    <div className="flex flex-1 flex-col gap-6 px-5 pt-16 pb-10">
      <h2 className="text-lg font-semibold text-zinc-900">친구</h2>
      <FriendRequestsSection />
      <FriendListSection />
    </div>
  );
}
