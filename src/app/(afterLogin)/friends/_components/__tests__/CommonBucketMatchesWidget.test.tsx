import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { CommonBucketMatchesWidget } from "../CommonBucketMatchesWidget";
import { fetchCommonBucketMatches } from "@/api/friends";

vi.mock("@/api/friends", () => ({
  fetchCommonBucketMatches: vi.fn(),
  friendQueryKeys: {
    commonBuckets: () => ["friends", "widgets", "common-buckets"],
  },
}));

vi.mock("@phosphor-icons/react", () => ({
  MapPin: () => <span data-testid="icon-map-pin" />,
}));

const mockFetchCommonBucketMatches = vi.mocked(fetchCommonBucketMatches);

const MATCH_ITEM = {
  placeId: "place-1",
  displayName: "신주쿠구",
  myItem: { id: "my-1", title: "내 항목", achieved: false },
  friends: [{ id: "friend-1", username: "friend1", name: "친구1", title: "친구 항목", achieved: false }],
};

function renderWidget() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  return render(<CommonBucketMatchesWidget />, { wrapper: Wrapper });
}

describe("CommonBucketMatchesWidget", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("로딩 중에는 스켈레톤을 표시한다", () => {
    mockFetchCommonBucketMatches.mockImplementation(() => new Promise(() => {}));
    const { container } = renderWidget();

    expect(container.querySelectorAll(".animate-pulse")).toHaveLength(9);
  });

  it("fetchCommonBucketMatches 실패 시 에러 메시지를 표시한다", async () => {
    mockFetchCommonBucketMatches.mockRejectedValue(new Error("실패"));
    renderWidget();

    expect(await screen.findByText("목록을 불러오지 못했어요")).toBeInTheDocument();
  });

  it("items가 비어있으면 안내 문구와 아이콘을 표시한다", async () => {
    mockFetchCommonBucketMatches.mockResolvedValue([]);
    renderWidget();

    expect(await screen.findByText("친구와 겹치는 버킷리스트가 없어요")).toBeInTheDocument();
    expect(screen.getByText("같은 장소를 버킷리스트에 추가해보세요")).toBeInTheDocument();
    expect(screen.getByTestId("icon-map-pin")).toBeInTheDocument();
  });

  it("매치 항목을 '{친구}님과 함께 — {장소}' 형식으로 표시한다", async () => {
    mockFetchCommonBucketMatches.mockResolvedValue([MATCH_ITEM]);
    renderWidget();

    expect(await screen.findByText("친구1님과 함께 — 신주쿠구")).toBeInTheDocument();
    expect(screen.getByText("내 항목 · 친구 항목")).toBeInTheDocument();
  });

  it("친구 이름이 없으면 username을 표시한다", async () => {
    mockFetchCommonBucketMatches.mockResolvedValue([
      { ...MATCH_ITEM, friends: [{ ...MATCH_ITEM.friends[0], name: null }] },
    ]);
    renderWidget();

    expect(await screen.findByText("friend1님과 함께 — 신주쿠구")).toBeInTheDocument();
  });

  it("한 장소에 친구가 여러 명이면 각각 행으로 표시한다", async () => {
    mockFetchCommonBucketMatches.mockResolvedValue([
      {
        ...MATCH_ITEM,
        friends: [
          { id: "friend-1", username: "friend1", name: "친구1", title: "친구1 항목", achieved: false },
          { id: "friend-2", username: "friend2", name: "친구2", title: "친구2 항목", achieved: true },
        ],
      },
    ]);
    renderWidget();

    expect(await screen.findByText("친구1님과 함께 — 신주쿠구")).toBeInTheDocument();
    expect(screen.getByText("친구2님과 함께 — 신주쿠구")).toBeInTheDocument();
  });
});
