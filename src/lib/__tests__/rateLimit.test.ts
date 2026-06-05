import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import { consumeRateLimit } from "../rateLimit";

describe("consumeRateLimit", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("한도 이하 호출은 모두 허용한다", () => {
    expect(consumeRateLimit("allow-test", 3, 1000)).toBe(true);
    expect(consumeRateLimit("allow-test", 3, 1000)).toBe(true);
    expect(consumeRateLimit("allow-test", 3, 1000)).toBe(true);
  });

  it("한도 초과 호출은 차단한다", () => {
    consumeRateLimit("block-test", 3, 1000);
    consumeRateLimit("block-test", 3, 1000);
    consumeRateLimit("block-test", 3, 1000);
    expect(consumeRateLimit("block-test", 3, 1000)).toBe(false);
  });

  it("windowMs 경과 후에는 다시 허용한다", () => {
    consumeRateLimit("window-test", 2, 1000);
    consumeRateLimit("window-test", 2, 1000);
    expect(consumeRateLimit("window-test", 2, 1000)).toBe(false);

    vi.advanceTimersByTime(1000);

    expect(consumeRateLimit("window-test", 2, 1000)).toBe(true);
  });
});
