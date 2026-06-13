import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { BucketCountWidget } from "../BucketCountWidget";
import { fetchBucketCount } from "@/api/dashboard";

vi.mock("@/api/dashboard", () => ({
  fetchBucketCount: vi.fn(),
  dashboardQueryKeys: {
    bucketCount: () => ["dashboard", "bucket-count"],
  },
}));

vi.mock("@phosphor-icons/react", () => ({
  ListChecks: () => <span data-testid="icon-list-checks" />,
}));

// motion value를 useSyncExternalStore로 구독 — animate(set)이 호출되면 motion.span이 새 값으로 리렌더링
vi.mock("framer-motion", async () => {
  const React = await import("react");

  type Store = {
    get: () => number;
    set: (value: number) => void;
    subscribe: (cb: () => void) => () => void;
  };

  function createStore(initial: number): Store {
    let value = initial;
    const listeners = new Set<() => void>();
    return {
      get: () => value,
      set: (next) => {
        value = next;
        listeners.forEach((listener) => listener());
      },
      subscribe: (cb) => {
        listeners.add(cb);
        return () => listeners.delete(cb);
      },
    };
  }

  function useMotionValue(initial: number) {
    const storeRef = React.useRef<Store | null>(null);
    if (!storeRef.current) storeRef.current = createStore(initial);
    return storeRef.current;
  }

  function useTransform<T>(source: Store, transform: (value: number) => T) {
    return {
      get: () => transform(source.get()),
      subscribe: source.subscribe,
    };
  }

  function animate(value: Store, target: number) {
    value.set(target);
    return { stop: () => {} };
  }

  const span = ({ children, className }: { children: unknown; className?: string }) => {
    const isMotionValue =
      children !== null &&
      typeof children === "object" &&
      "get" in children &&
      "subscribe" in children;

    const motionChild = children as {
      get: () => unknown;
      subscribe: (cb: () => void) => () => void;
    };

    const value = React.useSyncExternalStore(
      isMotionValue ? motionChild.subscribe : () => () => {},
      isMotionValue ? motionChild.get : () => children
    );

    return <span className={className}>{String(value)}</span>;
  };

  return {
    motion: { span },
    useMotionValue,
    useTransform,
    animate,
  };
});

const mockFetchBucketCount = vi.mocked(fetchBucketCount);

function renderWidget(isOpen: boolean) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  return render(<BucketCountWidget isOpen={isOpen} />, { wrapper: Wrapper });
}

describe("BucketCountWidget", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("로딩 중에는 스켈레톤을 표시한다", () => {
    mockFetchBucketCount.mockImplementation(() => new Promise(() => {}));
    renderWidget(true);

    expect(document.querySelector(".animate-pulse")).toBeInTheDocument();
  });

  it("정상 데이터 로드 후 개수를 표시한다", async () => {
    mockFetchBucketCount.mockResolvedValue(5);
    renderWidget(true);

    expect(await screen.findByText("5")).toBeInTheDocument();
    expect(screen.getByText("개")).toBeInTheDocument();
  });

  it("count=0인 경우 0을 표시한다", async () => {
    mockFetchBucketCount.mockResolvedValue(0);
    renderWidget(true);

    expect(await screen.findByText("0")).toBeInTheDocument();
  });

  it("fetchBucketCount 실패 시 '-'를 표시한다", async () => {
    mockFetchBucketCount.mockRejectedValue(new Error("실패"));
    renderWidget(true);

    expect(await screen.findByText("-")).toBeInTheDocument();
    expect(screen.queryByText("개")).not.toBeInTheDocument();
  });

  it("isOpen=false면 쿼리가 비활성화되어 fetch가 호출되지 않는다", () => {
    mockFetchBucketCount.mockResolvedValue(5);
    renderWidget(false);

    expect(mockFetchBucketCount).not.toHaveBeenCalled();
  });

  it("isOpen이 false에서 true로 바뀌면 fetch가 호출된다", () => {
    mockFetchBucketCount.mockResolvedValue(5);
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    const Wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
    const { rerender } = render(<BucketCountWidget isOpen={false} />, { wrapper: Wrapper });

    expect(mockFetchBucketCount).not.toHaveBeenCalled();

    rerender(<BucketCountWidget isOpen={true} />);

    expect(mockFetchBucketCount).toHaveBeenCalled();
  });

  it("라벨과 아이콘 등 정적 요소를 렌더링한다", () => {
    mockFetchBucketCount.mockImplementation(() => new Promise(() => {}));
    renderWidget(true);

    expect(screen.getByText("작성한 버킷리스트 수")).toBeInTheDocument();
    expect(screen.getByTestId("icon-list-checks")).toBeInTheDocument();
  });
});
