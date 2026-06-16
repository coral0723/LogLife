"use client";

import Link from "next/link";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { acceptFriendRequest, sendFriendRequest } from "@/actions/friend/actions";
import { friendQueryKeys, type UserSearchResult } from "@/api/friends";
import { ImageWithFallback } from "@/app/(afterLogin)/_components/ImageWithFallback";
import { AVATAR_PATHS } from "@/lib/avatar";

const AVATAR_CONTAINER_CLASSNAME = "h-10 w-10 flex-shrink-0 overflow-hidden rounded-full";
const ACTION_BUTTON_CLASSNAME =
  "flex-shrink-0 cursor-pointer rounded-full bg-zinc-900 px-3 py-1.5 text-xs font-medium text-white disabled:cursor-not-allowed disabled:opacity-50";

type Props = {
  user: UserSearchResult;
  searchQuery: string;
  onSendSuccess: (status: "PENDING" | "ACCEPTED") => void;
};

export function UserSearchResultItem({ user, searchQuery, onSendSuccess }: Props) {
  const queryClient = useQueryClient();
  const friendshipId = user.friendshipId;

  const invalidateAll = () => {
    queryClient.invalidateQueries({ queryKey: friendQueryKeys.search(searchQuery) });
    queryClient.invalidateQueries({ queryKey: friendQueryKeys.list() });
    queryClient.invalidateQueries({ queryKey: friendQueryKeys.requests() });
  };

  const handleError = (e: unknown) => {
    alert(e instanceof Error ? e.message : "처리 중 오류가 발생했습니다.");
  };

  const sendMutation = useMutation({
    mutationFn: sendFriendRequest,
    onSuccess: ({ status }) => {
      onSendSuccess(status);
      invalidateAll();
    },
    onError: handleError,
  });

  const acceptMutation = useMutation({
    mutationFn: acceptFriendRequest,
    onSuccess: () => {
      onSendSuccess("ACCEPTED");
      invalidateAll();
      queryClient.invalidateQueries({ queryKey: friendQueryKeys.requestsCount() });
    },
    onError: handleError,
  });

  return (
    <li className="flex items-center gap-3 rounded-2xl border border-zinc-100 bg-zinc-50 p-3">
      <Link href={`/u/${user.username}`} className="flex min-w-0 flex-1 items-center gap-3">
        <ImageWithFallback
          src={user.image ?? AVATAR_PATHS[0]}
          alt={user.name ?? user.username}
          containerClassName={AVATAR_CONTAINER_CLASSNAME}
          objectFit="cover"
          iconSize={18}
          iconClassName="text-zinc-300"
        />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-zinc-900">{user.name ?? user.username}</p>
          <p className="truncate text-xs text-zinc-400">@{user.username}</p>
        </div>
      </Link>
      {user.relation === "none" && (
        <button
          type="button"
          onClick={() => sendMutation.mutate(user.id)}
          disabled={sendMutation.isPending}
          className={ACTION_BUTTON_CLASSNAME}
        >
          친구 추가
        </button>
      )}
      {user.relation === "pending_sent" && (
        <span className="flex-shrink-0 rounded-full border border-zinc-200 px-3 py-1.5 text-xs font-medium text-zinc-400">
          요청됨
        </span>
      )}
      {user.relation === "pending_received" && friendshipId && (
        <button
          type="button"
          onClick={() => acceptMutation.mutate(friendshipId)}
          disabled={acceptMutation.isPending}
          className={ACTION_BUTTON_CLASSNAME}
        >
          수락
        </button>
      )}
      {user.relation === "friends" && (
        <span className="flex-shrink-0 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-600">
          친구
        </span>
      )}
    </li>
  );
}
