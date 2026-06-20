"use client";

import { useState, useTransition } from "react";

import { Button } from "@/app/(afterLogin)/_components/Button";
import LoadingSpinner from "@/app/(afterLogin)/_components/LoadingSpinner";
import {
  PlacesAutocomplete,
  type NormalizedPlace,
} from "@/app/(afterLogin)/_components/PlacesAutocomplete";
import { DotRatingInput } from "@/app/(afterLogin)/create/_components/DotRatingInput";
import { createBucketList } from "@/actions/bucketList/actions";
import { useTodayDateString } from "@/lib/date/useTodayDateString";

import { completeOnboarding } from "../actions";

type Visibility = "PRIVATE" | "FRIENDS" | "PUBLIC";

const TITLE_MAX = 20;
const DESCRIPTION_MAX = 1000;

const inputCls =
  "w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-[#2cc2f7]/40 transition-colors";

export function FirstBucketStep() {
  const [place, setPlace] = useState<NormalizedPlace | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [deadlineAt, setDeadlineAt] = useState("");
  const [deadlineFocused, setDeadlineFocused] = useState(false);
  const [difficulty, setDifficulty] = useState(3);
  const [excitement, setExcitement] = useState(3);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
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
      let created = false;
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
        created = true;
      } catch (e) {
        setError(e instanceof Error ? e.message : "저장에 실패했습니다.");
      }
      // redirect()를 포함한 completeOnboarding은 try/catch 밖에서 호출
      if (created) {
        await completeOnboarding();
      }
    });
  };

  return (
    <div className="pt-4 pb-4">
      {/* 스텝 레이블 */}
      <div className="mb-8 text-center">
        <p className="mb-1 select-none text-[72px] font-bold leading-none tracking-tighter text-white/[0.12]">
          02
        </p>
        <p className="mb-4 flex items-center justify-center gap-2.5 text-xs font-semibold uppercase tracking-[0.2em] text-[#2cc2f7]">
          <span className="h-px w-5 bg-[#2cc2f7]/50" />
          BUCKET LIST
          <span className="h-px w-5 bg-[#2cc2f7]/50" />
        </p>
        <h1 className="mb-2 text-2xl font-bold tracking-tight text-white sm:text-3xl">
          첫 버킷리스트를 등록하세요
        </h1>
        <p className="text-sm leading-relaxed text-zinc-400">
          달성하고 싶은 것을 지구본에 새겨보세요
        </p>
      </div>

      <form action={handleSubmit} className="space-y-5">
        {/* 제목 */}
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-zinc-400">
            제목 
          </span>
          <input
            name="title"
            required
            maxLength={TITLE_MAX}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            spellCheck={false}
            placeholder="버킷리스트 제목"
            className={inputCls}
          />
          <p className="mt-1 text-right text-xs text-zinc-600">
            {title.length}/{TITLE_MAX}
          </p>
        </label>

        {/* 내용 */}
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-zinc-400">
            내용 
          </span>
          <textarea
            name="description"
            maxLength={DESCRIPTION_MAX}
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            spellCheck={false}
            placeholder="상세 내용을 입력하세요"
            className={`${inputCls} resize-none`}
          />
          <p className="mt-1 text-right text-xs text-zinc-600">
            {description.length}/{DESCRIPTION_MAX}
          </p>
        </label>

        {/* 위치 */}
        <div>
          <span className="mb-1.5 block text-sm font-medium text-zinc-400">
            위치 
          </span>
          <PlacesAutocomplete onSelect={setPlace} inputClassName={inputCls} />
        </div>

        {/* 마감일 */}
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-zinc-400">
            마감일 
          </span>
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
              className={inputCls}
              style={!deadlineAt && !deadlineFocused ? { color: "transparent" } : undefined}
            />
            {!deadlineAt && !deadlineFocused && (
              <span className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-sm text-zinc-600">
                마감일을 선택해주세요
              </span>
            )}
          </div>
        </label>

        {/* 난이도 + 설레임 */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <span className="mb-2 block text-sm font-medium text-zinc-400">
              난이도
            </span>
            <DotRatingInput
              name="difficulty"
              value={difficulty}
              onChange={setDifficulty}
              dotClassName="bg-white/15 hover:bg-white/25"
            />
          </div>
          <div>
            <span className="mb-2 block text-sm font-medium text-zinc-400">
              설레임
            </span>
            <DotRatingInput
              name="excitement"
              value={excitement}
              onChange={setExcitement}
              dotClassName="bg-white/15 hover:bg-white/25"
            />
          </div>
        </div>

        {/* 공개 범위 */}
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-zinc-400">
            공개 범위
          </span>
          <div className="relative">
            <select
              name="visibility"
              defaultValue="PUBLIC"
              className="w-full cursor-pointer appearance-none rounded-xl border border-white/10 bg-zinc-900 px-4 py-3 pr-10 text-sm text-white focus:outline-none focus:border-[#2cc2f7]/40 transition-colors"
            >
              <option value="PRIVATE" className="bg-zinc-900">
                비공개
              </option>
              <option value="FRIENDS" className="bg-zinc-900">
                친구 공개
              </option>
              <option value="PUBLIC" className="bg-zinc-900">
                전체 공개
              </option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M2 4L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-400" />
              </svg>
            </div>
          </div>
        </label>

        {error && (
          <p role="alert" className="text-sm text-red-400">
            {error}
          </p>
        )}

        <Button
          type="submit"
          variant="primary"
          shape="pill"
          disabled={isPending || !canSubmit}
          className="flex w-full items-center justify-center gap-2 py-3.5 text-sm font-semibold shadow-[0_0_28px_rgba(44,194,247,0.3)] transition-all enabled:hover:shadow-[0_0_44px_rgba(44,194,247,0.5)] active:scale-[0.98]"
        >
          {isPending && <LoadingSpinner size="xs" />}
          등록하고 시작하기
        </Button>
      </form>
    </div>
  );
}
