import type { ComponentProps } from "react";

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

import { BottomNav, type NavItem } from "../BottomNav";

vi.mock("next/navigation", () => ({ usePathname: vi.fn() }));
vi.mock("next/link", () => ({
  default: ({ href, children, ...props }: ComponentProps<"a">) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));
vi.mock("@phosphor-icons/react", () => ({
  Globe: () => <span data-testid="icon-globe" />,
  SquaresFour: () => <span data-testid="icon-squaresfour" />,
  UsersThree: () => <span data-testid="icon-usersthree" />,
}));
vi.mock("../DashboardPanel", () => ({
  DashboardPanel: ({ isOpen }: { isOpen: boolean; onClose: () => void }) =>
    isOpen ? <div data-testid="dashboard-panel" /> : null,
}));

import { usePathname } from "next/navigation";

describe("BottomNav", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("경로 /main → 메인 링크에 활성 클래스, 대시보드·친구는 없음", () => {
    (usePathname as ReturnType<typeof vi.fn>).mockReturnValue("/main");
    render(<BottomNav />);

    const mainLink = screen.getByRole("link", { name: "메인" });
    const dashboardButton = screen.getByRole("button", { name: "대시보드" });
    const friendsLink = screen.getByRole("link", { name: "친구" });

    expect(mainLink).toHaveClass("bg-gray-100", "text-gray-900");
    expect(dashboardButton).not.toHaveClass("bg-gray-100", "text-gray-900");
    expect(friendsLink).not.toHaveClass("bg-gray-100", "text-gray-900");
    expect(screen.queryByTestId("dashboard-panel")).not.toBeInTheDocument();
  });

  it("경로 /friends → 친구 링크에만 활성 클래스 적용", () => {
    (usePathname as ReturnType<typeof vi.fn>).mockReturnValue("/friends");
    render(<BottomNav />);

    const friendsLink = screen.getByRole("link", { name: "친구" });
    const mainLink = screen.getByRole("link", { name: "메인" });

    expect(friendsLink).toHaveClass("bg-gray-100", "text-gray-900");
    expect(mainLink).not.toHaveClass("bg-gray-100", "text-gray-900");
  });

  it("대시보드 버튼 클릭 → 버튼 활성화 + 패널 표시, 메인 링크는 비활성화", () => {
    (usePathname as ReturnType<typeof vi.fn>).mockReturnValue("/main");
    render(<BottomNav />);

    const dashboardButton = screen.getByRole("button", { name: "대시보드" });
    const mainLink = screen.getByRole("link", { name: "메인" });
    expect(mainLink).toHaveClass("bg-gray-100", "text-gray-900");

    fireEvent.click(dashboardButton);

    expect(dashboardButton).toHaveClass("bg-gray-100", "text-gray-900");
    expect(mainLink).not.toHaveClass("bg-gray-100", "text-gray-900");
    expect(screen.getByTestId("dashboard-panel")).toBeInTheDocument();
  });

  it("대시보드가 열린 상태에서 메인 링크 클릭 시 패널이 닫힌다", () => {
    (usePathname as ReturnType<typeof vi.fn>).mockReturnValue("/main");
    render(<BottomNav />);

    fireEvent.click(screen.getByRole("button", { name: "대시보드" }));
    expect(screen.getByTestId("dashboard-panel")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("link", { name: "메인" }));
    expect(screen.queryByTestId("dashboard-panel")).not.toBeInTheDocument();
  });

  it("items prop 커스텀 시 해당 항목만 렌더링", () => {
    (usePathname as ReturnType<typeof vi.fn>).mockReturnValue("/custom");
    const customItems: NavItem[] = [
      {
        href: "/custom",
        icon: (() => <span data-testid="icon-custom" />) as unknown as NavItem["icon"],
        label: "커스텀",
      },
    ];
    render(<BottomNav items={customItems} />);

    expect(screen.getByRole("link", { name: "커스텀" })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "메인" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "대시보드" })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "친구" })).not.toBeInTheDocument();
  });
});
