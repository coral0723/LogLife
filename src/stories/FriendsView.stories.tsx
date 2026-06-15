import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import type { ComponentType } from "react";
import { QueryClient, QueryClientProvider, type InfiniteData } from "@tanstack/react-query";
import { userEvent } from "storybook/test";

import { FriendsView } from "../app/(afterLogin)/friends/_components/FriendsView";
import {
  friendQueryKeys,
  type AchievedTogetherMoment,
  type CommonMatchItem,
  type FriendItem,
  type FriendRequestItem,
  type FriendRequestsPage,
  type FriendsPage,
  type HotPlaceItem,
} from "../api/friends";
import { AVATAR_PATHS } from "../lib/avatar";

// 스토리별로 QueryClient에 친구 페이지 쿼리 상태를 미리 주입하는 데코레이터
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

function toInfiniteData<T>(page: T): InfiniteData<T, string | null> {
  return { pages: [page], pageParams: [null] };
}

function toFriendsPage(items: FriendItem[]): FriendsPage {
  return { items, nextCursor: null, totalCount: items.length };
}

function toFriendRequestsPage(items: FriendRequestItem[]): FriendRequestsPage {
  return { items, nextCursor: null, totalCount: items.length };
}

// 받은 요청·친구 섹션은 기본 접힘 상태라, 내용을 보여주기 위해 토글 버튼을 모두 펼친다
async function expandSections(canvasElement: HTMLElement) {
  const toggles = canvasElement.querySelectorAll<HTMLButtonElement>(
    'button[aria-expanded="false"]',
  );
  for (const toggle of Array.from(toggles)) {
    await userEvent.click(toggle);
  }
}

const sampleRequests: FriendRequestItem[] = [
  {
    friendshipId: "req-1",
    id: "user-2",
    username: "minji",
    name: "민지",
    image: AVATAR_PATHS[1],
    createdAt: "2026-06-10T00:00:00.000Z",
  },
];

const sampleFriends: FriendItem[] = [
  { friendshipId: "friend-1", id: "user-3", username: "junho", name: "준호", image: AVATAR_PATHS[2] },
  { friendshipId: "friend-2", id: "user-4", username: "yuna", name: null, image: AVATAR_PATHS[3] },
];

const sampleCommonBuckets: CommonMatchItem[] = [
  {
    placeId: "place-jeju",
    displayName: "제주도",
    myItem: { id: "bucket-1", title: "제주도 한 달 살기", achieved: false },
    friends: [
      { id: "user-3", username: "junho", name: "준호", title: "제주 한 바퀴 여행", achieved: false },
    ],
  },
];

const sampleHotPlaces: HotPlaceItem[] = [
  { countryCode: "JP", displayName: "도쿄", count: 5, placeId: "place-tokyo" },
  { countryCode: "FR", displayName: "파리", count: 3, placeId: "place-paris" },
  { countryCode: "KR", displayName: "부산", count: 2, placeId: "place-busan" },
];

const sampleAchievedTogether: AchievedTogetherMoment[] = [
  {
    placeId: "place-busan",
    displayName: "부산",
    myItem: { id: "bucket-2", title: "해운대 방문", achievedAt: "2026-05-01T00:00:00.000Z" },
    friendItem: {
      id: "bucket-3",
      title: "부산 여행",
      achievedAt: "2026-05-03T00:00:00.000Z",
      friendId: "user-3",
      friendUsername: "junho",
      friendName: "준호",
    },
    daysApart: 2,
  },
];

const meta = {
  title: "Components/FriendsView",
  component: FriendsView,
  parameters: {
    layout: "fullscreen",
    nextjs: { appDirectory: true },
  },
  decorators: [
    (Story) => (
      <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col bg-white">
        <Story />
      </div>
    ),
  ],
  tags: ["autodocs"],
} satisfies Meta<typeof FriendsView>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  name: "기본",
  decorators: [
    withQueryCache((qc) => {
      qc.setQueryData(friendQueryKeys.requests(), toInfiniteData(toFriendRequestsPage(sampleRequests)));
      qc.setQueryData(friendQueryKeys.list(), toInfiniteData(toFriendsPage(sampleFriends)));
      qc.setQueryData(friendQueryKeys.commonBuckets(), sampleCommonBuckets);
      qc.setQueryData(friendQueryKeys.hotPlaces(), sampleHotPlaces);
      qc.setQueryData(friendQueryKeys.achievedTogether(), sampleAchievedTogether);
    }),
  ],
  play: async ({ canvasElement }) => {
    await expandSections(canvasElement);
  },
};

export const Empty: Story = {
  name: "빈 상태",
  decorators: [
    withQueryCache((qc) => {
      qc.setQueryData(friendQueryKeys.requests(), toInfiniteData(toFriendRequestsPage([])));
      qc.setQueryData(friendQueryKeys.list(), toInfiniteData(toFriendsPage([])));
      qc.setQueryData(friendQueryKeys.commonBuckets(), []);
      qc.setQueryData(friendQueryKeys.hotPlaces(), []);
      qc.setQueryData(friendQueryKeys.achievedTogether(), []);
    }),
  ],
  play: async ({ canvasElement }) => {
    await expandSections(canvasElement);
  },
};
