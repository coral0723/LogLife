"use client";

import { useQuery } from "@tanstack/react-query";
import { User } from "@phosphor-icons/react";

import { fetchPublicUser, userQueryKeys } from "@/api/user";
import { AVATAR_PATHS } from "@/lib/avatar";
import { ImageWithFallback } from "@/app/(afterLogin)/_components/ImageWithFallback";
import LoadingSpinner from "@/app/(afterLogin)/_components/LoadingSpinner";
import { AchievementStatsWidget } from "@/app/(afterLogin)/_components/AchievementStatsWidget";
import { BucketCountWidget } from "@/app/(afterLogin)/_components/BucketCountWidget";
import { DifficultyExcitementMatrixWidget } from "@/app/(afterLogin)/_components/DifficultyExcitementMatrixWidget";
import { UpcomingDeadlinesWidget } from "@/app/(afterLogin)/_components/UpcomingDeadlinesWidget";

const AVATAR_CONTAINER_CLASSNAME = "h-32 w-24 md:h-42 md:w-34";

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
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const nickname = isError ? "-" : data?.name ?? data?.username ?? "";

  return (
    <div className="flex flex-1 flex-col px-6 pt-16 pb-16">
      <div className="flex flex-col items-center gap-3">
        {isError ? (
          <div className={`${AVATAR_CONTAINER_CLASSNAME} flex items-center justify-center`}>
            <User size={40} className="text-zinc-300" weight="regular" />
          </div>
        ) : (
          <ImageWithFallback
            src={data?.image ?? AVATAR_PATHS[0]}
            alt={nickname}
            containerClassName={AVATAR_CONTAINER_CLASSNAME}
            objectFit="contain"
            iconSize={40}
            iconClassName="text-zinc-300"
          />
        )}
        <p className="text-sm font-medium text-zinc-900">{nickname}</p>
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
