import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, act } from "@testing-library/react";

import OfflineOverlay from "../OfflineOverlay";

function setNavigatorOnline(value: boolean) {
  Object.defineProperty(navigator, "onLine", { configurable: true, value });
}

describe("OfflineOverlay", () => {
  afterEach(() => {
    setNavigatorOnline(true);
  });

  it("온라인 상태 초기 렌더 — 아무것도 표시 안 함", () => {
    setNavigatorOnline(true);
    const { container } = render(<OfflineOverlay />);
    expect(container.firstChild).toBeNull();
  });

  it("오프라인 상태 초기 렌더 — 오버레이·텍스트 표시", () => {
    setNavigatorOnline(false);
    render(<OfflineOverlay />);
    expect(screen.getByText("인터넷 연결이 없습니다")).toBeInTheDocument();
    expect(screen.getByText("연결이 복구되면 자동으로 계속됩니다")).toBeInTheDocument();
  });

  it("online → offline 이벤트 → 오버레이 표시", () => {
    setNavigatorOnline(true);
    render(<OfflineOverlay />);
    act(() => {
      window.dispatchEvent(new Event("offline"));
    });
    expect(screen.getByText("인터넷 연결이 없습니다")).toBeInTheDocument();
  });

  it("offline → online 이벤트 → 오버레이 사라짐", () => {
    setNavigatorOnline(false);
    render(<OfflineOverlay />);
    act(() => {
      window.dispatchEvent(new Event("online"));
    });
    expect(screen.queryByText("인터넷 연결이 없습니다")).not.toBeInTheDocument();
  });

  it("언마운트 시 offline·online 이벤트 리스너 제거", () => {
    setNavigatorOnline(true);
    const removeSpy = vi.spyOn(window, "removeEventListener");
    const { unmount } = render(<OfflineOverlay />);
    unmount();
    expect(removeSpy).toHaveBeenCalledWith("offline", expect.any(Function));
    expect(removeSpy).toHaveBeenCalledWith("online", expect.any(Function));
    removeSpy.mockRestore();
  });
});
