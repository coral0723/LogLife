# 위젯3 "난이도 × 설렘 2x2 매트릭스" 구현 계획

> [HANDOFF.md](./HANDOFF.md)의 위젯3 작업을 위한 상세 구현 계획. 이 문서대로 6단계 워크플로우(API → 디자인 → API 연결 → 컴포넌트 분리 → 테스트 → 스토리북)를 진행한다.
>
> **추가 세션 결과**: 디자인 단계 진입 전 사용자와 디자인 결정사항을 모두 확정함 (아래 "확정된 디자인 결정" 참고). 워크플로우 1번(API: `route.ts`)은 작성 완료 상태이나, 시트 요구사항 확장으로 **select 필드 추가가 필요**(1번 항목 참고). 구현은 다음 세션에서 시작 — 워크플로우 2번(디자인) 작업 시 `/design-taste-frontend` 스킬 사용.
>
> **다음 세션 시작점**: 워크플로우 2번(디자인, 더미 데이터) 1차 버전(단순 2x2 그리드)을 작성했으나, 사용자 피드백으로 **좌표축(난이도↑/설렘→) 교차 스타일로 재작업 필요**. 디자인 결정 모두 확정 완료 — 추가 질문 없이 "4. 디자인 재작업" 섹션 계획대로 `DashboardPanel.tsx`만 수정하면 됨. 완료 후 5번(API 연결)부터 이어서 진행.

## Context
대시보드 패널 위젯 4종 중 위젯1("작성한 버킷리스트 수")·위젯2("마감 임박 순 리스트")는 완료됨. 이번엔 위젯3 차례.

placeholder는 정확한 2x2(4분면) 그리드라서, "겹침" 문제는 한 분면에 항목이 여러 개 들어가는 상황을 가리킨다. 사용자와 논의 끝에 표시 방식을 다음과 같이 확정했다:

- **각 분면 안에 항목 제목을 칩(태그)으로 최대 2개 노출**, 3개 이상이면 "+N개 더보기"
- **칩/더보기를 탭하면 해당 분면의 전체 항목을 `MatrixSlidePanel`(하단 시트)로 표시** — `CountrySlidePanel`을 그대로 재사용하는 수준으로: 동일한 셸(백드롭 + `h-[85vh]` + `rounded-t-3xl` + framer-motion 슬라이드업) + 사진/상태/공개범위 배지 포함 풀 리스트 + 항목 클릭 시 `BucketDetailView` 드릴다운까지 동일하게 지원

기존 합의된 6단계 워크플로우(API → 디자인 → API 연결 → 컴포넌트 분리 → 테스트 → 스토리북)를 그대로 따른다.

## 확정된 디자인 결정

| 항목 | 확정값 | 비고 |
|---|---|---|
| `achieved` 항목 포함 여부 | **제외** (`achieved: false`) | route.ts에 이미 적용됨. "지금 도전/나중에" 프레이밍은 미달성 항목 대상 |
| 2x2 분할 임계값 | `difficulty`/`excitement` 각각 **≤3 → 낮음, ≥4 → 높음** | 1~5 스케일에서 "보통(3)"을 낮음 쪽에 포함, 확실히 높은(4~5) 항목만 "높음" 분면에 들어가도록. 한 줄 상수로 분리 |
| 분면당 칩 개수 | **최대 2개**, 3개 이상이면 "+N개 더보기" | |
| 4분면 레이아웃 & 레이블 | "기회 매트릭스" — 아래 표 참고 | 가로축=난이도(좌:낮음/우:높음), 세로축=설렘(상:높음/하:낮음) |
| 분면 상세 시트 | `MatrixSlidePanel` — `CountrySlidePanel` 풀 재사용 (사진/상태/공개범위 배지 + BucketDetailView 드릴다운), `h-[85vh]` | 컴포넌트명 `MatrixQuadrantSheet`에서 변경. **API select 확장 필요** (단계 1 참고) |
| **매트릭스 시각 스타일** | 단순 2x2 그리드 → **좌표축 교차 스타일**로 재작업 | 가로(설렘→)/세로(난이도↑) 화살표가 교차, 끝은 위/오른쪽 방향. 상세는 "4. 디자인 재작업" 참고 |
| **분면 배경색** | 난이도별 2색 계열 — 좌측 열(난이도 낮음)=`sky`, 우측 열(난이도 높음)=`orange`/`amber` | 설렘(상/하)에 따라 같은 계열 내 음영 차이: `sky-100`/`sky-50`, `orange-100`/`amber-50` |
| **축 화살표·라벨 위치** | 그리드 안쪽 (위젯 전체 크기 변화 없음) | "난이도"/"설렘" 라벨은 화살표 끝 옆 빈 공간에 배치 |
| **상단 "난이도 × 설렘 매트릭스" 헤더** | 그대로 유지 | |
| **반응형 텍스트 스케일** | 모바일 → `sm:` → `lg:` 3단계 | 분면 라벨/칩/더보기/빈 상태/축 라벨 모두 적용. 화살표 아이콘은 14px 고정 |

### 4분면 레이블 ("기회 매트릭스")

|  | 난이도 낮음 (≤3) | 난이도 높음 (≥4) |
|---|---|---|
| **설렘 높음 (≥4)** | 지금 도전! | 버킷리스트의 꽃 |
| **설렘 낮음 (≤3)** | 여유 있을 때 | 마음먹고 천천히 |

`grid grid-cols-2 grid-rows-2` DOM 순서(좌상→우상→좌하→우하)와 매핑:
1. 좌상단(난이도 낮음 + 설렘 높음) → "지금 도전!"
2. 우상단(난이도 높음 + 설렘 높음) → "버킷리스트의 꽃"
3. 좌하단(난이도 낮음 + 설렘 낮음) → "여유 있을 때"
4. 우하단(난이도 높음 + 설렘 낮음) → "마음먹고 천천히"

빈 분면: 기존 placeholder 톤(`text-zinc-400`)의 안내 텍스트.

## 단계별 작업

### 1. API — `src/app/api/dashboard/difficulty-excitement/route.ts` (작성됨, **select 확장 필요**)
기존 작성본:
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

`MatrixSlidePanel`에서 `CountrySlidePanel`과 동일한 리스트(사진/상태/공개범위 배지)를 렌더링하려면 `select`에 다음 필드 추가:
- `displayName` — 카테고리 표시
- `placeId` — 사진 (`ImageWithFallback`의 `/api/places/photo?placeId=...`)
- `deadlineAt` — `getStatus()`로 마감 여부 판정
- `visibility` — `VISIBILITY_CONFIG` 배지

`achieved`는 where절에서 이미 `false`로 고정되므로 select에 추가하지 않고, FE에서 `getStatus({ achieved: false, deadlineAt })`처럼 하드코딩해도 됨 (이 엔드포인트의 status는 항상 "진행 중" 또는 "마감"만 나옴).

### 2. 그룹화 로직 — `src/lib/bucketList/difficultyExcitementMatrix.ts` (신규)
순수 변환 로직이므로 `src/lib/bucketList/`에 배치 (`bucketStatus.ts`와 동일 위치).
- 항목 배열을 입력받아 4분면(난이도 낮음/높음 × 설렘 낮음/높음)으로 그룹화하는 함수
- 임계값(≤3/≥4)은 상수로 분리
- 타입/함수명은 구현 시 자연스럽게 결정 (예: `groupByQuadrant`)
- 입력 타입은 1번에서 확장된 `DifficultyExcitementItem` (그룹화 자체는 difficulty/excitement만 사용하지만, 항목 전체를 그대로 분배)

### 3. 클라이언트 fetch — `src/api/dashboard.ts` 추가
- `DifficultyExcitementItem` 타입: `{ id: string; title: string; displayName: string; placeId: string; difficulty: number; excitement: number; deadlineAt: string | null; visibility: Visibility }` (`Visibility`는 `@/lib/bucketList/bucketStatus`에서 import)
- `dashboardQueryKeys.difficultyExcitement: () => ["dashboard", "difficulty-excitement"] as const`
- `fetchDifficultyExcitementMatrix(): Promise<DifficultyExcitementItem[]>`

### 4. 디자인 재작업 — 좌표축 스타일 매트릭스 (현재 작업, `DashboardPanel.tsx`만 수정)

1차 버전(`groupByQuadrant`로 더미 항목을 4분면에 배치, 칩 최대 2개 + "+N개 더보기", 빈 분면 안내 텍스트, 셀 탭 → `MatrixSlidePanel`)은 작성 완료 — 이 동작/로직은 모두 유지. `MatrixSlidePanel`도 이미 작성됨, 변경 없음.

재작업 대상은 시각 디자인뿐: 단순 2x2 그리드 → **좌표축(난이도↑/설렘→) 교차 스타일**.

#### 구조 개요

기존:
```tsx
<div className="grid aspect-square grid-cols-2 grid-rows-2 gap-2">
  {QUADRANT_CONFIG.map((quadrant) => (
    <MatrixQuadrantCell key={quadrant.key} label={quadrant.label} items={...} onSelect={...} />
  ))}
</div>
```

변경 후: `relative aspect-square` 래퍼 안에 (1) 2x2 컬러 셀 그리드 + (2) 절대 위치 좌표축 오버레이(세로/가로 선 + 위/오른쪽 화살표 아이콘 + "난이도"/"설렘" 라벨)를 함께 배치.

```tsx
{/* 난이도 x 설렘 2x2 매트릭스 */}
<section className="rounded-2xl border border-zinc-100 bg-zinc-50 p-5">
  <p className="mb-3 text-sm text-zinc-400">난이도 × 설렘 매트릭스</p>
  <div className="relative aspect-square">
    <div className="grid h-full w-full grid-cols-2 grid-rows-2 gap-2">
      {QUADRANT_CONFIG.map((quadrant, index) => (
        <MatrixQuadrantCell
          key={quadrant.key}
          label={quadrant.label}
          items={quadrantGroups[quadrant.key]}
          position={QUADRANT_POSITIONS[index]}
          onSelect={() => setSelectedQuadrant(quadrant.key)}
        />
      ))}
    </div>

    {/* 좌표축 오버레이: 세로선(난이도↑) + 가로선(설렘→) */}
    <div className="pointer-events-none absolute inset-0">
      <div className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-zinc-300" />
      <div className="absolute left-0 top-1/2 h-px w-full -translate-y-1/2 bg-zinc-300" />

      <div className="absolute left-1/2 top-0 flex items-start gap-1">
        <ArrowUp size={14} weight="bold" className="text-zinc-400" />
        <span className="text-[10px] font-medium text-zinc-400 sm:text-xs lg:text-sm">난이도</span>
      </div>

      <div className="absolute right-0 top-1/2 flex flex-col items-end gap-0.5">
        <ArrowRight size={14} weight="bold" className="text-zinc-400" />
        <span className="text-[10px] font-medium text-zinc-400 sm:text-xs lg:text-sm">설렘</span>
      </div>
    </div>
  </div>
</section>
```

- 세로/가로 선은 `gap-2`(8px) 셀 간격의 정중앙을 지나가도록 `left-1/2`/`top-1/2` + `-translate`로 배치.
- 위쪽 화살표+"난이도" 그룹: `left-1/2`에서 시작해 오른쪽으로만 펼쳐짐 → 우상단 셀(items-end 정렬이라 좌상단 영역이 빔)의 좌상단 빈 공간에 위치, 좌상단 셀과 겹치지 않음.
- 오른쪽 화살표+"설렘" 그룹: `top-1/2`에서 시작해 아래로만 펼쳐짐 → 우상단 셀의 우하단 빈 공간 + 우하단 셀의 우상단 빈 공간 경계에 위치.
- `ArrowUp`/`ArrowRight`는 `@phosphor-icons/react`에서 새로 import (기존 `CaretDown`과 같은 import 라인에 추가).

#### `MatrixQuadrantCell` 변경

각 분면을 "중심(축)에서 바깥 모서리 방향으로" 콘텐츠가 모이도록 정렬하고, 난이도별 배경색 + 분면 외곽 모서리만 둥글게 처리. `QUADRANT_CONFIG` 순서(좌상→우상→좌하→우하)에 맞춰 4가지 시각 설정 정의:

```tsx
type Position = "top-left" | "top-right" | "bottom-left" | "bottom-right";

const QUADRANT_POSITIONS: Position[] = ["top-left", "top-right", "bottom-left", "bottom-right"];

const POSITION_STYLES: Record<
  Position,
  { rounded: string; bg: string; justify: string; items: string; chipsJustify: string }
> = {
  "top-left":     { rounded: "rounded-tl-2xl", bg: "bg-sky-100",    justify: "justify-start", items: "items-start", chipsJustify: "justify-start" },
  "top-right":    { rounded: "rounded-tr-2xl", bg: "bg-orange-100", justify: "justify-start", items: "items-end",   chipsJustify: "justify-end" },
  "bottom-left":  { rounded: "rounded-bl-2xl", bg: "bg-sky-50",     justify: "justify-end",   items: "items-start", chipsJustify: "justify-start" },
  "bottom-right": { rounded: "rounded-br-2xl", bg: "bg-amber-50",   justify: "justify-end",   items: "items-end",   chipsJustify: "justify-end" },
};
```

```tsx
type MatrixQuadrantCellProps = {
  label: string;
  items: DifficultyExcitementItem[];
  position: Position;
  onSelect: () => void;
};

function MatrixQuadrantCell({ label, items, position, onSelect }: MatrixQuadrantCellProps) {
  const visibleItems = items.slice(0, MAX_VISIBLE_CHIPS);
  const overflowCount = items.length - visibleItems.length;
  const styles = POSITION_STYLES[position];

  return (
    <button
      type="button"
      disabled={items.length === 0}
      onClick={onSelect}
      className={`flex h-full w-full flex-col gap-1.5 overflow-hidden p-3 text-left transition-transform sm:p-4 ${styles.rounded} ${styles.bg} ${styles.justify} ${styles.items} ${
        items.length > 0 ? "active:scale-[0.98]" : "cursor-default"
      }`}
    >
      <span className="text-sm font-bold text-zinc-700 sm:text-base lg:text-lg">{label}</span>
      {items.length === 0 ? (
        <span className="text-xs text-zinc-400 sm:text-sm lg:text-base">아직 없어요</span>
      ) : (
        <div className={`flex flex-wrap gap-1 ${styles.chipsJustify}`}>
          {visibleItems.map((item) => (
            <span
              key={item.id}
              className="max-w-full truncate rounded-full bg-white/70 px-2 py-0.5 text-[11px] text-zinc-600 sm:text-xs lg:text-sm"
            >
              {item.title}
            </span>
          ))}
          {overflowCount > 0 && (
            <span className="text-[11px] font-medium text-zinc-500 sm:text-xs lg:text-sm">+{overflowCount}개 더보기</span>
          )}
        </div>
      )}
    </button>
  );
}
```

`flex-col` + `items-start`/`items-end`는 자식을 cross-axis 기준 좌/우로 정렬하므로 별도 `text-left`/`text-right` 클래스는 불필요.

#### 반응형 텍스트 스케일

| 요소 | 모바일(기본) | `sm:` | `lg:` |
|---|---|---|---|
| 분면 라벨(예: "버킷리스트의 꽃") | `text-sm font-bold` | `text-base` | `text-lg` |
| 칩(아이템 제목) | `text-[11px]` | `text-xs` | `text-sm` |
| "+N개 더보기" | `text-[11px]` | `text-xs` | `text-sm` |
| 빈 분면 "아직 없어요" | `text-xs` | `text-sm` | `text-base` |
| 축 라벨("난이도"/"설렘") | `text-[10px]` | `text-xs` | `text-sm` |

화살표 아이콘은 `size={14}` 고정(반응형 미적용).

#### 검증 (이 단계)
- `pnpm exec tsc --noEmit -p tsconfig.json`
- `pnpm lint`
- 시각 확인은 사용자가 직접 dev 서버에서 확인 (자동화 시도 안 함)

### 5. API 연결
- `useQuery({ queryKey: dashboardQueryKeys.difficultyExcitement(), queryFn: fetchDifficultyExcitementMatrix, enabled: isOpen })`
- 로딩: 4셀 스켈레톤(`animate-pulse`, BucketCountWidget/UpcomingDeadlinesWidget 패턴)
- 에러: 동일한 에러 카드 패턴
- 전체 항목 0개일 때의 빈 상태 (위젯2의 Confetti 빈 상태 패턴 참고)

### 6. 컴포넌트 분리
- `src/app/(afterLogin)/_components/DifficultyExcitementMatrixWidget.tsx` — 쿼리 + 2x2 그리드 + 칩 렌더링 + 선택 분면 상태
- `src/app/(afterLogin)/_components/MatrixSlidePanel.tsx` — 분면 상세 시트
  - props: 분면 라벨, 항목 배열(`DifficultyExcitementItem[]`), `onClose`
  - `CountrySlidePanel`과 동일한 셸(backdrop + `h-[85vh]` + `rounded-t-3xl` + slide-up) + 리스트(사진/상태/공개범위 배지) + 항목 클릭 시 `BucketDetailView` 드릴다운
  - `CountrySlidePanel`과의 차이: `useInfiniteQuery`로 페이지네이션 fetch하지 않음 — props로 받은 항목 배열을 그대로 렌더링 (이미 difficulty-excitement 쿼리로 전체 항목을 한 번에 가져왔으므로 페이지네이션 불필요)
  - BucketDetailView 드릴다운은 `CountrySlidePanel`과 동일 패턴: `queryClient.ensureQueryData({ queryKey: bucketQueryKeys.detail(itemId), queryFn: () => fetchBucketDetail(itemId) })` → `<BucketDetailView bucketId={itemId} onBack={...} isOwner />`
- `DashboardPanel.tsx`에서 `<DifficultyExcitementMatrixWidget isOpen={isOpen} />`로 교체

### 7. 테스트
- API route: `src/app/api/dashboard/difficulty-excitement/__tests__/route.test.ts` — `@vitest-environment node`, `@/auth`/`@/lib/prisma` 모킹, `where`/확장된 `select`/401 검증
- 그룹화 함수: `src/lib/bucketList/__tests__/difficultyExcitementMatrix.test.ts` — 순수 함수, 경계값(difficulty/excitement=3,4) 포함 케이스
- 컴포넌트:
  - `_components/__tests__/DifficultyExcitementMatrixWidget.test.tsx` — `@/api/dashboard` 모킹 + framer-motion/아이콘 모킹 + `QueryClientProvider` wrapper. 칩 렌더링/오버플로우, 셀 탭 → `MatrixSlidePanel` 오픈/닫기 검증
  - `_components/__tests__/MatrixSlidePanel.test.tsx` — `CountrySlidePanel.test.tsx` 패턴 참고 (`@/api/bucketlists`의 `fetchBucketDetail` 모킹, `BucketDetailView` 모킹, framer-motion 모킹). 리스트 렌더링(사진/상태/공개범위 배지), 항목 클릭 → `BucketDetailView` 드릴다운 검증

### 8. 스토리북
- `src/stories/DifficultyExcitementMatrixWidget.stories.tsx` — `UpcomingDeadlinesWidget.stories.tsx`의 `withQueryCache` 패턴 재사용. 케이스: 기본(여러 분면에 항목 분산 + 한 분면은 오버플로우로 "+N더보기" 노출), 빈 목록, 로딩, 에러(MSW 500)
- `MatrixSlidePanel`의 별도 스토리는 선택사항 — 메인 위젯 스토리의 인터랙션(분면 탭 → 시트 오픈)으로 충분히 커버되면 생략 가능. `BucketDetailView` 드릴다운까지 인터랙션으로 다루려면 `fetchBucketDetail`용 MSW 핸들러 추가 필요

## 검증
- `pnpm exec tsc --noEmit -p tsconfig.json` (타입 체크)
- `pnpm exec vitest run --project unit DifficultyExcitementMatrixWidget MatrixSlidePanel difficultyExcitementMatrix route` (단위/컴포넌트/route 테스트)
- `pnpm exec vitest run --project storybook DifficultyExcitementMatrixWidget` (스토리북 스냅샷)
- `pnpm lint`
- Storybook 시각 확인은 사용자가 직접 (자동화 시도 안 함 — 기존 합의)
