import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";

import { CirclePlusIcon } from "../CirclePlusIcon";

describe("CirclePlusIcon", () => {
  it("기본값 — size=80, circleColor=#f3f4f6, plusColor=#060d1f", () => {
    const { container } = render(<CirclePlusIcon />);
    const svg = container.querySelector("svg")!;
    expect(svg.getAttribute("width")).toBe("80");
    expect(svg.getAttribute("height")).toBe("80");

    const circle = container.querySelector("circle")!;
    expect(circle.getAttribute("fill")).toBe("#f3f4f6");

    const lines = container.querySelectorAll("line");
    lines.forEach((line) => {
      expect(line.getAttribute("stroke")).toBe("#060d1f");
    });
  });

  it("size prop이 SVG width/height attribute에 반영됨", () => {
    const { container } = render(<CirclePlusIcon size={120} />);
    const svg = container.querySelector("svg")!;
    expect(svg.getAttribute("width")).toBe("120");
    expect(svg.getAttribute("height")).toBe("120");
  });

  it("circleColor prop이 circle의 fill attribute에 반영됨", () => {
    const { container } = render(<CirclePlusIcon circleColor="#ff0000" />);
    const circle = container.querySelector("circle")!;
    expect(circle.getAttribute("fill")).toBe("#ff0000");
  });

  it("plusColor prop이 두 line의 stroke attribute에 반영됨", () => {
    const { container } = render(<CirclePlusIcon plusColor="#00ff00" />);
    const lines = container.querySelectorAll("line");
    expect(lines).toHaveLength(2);
    lines.forEach((line) => {
      expect(line.getAttribute("stroke")).toBe("#00ff00");
    });
  });

  it("className prop이 SVG 요소에 적용됨", () => {
    const { container } = render(<CirclePlusIcon className="test-class" />);
    const svg = container.querySelector("svg")!;
    expect(svg).toHaveClass("test-class");
  });
});
