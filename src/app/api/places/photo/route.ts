import { z } from "zod";

import { auth } from "@/auth";
import { consumeRateLimit } from "@/lib/rateLimit";

export const runtime = "nodejs";

const querySchema = z.object({
  placeId: z.string().min(1),
});

type PlacePhotoResponse = {
  photos?: Array<{ name: string }>;
};

export async function GET(req: Request) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return new Response(null, { status: 401 });

  if (!consumeRateLimit(`photo:${userId}`, 30, 60_000)) {
    return new Response(null, { status: 429 });
  }

  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey) return new Response(null, { status: 500 });

  const url = new URL(req.url);
  let query: z.infer<typeof querySchema>;
  try {
    query = querySchema.parse({ placeId: url.searchParams.get("placeId") });
  } catch {
    return new Response(null, { status: 400 });
  }

  // Step 1: 사진 참조(photo name) 조회
  const detailsRes = await fetch(
    `https://places.googleapis.com/v1/places/${encodeURIComponent(query.placeId)}`,
    {
      headers: {
        "X-Goog-Api-Key": apiKey,
        "X-Goog-FieldMask": "photos",
      },
    },
  );
  if (!detailsRes.ok) return new Response(null, { status: 404 });

  const data = (await detailsRes.json()) as PlacePhotoResponse;
  const photoName = data.photos?.[0]?.name;
  if (!photoName) return new Response(null, { status: 404 });

  // Step 2: 이미지 binary 프록시 (API key 클라이언트 미노출)
  const mediaUrl = new URL(`https://places.googleapis.com/v1/${photoName}/media`);
  mediaUrl.searchParams.set("maxHeightPx", "300");
  mediaUrl.searchParams.set("key", apiKey);

  const photoRes = await fetch(mediaUrl);
  if (!photoRes.ok) return new Response(null, { status: 404 });

  const contentType = photoRes.headers.get("content-type") ?? "image/jpeg";
  if (!contentType.startsWith("image/")) return new Response(null, { status: 404 });
  const buffer = await photoRes.arrayBuffer();

  return new Response(buffer, {
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "public, max-age=86400",
    },
  });
}
