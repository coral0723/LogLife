import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import type { ComponentType } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { http, HttpResponse } from "msw";

import { ProfileBadge } from "@/components/nav/ProfileBadge";
import { userQueryKeys, type CurrentUser } from "../api/user";

// 스토리별로 QueryClient에 me 쿼리 상태를 미리 주입하는 데코레이터
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

const sampleUser: CurrentUser = {
  image: "/avatars/cat.png",
  name: "홍길동",
  username: "honggildong",
};

const meta = {
  title: "Components/ProfileBadge",
  component: ProfileBadge,
  parameters: {
    layout: "fullscreen",
  },
  decorators: [
    (Story) => (
      <div style={{ height: "200px", background: "#f3f4f6" }}>
        <Story />
      </div>
    ),
  ],
  tags: ["autodocs"],
} satisfies Meta<typeof ProfileBadge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  name: "기본",
  decorators: [withQueryCache((qc) => qc.setQueryData(userQueryKeys.me(), sampleUser))],
};

export const UsernameOnly: Story = {
  name: "username만",
  decorators: [
    withQueryCache((qc) =>
      qc.setQueryData(userQueryKeys.me(), { ...sampleUser, name: null }),
    ),
  ],
};

export const Loading: Story = {
  name: "로딩",
  decorators: [
    // 영원히 resolve되지 않는 쿼리를 미리 프리페치해 스켈레톤 상태를 고정한다
    withQueryCache((qc) => {
      qc.prefetchQuery({
        queryKey: userQueryKeys.me(),
        queryFn: () => new Promise<CurrentUser>(() => {}),
      });
    }),
  ],
};

export const FetchError: Story = {
  name: "에러",
  decorators: [withQueryCache()],
  parameters: {
    msw: {
      handlers: [http.get("/api/me", () => new HttpResponse(null, { status: 500 }))],
    },
  },
};
