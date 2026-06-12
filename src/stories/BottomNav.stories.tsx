import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import type { ComponentType } from "react";
import { Bell, Gear, House } from "@phosphor-icons/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { BottomNav } from "../app/(afterLogin)/_components/BottomNav";
import { dashboardQueryKeys } from "../api/dashboard";

// 대시보드 버튼 클릭 시 열리는 DashboardPanel 위젯들의 useQuery에 QueryClient를 제공하는 데코레이터
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

const meta = {
  title: "Components/BottomNav",
  component: BottomNav,
  parameters: {
    layout: "fullscreen",
  },
  decorators: [
    (Story) => (
      <div style={{ height: "300px", background: "#f3f4f6" }}>
        <Story />
      </div>
    ),
  ],
  tags: ["autodocs"],
  argTypes: {
    items: {
      control: false,
      description: `네비게이션 아이템 목록. 미전달 시 앱 기본 메뉴(대시보드·메인·친구) 사용.`,
    },
  },
} satisfies Meta<typeof BottomNav>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  name: "기본",
  parameters: {
    nextjs: { navigation: { pathname: "/" } },
  },
  decorators: [
    withQueryCache((qc) => {
      qc.setQueryData(dashboardQueryKeys.bucketCount(), 12);
      qc.setQueryData(dashboardQueryKeys.upcomingDeadlines(), []);
      qc.setQueryData(dashboardQueryKeys.difficultyExcitement(), []);
    }),
  ],
};

export const CustomItems: Story = {
  name: "커스텀 아이템",
  args: {
    items: [
      { href: "/home", icon: House, label: "홈" },
      { href: "/notifications", icon: Bell, label: "알림" },
      { href: "/settings", icon: Gear, label: "설정" },
    ],
  },
  parameters: {
    nextjs: { navigation: { pathname: "/notifications" } },
  },
};
