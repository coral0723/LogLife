import React from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { BucketDetailView } from "@/components/bucket/BucketDetailView";
import type { BucketDetail } from "../api/bucketlists";

const BASE: BucketDetail = {
  id: "1",
  title: "도쿄 라멘 골목 탐방",
  description:
    "신주쿠 골든가이 근처 숨겨진 라멘집 5곳을 방문하고 최고의 라멘을 찾아본다.",
  visibility: "PUBLIC",
  deadlineAt: null,
  achievedAt: null,
  difficulty: 3,
  excitement: 5,
  achieved: false,
  placeId: "ChIJ1111",
  displayName: "신주쿠구",
  countryCode: "JP",
  shareToken: "abc123",
  user: { username: "traveler", name: "여행자", image: null },
};

// 스토리별로 QueryClient 캐시에 detail을 주입하는 데코레이터
function withQueryCache(detail: BucketDetail) {
  return function QueryCacheDecorator(Story: React.ComponentType) {
    const qc = new QueryClient({
      defaultOptions: { queries: { staleTime: Infinity, retry: false } },
    });
    qc.setQueryData(["bucketlists", "detail", detail.id], detail);
    return (
      <QueryClientProvider client={qc}>
        <Story />
      </QueryClientProvider>
    );
  };
}

// 본인 소유 액션 영역(화면 최하단 고정) 위에 클릭 차단용 투명 레이어를 얹는 데코레이터
// — 클릭 시 toggleAchieved/updateDeadline 서버 액션이 실제 호출되는 것을 막아 디자인 프리뷰만 보여준다
function withOwnerActionGuard(Story: React.ComponentType) {
  return (
    <div style={{ position: "relative", height: "100%" }}>
      <Story />
      <div
        aria-hidden="true"
        style={{ position: "absolute", inset: "auto 0 0 0", height: "72px", zIndex: 10 }}
      />
    </div>
  );
}

const meta = {
  title: "Components/BucketDetailView",
  component: BucketDetailView,
  parameters: {
    layout: "fullscreen",
  },
  decorators: [
    (Story: React.ComponentType) => (
      <div
        style={{
          maxWidth: "448px",
          height: "85vh",
          overflow: "hidden",
          border: "1px solid #e4e4e7",
          borderRadius: "1.5rem",
          margin: "1rem auto",
        }}
      >
        <Story />
      </div>
    ),
    withOwnerActionGuard,
  ],
  tags: ["autodocs"],
  args: {
    bucketId: BASE.id,
    onBack: () => {},
    photoSrc: "/stories/ramen-demo.jpg",
    isOwner: true,
  },
  argTypes: {
    bucketId: {
      control: false,
      description: "버킷리스트 ID — QueryClient 캐시에서 상세 데이터를 조회한다.",
    },
    photoSrc: {
      control: false,
      description:
        "커스텀 사진 URL. 미전달 시 `/api/places/photo?placeId=` 로 자동 요청.",
    },
    onBack: {
      control: false,
      description:
        "뒤로가기 버튼 클릭 시 호출되는 콜백. 미전달 시 버튼이 숨겨진다.",
    },
    isOwner: {
      control: "boolean",
      description:
        "본인 소유 여부 — true면 화면 하단에 상태 전환 액션(달성 토글 · 마감일 다시 설정)이 노출된다.",
    },
  },
} satisfies Meta<typeof BucketDetailView>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  name: "기본",
  decorators: [withQueryCache(BASE)],
};

export const Achieved: Story = {
  name: "달성",
  decorators: [
    withQueryCache({
      ...BASE,
      achieved: true,
      achievedAt: "2024-12-25T00:00:00Z",
      deadlineAt: null,
    }),
  ],
};

export const WithDeadline: Story = {
  name: "마감일 있음",
  decorators: [withQueryCache({ ...BASE, deadlineAt: "2027-12-31T00:00:00Z" })],
};

export const Expired: Story = {
  name: "마감 초과",
  decorators: [withQueryCache({ ...BASE, deadlineAt: "2024-01-01T00:00:00Z" })],
};

export const Private: Story = {
  name: "비공개",
  decorators: [withQueryCache({ ...BASE, visibility: "PRIVATE" })],
};

export const Friends: Story = {
  name: "친구 공개 (소유자)",
  decorators: [withQueryCache({ ...BASE, visibility: "FRIENDS" })],
};

export const ViewerMode: Story = {
  name: "뷰어 모드 — 타인 PUBLIC",
  args: { isOwner: false },
  decorators: [withQueryCache(BASE)],
};

export const FriendsViewer: Story = {
  name: "뷰어 모드 — 타인 FRIENDS",
  args: { isOwner: false },
  decorators: [withQueryCache({ ...BASE, visibility: "FRIENDS" })],
};
