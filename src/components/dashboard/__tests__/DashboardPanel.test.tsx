import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

import { DashboardPanel } from "../DashboardPanel";

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

vi.mock("../BucketCountWidget", () => ({
  BucketCountWidget: ({ isOpen }: { isOpen: boolean }) => (
    <div data-testid="widget-bucket-count" data-open={isOpen} />
  ),
}));

vi.mock("../UpcomingDeadlinesWidget", () => ({
  UpcomingDeadlinesWidget: ({ isOpen }: { isOpen: boolean }) => (
    <div data-testid="widget-upcoming-deadlines" data-open={isOpen} />
  ),
}));

vi.mock("../DifficultyExcitementMatrixWidget", () => ({
  DifficultyExcitementMatrixWidget: ({ isOpen }: { isOpen: boolean }) => (
    <div data-testid="widget-difficulty-excitement" data-open={isOpen} />
  ),
}));

vi.mock("../AchievementStatsWidget", () => ({
  AchievementStatsWidget: ({ isOpen }: { isOpen: boolean }) => (
    <div data-testid="widget-achievement-stats" data-open={isOpen} />
  ),
}));

describe("DashboardPanel", () => {
  it("isOpen=false → 패널/backdrop/위젯 전부 렌더링 안 됨", () => {
    const { container } = render(<DashboardPanel isOpen={false} onClose={vi.fn()} />);

    expect(container).toBeEmptyDOMElement();
    expect(screen.queryByText("대시보드")).not.toBeInTheDocument();
    expect(screen.queryByTestId("widget-bucket-count")).not.toBeInTheDocument();
    expect(screen.queryByTestId("widget-upcoming-deadlines")).not.toBeInTheDocument();
    expect(screen.queryByTestId("widget-difficulty-excitement")).not.toBeInTheDocument();
    expect(screen.queryByTestId("widget-achievement-stats")).not.toBeInTheDocument();
  });

  it("isOpen=true → '대시보드' 헤딩 + 4개 위젯 렌더링, 각 위젯에 isOpen={true} 전달", () => {
    render(<DashboardPanel isOpen={true} onClose={vi.fn()} />);

    expect(screen.getByText("대시보드")).toBeInTheDocument();
    expect(screen.getByTestId("widget-bucket-count")).toHaveAttribute("data-open", "true");
    expect(screen.getByTestId("widget-upcoming-deadlines")).toHaveAttribute("data-open", "true");
    expect(screen.getByTestId("widget-difficulty-excitement")).toHaveAttribute(
      "data-open",
      "true",
    );
    expect(screen.getByTestId("widget-achievement-stats")).toHaveAttribute("data-open", "true");
  });

  it("backdrop(바깥 영역) 클릭 → onClose 호출", () => {
    const onClose = vi.fn();
    const { container } = render(<DashboardPanel isOpen={true} onClose={onClose} />);

    fireEvent.click(container.children[0]);

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("패널 내부 클릭 → onClose 호출 안 됨 (stopPropagation)", () => {
    const onClose = vi.fn();
    render(<DashboardPanel isOpen={true} onClose={onClose} />);

    fireEvent.click(screen.getByText("대시보드"));

    expect(onClose).not.toHaveBeenCalled();
  });
});
