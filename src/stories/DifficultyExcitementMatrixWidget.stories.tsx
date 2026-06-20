import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import type { ComponentType } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { http, HttpResponse } from "msw";

import { DifficultyExcitementMatrixWidget } from "@/components/dashboard/DifficultyExcitementMatrixWidget";
import { dashboardQueryKeys } from "../api/dashboard";
import type { DifficultyExcitementItem } from "../lib/bucketList/difficultyExcitementMatrix";

// 스토리별로 QueryClient에 difficultyExcitement 쿼리 상태를 미리 주입하는 데코레이터
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

function makeItem(overrides: Partial<DifficultyExcitementItem> = {}): DifficultyExcitementItem {
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

// 사분면별 1~2개씩 균형 있게 채운 기본 데이터
const balancedItems: DifficultyExcitementItem[] = [
  makeItem({ id: "1", title: "풀코스 마라톤 완주", difficulty: 5, excitement: 2 }), // 마음먹고 천천히
  makeItem({ id: "2", title: "오로라 보러 아이슬란드 여행", difficulty: 5, excitement: 5 }), // 버킷리스트의 꽃
  makeItem({ id: "3", title: "에베레스트 베이스캠프 트레킹", difficulty: 4, excitement: 5 }), // 버킷리스트의 꽃
  makeItem({ id: "4", title: "동네 카페 투어", difficulty: 1, excitement: 2 }), // 여유 있을 때
  makeItem({ id: "5", title: "번지점프 체험", difficulty: 2, excitement: 5 }), // 지금 도전!
];

// 일부 사분면은 비우고, 한 사분면은 6개 이상으로 채워 "아직 없어요"와 "+N개 더보기"를 함께 보여주는 데이터
const mixedItems: DifficultyExcitementItem[] = [
  ...Array.from({ length: 6 }, (_, i) =>
    makeItem({
      id: `gem-${i}`,
      title: `보석 항목 ${i + 1}`,
      difficulty: 4,
      excitement: 4,
    })
  ), // 버킷리스트의 꽃 (6개, 더보기 표시)
  makeItem({ id: "relax-1", title: "동네 산책", difficulty: 1, excitement: 1 }), // 여유 있을 때
  makeItem({ id: "challenge-1", title: "방탈출 카페", difficulty: 2, excitement: 4 }), // 지금 도전!
];

const meta = {
  title: "Components/DifficultyExcitementMatrixWidget",
  component: DifficultyExcitementMatrixWidget,
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
      description: "패널 열림 여부 — false면 쿼리가 비활성화되어 매트릭스가 표시되지 않는다.",
    },
  },
} satisfies Meta<typeof DifficultyExcitementMatrixWidget>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  name: "기본",
  decorators: [
    withQueryCache((qc) => qc.setQueryData(dashboardQueryKeys.difficultyExcitement(), balancedItems)),
  ],
};

export const MixedQuadrants: Story = {
  name: "일부 사분면만 채워짐",
  decorators: [
    withQueryCache((qc) => qc.setQueryData(dashboardQueryKeys.difficultyExcitement(), mixedItems)),
  ],
};

export const Empty: Story = {
  name: "빈 매트릭스",
  decorators: [
    withQueryCache((qc) => qc.setQueryData(dashboardQueryKeys.difficultyExcitement(), [])),
  ],
};

export const Loading: Story = {
  name: "로딩",
  decorators: [
    // 영원히 resolve되지 않는 쿼리를 미리 프리페치해 fetching 상태를 고정한다
    withQueryCache((qc) => {
      qc.prefetchQuery({
        queryKey: dashboardQueryKeys.difficultyExcitement(),
        queryFn: () => new Promise<DifficultyExcitementItem[]>(() => {}),
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
          "/api/dashboard/difficulty-excitement",
          () => new HttpResponse(null, { status: 500 }),
        ),
      ],
    },
  },
};
