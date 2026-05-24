"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import {
  PlacesAutocomplete,
  type NormalizedPlace,
} from "@/components/PlacesAutocomplete";

import { createBucketList } from "./actions";

type Visibility = "PRIVATE" | "FRIENDS" | "PUBLIC";

export function CreateBucketListForm() {
  const router = useRouter();
  const [place, setPlace] = useState<NormalizedPlace | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (formData: FormData) => {
    if (!place) {
      setError("위치를 선택해주세요.");
      return;
    }
    setError(null);
    const title = String(formData.get("title") ?? "").trim();
    const descriptionRaw = String(formData.get("description") ?? "").trim();
    const deadlineRaw = String(formData.get("deadlineAt") ?? "").trim();
    const visibility = formData.get("visibility") as Visibility;
    const difficulty = Number(formData.get("difficulty"));
    const excitement = Number(formData.get("excitement"));

    startTransition(async () => {
      try {
        await createBucketList({
          title,
          description: descriptionRaw === "" ? null : descriptionRaw,
          visibility,
          deadlineAt: deadlineRaw === "" ? null : new Date(deadlineRaw),
          difficulty,
          excitement,
          ...place,
        });
        router.push("/");
      } catch (e) {
        setError(e instanceof Error ? e.message : "저장에 실패했습니다.");
      }
    });
  };

  return (
    <form action={handleSubmit} className="space-y-4">
      <label className="block">
        <span className="mb-1 block text-sm font-medium">제목</span>
        <input
          name="title"
          required
          maxLength={100}
          className="w-full rounded border border-gray-300 px-3 py-2"
        />
      </label>

      <label className="block">
        <span className="mb-1 block text-sm font-medium">내용</span>
        <textarea
          name="description"
          maxLength={2000}
          rows={4}
          className="w-full rounded border border-gray-300 px-3 py-2"
        />
      </label>

      <div>
        <span className="mb-1 block text-sm font-medium">위치</span>
        <PlacesAutocomplete onSelect={setPlace} />
      </div>

      <label className="block">
        <span className="mb-1 block text-sm font-medium">마감일</span>
        <input
          type="date"
          name="deadlineAt"
          className="w-full rounded border border-gray-300 px-3 py-2"
        />
      </label>

      <div className="grid grid-cols-2 gap-4">
        <label className="block">
          <span className="mb-1 block text-sm font-medium">난이도 (1–5)</span>
          <input
            type="number"
            name="difficulty"
            min={1}
            max={5}
            required
            defaultValue={3}
            className="w-full rounded border border-gray-300 px-3 py-2"
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm font-medium">설레임 (1–5)</span>
          <input
            type="number"
            name="excitement"
            min={1}
            max={5}
            required
            defaultValue={3}
            className="w-full rounded border border-gray-300 px-3 py-2"
          />
        </label>
      </div>

      <label className="block">
        <span className="mb-1 block text-sm font-medium">공개 범위</span>
        <select
          name="visibility"
          defaultValue="PUBLIC"
          className="w-full rounded border border-gray-300 px-3 py-2"
        >
          <option value="PRIVATE">비공개</option>
          <option value="FRIENDS">친구 공개</option>
          <option value="PUBLIC">전체 공개</option>
        </select>
      </label>

      {error && (
        <p role="alert" className="text-sm text-red-600">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded bg-black px-4 py-2 text-white disabled:opacity-50"
      >
        {isPending ? "저장 중…" : "저장"}
      </button>
    </form>
  );
}
