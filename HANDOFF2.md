# 위젯3 "난이도 × 설렘 2x2 매트릭스" 구현 계획

> [HANDOFF.md](./HANDOFF.md)의 위젯3 작업을 위한 상세 구현 계획. 이 문서대로 6단계 워크플로우(API → 디자인 → API 연결 → 컴포넌트 분리 → 테스트 → 스토리북)를 진행한다.

## Context
대시보드 패널 위젯 4종 중 위젯1("작성한 버킷리스트 수")·위젯2("마감 임박 순 리스트")는 완료됨. 이번엔 위젯3 차례.

placeholder는 정확한 2x2(4분면) 그리드라서, "겹침" 문제는 한 분면에 항목이 여러 개 들어가는 상황을 가리킨다. 사용자와 논의 끝에 표시 방식을 다음과 같이 확정했다:

- **각 분면 안에 항목 제목을 칩(태그)으로 최대 2개 노출**, 3개 이상이면 "+N개 더보기"
- **칩/더보기를 탭하면 해당 분면의 전체 항목을 하단 시트(bottom sheet)로 표시** — `CountrySlidePanel`의 시트 셸(백드롭 + `rounded-t-3xl` + framer-motion 슬라이드업)을 재사용하되, 드릴다운 없이 단순 목록만 표시(위젯2 수준의 단순함 유지)

기존 합의된 6단계 워크플로우(API → 디자인 → API 연결 → 컴포넌트 분리 → 테스트 → 스토리북)를 그대로 따른다.

## 추가 결정 사항 (제안값 — 디자인 단계에서 더미데이터로 다듬으며 조정 가능)

| 항목 | 제안값 | 근거 |
|---|---|---|
| `achieved` 항목 포함 여부 | **제외** (`achieved: false`) | "지금 도전/나중에" 프레이밍은 미달성 항목 대상. 위젯2(`upcoming-deadlines`)도 동일 필터 사용 |
| API 응답 형태 | **원본 항목 배열** `{ id, title, difficulty, excitement }` 반환, **FE에서 4분면 그룹화** | 분할 임계값을 디자인 단계에서 자유롭게 조정 가능 (API 재작성 불필요) |
| 2x2 분할 임계값 | `difficulty`/`excitement` 각각 **≤3 → 낮음, ≥4 → 높음** | 1~5 스케일에서 "보통(3)"을 낮음 쪽에 포함시켜, 확실히 높은(4~5) 항목만 "높음" 분면에 들어가도록 — 분면 간 구분이 더 뚜렷해짐. 한 줄 상수라 디자인 단계에서 쉽게 변경 가능 |
| 분면당 칩 개수 | **최대 2개**, 3개 이상이면 "+N개 더보기" | 사용자가 "1~2개" 언급, 카드 크기 대비 2개가 적당 |
| 4분면 레이블 ("지금 도전"/"나중에" 등) | **디자인 단계에서 확정** | 이 계획에서 고정하지 않음 — 더미데이터로 다듬으며 결정 |

## 단계별 작업

### 1. API — `src/app/api/dashboard/difficulty-excitement/route.ts` (신규)
`upcoming-deadlines/route.ts` 패턴 그대로:
```ts
export const runtime = "nodejs";
export async function GET() {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });

  const items = await prisma.bucketList.findMany({
    where: { userId, achieved: false },
    select: { id: true, title: true, difficulty: true, excitement: true },
  });
  return NextResponse.json({ items });
}
```

### 2. 그룹화 로직 — `src/lib/bucketList/difficultyExcitementMatrix.ts` (신규)
순수 변환 로직이므로 `src/lib/bucketList/`에 배치 (`bucketStatus.ts`와 동일 위치).
- 항목 배열을 입력받아 4분면(난이도 낮음/높음 × 설렘 낮음/높음)으로 그룹화하는 함수
- 임계값(≤3/≥4)은 상수로 분리해 디자인 단계에서 조정 용이하게
- 타입/함수명은 구현 시 자연스럽게 결정 (예: `groupByQuadrant`)

### 3. 클라이언트 fetch — `src/api/dashboard.ts` 추가
- `DifficultyExcitementItem` 타입: `{ id: string; title: string; difficulty: number; excitement: number }`
- `dashboardQueryKeys.difficultyExcitement: () => ["dashboard", "difficulty-excitement"] as const`
- `fetchDifficultyExcitementMatrix(): Promise<DifficultyExcitementItem[]>`

### 4. 디자인 — `DashboardPanel.tsx` 인라인 (더미 데이터)
현재 placeholder(43~60번 줄)를 더미 데이터 기반 2x2 그리드로 교체:
- 2단계 그룹화 함수로 더미 항목을 4분면에 배치
- 각 셀: 칩 최대 2개 렌더링 + 초과 시 "+N개 더보기" 텍스트
- 빈 분면: 기존 placeholder 톤(`text-zinc-400`)의 안내 텍스트
- 셀/칩/더보기 탭 → 선택된 분면 상태(`useState`)를 세팅해 하단 시트 표시
- 시트는 일단 인라인으로 같은 파일에 작성 (CountrySlidePanel 셸 참고, 높이는 `h-[85vh]`보다 작게 — 항목 수에 맞춰 `max-h-[60vh]` 등 검토)
- 4분면 레이블 문구는 이 단계에서 더미데이터로 다듬으며 확정

### 5. API 연결
- `useQuery({ queryKey: dashboardQueryKeys.difficultyExcitement(), queryFn: fetchDifficultyExcitementMatrix, enabled: isOpen })`
- 로딩: 4셀 스켈레톤(`animate-pulse`, BucketCountWidget/UpcomingDeadlinesWidget 패턴)
- 에러: 동일한 에러 카드 패턴
- 전체 항목 0개일 때의 빈 상태도 고려 (위젯2의 Confetti 빈 상태 패턴 참고)

### 6. 컴포넌트 분리
- `src/app/(afterLogin)/_components/DifficultyExcitementMatrixWidget.tsx` — 쿼리 + 2x2 그리드 + 칩 렌더링 + 선택 분면 상태
- `src/app/(afterLogin)/_components/MatrixQuadrantSheet.tsx` — 하단 시트 (props: 분면 라벨, 항목 목록, `onClose`). code_style.md 규칙상 한 파일에 컴포넌트 2개 이상이면 분리 필요
- `DashboardPanel.tsx`에서 `<DifficultyExcitementMatrixWidget isOpen={isOpen} />`로 교체

### 7. 테스트
- API route: `src/app/api/dashboard/difficulty-excitement/__tests__/route.test.ts` — `@vitest-environment node`, `@/auth`/`@/lib/prisma` 모킹, `where`/`select`/401 검증
- 그룹화 함수: `src/lib/bucketList/__tests__/difficultyExcitementMatrix.test.ts` — 순수 함수, 경계값(difficulty/excitement=3,4) 포함 케이스
- 컴포넌트: `_components/__tests__/DifficultyExcitementMatrixWidget.test.tsx`, `_components/__tests__/MatrixQuadrantSheet.test.tsx` — `@/api/dashboard` 모킹 + framer-motion/아이콘 모킹 + `QueryClientProvider` wrapper. 칩 렌더링/오버플로우, 셀 탭 → 시트 오픈/닫기 검증

### 8. 스토리북
- `src/stories/DifficultyExcitementMatrixWidget.stories.tsx` — `UpcomingDeadlinesWidget.stories.tsx`의 `withQueryCache` 패턴 재사용. 케이스: 기본(여러 분면에 항목 분산 + 한 분면은 오버플로우로 "+N더보기" 노출), 빈 목록, 로딩, 에러(MSW 500)
- `MatrixQuadrantSheet`의 별도 스토리는 선택사항 — 메인 위젯 스토리의 인터랙션으로 충분히 커버되면 생략 가능

## 검증
- `pnpm exec tsc --noEmit -p tsconfig.json` (타입 체크)
- `pnpm exec vitest run --project unit DifficultyExcitementMatrixWidget MatrixQuadrantSheet difficultyExcitementMatrix route` (단위/컴포넌트/route 테스트)
- `pnpm exec vitest run --project storybook DifficultyExcitementMatrixWidget` (스토리북 스냅샷)
- `pnpm lint`
- Storybook 시각 확인은 사용자가 직접 (자동화 시도 안 함 — 기존 합의)
