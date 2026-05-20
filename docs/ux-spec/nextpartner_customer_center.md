# NextPartner 고객센터 전체 페이지 — Claude Code 구현 스펙

## 프로젝트 개요

NextPartner(시니어 인재 마켓플레이스)의 고객센터를 기존 모달 팝업에서 **독립 전체 페이지**로 전환한다.
타겟 사용자는 디지털 역량이 낮은 50–65세 시니어이며, 접근성과 가독성을 최우선으로 설계한다.

- **라우트**: `/support` 또는 `/customer-center`
- **기술 스택**: React (Next.js 또는 CRA), TypeScript, Tailwind CSS
- **접근성 목표**: WCAG 2.1 AA 준수
- **기존 디자인 토큰 유지**: NextPartner 브랜드 컬러(`#E84393` 핑크, `#F5A623` 골드, `#7B2FBE` 퍼플)

---

## 파일 구조

```
src/
├── pages/
│   └── support/
│       └── index.tsx          # 고객센터 메인 페이지
├── components/
│   └── support/
│       ├── SupportHeader.tsx      # 헤더 + 운영 상태 배너
│       ├── ChannelCard.tsx        # 채널 선택 카드 (전화/카카오/채팅)
│       ├── ChannelSection.tsx     # 채널 카드 그리드 섹션
│       ├── FaqAccordion.tsx       # FAQ 아코디언
│       ├── OperatingHours.tsx     # 운영시간 테이블
│       └── SupportNotice.tsx      # 이용 안내 섹션
├── hooks/
│   └── useOperatingStatus.ts     # 현재 운영 상태 자동 계산 훅
├── constants/
│   └── support.ts                # 운영시간, 채널 정보, FAQ 데이터
└── types/
    └── support.ts                # 타입 정의
```

---

## 타입 정의 (`types/support.ts`)

```typescript
export type OperatingStatus = 'open' | 'lunch' | 'closed' | 'holiday';

export interface OperatingHour {
  day: string;           // 'monday' | 'tuesday' | ...
  dayLabel: string;      // '월요일'
  open: string | null;   // '10:00' | null (휴무)
  close: string | null;  // '17:00' | null
  isHoliday: boolean;
}

export interface Channel {
  id: 'phone' | 'kakao' | 'chat';
  type: 'phone' | 'kakao' | 'chat';
  label: string;          // '전화 상담'
  typeLabel: string;      // '전화안내'
  description: string;    // 한 줄 설명
  ctaText: string;        // '지금 전화 연결하기'
  ctaHref: string;        // 'tel:070-8655-2031' | 카카오 링크 | '#chat'
  primaryColor: string;   // Tailwind 색상 클래스
  iconName: string;       // lucide-react 아이콘 이름
  note?: string;          // '주말·공휴일 고객센터 휴무'
}

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
  actionLabel?: string;   // '이력서 등록하기'
  actionHref?: string;
}
```

---

## 상수 데이터 (`constants/support.ts`)

```typescript
import type { Channel, OperatingHour, FaqItem } from '@/types/support';

export const OPERATING_HOURS: OperatingHour[] = [
  { day: 'monday',    dayLabel: '월요일', open: '10:00', close: '17:00', isHoliday: false },
  { day: 'tuesday',   dayLabel: '화요일', open: '10:00', close: '17:00', isHoliday: false },
  { day: 'wednesday', dayLabel: '수요일', open: '10:00', close: '17:00', isHoliday: false },
  { day: 'thursday',  dayLabel: '목요일', open: '10:00', close: '17:00', isHoliday: false },
  { day: 'friday',    dayLabel: '금요일', open: '10:00', close: '17:00', isHoliday: false },
  { day: 'saturday',  dayLabel: '토요일', open: null,    close: null,    isHoliday: true  },
  { day: 'sunday',    dayLabel: '일요일', open: null,    close: null,    isHoliday: true  },
];

export const LUNCH_START = '13:00';
export const LUNCH_END   = '14:00';
export const PHONE_NUMBER = '070-8655-2031';

export const CHANNELS: Channel[] = [
  {
    id: 'phone',
    type: 'phone',
    label: '전화 상담',
    typeLabel: '전화안내',
    description: `담당자와 직접 통화로 가장 빠르게 해결합니다.\n궁금한 점이 있다면 편하게 연락주세요.`,
    ctaText: '지금 전화 연결하기',
    ctaHref: `tel:${PHONE_NUMBER}`,
    primaryColor: '#E84393',
    iconName: 'Phone',
    note: '주말·공휴일 고객센터 휴무',
  },
  {
    id: 'kakao',
    type: 'kakao',
    label: '카카오톡 상담',
    typeLabel: '카카오톡',
    description: `버튼을 누르면 카카오톡으로 메시지가 전송됩니다.\n성함과 연락처를 함께 남겨주시면 더욱 빠르게 안내해 드립니다.`,
    ctaText: '카카오톡 열기',
    ctaHref: 'https://pf.kakao.com/_REPLACE_WITH_ACTUAL_ID',  // ← 실제 채널 ID로 교체
    primaryColor: '#F5A623',
    iconName: 'MessageCircle',
  },
  {
    id: 'chat',
    type: 'chat',
    label: '채팅 상담',
    typeLabel: '채널톡안내',
    description: `버튼을 누르면 채팅창이 열립니다.\n성함과 연락처를 남긴 후 전송 버튼을 눌러주세요.`,
    ctaText: '채팅 상담 시작하기',
    ctaHref: '#chat',   // 채널톡 SDK가 처리 (onClick으로 window.ChannelIO('show') 호출)
    primaryColor: '#7B2FBE',
    iconName: 'MessagesSquare',
  },
];

export const FAQ_ITEMS: FaqItem[] = [
  {
    id: 'faq-1',
    question: '상담 운영시간이 언제인가요?',
    answer: '평일(월~금) 오전 10시부터 오후 5시까지 운영합니다. 점심시간(13:00~14:00)에는 상담이 어려울 수 있습니다. 토·일요일 및 법정 공휴일은 휴무입니다.',
  },
  {
    id: 'faq-2',
    question: '이력서는 어떻게 등록하나요?',
    answer: '상단 메뉴의 [+ 이력서·자소서] 버튼을 클릭하거나, 마이페이지에서 이력서를 등록할 수 있습니다. 사진, 경력사항, 자기소개서를 단계별로 입력해 주세요.',
    actionLabel: '이력서 등록하러 가기',
    actionHref: '/resume/create',
  },
  {
    id: 'faq-3',
    question: '지원한 공고의 처리 상태는 어떻게 확인하나요?',
    answer: '마이페이지 > 지원현황 메뉴에서 지원한 공고의 진행 상태(검토중 / 서류합격 / 불합격)를 확인할 수 있습니다. 상태 변경 시 등록된 이메일로도 알림이 발송됩니다.',
  },
  {
    id: 'faq-4',
    question: '회원정보(연락처, 비밀번호)를 변경하고 싶어요.',
    answer: '마이페이지 > 회원정보 수정에서 이름, 연락처, 비밀번호, 이메일 등을 변경할 수 있습니다. 비밀번호를 잊으셨다면 로그인 페이지의 [비밀번호 찾기]를 이용해 주세요.',
  },
  {
    id: 'faq-5',
    question: '기업 담당자에게 직접 연락할 수 있나요?',
    answer: '개인정보 보호를 위해 지원 전 기업 담당자의 연락처를 제공하지 않습니다. 서류 합격 후 면접 단계에서 기업 담당자 정보가 공개됩니다.',
  },
];
```

---

## 운영 상태 훅 (`hooks/useOperatingStatus.ts`)

```typescript
import { useState, useEffect } from 'react';
import type { OperatingStatus } from '@/types/support';

// 한국 법정 공휴일 목록 (YYYY-MM-DD) — 매년 업데이트 필요
const HOLIDAYS_2025 = [
  '2025-01-01', '2025-01-28', '2025-01-29', '2025-01-30',
  '2025-03-01', '2025-05-05', '2025-05-06', '2025-06-06',
  '2025-08-15', '2025-10-03', '2025-10-06', '2025-10-07', '2025-10-08',
  '2025-12-25',
];

function toTimeInt(hhmm: string): number {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
}

function getStatus(now: Date): OperatingStatus {
  const dateStr = now.toISOString().slice(0, 10);
  const dayOfWeek = now.getDay(); // 0=일, 6=토
  const currentMin = now.getHours() * 60 + now.getMinutes();

  if (dayOfWeek === 0 || dayOfWeek === 6) return 'holiday';
  if (HOLIDAYS_2025.includes(dateStr)) return 'holiday';

  const openMin  = toTimeInt('10:00');
  const lunchS   = toTimeInt('13:00');
  const lunchE   = toTimeInt('14:00');
  const closeMin = toTimeInt('17:00');

  if (currentMin < openMin || currentMin >= closeMin) return 'closed';
  if (currentMin >= lunchS && currentMin < lunchE)    return 'lunch';
  return 'open';
}

export function useOperatingStatus() {
  const [status, setStatus] = useState<OperatingStatus>(() => getStatus(new Date()));

  useEffect(() => {
    const tick = () => setStatus(getStatus(new Date()));
    const interval = setInterval(tick, 60_000); // 1분마다 갱신
    return () => clearInterval(interval);
  }, []);

  const statusConfig = {
    open:    { label: '현재 상담 가능',  sublabel: '빠르게 연결해 드립니다', bg: 'bg-emerald-500', text: 'text-white' },
    lunch:   { label: '점심시간 중',     sublabel: '14:00부터 상담 재개됩니다', bg: 'bg-amber-400',   text: 'text-white' },
    closed:  { label: '운영 시간 외',    sublabel: '평일 10:00–17:00 운영', bg: 'bg-slate-400',   text: 'text-white' },
    holiday: { label: '오늘은 휴무일',   sublabel: '평일에 다시 연락주세요', bg: 'bg-slate-400',   text: 'text-white' },
  };

  return { status, config: statusConfig[status] };
}
```

---

## 컴포넌트 상세 스펙

### 1. `SupportHeader.tsx` — 페이지 헤더 + 운영 상태 배너

**역할**: 브레드크럼 내비게이션, 페이지 제목, 운영 상태 배너를 제공한다.

```
[ 홈 > 고객센터 ]                          ← 브레드크럼 (aria-label="breadcrumb")

고객센터                                    ← h1, 32px Bold
페이지 이동 없이 빠르게 문의할 수 있습니다.  ← 서브타이틀, 18px

┌──────────────────────────────────────────────────────┐
│  🟢  현재 상담 가능          오늘 10:00 – 17:00       │  ← 상태 배너
│      빠르게 연결해 드립니다  (점심 13:00 – 14:00)     │
└──────────────────────────────────────────────────────┘
```

**구현 요구사항**:
- `useOperatingStatus()` 훅으로 배너 배경색 자동 전환
- 배너 전체 너비, 패딩 `py-4 px-6`, 둥근 모서리 `rounded-xl`
- 상태 아이콘: `open` → `●` 초록, `lunch` → `🕐`, `closed`/`holiday` → `●` 회색
- 폰트 크기: 상태 레이블 20px Bold, 서브레이블 16px
- `role="status"` `aria-live="polite"` 적용

---

### 2. `ChannelCard.tsx` — 채널 카드

**역할**: 전화·카카오톡·채팅 채널을 각각 하나의 카드로 표현한다.

```
┌─────────────────────────────────┐
│  [운영중]               아이콘  │  ← 뱃지 + 아이콘 (32px)
│  전화안내                       │  ← typeLabel, 14px, 브랜드 색
│  전화 상담                      │  ← label, 28px Bold
│                                 │
│  TODAY                          │
│  10:00 – 17:00                  │  ← 오늘 운영 시간
│  점심 13:00 – 14:00             │
│                                 │
│  담당자와 직접 통화로...         │  ← description (줄바꿈 포함)
│                                 │
│  ┌───────────────────────────┐  │
│  │   지금 전화 연결하기      │  │  ← CTA 버튼, 56px 높이, 풀너비
│  └───────────────────────────┘  │
│  주말·공휴일 고객센터 휴무       │  ← note (옵셔널)
└─────────────────────────────────┘
```

**Props**:
```typescript
interface ChannelCardProps {
  channel: Channel;
  status: OperatingStatus;
  todayHours: OperatingHour | undefined;
}
```

**구현 요구사항**:
- 카드: `bg-white rounded-2xl shadow-md p-6 flex flex-col gap-4`
- 운영 상태가 `closed` / `holiday`일 때 전화 CTA는 `disabled` + 회색 처리 + 안내 문구 추가
- CTA 버튼 높이 최소 `56px` (`min-h-[56px]`), `text-lg font-bold`
- 전화 채널의 `ctaHref`는 `tel:` 프로토콜 그대로 사용 (모바일 자동 앱 연결)
- 채팅 채널 클릭 시 `window.ChannelIO?.('show')` 호출 (SDK 미로드 시 fallback 안내)
- `aria-label`: `"${channel.label} 연결하기"` 명시
- 호버 시 `shadow-lg` + `translateY(-2px)` 트랜지션 (CSS transition 사용)

---

### 3. `ChannelSection.tsx` — 채널 카드 그리드

**역할**: 3개 채널 카드를 반응형 그리드로 배치한다.

```
모바일  (< 768px):  세로 1열 스택
태블릿  (768–1023): 가로 1열 (카드 너비 100%)
데스크톱(≥ 1024px): 가로 3열 균등 분배
```

**구현 요구사항**:
- `grid grid-cols-1 lg:grid-cols-3 gap-6`
- 섹션 타이틀: `문의 채널 선택`, `h2`, 26px Bold
- 섹션 서브타이틀: `전화, 카카오톡, 채팅 중 편한 채널을 선택하세요.`, 18px

---

### 4. `FaqAccordion.tsx` — FAQ 아코디언

**역할**: 자주 묻는 질문 5개를 아코디언 형식으로 제공한다.

**구현 요구사항**:
- `<details>` / `<summary>` 네이티브 HTML 사용 (접근성 기본 확보)
  - 또는 `useState`로 직접 구현 시 `aria-expanded`, `aria-controls` 필수
- 질문 폰트: 18px Medium, 답변 폰트: 17px Regular, 줄간격 1.8
- 열린 상태: 좌측 `4px` 핑크(`#E84393`) 보더 강조
- 애니메이션: `max-height` 트랜지션 `300ms ease`
- 하단 링크: `전체 FAQ 보기 →` (별도 FAQ 페이지 또는 추후 연결)
- 액션 링크(`actionHref`)가 있는 항목은 답변 하단에 버튼 형식으로 노출

---

### 5. `OperatingHours.tsx` — 운영시간 테이블

**역할**: 요일별 운영시간을 명확하게 표시한다.

```
대표 운영시간
──────────────────────────
월요일    10:00 – 17:00
화요일    10:00 – 17:00
수요일    10:00 – 17:00
목요일    10:00 – 17:00
금요일    10:00 – 17:00
토요일    휴무             ← 빨간 텍스트
일요일    휴무             ← 빨간 텍스트

┌──────────────────────────────┐
│  🕐  점심시간 13:00 – 14:00  │  ← 노란 인포 박스
└──────────────────────────────┘

오늘(월요일)은 운영 중입니다.   ← 오늘 요일 강조 행
```

**구현 요구사항**:
- `<table>` 사용, `<caption>` 제공 (접근성)
- `scope="row"` 각 요일 `<th>`에 적용
- 오늘 요일 행: `bg-pink-50 font-bold` 강조
- 휴무 텍스트: `text-red-500 font-semibold`
- 폰트 크기: 18px 이상

---

### 6. `SupportNotice.tsx` — 이용 안내

**역할**: 운영 관련 유의사항 3개 이내로 간결하게 안내한다.

**표시 내용**:
1. 운영시간 외 문의는 접수 후 다음 운영시간에 순차적으로 답변됩니다.
2. 전화 연결이 어렵다면 카카오톡 또는 채팅 문의를 함께 이용하시면 좋습니다.
3. 점심시간(13:00–14:00)에는 상담이 지연될 수 있습니다.

---

## 메인 페이지 조립 (`pages/support/index.tsx`)

```tsx
// 섹션 순서 및 간격
<main>
  {/* 섹션 01: 헤더 */}
  <SupportHeader />                    {/* mt-0 */}

  {/* 섹션 02: 채널 선택 */}
  <section className="mt-10">
    <ChannelSection />
  </section>

  {/* 섹션 03: FAQ */}
  <section className="mt-12">
    <FaqAccordion items={FAQ_ITEMS} />
  </section>

  {/* 섹션 04 + 05: 운영시간 + 이용 안내 (2열 or 단일) */}
  <section className="mt-12 grid grid-cols-1 lg:grid-cols-2 gap-8">
    <OperatingHours hours={OPERATING_HOURS} />
    <SupportNotice />
  </section>
</main>
```

**페이지 레이아웃**:
- 최대 너비: `max-w-5xl mx-auto px-4 sm:px-6 lg:px-8`
- 배경: `bg-gray-50` (순백 지양)
- 기존 GNB / Footer 그대로 포함

---

## 접근성 체크리스트

| 항목 | 구현 방법 |
|------|-----------|
| 페이지 제목 | `<h1>고객센터</h1>` 명시 |
| 브레드크럼 | `<nav aria-label="breadcrumb">` |
| 운영 상태 | `role="status"` `aria-live="polite"` |
| 채널 카드 | `<article>` 태그로 감싸기 |
| CTA 버튼 | `aria-label="전화 상담 연결하기"` |
| FAQ 아코디언 | `aria-expanded` `aria-controls` |
| 테이블 | `<caption>` `scope="row"` |
| 색상 대비 | 모든 텍스트 4.5:1 이상 확인 |
| 포커스 링 | `focus-visible:ring-2 ring-pink-500` |
| 건너뛰기 링크 | `<a href="#main-content" className="sr-only focus:not-sr-only">본문 바로가기</a>` |

---

## 스타일 가이드

### 폰트 크기 (시니어 기준)
```
페이지 제목 (h1):   32px  font-bold
섹션 제목  (h2):   26px  font-bold
채널명     (h3):   24px  font-bold
본문 텍스트:        18px  font-normal   line-height: 1.8
보조 텍스트:        16px  font-normal
레이블/뱃지:        14px  font-semibold
```

### 색상 토큰
```
--color-brand-pink:   #E84393   /* 전화 채널 CTA, 강조 */
--color-brand-gold:   #F5A623   /* 카카오 채널 CTA     */
--color-brand-purple: #7B2FBE   /* 채팅 채널 CTA       */
--color-status-open:  #10B981   /* 운영중 (emerald-500) */
--color-status-lunch: #F59E0B   /* 점심시간 (amber-400) */
--color-status-off:   #94A3B8   /* 운영종료 (slate-400) */
--color-bg:           #F9FAFB   /* 페이지 배경          */
--color-surface:      #FFFFFF   /* 카드 배경            */
--color-text-primary: #111827   /* 주요 텍스트          */
--color-text-muted:   #6B7280   /* 보조 텍스트          */
```

### 인터랙션
```
버튼 높이:    min-h-[56px]
버튼 반경:    rounded-xl
호버 효과:    transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg
포커스:       focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E84393]
카드 반경:    rounded-2xl
카드 그림자:  shadow-md → hover:shadow-lg
```

---

## 추가 구현 사항

### 채널톡(Channel.io) SDK 연동
```typescript
// _app.tsx 또는 layout.tsx에서 초기화
useEffect(() => {
  if (window.ChannelIO) return;
  // 채널톡 SDK 스니펫 삽입
  window.ChannelIO('boot', { pluginKey: 'REPLACE_WITH_PLUGIN_KEY' });
}, []);
```

### 카카오톡 채널 딥링크 처리
```typescript
// ChannelCard.tsx 내부
function handleKakaoClick() {
  const isMobile = /iPhone|Android/i.test(navigator.userAgent);
  if (isMobile) {
    window.location.href = `kakaoplus://plusfriend/home/_CHANNEL_ID`;
  } else {
    window.open(channel.ctaHref, '_blank', 'noopener,noreferrer');
  }
}
```

### 전화 CTA 운영시간 비활성화
```typescript
// ChannelCard.tsx 내부
const isPhoneDisabled = channel.type === 'phone' && (status === 'closed' || status === 'holiday' || status === 'lunch');
```

---

## 완료 기준 (Definition of Done)

- [ ] `/support` 라우트에서 페이지 정상 렌더링
- [ ] 운영 상태 배너가 현재 시간 기준 자동으로 색상 전환
- [ ] 전화 CTA: 모바일 클릭 시 전화 앱 실행, 운영외 시간 비활성화
- [ ] 카카오톡: 모바일/PC 딥링크 분기 동작
- [ ] 채팅: 채널톡 SDK 연결 동작
- [ ] FAQ 아코디언 열기/닫기 정상 동작
- [ ] 반응형: 모바일(375px), 태블릿(768px), 데스크톱(1280px) 레이아웃 정상
- [ ] WCAG 2.1 AA: axe DevTools 오류 0건
- [ ] 폰트 크기 전 요소 16px 이상 (본문 18px 이상)
- [ ] 버튼 터치 영역 48×48px 이상
- [ ] Lighthouse 접근성 점수 95 이상
- [ ] 기존 GNB / Footer 정상 포함
