export type Suggestion = {
  placeId: string;
  text: string;
};

export type NormalizedPlace = {
  placeId: string;
  displayName: string;
  lat: number;
  lng: number;
  countryCode: string;
};

export async function fetchPlacesAutocomplete(
  input: string,
  sessionToken: string,
  languageCode: string,
  regionCode?: string,
): Promise<{ suggestions: Suggestion[] }> {
  const res = await fetch("/api/places/autocomplete", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ input, sessionToken, languageCode, regionCode }),
  });
  if (!res.ok) throw new Error("Places 자동완성 조회 실패");
  return res.json();
}

export async function fetchPlaceDetails(
  placeId: string,
  sessionToken: string,
  languageCode: string,
): Promise<NormalizedPlace> {
  const params = new URLSearchParams({ placeId, sessionToken, languageCode });
  const res = await fetch(`/api/places/details?${params}`);
  if (!res.ok) throw new Error("Place 상세 조회 실패");
  return res.json();
}
