import { NextResponse } from "next/server";
import { z } from "zod";

import { auth } from "@/auth";

export const runtime = "nodejs";

const requestSchema = z.object({
  input: z.string().trim().min(1).max(200),
  sessionToken: z.string().min(8).max(128),
  languageCode: z.string().min(2).max(10).default("ko"),
  regionCode: z.string().min(2).max(3).optional(),
});

const RATE_LIMIT_MAX = 30;
const RATE_LIMIT_WINDOW_MS = 60_000;
const buckets = new Map<string, number[]>();

function consumeRateLimit(userId: string): boolean {
  const now = Date.now();
  const arr = buckets.get(userId) ?? [];
  const recent = arr.filter((t) => now - t < RATE_LIMIT_WINDOW_MS);
  if (recent.length >= RATE_LIMIT_MAX) {
    buckets.set(userId, recent);
    return false;
  }
  recent.push(now);
  buckets.set(userId, recent);
  return true;
}

type Suggestion = { placeId: string; text: string };

type AutocompleteResponse = {
  suggestions?: Array<{
    placePrediction?: {
      placeId?: string;
      text?: { text?: string };
    };
  }>;
};

export async function POST(req: Request) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }

  if (!consumeRateLimit(userId)) {
    return NextResponse.json(
      { error: "요청이 너무 많습니다." },
      { status: 429 },
    );
  }

  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "Places API 키가 설정되지 않았습니다." },
      { status: 500 },
    );
  }

  let body: z.infer<typeof requestSchema>;
  try {
    body = requestSchema.parse(await req.json());
  } catch {
    return NextResponse.json({ error: "잘못된 요청입니다." }, { status: 400 });
  }

  const upstream = await fetch(
    "https://places.googleapis.com/v1/places:autocomplete",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": apiKey,
      },
      body: JSON.stringify({
        input: body.input,
        sessionToken: body.sessionToken,
        languageCode: body.languageCode,
        ...(body.regionCode ? { regionCode: body.regionCode } : {}),
      }),
    },
  );

  if (!upstream.ok) {
    return NextResponse.json(
      { error: "Places API 호출에 실패했습니다." },
      { status: 502 },
    );
  }

  const data = (await upstream.json()) as AutocompleteResponse;
  const suggestions: Suggestion[] = (data.suggestions ?? [])
    .map((s) => ({
      placeId: s.placePrediction?.placeId ?? "",
      text: s.placePrediction?.text?.text ?? "",
    }))
    .filter((s): s is Suggestion => Boolean(s.placeId && s.text));

  return NextResponse.json({ suggestions });
}
