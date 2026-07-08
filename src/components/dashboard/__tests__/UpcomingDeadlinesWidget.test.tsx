import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { UpcomingDeadlinesWidget } from "../UpcomingDeadlinesWidget";
import { fetchUpcomingDeadlines } from "@/api/dashboard";

vi.mock("@/api/dashboard", () => ({
  fetchUpcomingDeadlines: vi.fn(),
  dashboardQueryKeys: {
    upcomingDeadlines: () => ["dashboard", "upcoming-deadlines"],
  },
}));

vi.mock("@phosphor-icons/react", () => ({
  Confetti: () => <span data-testid="icon-confetti" />,
}));

vi.mock("framer-motion", () => {
  const li = ({
    children,
    className,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    initial: _initial,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    animate: _animate,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    transition: _transition,
    ...rest
  }: React.LiHTMLAttributes<HTMLLIElement> & {
    initial?: unknown;
    animate?: unknown;
    transition?: unknown;
  }) => (
    <li className={className} {...rest}>
      {children}
    </li>
  );

  return {
    motion: { li },
  };
});

const mockFetchUpcomingDeadlines = vi.mocked(fetchUpcomingDeadlines);

function renderWidget(isOpen: boolean) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  return render(<UpcomingDeadlinesWidget isOpen={isOpen} />, { wrapper: Wrapper });
}

describe("UpcomingDeadlinesWidget", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("로딩 중에는 스켈레톤을 표시한다", () => {
    mockFetchUpcomingDeadlines.mockImplementation(() => new Promise(() => {}));
    renderWidget(true);

    expect(document.querySelectorAll(".animate-pulse")).toHaveLength(9);
  });

  it("fetchUpcomingDeadlines 실패 시 에러 메시지를 표시한다", async () => {
    mockFetchUpcomingDeadlines.mockRejectedValue(new Error("실패"));
    renderWidget(true);

    expect(await screen.findByText("목록을 불러오지 못했어요")).toBeInTheDocument();
  });

  it("빈 배열인 경우 안내 문구와 아이콘을 표시한다", async () => {
    mockFetchUpcomingDeadlines.mockResolvedValue([]);
    renderWidget(true);

    expect(await screen.findByText("마감 임박한 항목이 없어요")).toBeInTheDocument();
    expect(screen.getByText("여유롭게 다음 목표를 계획해보세요")).toBeInTheDocument();
    expect(screen.getByTestId("icon-confetti")).toBeInTheDocument();
  });

  it("정상 데이터 로드 후 각 항목의 title과 displayName을 표시한다", async () => {
    mockFetchUpcomingDeadlines.mockResolvedValue([
      { id: "1", title: "제주도 여행", displayName: "여행", deadlineAt: "2026-07-01T00:00:00" },
      { id: "2", title: "독서 50권", displayName: "자기계발", deadlineAt: "2026-08-01T00:00:00" },
    ]);
    renderWidget(true);

    expect(await screen.findByText("제주도 여행")).toBeInTheDocument();
    expect(screen.getByText("여행")).toBeInTheDocument();
    expect(screen.getByText("독서 50권")).toBeInTheDocument();
    expect(screen.getByText("자기계발")).toBeInTheDocument();
  });

  it("D-day 값에 따라 배지 문구와 스타일이 달라진다", async () => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date("2026-06-11T00:00:00"));

    mockFetchUpcomingDeadlines.mockResolvedValue([
      { id: "1", title: "마감 지남", displayName: "A", deadlineAt: "2026-06-10T00:00:00" },
      { id: "2", title: "3일 후", displayName: "B", deadlineAt: "2026-06-14T00:00:00" },
      { id: "3", title: "7일 후", displayName: "C", deadlineAt: "2026-06-18T00:00:00" },
      { id: "4", title: "10일 후", displayName: "D", deadlineAt: "2026-06-21T00:00:00" },
    ]);

    renderWidget(true);

    expect(await screen.findByText("D-DAY")).toHaveClass("bg-rose-50", "text-rose-600");
    expect(screen.getByText("D-3")).toHaveClass("bg-rose-50", "text-rose-600");
    expect(screen.getByText("D-7")).toHaveClass("bg-amber-50", "text-amber-600");
    expect(screen.getByText("D-10")).toHaveClass("bg-zinc-100", "text-zinc-500");
  });

  it("isOpen=false면 쿼리가 비활성화되어 fetch가 호출되지 않는다", () => {
    mockFetchUpcomingDeadlines.mockResolvedValue([]);
    renderWidget(false);

    expect(mockFetchUpcomingDeadlines).not.toHaveBeenCalled();
  });

  it("isOpen이 false에서 true로 바뀌면 fetch가 호출된다", () => {
    mockFetchUpcomingDeadlines.mockResolvedValue([]);
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    const Wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
    const { rerender } = render(<UpcomingDeadlinesWidget isOpen={false} />, { wrapper: Wrapper });

    expect(mockFetchUpcomingDeadlines).not.toHaveBeenCalled();

    rerender(<UpcomingDeadlinesWidget isOpen={true} />);

    expect(mockFetchUpcomingDeadlines).toHaveBeenCalled();
  });
});
