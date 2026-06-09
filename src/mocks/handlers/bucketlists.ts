import { http, HttpResponse } from 'msw';

const MOCK_ITEMS = [
  {
    id: '1',
    title: '도쿄 라멘 골목 탐방',
    displayName: '신주쿠구, 도쿄',
    achieved: false,
    placeId: 'ChIJ1111',
    visibility: 'PUBLIC' as const,
    deadlineAt: '2025-12-31T00:00:00Z',
  },
  {
    id: '2',
    title: '후지산 등반',
    displayName: '후지산, 시즈오카',
    achieved: true,
    placeId: 'ChIJ2222',
    visibility: 'FRIENDS' as const,
    deadlineAt: null,
  },
  {
    id: '3',
    title: '교토 금각사 방문',
    displayName: '금각사, 교토',
    achieved: false,
    placeId: 'ChIJ3333',
    visibility: 'PRIVATE' as const,
    deadlineAt: '2024-01-01T00:00:00Z',
  },
];

const MOCK_DETAIL = {
  id: '1',
  title: '도쿄 라멘 골목 탐방',
  description: '신주쿠 골든가이 근처 숨겨진 라멘집 5곳을 방문하고 최고의 라멘을 찾아본다.',
  visibility: 'PUBLIC' as const,
  deadlineAt: '2025-12-31T00:00:00Z',
  achievedAt: null,
  difficulty: 2,
  excitement: 5,
  achieved: false,
  placeId: 'ChIJ1111',
  displayName: '신주쿠구',
  countryCode: 'JP',
  shareToken: 'abc123',
};

// autodocs 페이지는 여러 스토리를 한 번에 렌더링하고 MSW worker는 하나뿐이라,
// 스토리별로 핸들러를 분리하면 마지막 스토리의 핸들러가 나머지를 덮어쓴다.
// countryCode로 분기하는 단일 핸들러로 두면 모든 스토리가 충돌 없이 공존한다.
export const bucketlistHandlers = [
  http.get('/api/bucketlists/by-country', ({ request }) => {
    const countryCode = new URL(request.url).searchParams.get('countryCode');
    const items = countryCode === 'KR' ? [] : MOCK_ITEMS;
    return HttpResponse.json({ items, nextCursor: null });
  }),
  http.get('/api/bucketlists/:id', () =>
    HttpResponse.json(MOCK_DETAIL)
  ),
  http.get('/api/places/photo', () =>
    new HttpResponse(null, { status: 404 })
  ),
];
