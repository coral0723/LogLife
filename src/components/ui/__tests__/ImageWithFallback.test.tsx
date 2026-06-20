import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

import { ImageWithFallback } from "../ImageWithFallback";

vi.mock("@phosphor-icons/react", () => ({
  Camera: () => <span data-testid="icon-camera" />,
}));

describe("ImageWithFallback", () => {
  it("기본 상태 — img 렌더링, Camera 아이콘 없음", () => {
    const { container } = render(
      <ImageWithFallback
        src="https://example.com/photo.jpg"
        containerClassName="w-16 h-16"
        iconSize={24}
        iconClassName="text-zinc-300"
      />
    );

    const img = container.querySelector("img");
    expect(img).not.toBeNull();
    expect(img!.src).toBe("https://example.com/photo.jpg");
    expect(screen.queryByTestId("icon-camera")).not.toBeInTheDocument();
  });

  it("img 로드 실패 → Camera 아이콘 폴백 표시", () => {
    const { container } = render(
      <ImageWithFallback
        src="https://example.com/photo.jpg"
        containerClassName="w-16 h-16"
        iconSize={24}
        iconClassName="text-zinc-300"
      />
    );

    fireEvent.error(container.querySelector("img")!);

    expect(container.querySelector("img")).toBeNull();
    expect(screen.getByTestId("icon-camera")).toBeInTheDocument();
  });
});
