import { getCountryCentroid } from "./countryCentroids";

export interface CountryPin {
  countryCode: string;
  lat: number;
  lng: number;
  count: number;
  achievedCount: number;
  hasExpiredDeadline: boolean;
}

interface GroupByResult {
  countryCode: string;
  _count: { _all: number };
}

export function buildCountryPins(
  byCountry: GroupByResult[],
  byAchieved: GroupByResult[],
  byExpired: GroupByResult[]
): CountryPin[] {
  const achievedMap = new Map(
    byAchieved.map((r) => [r.countryCode, r._count._all])
  );
  const expiredSet = new Set(byExpired.map((r) => r.countryCode));
  return byCountry.flatMap((r) => {
    const centroid = getCountryCentroid(r.countryCode);
    if (!centroid) return [];
    return [
      {
        countryCode: r.countryCode,
        lat: centroid.lat,
        lng: centroid.lng,
        count: r._count._all,
        achievedCount: achievedMap.get(r.countryCode) ?? 0,
        hasExpiredDeadline: expiredSet.has(r.countryCode),
      },
    ];
  });
}
