export async function getPlacePhotoUrl(placeId: string): Promise<string | null> {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey) return null;
  try {
    const detailsRes = await fetch(
      `https://places.googleapis.com/v1/places/${encodeURIComponent(placeId)}`,
      {
        headers: { "X-Goog-Api-Key": apiKey, "X-Goog-FieldMask": "photos" },
        next: { revalidate: 86400 },
      },
    );
    if (!detailsRes.ok) return null;
    const data = (await detailsRes.json()) as { photos?: { name: string }[] };
    const photoName = data.photos?.[0]?.name;
    if (!photoName) return null;

    // skipHttpRedirect=true → JSON { photoUri } 반환 (API key 클라이언트 미노출)
    const mediaRes = await fetch(
      `https://places.googleapis.com/v1/${photoName}/media?maxHeightPx=800&skipHttpRedirect=true&key=${apiKey}`,
      { next: { revalidate: 1800 } },
    );
    if (!mediaRes.ok) return null;
    const { photoUri } = (await mediaRes.json()) as { photoUri?: string };
    return photoUri ?? null;
  } catch {
    return null;
  }
}
