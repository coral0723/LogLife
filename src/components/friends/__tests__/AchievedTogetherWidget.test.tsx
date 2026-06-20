import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { AchievedTogetherWidget } from "../AchievedTogetherWidget";
import { fetchAchievedTogetherMoments } from "@/api/friends";

vi.mock("@/api/friends", () => ({
  fetchAchievedTogetherMoments: vi.fn(),
  friendQueryKeys: {
    achievedTogether: () => ["friends", "widgets", "achieved-together"],
  },
}));

vi.mock("@phosphor-icons/react", () => ({
  Confetti: () => <span data-testid="icon-confetti" />,
}));

const mockFetchAchievedTogetherMoments = vi.mocked(fetchAchievedTogetherMoments);

const MOMENT_ITEM = {
  placeId: "place-1",
  displayName: "신주쿠구",
  myItem: { id: "my-1", title: "내 항목", achievedAt: "2026-01-01T00:00:00.000Z" },
  friendItem: {
    id: "friend-item-1",
    title: "친구 항목",
    achievedAt: "2026-01-10T00:00:00.000Z",
    friendId: "friend-1",
    friendUsername: "friend1",
    friendName: "친구1",
  },
  daysApart: 9,
};

function renderWidget() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  return render(<AchievedTogetherWidget />, { wrapper: Wrapper });
}

describe("AchievedTogetherWidget", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("로딩 중에는 스켈레톤을 표시한다", () => {
    mockFetchAchievedTogetherMoments.mockImplementation(() => new Promise(() => {}));
    const { container } = renderWidget();

    expect(container.querySelectorAll(".animate-pulse")).toHaveLength(6);
  });

  it("fetchAchievedTogetherMoments 실패 시 에러 메시지를 표시한다", async () => {
    mockFetchAchievedTogetherMoments.mockRejectedValue(new Error("실패"));
    renderWidget();

    expect(await screen.findByText("목록을 불러오지 못했어요")).toBeInTheDocument();
  });

  it("items가 비어있으면 안내 문구와 아이콘을 표시한다", async () => {
    mockFetchAchievedTogetherMoments.mockResolvedValue([]);
    renderWidget();

    expect(await screen.findByText("함께 달성한 모먼트가 없어요")).toBeInTheDocument();
    expect(screen.getByText("같은 장소를 비슷한 시기에 달성하면 보여드릴게요")).toBeInTheDocument();
    expect(screen.getByTestId("icon-confetti")).toBeInTheDocument();
  });

  it("항목을 '{친구}님도 {일수}일 차이로 {장소} 달성' 형식으로 표시한다", async () => {
    mockFetchAchievedTogetherMoments.mockResolvedValue([MOMENT_ITEM]);
    renderWidget();

    expect(await screen.findByText("친구1님도 9일 차이로 신주쿠구 달성")).toBeInTheDocument();
  });

  it("친구 이름이 없으면 username을 표시한다", async () => {
    mockFetchAchievedTogetherMoments.mockResolvedValue([
      { ...MOMENT_ITEM, friendItem: { ...MOMENT_ITEM.friendItem, friendName: null } },
    ]);
    renderWidget();

    expect(await screen.findByText("friend1님도 9일 차이로 신주쿠구 달성")).toBeInTheDocument();
  });

  it("여러 항목이면 모두 표시한다", async () => {
    mockFetchAchievedTogetherMoments.mockResolvedValue([
      MOMENT_ITEM,
      {
        ...MOMENT_ITEM,
        placeId: "place-2",
        displayName: "오사카",
        myItem: { id: "my-2", title: "내 항목2", achievedAt: "2026-02-01T00:00:00.000Z" },
        friendItem: { ...MOMENT_ITEM.friendItem, id: "friend-item-2", friendUsername: "friend2", friendName: "친구2" },
        daysApart: 2,
      },
    ]);
    renderWidget();

    expect(await screen.findByText("친구1님도 9일 차이로 신주쿠구 달성")).toBeInTheDocument();
    expect(screen.getByText("친구2님도 2일 차이로 오사카 달성")).toBeInTheDocument();
  });
});
