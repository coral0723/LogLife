import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, act, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { GlobeClient } from "../GlobeClient";

vi.mock("@/api/bucketlists", () => ({
  fetchBucketsByCountry: vi.fn().mockResolvedValue({ items: [], nextCursor: null }),
  fetchBucketDetail: vi.fn(),
  bucketQueryKeys: {
    byCountry: (code: string) => ["bucketlists", "by-country", code],
    detail: (id: string) => ["bucketlists", "detail", id],
  },
}));

function renderWithQuery(ui: React.ReactElement) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={client}>{ui}</QueryClientProvider>
  );
}

vi.mock("next/dynamic", () => ({
  default: () => {
    const MockGlobeView = ({
      onReady,
      onPinClick,
    }: {
      onReady: () => void;
      onPinClick: (pin: {
        countryCode: string;
        lat: number;
        lng: number;
        count: number;
        achievedCount: number;
        hasExpiredDeadline: boolean;
      }) => void;
      pins: unknown[];
    }) => (
      <div>
        <button data-testid="trigger-ready" onClick={onReady}>
          ready
        </button>
        <button
          data-testid="trigger-pin-click"
          onClick={(e) => {
            e.stopPropagation();
            onPinClick({
              countryCode: "KR",
              lat: 35.9,
              lng: 127.8,
              count: 3,
              achievedCount: 2,
              hasExpiredDeadline: false,
            });
          }}
        >
          click pin
        </button>
      </div>
    );
    return MockGlobeView;
  },
}));

vi.mock("framer-motion", () => ({
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  motion: {
    div: ({ children, onClick, className }: React.ComponentProps<"div">) => (
      <div onClick={onClick} className={className}>
        {children}
      </div>
    ),
  },
}));

vi.mock("@phosphor-icons/react", () => ({
  Camera: () => <span data-testid="icon-camera" />,
  CaretDown: () => <span />,
  Globe: () => <span />,
  Lock: () => <span />,
  Users: () => <span />,
}));

vi.mock("../BucketDetailView", () => ({
  BucketDetailView: () => <div data-testid="bucket-detail-view" />,
}));

describe("GlobeClient", () => {
  beforeEach(() => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        json: () => Promise.resolve({ items: [], nextCursor: null }),
      })
    );
    vi.stubGlobal(
      "IntersectionObserver",
      vi.fn().mockImplementation(() => ({
        observe: vi.fn(),
        disconnect: vi.fn(),
      }))
    );
  });

  it("초기 상태 — 로딩 스피너 노출", () => {
    renderWithQuery(<GlobeClient pins={[]} />);
    expect(screen.getByRole("status", { name: "로딩 중" })).toBeInTheDocument();
  });

  it("onReady 콜백 호출 후 — 스피너 사라짐", () => {
    renderWithQuery(<GlobeClient pins={[]} />);

    act(() => {
      fireEvent.click(screen.getByTestId("trigger-ready"));
    });

    expect(screen.queryByRole("status", { name: "로딩 중" })).not.toBeInTheDocument();
  });

  it("핀 클릭 시 CountrySlidePanel 열림 — 닫기 버튼 노출", async () => {
    renderWithQuery(<GlobeClient pins={[]} />);

    act(() => {
      fireEvent.click(screen.getByTestId("trigger-pin-click"));
    });

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "닫기" })).toBeInTheDocument();
    });
  });

  it("최상위 div 클릭 시 CountrySlidePanel 닫힘", async () => {
    const { container } = renderWithQuery(<GlobeClient pins={[]} />);

    act(() => {
      fireEvent.click(screen.getByTestId("trigger-pin-click"));
    });

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "닫기" })).toBeInTheDocument();
    });

    act(() => {
      fireEvent.click(container.firstChild as HTMLElement);
    });

    await waitFor(() => {
      expect(screen.queryByRole("button", { name: "닫기" })).not.toBeInTheDocument();
    });
  });
});
