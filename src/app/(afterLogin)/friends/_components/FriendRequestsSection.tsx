"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { acceptFriendRequest, declineFriendRequest } from "@/actions/friend/actions";
import { friendQueryKeys, fetchFriendRequests, type FriendRequestItem } from "@/api/friends";
import { ImageWithFallback } from "@/app/(afterLogin)/_components/ImageWithFallback";
import { AVATAR_PATHS } from "@/lib/avatar";

const AVATAR_CONTAINER_CLASSNAME = "h-10 w-10 flex-shrink-0 overflow-hidden rounded-full";

export function FriendRequestsSection() {
  const queryClient = useQueryClient();

  const { data: requests = [] } = useQuery({
    queryKey: friendQueryKeys.requests(),
    queryFn: fetchFriendRequests,
  });

  const removeRequest = (friendshipId: string) => {
    queryClient.setQueryData<FriendRequestItem[]>(friendQueryKeys.requests(), (prev) =>
      prev?.filter((item) => item.friendshipId !== friendshipId),
    );
  };

  const handleError = (e: unknown) => {
    alert(e instanceof Error ? e.message : "처리 중 오류가 발생했습니다.");
  };

  const acceptMutation = useMutation({
    mutationFn: acceptFriendRequest,
    onSuccess: (_, friendshipId) => {
      removeRequest(friendshipId);
      queryClient.invalidateQueries({ queryKey: friendQueryKeys.list() });
    },
    onError: handleError,
  });

  const declineMutation = useMutation({
    mutationFn: declineFriendRequest,
    onSuccess: (_, friendshipId) => removeRequest(friendshipId),
    onError: handleError,
  });

  if (requests.length === 0) return null;

  return (
    <section className="flex flex-col gap-3">
      <h3 className="text-sm font-medium text-zinc-500">받은 친구 요청</h3>
      <ul className="flex flex-col gap-2">
        {requests.map((request) => {
          const isPending =
            (acceptMutation.isPending && acceptMutation.variables === request.friendshipId) ||
            (declineMutation.isPending && declineMutation.variables === request.friendshipId);

          return (
            <li
              key={request.friendshipId}
              className="flex items-center gap-3 rounded-2xl border border-zinc-100 bg-zinc-50 p-3"
            >
              <ImageWithFallback
                src={request.image ?? AVATAR_PATHS[0]}
                alt={request.name ?? request.username}
                containerClassName={AVATAR_CONTAINER_CLASSNAME}
                objectFit="cover"
                iconSize={18}
                iconClassName="text-zinc-300"
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-zinc-900">
                  {request.name ?? request.username}
                </p>
                <p className="truncate text-xs text-zinc-400">@{request.username}</p>
              </div>
              <div className="flex flex-shrink-0 gap-2">
                <button
                  type="button"
                  onClick={() => acceptMutation.mutate(request.friendshipId)}
                  disabled={isPending}
                  className="cursor-pointer rounded-full bg-zinc-900 px-3 py-1.5 text-xs font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
                >
                  수락
                </button>
                <button
                  type="button"
                  onClick={() => declineMutation.mutate(request.friendshipId)}
                  disabled={isPending}
                  className="cursor-pointer rounded-full border border-zinc-200 px-3 py-1.5 text-xs font-medium text-zinc-600 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  거절
                </button>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
