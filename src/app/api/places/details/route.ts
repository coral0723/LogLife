import { NextResponse } from "next/server";
import { z } from "zod";

import { auth } from "@/auth";
import { consumeRateLimit } from "@/lib/rateLimit";

export const runtime = "nodejs";

const querySchema = z.object({
  placeId: z.string().min(1),
  sessionToken: z.string().min(8).max(128),
  languageCode: z.string().min(2).max(10).default("ko"),
});

const FIELD_MASK = "id,displayName,location,addressComponents";

type AddressComponent = {
  longText?: string;
  shortText?: string;
  types?: string[];
};

type PlaceDetailsResponse = {
  id?: string;
  displayName?: { text?: string };
  location?: { latitude?: number; longitude?: number };
  addressComponents?: AddressComponent[];
};

type NormalizedPlace = {
  placeId: string;
  displayName: string;
  lat: number;
  lng: number;
  countryCode: string;
};

function pickComponent(
  components: AddressComponent[] | undefined,
  type: string,
): AddressComponent | undefined {
  return components?.find((c) => c.types?.includes(type));
}

function normalize(data: PlaceDetailsResponse): NormalizedPlace | null {
  const placeId = data.id;
  const displayName = data.displayName?.text;
  const lat = data.location?.latitude;
  const lng = data.location?.longitude;
  const country = pickComponent(data.addressComponents, "country");
  if (
    !placeId ||
    !displayName ||
    typeof lat !== "number" ||
    typeof lng !== "number" ||
    !country?.shortText
  ) {
    return null;
  }

  return {
    placeId,
    displayName,
    lat,
    lng,
    countryCode: country.shortText,
  };
}

export async function GET(req: Request) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }

  if (!consumeRateLimit(`places:${userId}`, 30, 60_000)) {
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

  const url = new URL(req.url);
  let query: z.infer<typeof querySchema>;
  try {
    query = querySchema.parse({
      placeId: url.searchParams.get("placeId"),
      sessionToken: url.searchParams.get("sessionToken"),
      languageCode: url.searchParams.get("languageCode") ?? undefined,
    });
  } catch {
    return NextResponse.json({ error: "잘못된 요청입니다." }, { status: 400 });
  }

  const upstreamUrl = new URL(
    `https://places.googleapis.com/v1/places/${encodeURIComponent(query.placeId)}`,
  );
  upstreamUrl.searchParams.set("sessionToken", query.sessionToken);
  upstreamUrl.searchParams.set("languageCode", query.languageCode);

  const upstream = await fetch(upstreamUrl, {
    method: "GET",
    headers: {
      "X-Goog-Api-Key": apiKey,
      "X-Goog-FieldMask": FIELD_MASK,
    },
  });

  if (!upstream.ok) {
    return NextResponse.json(
      { error: "Place Details 호출에 실패했습니다." },
      { status: 502 },
    );
  }

  const data = (await upstream.json()) as PlaceDetailsResponse;
  const normalized = normalize(data);
  if (!normalized) {
    return NextResponse.json(
      { error: "필수 위치 정보가 누락된 응답입니다." },
      { status: 502 },
    );
  }

  return NextResponse.json(normalized);
}
