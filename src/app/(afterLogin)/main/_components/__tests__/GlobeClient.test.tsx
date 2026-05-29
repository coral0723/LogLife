import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";

import { GlobeClient } from "../GlobeClient";

// next/dynamic을 동기 컴포넌트로 대체 — Three.js DOM 의존성 제거
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

describe("GlobeClient", () => {
  it("초기 상태 — 로딩 스피너 노출", () => {
    render(<GlobeClient pins={[]} />);
    expect(screen.getByRole("status", { name: "로딩 중" })).toBeInTheDocument();
  });

  it("onReady 콜백 호출 후 — 스피너 사라짐", () => {
    render(<GlobeClient pins={[]} />);

    act(() => {
      fireEvent.click(screen.getByTestId("trigger-ready"));
    });

    expect(screen.queryByRole("status", { name: "로딩 중" })).not.toBeInTheDocument();
  });

  it("핀 클릭 시 팝업 카드 렌더링 — countryCode, count, achievedCount 텍스트 노출", () => {
    render(<GlobeClient pins={[]} />);

    act(() => {
      fireEvent.click(screen.getByTestId("trigger-pin-click"));
    });

    expect(screen.getByText("KR")).toBeInTheDocument();
    expect(screen.getByText("3개 등록")).toBeInTheDocument();
    expect(screen.getByText("2개 달성")).toBeInTheDocument();
  });

  it("팝업 배경(최상위 div) 클릭 시 팝업 닫힘", () => {
    const { container } = render(<GlobeClient pins={[]} />);

    act(() => {
      fireEvent.click(screen.getByTestId("trigger-pin-click"));
    });

    expect(screen.getByText("KR")).toBeInTheDocument();

    act(() => {
      fireEvent.click(container.firstChild as HTMLElement);
    });

    expect(screen.queryByText("KR")).not.toBeInTheDocument();
  });

  it("팝업 카드 자체 클릭은 팝업 유지 — stopPropagation", () => {
    render(<GlobeClient pins={[]} />);

    act(() => {
      fireEvent.click(screen.getByTestId("trigger-pin-click"));
    });

    const countryCodeEl = screen.getByText("KR");
    const card = countryCodeEl.closest("div[class*='absolute']") as HTMLElement;

    act(() => {
      fireEvent.click(card);
    });

    expect(screen.getByText("KR")).toBeInTheDocument();
  });

  it("미달성 핀 — achievedCount/count 형식 배지 표시", () => {
    render(<GlobeClient pins={[]} />);

    act(() => {
      fireEvent.click(screen.getByTestId("trigger-pin-click"));
    });

    expect(screen.getByText("2/3")).toBeInTheDocument();
  });
});
