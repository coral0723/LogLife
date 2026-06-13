"use client";

import LoadingSpinner from "@/app/(afterLogin)/_components/LoadingSpinner";

const MAX_NICKNAME_LENGTH = 15;

type Props = {
  value: string;
  currentNickname: string;
  isPending: boolean;
  errorMessage: string | null;
  onChange: (value: string) => void;
  onConfirm: () => void;
  onCancel: () => void;
};

export function NicknameEditPanel({
  value,
  currentNickname,
  isPending,
  errorMessage,
  onChange,
  onConfirm,
  onCancel,
}: Props) {
  const trimmed = value.trim();
  const confirmDisabled = trimmed.length === 0 || trimmed === currentNickname || isPending;

  return (
    <div className="flex flex-1 flex-col mt-4">
      <span className="text-sm font-medium text-zinc-400 mt-2 mb-2">닉네임 변경</span>

      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        maxLength={MAX_NICKNAME_LENGTH}
        className="w-full rounded-xl border border-zinc-200 px-3 py-2.5 text-sm text-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
      />
      <span className="mt-1 self-end text-xs text-zinc-400">
        {value.length}/{MAX_NICKNAME_LENGTH}
      </span>

      <div className="sticky bottom-0 -mx-6 mt-auto flex gap-3 border-t border-zinc-100 bg-white px-6 py-4">
        {errorMessage && (
          <div className="absolute inset-x-4 bottom-full mb-3 flex items-center justify-center rounded-xl bg-zinc-900 px-4 py-2.5 text-sm text-white shadow-lg">
            {errorMessage}
          </div>
        )}
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 cursor-pointer rounded-xl border border-zinc-200 bg-white py-2.5 text-sm font-medium text-zinc-600 hover:bg-zinc-50"
        >
          취소
        </button>
        <button
          type="button"
          onClick={onConfirm}
          disabled={confirmDisabled}
          className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-medium text-white ${
            confirmDisabled ? "bg-zinc-300" : "cursor-pointer bg-zinc-900 hover:bg-zinc-800"
          }`}
        >
          {isPending ? (
            <>
              <LoadingSpinner size="xs" />
              변경 중
            </>
          ) : (
            "변경하기"
          )}
        </button>
      </div>
    </div>
  );
}
