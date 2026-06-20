import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";

import { ShareProfileButton } from "../ShareProfileButton";

vi.mock("@phosphor-icons/react", () => ({
  ShareNetwork: () => <svg data-testid="share-icon" />,
}));

describe("ShareProfileButton", () => {
  beforeEach(() => {
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText: vi.fn().mockResolvedValue(undefined) },
      configurable: true,
      writable: true,
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.restoreAllMocks();
  });

  it("프로필 공유 버튼을 렌더링한다", () => {
    render(<ShareProfileButton username="alice" />);
    expect(screen.getByRole("button", { name: "프로필 공유" })).toBeInTheDocument();
  });

  it("클릭하면 클립보드에 URL을 복사하고 복사됨 문구를 표시한다", async () => {
    render(<ShareProfileButton username="alice" />);
    fireEvent.click(screen.getByRole("button", { name: "프로필 공유" }));

    await waitFor(() => {
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
        `${window.location.origin}/u/alice`,
      );
    });
    expect(screen.getByText("링크 복사됨")).toBeInTheDocument();
  });

  it("2초 후 복사됨 문구가 사라진다", async () => {
    let pendingCallback: (() => void) | undefined;
    const originalSetTimeout = window.setTimeout.bind(window);
    vi.spyOn(window, "setTimeout").mockImplementation((fn: TimerHandler, delay?: number) => {
      if (delay === 2000) {
        pendingCallback = fn as () => void;
        return 0 as unknown as ReturnType<typeof setTimeout>;
      }
      return originalSetTimeout(fn as (...args: unknown[]) => void, delay);
    });

    render(<ShareProfileButton username="alice" />);
    fireEvent.click(screen.getByRole("button", { name: "프로필 공유" }));

    await waitFor(() => expect(screen.getByText("링크 복사됨")).toBeInTheDocument());

    act(() => pendingCallback?.());

    expect(screen.queryByText("링크 복사됨")).not.toBeInTheDocument();
  });

  it("클립보드 실패 시 alert를 표시한다", async () => {
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText: vi.fn().mockRejectedValue(new Error("denied")) },
      configurable: true,
      writable: true,
    });
    const alertSpy = vi.spyOn(window, "alert").mockImplementation(() => {});

    render(<ShareProfileButton username="alice" />);
    fireEvent.click(screen.getByRole("button", { name: "프로필 공유" }));

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith("클립보드에 오류가 발생했습니다.");
    });
  });
});
