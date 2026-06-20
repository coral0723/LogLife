"use client";

import { useQuery } from "@tanstack/react-query";

import { fetchPublicUser, userQueryKeys } from "@/api/user";
import { AVATAR_PATHS } from "@/lib/avatar";
import { ImageWithFallback } from "@/components/ui/ImageWithFallback";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { AchievementStatsWidget } from "@/components/dashboard/AchievementStatsWidget";
import { BucketCountWidget } from "@/components/dashboard/BucketCountWidget";
import { DifficultyExcitementMatrixWidget } from "@/components/dashboard/DifficultyExcitementMatrixWidget";
import { UpcomingDeadlinesWidget } from "@/components/dashboard/UpcomingDeadlinesWidget";

const AVATAR_CONTAINER_CLASSNAME = "h-18 w-18 md:h-24 md:w-24";

type Props = {
  username: string;
};

export function PublicProfileView({ username }: Props) {
  const { data, isLoading, isError } = useQuery({
    queryKey: userQueryKeys.profile(username),
    queryFn: () => fetchPublicUser(username),
  });

  if (isLoading) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-10">
        <LoadingSpinner size="sm" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-10">
        <p className="text-sm text-zinc-400">사용자 정보를 불러올 수 없습니다.</p>
      </div>
    );
  }

  const nickname = data?.name ?? data?.username ?? "";

  return (
    <div className="flex flex-1 flex-col px-6 pt-16 pb-16">
      <div className="flex flex-col items-center gap-3">
        <ImageWithFallback
          src={data?.image ?? AVATAR_PATHS[0]}
          alt={nickname}
          containerClassName={AVATAR_CONTAINER_CLASSNAME}
          objectFit="contain"
          iconSize={40}
          iconClassName="text-zinc-300"
        />
        <p className="text-sm font-bold text-zinc-900 md:text-lg">{nickname}</p>
      </div>

      <div className="mt-6 space-y-4">
        <BucketCountWidget isOpen username={username} />
        <UpcomingDeadlinesWidget isOpen username={username} />
        <DifficultyExcitementMatrixWidget isOpen username={username} />
        <AchievementStatsWidget isOpen username={username} />
      </div>
    </div>
  );
}
