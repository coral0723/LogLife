export type HotPlaceGroupInput = {
  countryCode: string;
  displayName: string;
  count: number;
  placeId: string;
};

export type HotPlaceItem = HotPlaceGroupInput;

const TOP_PLACES_LIMIT = 5;

export function computeHotPlaces(groups: HotPlaceGroupInput[]): HotPlaceItem[] {
  return [...groups].sort((a, b) => b.count - a.count).slice(0, TOP_PLACES_LIMIT);
}
