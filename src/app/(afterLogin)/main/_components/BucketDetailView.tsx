"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  MapPin,
  ShareNetwork,
} from "@phosphor-icons/react";
import { useQuery, useQueryClient, type InfiniteData } from "@tanstack/react-query";

import { getStatus, STATUS_CONFIG, VISIBILITY_CONFIG } from "@/lib/bucketList/bucketStatus";
import { toggleAchieved, updateDeadline } from "@/actions/bucketList/actions";
import { ImageWithFallback } from "@/app/(afterLogin)/_components/ImageWithFallback";
import {
  fetchBucketDetail,
  bucketQueryKeys,
  type BucketDetail,
  type BucketsByCountryPage,
} from "@/api/bucketlists";
import { dashboardQueryKeys } from "@/api/dashboard";
import { useTodayDateString } from "@/lib/date/useTodayDateString";

type Props = {
  bucketId: string;
  onBack?: () => void;
  photoSrc?: string;
  isOwner?: boolean;
};

type Toast = { message: string; onUndo?: () => void };

function DotRating({ value, max = 5 }: { value: number; max?: number }) {
  return (
    <div className="flex items-center gap-1.5">
      {Array.from({ length: max }).map((_, i) => (
        <span
          key={i}
          className={`w-2.5 h-2.5 rounded-full ${
            i < value ? "bg-zinc-800" : "bg-zinc-200"
          }`}
        />
      ))}
    </div>
  );
}

const dateFormatter = new Intl.DateTimeFormat("ko-KR", {
  year: "numeric",
  month: "long",
  day: "numeric",
});

export function BucketDetailView({ bucketId, onBack, photoSrc, isOwner = false }: Props) {
  const [copied, setCopied] = useState(false);
  const [toast, setToast] = useState<Toast | null>(null);
  const [resettingDeadline, setResettingDeadline] = useState(false);
  const [deadlineInput, setDeadlineInput] = useState("");
  const minDate = useTodayDateString();
  const [isPending, startTransition] = useTransition();
  const queryClient = useQueryClient();

  const { data: detail, isError } = useQuery({
    queryKey: bucketQueryKeys.detail(bucketId),
    queryFn: () => fetchBucketDetail(bucketId),
  });

  useEffect(() => {
    if (isError) {
      alert("데이터를 불러오는 중 오류가 발생했습니다.");
      window.location.reload();
    }
  }, [isError]);

  if (!detail) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="h-6 w-6 rounded-full border-2 border-zinc-300 border-t-zinc-600 animate-spin" />
      </div>
    );
  }

  const status = getStatus(detail);
  const { label: statusLabel, className: statusClassName } = STATUS_CONFIG[status];
  const { label: visLabel, Icon: VisIcon } = VISIBILITY_CONFIG[detail.visibility];

  const imgSrc = photoSrc ?? `/api/places/photo?placeId=${detail.placeId}`;

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(
        `${window.location.origin}/b/${detail.shareToken}`,
      );
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      alert("클립보드에 오류가 발생했습니다.");
    }
  };

  const showToast = (toast: Toast) => {
    setToast(toast);
    setTimeout(() => setToast(null), 2000);
  };

  const handleToggleAchieved = () => {
    startTransition(async () => {
      try {
        const { achieved } = await toggleAchieved(detail.id);
        queryClient.setQueryData(
          bucketQueryKeys.detail(bucketId),
          (prev?: BucketDetail) =>
            prev && {
              ...prev,
              achieved,
              achievedAt: achieved ? new Date().toISOString() : null,
            },
        );
        queryClient.setQueryData(
          bucketQueryKeys.byCountry(detail.countryCode),
          (prev?: InfiniteData<BucketsByCountryPage>) =>
            prev && {
              ...prev,
              pages: prev.pages.map((page) => ({
                ...page,
                items: page.items.map((item) =>
                  item.id === bucketId ? { ...item, achieved } : item,
                ),
              })),
            },
        );
        queryClient.invalidateQueries({ queryKey: dashboardQueryKeys.upcomingDeadlines() });
        queryClient.invalidateQueries({ queryKey: dashboardQueryKeys.difficultyExcitement() });
        queryClient.invalidateQueries({ queryKey: dashboardQueryKeys.achievementStats() });
        showToast({
          message: achieved ? "달성으로 표시했어요." : "달성을 취소했어요.",
          onUndo: handleToggleAchieved,
        });
      } catch (e) {
        alert(e instanceof Error ? e.message : "처리 중 오류가 발생했습니다.");
      }
    });
  };

  const handleUpdateDeadline = () => {
    if (!deadlineInput) return;
    startTransition(async () => {
      try {
        const { deadlineAt } = await updateDeadline(detail.id, new Date(deadlineInput));
        queryClient.setQueryData(
          bucketQueryKeys.detail(bucketId),
          (prev?: BucketDetail) =>
            prev && { ...prev, deadlineAt: deadlineAt?.toISOString() ?? null },
        );
        queryClient.invalidateQueries({ queryKey: dashboardQueryKeys.upcomingDeadlines() });
        setResettingDeadline(false);
        setDeadlineInput("");
        showToast({ message: "마감일을 다시 설정했어요. 진행 중으로 전환됩니다." });
      } catch (e) {
        alert(e instanceof Error ? e.message : "처리 중 오류가 발생했습니다.");
      }
    });
  };

  return (
    <div className="relative flex flex-col h-full overflow-hidden">
      {/* 사진 헤더 */}
      <div className="relative h-48 flex-shrink-0">
        <ImageWithFallback
          src={imgSrc}
          containerClassName="w-full h-full bg-zinc-100 flex items-center justify-center"
          iconSize={32}
          iconClassName="text-zinc-400"
        />

        {/* 하단 그라데이션 */}
        <div className="absolute inset-0 bg-gradient-to-t from-white via-white/20 to-transparent pointer-events-none" />

        {/* E2E: 소프트 내비게이션으로 인터셉팅 라우트를 트리거하기 위한 Next.js Link */}
        <Link
          href={`/b/${detail.shareToken}`}
          data-testid="share-page-link"
          aria-hidden="true"
          tabIndex={-1}
          className="absolute opacity-0 w-px h-px top-0 left-0"
        />

        {/* 뒤로가기 버튼 */}
        {onBack && (
          <button
            onClick={onBack}
            className="absolute top-3 left-3 w-9 h-9 rounded-full bg-black/50 flex items-center justify-center text-white hover:bg-black/70 transition-colors cursor-pointer"
            aria-label="목록으로 돌아가기"
          >
            <ArrowLeft size={18} weight="bold" />
          </button>
        )}

        {/* 공유 버튼 — PUBLIC 아이템만 표시 */}
        {detail.visibility === "PUBLIC" && (
          <div className="absolute top-3 right-3">
            <button
              onClick={handleShare}
              className="w-9 h-9 rounded-full bg-black/50 flex items-center justify-center text-white hover:bg-black/70 transition-colors cursor-pointer"
              aria-label="공유하기"
            >
              <ShareNetwork size={18} weight="bold" />
            </button>
            {copied && (
              <span className="absolute right-0 top-11 whitespace-nowrap text-xs bg-zinc-900 text-white px-2.5 py-1.5 rounded-lg shadow-lg">
                링크 복사됨
              </span>
            )}
          </div>
        )}
      </div>

      {/* 콘텐츠 */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
        {/* 배지 행 */}
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${statusClassName}`}
          >
            {statusLabel}
          </span>
          <span className="flex items-center gap-1 text-xs text-zinc-500">
            <VisIcon size={12} weight="regular" />
            {visLabel}
          </span>
        </div>

        {/* 제목 */}
        <h2 className="text-xl font-semibold text-zinc-900 leading-snug">
          {detail.title}
        </h2>

        {/* 위치 */}
        <div className="flex items-start gap-1.5">
          <MapPin
            size={14}
            weight="regular"
            className="text-zinc-500 mt-0.5 flex-shrink-0"
          />
          <p className="text-sm text-zinc-500 leading-relaxed">
            {detail.displayName}
          </p>
        </div>

        {/* 설명 */}
        {detail.description && (
          <p className="text-sm text-zinc-700 leading-relaxed">
            {detail.description}
          </p>
        )}

        {/* 난이도 */}
        <div className="space-y-1.5">
          <p className="text-xs font-medium text-zinc-500 tracking-wide">
            난이도
          </p>
          <DotRating value={detail.difficulty} />
        </div>

        {/* 설레임 */}
        <div className="space-y-1.5">
          <p className="text-xs font-medium text-zinc-500 tracking-wide">
            설레임
          </p>
          <DotRating value={detail.excitement} />
        </div>

        {/* 날짜 */}
        {detail.deadlineAt && !detail.achieved && (
          <p className="text-xs text-zinc-400">
            마감일: {dateFormatter.format(new Date(detail.deadlineAt))}
          </p>
        )}
        {detail.achievedAt && (
          <p className="text-xs text-zinc-400">
            달성일: {dateFormatter.format(new Date(detail.achievedAt))}
          </p>
        )}
      </div>

      {/* 본인 소유 — 상태 전환 액션 */}
      {isOwner && (
        <div className="relative flex-shrink-0 border-t border-zinc-100 bg-white px-5 py-3">
          {/* 토스트 — 되돌리기 액션 포함 */}
          {toast && (
            <div className="absolute inset-x-4 bottom-full mb-3 z-20 flex items-center justify-between gap-3 rounded-xl bg-zinc-900 px-4 py-2.5 text-sm text-white shadow-lg">
              <span>{toast.message}</span>
              {toast.onUndo && (
                <button
                  type="button"
                  onClick={toast.onUndo}
                  className="font-medium underline underline-offset-2 cursor-pointer"
                >
                  되돌리기
                </button>
              )}
            </div>
          )}

          {status === "pending" && (
            <button
              type="button"
              onClick={handleToggleAchieved}
              disabled={isPending}
              className="w-full rounded-xl bg-zinc-900 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-800 disabled:opacity-50 cursor-pointer"
            >
              달성으로 표시
            </button>
          )}

          {status === "achieved" && (
            <button
              type="button"
              onClick={handleToggleAchieved}
              disabled={isPending}
              className="w-full rounded-xl border border-zinc-200 py-2.5 text-sm font-medium text-zinc-500 transition-colors hover:bg-zinc-50 disabled:opacity-50 cursor-pointer"
            >
              달성 취소
            </button>
          )}

          {status === "expired" && !resettingDeadline && (
            <button
              type="button"
              onClick={() => setResettingDeadline(true)}
              className="w-full rounded-xl border border-zinc-200 py-2.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 cursor-pointer"
            >
              마감일 다시 설정
            </button>
          )}

          {status === "expired" && resettingDeadline && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleUpdateDeadline();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="date"
                value={deadlineInput}
                onChange={(e) => setDeadlineInput(e.target.value)}
                min={minDate}
                required
                aria-label="새 마감일"
                className="flex-1 rounded-xl border border-zinc-200 px-3 py-2 text-sm text-zinc-700"
              />
              <button
                type="submit"
                disabled={isPending}
                className="rounded-xl bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-800 disabled:opacity-50 cursor-pointer"
              >
                확인
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  );
}
