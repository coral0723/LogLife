import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import { getStatus } from "../bucketStatus";

const FIXED_NOW = new Date("2025-06-01T12:00:00.000Z");
const PAST = "2025-01-01T00:00:00.000Z";
const FUTURE = "2025-12-31T00:00:00.000Z";

describe("getStatus", () => {
  beforeEach(() => {
    vi.useFakeTimers({ now: FIXED_NOW });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("achieved=true이면 deadline 없이도 'achieved'를 반환한다", () => {
    expect(getStatus({ achieved: true, deadlineAt: null })).toBe("achieved");
  });

  it("achieved=true이면 deadline이 과거여도 'achieved'를 반환한다", () => {
    expect(getStatus({ achieved: true, deadlineAt: PAST })).toBe("achieved");
  });

  it("achieved=false이고 deadlineAt이 과거면 'expired'를 반환한다", () => {
    expect(getStatus({ achieved: false, deadlineAt: PAST })).toBe("expired");
  });

  it("achieved=false이고 deadlineAt이 미래면 'pending'을 반환한다", () => {
    expect(getStatus({ achieved: false, deadlineAt: FUTURE })).toBe("pending");
  });

  it("achieved=false이고 deadlineAt이 null이면 'pending'을 반환한다", () => {
    expect(getStatus({ achieved: false, deadlineAt: null })).toBe("pending");
  });
});
