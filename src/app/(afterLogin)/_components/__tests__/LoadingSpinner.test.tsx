import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";

import LoadingSpinner from "../LoadingSpinner";

describe("LoadingSpinner", () => {
  it("기본값 미지정 시 md 크기 — 48px 렌더링", () => {
    render(<LoadingSpinner />);
    const spinner = screen.getByRole("status", { name: "로딩 중" }) as HTMLElement;
    expect(spinner.style.width).toBe("48px");
    expect(spinner.style.height).toBe("48px");
  });

  it("size=xs — 24px 렌더링", () => {
    render(<LoadingSpinner size="xs" />);
    const spinner = screen.getByRole("status", { name: "로딩 중" }) as HTMLElement;
    expect(spinner.style.width).toBe("24px");
    expect(spinner.style.height).toBe("24px");
  });

  it("size=sm — 32px 렌더링", () => {
    render(<LoadingSpinner size="sm" />);
    const spinner = screen.getByRole("status", { name: "로딩 중" }) as HTMLElement;
    expect(spinner.style.width).toBe("32px");
    expect(spinner.style.height).toBe("32px");
  });

  it("size=md — 48px 렌더링", () => {
    render(<LoadingSpinner size="md" />);
    const spinner = screen.getByRole("status", { name: "로딩 중" }) as HTMLElement;
    expect(spinner.style.width).toBe("48px");
    expect(spinner.style.height).toBe("48px");
  });

  it("size=lg — 64px 렌더링", () => {
    render(<LoadingSpinner size="lg" />);
    const spinner = screen.getByRole("status", { name: "로딩 중" }) as HTMLElement;
    expect(spinner.style.width).toBe("64px");
    expect(spinner.style.height).toBe("64px");
  });
});
