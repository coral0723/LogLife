import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import type { ComponentType } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { http, HttpResponse } from "msw";

import { AchievementStatsWidget } from "@/components/dashboard/AchievementStatsWidget";
import { dashboardQueryKeys } from "../api/dashboard";
import type { AchievementStats } from "../lib/bucketList/achievementStats";

// 스토리별로 QueryClient에 achievementStats 쿼리 상태를 미리 주입하는 데코레이터
function withQueryCache(setup?: (qc: QueryClient) => void) {
  return function QueryCacheDecorator(Story: ComponentType) {
    const qc = new QueryClient({
      defaultOptions: { queries: { retry: false, staleTime: Infinity } },
    });
    setup?.(qc);
    return (
      <QueryClientProvider client={qc}>
        <Story />
      </QueryClientProvider>
    );
  };
}

const sampleStats: AchievementStats = {
  achievementRate: 50,
  avgDays: 12,
  longestItem: { title: "유럽 배낭여행", displayName: "사용자", days: 30 },
};

const emptyStats: AchievementStats = {
  achievementRate: 0,
  avgDays: null,
  longestItem: null,
};

const meta = {
  title: "Components/AchievementStatsWidget",
  component: AchievementStatsWidget,
  parameters: {
    layout: "centered",
  },
  decorators: [
    (Story) => (
      <div style={{ width: "360px" }}>
        <Story />
      </div>
    ),
  ],
  tags: ["autodocs"],
  args: {
    isOpen: true,
  },
  argTypes: {
    isOpen: {
      control: "boolean",
      description: "패널 열림 여부 — false면 쿼리가 비활성화되어 통계가 표시되지 않는다.",
    },
  },
} satisfies Meta<typeof AchievementStatsWidget>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  name: "기본",
  decorators: [
    withQueryCache((qc) => qc.setQueryData(dashboardQueryKeys.achievementStats(), sampleStats)),
  ],
};

export const Empty: Story = {
  name: "달성 항목 없음",
  decorators: [
    withQueryCache((qc) => qc.setQueryData(dashboardQueryKeys.achievementStats(), emptyStats)),
  ],
};

export const Loading: Story = {
  name: "로딩",
  decorators: [
    // 영원히 resolve되지 않는 쿼리를 미리 프리페치해 fetching 상태를 고정한다
    withQueryCache((qc) => {
      qc.prefetchQuery({
        queryKey: dashboardQueryKeys.achievementStats(),
        queryFn: () => new Promise<AchievementStats>(() => {}),
      });
    }),
  ],
};

export const FetchError: Story = {
  name: "에러",
  decorators: [withQueryCache()],
  parameters: {
    msw: {
      handlers: [
        http.get(
          "/api/dashboard/achievement-stats",
          () => new HttpResponse(null, { status: 500 }),
        ),
      ],
    },
  },
};
