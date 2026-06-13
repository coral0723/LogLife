import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import type { ComponentType } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { http, HttpResponse } from "msw";

import { BucketCountWidget } from "../app/(afterLogin)/_components/BucketCountWidget";
import { dashboardQueryKeys } from "../api/dashboard";

// 스토리별로 QueryClient에 bucketCount 쿼리 상태를 미리 주입하는 데코레이터
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
  title: "Components/BucketCountWidget",
  component: BucketCountWidget,
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
      description:
        "패널 열림 여부 — false면 쿼리가 비활성화되고 카운트 애니메이션도 동작하지 않아 0으로 표시된다.",
    },
  },
} satisfies Meta<typeof BucketCountWidget>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  name: "기본",
  decorators: [
    withQueryCache((qc) => qc.setQueryData(dashboardQueryKeys.bucketCount(), 12)),
  ],
};

export const Zero: Story = {
  name: "0개",
  decorators: [
    withQueryCache((qc) => qc.setQueryData(dashboardQueryKeys.bucketCount(), 0)),
  ],
};

export const Loading: Story = {
  name: "로딩",
  decorators: [
    // 영원히 resolve되지 않는 쿼리를 미리 프리페치해 fetching 상태를 고정한다
    withQueryCache((qc) => {
      qc.prefetchQuery({
        queryKey: dashboardQueryKeys.bucketCount(),
        queryFn: () => new Promise<number>(() => {}),
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
        http.get("/api/dashboard/bucket-count", () => new HttpResponse(null, { status: 500 })),
      ],
    },
  },
};
