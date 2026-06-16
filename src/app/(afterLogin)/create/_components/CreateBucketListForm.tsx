"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import {
  PlacesAutocomplete,
  type NormalizedPlace,
} from "@/app/(afterLogin)/_components/PlacesAutocomplete";
import LoadingSpinner from "@/app/(afterLogin)/_components/LoadingSpinner";
import { Button } from "@/app/(afterLogin)/_components/Button";
import { createBucketList } from "@/actions/bucketList/actions";
import { useTodayDateString } from "@/lib/date/useTodayDateString";

import { DotRatingInput } from "./DotRatingInput";

type Visibility = "PRIVATE" | "FRIENDS" | "PUBLIC";

const TITLE_MAX = 20;
const DESCRIPTION_MAX = 1000;

type Props = {
  onSuccess?: () => void;
};

export function CreateBucketListForm({ onSuccess }: Props) {
  const router = useRouter();
  const [place, setPlace] = useState<NormalizedPlace | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [deadlineAt, setDeadlineAt] = useState("");
  const [deadlineFocused, setDeadlineFocused] = useState(false);
  const [difficulty, setDifficulty] = useState(3);
  const [excitement, setExcitement] = useState(3);
  const minDate = useTodayDateString();

  const canSubmit = title.trim() !== "" && place !== null && deadlineAt !== "";

  const handleSubmit = (formData: FormData) => {
    if (!place) {
      setError("위치를 선택해주세요.");
      return;
    }
    setError(null);
    const visibility = formData.get("visibility") as Visibility;

    startTransition(async () => {
      try {
        await createBucketList({
          title: title.trim(),
          description: description.trim() === "" ? null : description.trim(),
          visibility,
          deadlineAt: new Date(deadlineAt),
          difficulty,
          excitement,
          ...place,
        });
        if (onSuccess) {
          onSuccess();
        } else {
          router.push("/main");
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : "저장에 실패했습니다.");
      }
    });
  };

  return (
    <form action={handleSubmit} className="contents">
      <div className="flex-1 overflow-y-auto px-5 pb-4">
        <label className="mb-4 block">
          <span className="mb-1 block text-sm font-medium text-zinc-700">제목</span>
          <input
            name="title"
            required
            maxLength={TITLE_MAX}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            spellCheck={false}
            className="w-full rounded-xl border border-zinc-200 px-3 py-2.5 text-sm focus:outline-none"
          />
          <p className="mt-1 text-right text-xs text-zinc-400">
            {title.length}/{TITLE_MAX}
          </p>
        </label>

        <label className="mb-4 block">
          <span className="mb-1 block text-sm font-medium text-zinc-700">내용</span>
          <textarea
            name="description"
            maxLength={DESCRIPTION_MAX}
            rows={8}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            spellCheck={false}
            className="w-full resize-none rounded-xl border border-zinc-200 px-3 py-2.5 text-sm focus:outline-none"
          />
          <p className="mt-1 text-right text-xs text-zinc-400">
            {description.length}/{DESCRIPTION_MAX}
          </p>
        </label>

        <div className="mb-9">
          <span className="mb-1 block text-sm font-medium text-zinc-700">위치</span>
          <PlacesAutocomplete onSelect={setPlace} />
        </div>

        <label className="mb-9 block">
          <span className="mb-1 block text-sm font-medium text-zinc-700">마감일</span>
          <div className="relative">
            <input
              type="date"
              name="deadlineAt"
              required
              min={minDate}
              value={deadlineAt}
              onChange={(e) => setDeadlineAt(e.target.value)}
              onFocus={() => setDeadlineFocused(true)}
              onBlur={() => setDeadlineFocused(false)}
              className={`w-full rounded-xl border border-zinc-200 px-3 py-2.5 text-sm focus:outline-none ${
                deadlineAt || deadlineFocused ? "text-zinc-900" : "text-transparent"
              }`}
            />
            {/* 네이티브 date input의 기본 "연도-월-일" 표시를 가리고 안내 문구로 대체 */}
            {!deadlineAt && !deadlineFocused && (
              <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-sm text-zinc-400">
                마감일을 선택해주세요
              </span>
            )}
          </div>
        </label>

        <div className="mb-9 grid grid-cols-2 gap-4">
          <div>
            <span className="mb-2 block text-sm font-medium text-zinc-700">난이도</span>
            <DotRatingInput name="difficulty" value={difficulty} onChange={setDifficulty} />
          </div>
          <div>
            <span className="mb-2 block text-sm font-medium text-zinc-700">설레임</span>
            <DotRatingInput name="excitement" value={excitement} onChange={setExcitement} />
          </div>
        </div>

        <label className="block">
          <span className="mb-1 block text-sm font-medium text-zinc-700">공개 범위</span>
          <select
            name="visibility"
            defaultValue="PUBLIC"
            className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-sm focus:outline-none"
          >
            <option value="PRIVATE">비공개</option>
            <option value="FRIENDS">친구 공개</option>
            <option value="PUBLIC">전체 공개</option>
          </select>
        </label>
      </div>

      <div className="flex-shrink-0 border-t border-zinc-100 bg-white px-5 py-3">
        {error && (
          <p role="alert" className="mb-2 text-sm text-red-600">
            {error}
          </p>
        )}
        <Button
          type="submit"
          variant="primary"
          disabled={isPending || !canSubmit}
          className="flex w-full items-center justify-center gap-2 py-3 text-sm font-medium transition-colors"
        >
          {isPending && <LoadingSpinner size="xs" />}
          작성하기
        </Button>
      </div>
    </form>
  );
}
