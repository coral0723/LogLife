import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import type { ComponentType } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { DashboardPanel } from "../app/(afterLogin)/_components/DashboardPanel";
import { dashboardQueryKeys, type UpcomingDeadlineItem } from "../api/dashboard";
import type { DifficultyExcitementItem } from "../lib/bucketList/difficultyExcitementMatrix";
import type { AchievementStats } from "../lib/bucketList/achievementStats";

// 스토리별로 QueryClient에 대시보드 위젯 쿼리 상태를 미리 주입하는 데코레이터
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

// D-Day 배지가 항상 같은 값으로 보이도록 오늘 기준 상대 날짜로 생성
function daysFromNow(days: number) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString();
}

const sampleUpcomingDeadlines: UpcomingDeadlineItem[] = [
  { id: "1", title: "제주도 한 달 살기", displayName: "여행", deadlineAt: daysFromNow(0) },
  { id: "2", title: "독서 50권 완독", displayName: "자기계발", deadlineAt: daysFromNow(2) },
  { id: "3", title: "풀코스 마라톤 완주", displayName: "운동", deadlineAt: daysFromNow(5) },
];

function makeDifficultyExcitementItem(
  overrides: Partial<DifficultyExcitementItem> = {},
): DifficultyExcitementItem {
  return {
    id: "1",
    title: "항목",
    displayName: "나",
    placeId: "place-1",
    difficulty: 1,
    excitement: 1,
    deadlineAt: null,
    visibility: "PUBLIC",
    ...overrides,
  };
}

const sampleDifficultyExcitement: DifficultyExcitementItem[] = [
  makeDifficultyExcitementItem({ id: "1", title: "풀코스 마라톤 완주", difficulty: 5, excitement: 2 }),
  makeDifficultyExcitementItem({
    id: "2",
    title: "오로라 보러 아이슬란드 여행",
    difficulty: 5,
    excitement: 5,
  }),
  makeDifficultyExcitementItem({ id: "3", title: "동네 카페 투어", difficulty: 1, excitement: 2 }),
  makeDifficultyExcitementItem({ id: "4", title: "번지점프 체험", difficulty: 2, excitement: 5 }),
];

const sampleAchievementStats: AchievementStats = {
  achievementRate: 50,
  avgDays: 12,
  longestItem: { title: "유럽 배낭여행", displayName: "사용자", days: 30 },
};

const emptyAchievementStats: AchievementStats = {
  achievementRate: 0,
  avgDays: null,
  longestItem: null,
};

const meta = {
  title: "Components/DashboardPanel",
  component: DashboardPanel,
  parameters: {
    layout: "fullscreen",
  },
  tags: ["autodocs"],
  args: {
    isOpen: true,
    onClose: () => {},
  },
  argTypes: {
    isOpen: {
      control: "boolean",
      description: "패널 열림 여부.",
    },
    onClose: {
      control: false,
      description: "배경(backdrop) 클릭 시 호출되는 콜백.",
    },
  },
} satisfies Meta<typeof DashboardPanel>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  name: "기본",
  decorators: [
    withQueryCache((qc) => {
      qc.setQueryData(dashboardQueryKeys.bucketCount(), 12);
      qc.setQueryData(dashboardQueryKeys.upcomingDeadlines(), sampleUpcomingDeadlines);
      qc.setQueryData(dashboardQueryKeys.difficultyExcitement(), sampleDifficultyExcitement);
      qc.setQueryData(dashboardQueryKeys.achievementStats(), sampleAchievementStats);
    }),
  ],
};

export const Empty: Story = {
  name: "빈 목록",
  decorators: [
    withQueryCache((qc) => {
      qc.setQueryData(dashboardQueryKeys.bucketCount(), 0);
      qc.setQueryData(dashboardQueryKeys.upcomingDeadlines(), []);
      qc.setQueryData(dashboardQueryKeys.difficultyExcitement(), []);
      qc.setQueryData(dashboardQueryKeys.achievementStats(), emptyAchievementStats);
    }),
  ],
};

export const Loading: Story = {
  name: "로딩",
  decorators: [
    // 영원히 resolve되지 않는 쿼리를 미리 프리페치해 4개 위젯 모두 스켈레톤 상태로 고정한다
    withQueryCache((qc) => {
      qc.prefetchQuery({
        queryKey: dashboardQueryKeys.bucketCount(),
        queryFn: () => new Promise<number>(() => {}),
      });
      qc.prefetchQuery({
        queryKey: dashboardQueryKeys.upcomingDeadlines(),
        queryFn: () => new Promise<UpcomingDeadlineItem[]>(() => {}),
      });
      qc.prefetchQuery({
        queryKey: dashboardQueryKeys.difficultyExcitement(),
        queryFn: () => new Promise<DifficultyExcitementItem[]>(() => {}),
      });
      qc.prefetchQuery({
        queryKey: dashboardQueryKeys.achievementStats(),
        queryFn: () => new Promise<AchievementStats>(() => {}),
      });
    }),
  ],
};
