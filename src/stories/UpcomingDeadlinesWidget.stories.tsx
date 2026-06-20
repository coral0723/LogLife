import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import type { ComponentType } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { http, HttpResponse } from "msw";

import { UpcomingDeadlinesWidget } from "@/components/dashboard/UpcomingDeadlinesWidget";
import { dashboardQueryKeys, type UpcomingDeadlineItem } from "../api/dashboard";

// 스토리별로 QueryClient에 upcomingDeadlines 쿼리 상태를 미리 주입하는 데코레이터
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

const sampleItems: UpcomingDeadlineItem[] = [
  { id: "1", title: "제주도 한 달 살기", displayName: "여행", deadlineAt: daysFromNow(0) },
  { id: "2", title: "독서 50권 완독", displayName: "자기계발", deadlineAt: daysFromNow(2) },
  { id: "3", title: "풀코스 마라톤 완주", displayName: "운동", deadlineAt: daysFromNow(5) },
  { id: "4", title: "유럽 배낭여행", displayName: "여행", deadlineAt: daysFromNow(15) },
];

const meta = {
  title: "Components/UpcomingDeadlinesWidget",
  component: UpcomingDeadlinesWidget,
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
      description: "패널 열림 여부 — false면 쿼리가 비활성화되어 목록이 표시되지 않는다.",
    },
  },
} satisfies Meta<typeof UpcomingDeadlinesWidget>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  name: "기본",
  decorators: [
    withQueryCache((qc) => qc.setQueryData(dashboardQueryKeys.upcomingDeadlines(), sampleItems)),
  ],
};

export const Empty: Story = {
  name: "빈 목록",
  decorators: [
    withQueryCache((qc) => qc.setQueryData(dashboardQueryKeys.upcomingDeadlines(), [])),
  ],
};

export const Loading: Story = {
  name: "로딩",
  decorators: [
    // 영원히 resolve되지 않는 쿼리를 미리 프리페치해 fetching 상태를 고정한다
    withQueryCache((qc) => {
      qc.prefetchQuery({
        queryKey: dashboardQueryKeys.upcomingDeadlines(),
        queryFn: () => new Promise<UpcomingDeadlineItem[]>(() => {}),
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
          "/api/dashboard/upcoming-deadlines",
          () => new HttpResponse(null, { status: 500 }),
        ),
      ],
    },
  },
};
