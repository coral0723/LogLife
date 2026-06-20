"use client";

import { Check } from "@phosphor-icons/react";

import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { Button } from "@/components/ui/Button";
import { AVATAR_LABELS } from "@/lib/avatar";

type Props = {
  avatars: readonly string[];
  selectedAvatar: string;
  currentAvatar: string;
  isPending: boolean;
  onSelect: (avatarPath: string) => void;
  onConfirm: () => void;
  onCancel: () => void;
};

export function AvatarEditPanel({
  avatars,
  selectedAvatar,
  currentAvatar,
  isPending,
  onSelect,
  onConfirm,
  onCancel,
}: Props) {
  const isUnchanged = selectedAvatar === currentAvatar;
  const confirmDisabled = isUnchanged || isPending;

  return (
    <div className="flex flex-1 flex-col mt-4">
      <span className="text-sm font-medium text-zinc-400 mt-2 mb-2">프로필 선택</span>
      <div className="grid grid-cols-5 gap-x-3 gap-y-4 pb-6">
        {avatars.map((avatarPath) => (
          <button
            key={avatarPath}
            type="button"
            onClick={() => onSelect(avatarPath)}
            aria-label={`${AVATAR_LABELS[avatarPath]} 아바타로 변경`}
            className="relative cursor-pointer self-end"
          >
            <img src={avatarPath} alt="" className="w-full rounded-lg" />
            {avatarPath === selectedAvatar && (
              <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-green-500">
                <Check size={12} weight="bold" className="text-white" />
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="sticky bottom-0 -mx-6 mt-auto flex gap-3 border-t border-zinc-100 bg-white px-6 py-4">
        <Button
          type="button"
          variant="cancel"
          onClick={onCancel}
          className="flex-1 py-2.5 text-sm font-medium"
        >
          취소
        </Button>
        <Button
          type="button"
          variant="primary"
          onClick={onConfirm}
          disabled={confirmDisabled}
          className="flex flex-1 items-center justify-center gap-2 py-2.5 text-sm font-medium"
        >
          {isPending ? (
            <>
              <LoadingSpinner size="xs" />
              변경 중
            </>
          ) : (
            "변경하기"
          )}
        </Button>
      </div>
    </div>
  );
}
