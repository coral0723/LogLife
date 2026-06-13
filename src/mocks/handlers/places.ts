import { http, HttpResponse } from 'msw';

const MOCK_SUGGESTIONS = [{ placeId: 'ChIJ_tokyo-tower', text: '도쿄 타워, 일본 도쿄' }];

const MOCK_DETAIL = {
  placeId: 'ChIJ_tokyo-tower',
  displayName: '도쿄 타워, 일본',
  lat: 35.6586,
  lng: 139.7454,
  countryCode: 'JP',
};

export const placesHandlers = [
  http.post('/api/places/autocomplete', () =>
    HttpResponse.json({ suggestions: MOCK_SUGGESTIONS })
  ),
  http.get('/api/places/details', () => HttpResponse.json(MOCK_DETAIL)),
];
