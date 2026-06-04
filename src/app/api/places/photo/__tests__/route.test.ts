// @vitest-environment node
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

vi.mock("@/auth", () => ({ auth: vi.fn() }));
vi.mock("@/lib/rateLimit", () => ({ consumeRateLimit: vi.fn() }));

import { GET } from "../route";
import { auth } from "@/auth";
import { consumeRateLimit } from "@/lib/rateLimit";

const mockAuth = vi.mocked(auth);
const mockConsumeRateLimit = vi.mocked(consumeRateLimit);

function makeRequest(placeId?: string) {
  const url = new URL("http://localhost/api/places/photo");
  if (placeId !== undefined) url.searchParams.set("placeId", placeId);
  return new Request(url.toString());
}

function detailsResponse(photos: Array<{ name: string }> | undefined) {
  return new Response(JSON.stringify({ photos }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}

function mediaResponse(contentType = "image/jpeg") {
  return new Response(new Uint8Array([0xff, 0xd8]).buffer, {
    status: 200,
    headers: { "Content-Type": contentType },
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  mockAuth.mockResolvedValue({ user: { id: "user-1" } } as never);
  mockConsumeRateLimit.mockReturnValue(true);
  vi.stubEnv("GOOGLE_PLACES_API_KEY", "test-key");
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe("GET /api/places/photo", () => {
  it("비로그인 → 401", async () => {
    mockAuth.mockResolvedValue(null as never);

    const res = await GET(makeRequest("ChIJ1111"));

    expect(res.status).toBe(401);
  });

  it("rate limit 초과 → 429", async () => {
    mockConsumeRateLimit.mockReturnValue(false);

    const res = await GET(makeRequest("ChIJ1111"));

    expect(res.status).toBe(429);
  });

  it("API key 없음 → 500", async () => {
    vi.stubEnv("GOOGLE_PLACES_API_KEY", "");

    const res = await GET(makeRequest("ChIJ1111"));

    expect(res.status).toBe(500);
  });

  it("placeId 누락 → 400", async () => {
    const res = await GET(makeRequest());

    expect(res.status).toBe(400);
  });

  it("Google Places Details API 오류 → 404", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValueOnce(new Response(null, { status: 500 })),
    );

    const res = await GET(makeRequest("ChIJ1111"));

    expect(res.status).toBe(404);
  });

  it("사진 없는 장소 (photos 없음) → 404", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValueOnce(detailsResponse(undefined)),
    );

    const res = await GET(makeRequest("ChIJ1111"));

    expect(res.status).toBe(404);
  });

  it("이미지 아닌 content-type → 404", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn()
        .mockResolvedValueOnce(detailsResponse([{ name: "places/x/photos/y" }]))
        .mockResolvedValueOnce(mediaResponse("text/html")),
    );

    const res = await GET(makeRequest("ChIJ1111"));

    expect(res.status).toBe(404);
  });

  it("정상 — 이미지 buffer + Cache-Control 반환", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn()
        .mockResolvedValueOnce(detailsResponse([{ name: "places/x/photos/y" }]))
        .mockResolvedValueOnce(mediaResponse("image/jpeg")),
    );

    const res = await GET(makeRequest("ChIJ1111"));

    expect(res.status).toBe(200);
    expect(res.headers.get("Content-Type")).toBe("image/jpeg");
    expect(res.headers.get("Cache-Control")).toBe("public, max-age=86400");
  });
});
