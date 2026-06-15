import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { HotPlacesWidget } from "../HotPlacesWidget";
import { fetchHotPlaces } from "@/api/friends";

vi.mock("@/api/friends", () => ({
  fetchHotPlaces: vi.fn(),
  friendQueryKeys: {
    hotPlaces: () => ["friends", "widgets", "hot-places"],
  },
}));

vi.mock("@phosphor-icons/react", () => ({
  Fire: () => <span data-testid="icon-fire" />,
  Camera: () => <span data-testid="icon-camera" />,
}));

const mockFetchHotPlaces = vi.mocked(fetchHotPlaces);

function renderWidget() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  return render(<HotPlacesWidget />, { wrapper: Wrapper });
}

describe("HotPlacesWidget", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("로딩 중에는 스켈레톤을 표시한다", () => {
    mockFetchHotPlaces.mockImplementation(() => new Promise(() => {}));
    const { container } = renderWidget();

    expect(container.querySelectorAll(".animate-pulse")).toHaveLength(6);
  });

  it("fetchHotPlaces 실패 시 에러 메시지를 표시한다", async () => {
    mockFetchHotPlaces.mockRejectedValue(new Error("실패"));
    renderWidget();

    expect(await screen.findByText("목록을 불러오지 못했어요")).toBeInTheDocument();
  });

  it("items가 비어있으면 안내 문구와 아이콘을 표시한다", async () => {
    mockFetchHotPlaces.mockResolvedValue([]);
    renderWidget();

    expect(await screen.findByText("친구들의 인기 장소가 없어요")).toBeInTheDocument();
    expect(screen.getByText("친구가 버킷리스트를 추가하면 보여드릴게요")).toBeInTheDocument();
    expect(screen.getByTestId("icon-fire")).toBeInTheDocument();
  });

  it("항목을 '{순위}. {장소} · {개수}곳' 형식으로 표시하고 장소 사진을 보여준다", async () => {
    mockFetchHotPlaces.mockResolvedValue([
      { countryCode: "JP", displayName: "신주쿠구", count: 3, placeId: "place-jp" },
    ]);
    const { container } = renderWidget();

    expect(await screen.findByText("1. 신주쿠구 · 3곳")).toBeInTheDocument();
    expect(container.querySelector("img")?.getAttribute("src")).toBe(
      "/api/places/photo?placeId=place-jp",
    );
  });

  it("여러 항목이면 순위 순서대로 표시한다", async () => {
    mockFetchHotPlaces.mockResolvedValue([
      { countryCode: "KR", displayName: "강남구", count: 5, placeId: "place-kr" },
      { countryCode: "JP", displayName: "신주쿠구", count: 3, placeId: "place-jp" },
    ]);
    renderWidget();

    expect(await screen.findByText("1. 강남구 · 5곳")).toBeInTheDocument();
    expect(screen.getByText("2. 신주쿠구 · 3곳")).toBeInTheDocument();
  });
});
