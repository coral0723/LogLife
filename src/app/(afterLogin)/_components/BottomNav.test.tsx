import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";

import { BottomNav, type NavItem } from "./BottomNav";

vi.mock("next/navigation", () => ({ usePathname: vi.fn() }));
vi.mock("next/link", () => ({
  default: ({ href, children, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));
vi.mock("@phosphor-icons/react", () => ({
  Globe: () => <span data-testid="icon-globe" />,
  UserCircle: () => <span data-testid="icon-usercircle" />,
  UsersThree: () => <span data-testid="icon-usersthree" />,
}));

import { usePathname } from "next/navigation";

describe("BottomNav", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("경로 /main → 메인 링크에 활성 클래스, 나머지는 없음", () => {
    (usePathname as ReturnType<typeof vi.fn>).mockReturnValue("/main");
    render(<BottomNav />);

    const mainLink = screen.getByRole("link", { name: "메인" });
    const profileLink = screen.getByRole("link", { name: "프로필" });
    const friendsLink = screen.getByRole("link", { name: "친구" });

    expect(mainLink).toHaveClass("bg-gray-100", "text-gray-900");
    expect(profileLink).not.toHaveClass("bg-gray-100", "text-gray-900");
    expect(friendsLink).not.toHaveClass("bg-gray-100", "text-gray-900");
  });

  it("경로 /profile → 프로필 링크에만 활성 클래스 적용", () => {
    (usePathname as ReturnType<typeof vi.fn>).mockReturnValue("/profile");
    render(<BottomNav />);

    const profileLink = screen.getByRole("link", { name: "프로필" });
    const mainLink = screen.getByRole("link", { name: "메인" });
    const friendsLink = screen.getByRole("link", { name: "친구" });

    expect(profileLink).toHaveClass("bg-gray-100", "text-gray-900");
    expect(mainLink).not.toHaveClass("bg-gray-100", "text-gray-900");
    expect(friendsLink).not.toHaveClass("bg-gray-100", "text-gray-900");
  });

  it("경로 /friends → 친구 링크에만 활성 클래스 적용", () => {
    (usePathname as ReturnType<typeof vi.fn>).mockReturnValue("/friends");
    render(<BottomNav />);

    const friendsLink = screen.getByRole("link", { name: "친구" });
    expect(friendsLink).toHaveClass("bg-gray-100", "text-gray-900");
  });

  it("items prop 커스텀 시 해당 항목만 렌더링", () => {
    (usePathname as ReturnType<typeof vi.fn>).mockReturnValue("/custom");
    const customItems: NavItem[] = [
      {
        href: "/custom",
        icon: () => <span data-testid="icon-custom" />,
        label: "커스텀",
      },
    ];
    render(<BottomNav items={customItems} />);

    expect(screen.getByRole("link", { name: "커스텀" })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "메인" })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "프로필" })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "친구" })).not.toBeInTheDocument();
  });
});
