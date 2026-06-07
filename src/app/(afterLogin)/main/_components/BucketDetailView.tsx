"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  MapPin,
  ShareNetwork,
} from "@phosphor-icons/react";
import { useQuery } from "@tanstack/react-query";

import { getStatus, STATUS_CONFIG, VISIBILITY_CONFIG } from "@/lib/bucketStatus";
import { ImageWithFallback } from "@/app/(afterLogin)/_components/ImageWithFallback";
import { fetchBucketDetail, bucketQueryKeys } from "@/api/bucketlists";

interface Props {
  bucketId: string;
  onBack?: () => void;
  photoSrc?: string;
}

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

export function BucketDetailView({ bucketId, onBack, photoSrc }: Props) {
  const [copied, setCopied] = useState(false);

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

  return (
    <div className="flex flex-col h-full overflow-hidden">
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
    </div>
  );
}
