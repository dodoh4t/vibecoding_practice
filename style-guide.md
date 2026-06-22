# dodoTodoList Style Guide

## 0. 스타일 방향

첨부 스크린샷은 Toss Careers 계열의 밝고 정돈된 UI를 따른다. dodoTodoList에는 다음 특성을 적용한다.

- 흰색 표면과 옅은 블루 배경을 기본으로 사용한다.
- Primary 색상은 선명한 블루로 제한해 주요 액션, 포커스, 링크에만 사용한다.
- 본문은 짙은 남청색에 가까운 neutral 텍스트를 사용한다.
- 카드와 리스트는 얇은 회색 보더, 큰 여백, 부드러운 그림자로 구분한다.
- Todo 앱 특성상 장식적 요소보다 입력, 목록, 완료/삭제 액션의 가독성을 우선한다.

## 1. 색상 팔레트

### 1.1 색상 토큰

| 구분 | 토큰 | HEX | 사용처 |
| --- | --- | --- | --- |
| Primary | `brand-600` | `#4f6fec` | 주요 버튼, 활성 상태, 링크, 체크박스 |
| Primary Hover | `brand-700` | `#3f5fd8` | Primary hover |
| Primary Focus | `brand-100` | `#dbeafe` | 포커스 링, 선택 배경 |
| Primary Soft | `brand-50` | `#eff6ff` | 히어로 배경, 연한 강조 영역 |
| Secondary | `slate-50` | `#f8fafc` | 페이지 배경, 완료 Todo 배경 |
| Secondary Accent | `blue-100` | `#dbeafe` | 상단 배경 그라데이션 |
| Neutral Strong | `ink-900` | `#191f28` | 페이지 제목, 주요 텍스트 |
| Neutral Body | `ink-700` | `#4e5968` | 본문 텍스트 |
| Neutral Muted | `ink-500` | `#8b95a1` | placeholder, 메타 정보 |
| Neutral Line | `line` | `#e5e8eb` | border, divider |
| Surface | `surface` | `#ffffff` | header, card, input |
| Success | `success-600` | `#16a34a` | 완료 상태, 성공 메시지 |
| Error | `error-600` | `#dc2626` | 에러 텍스트, 삭제 위험 액션 |
| Error Soft | `error-50` | `#fef2f2` | 에러 배경 |

### 1.2 Tailwind 커스텀 색상 설정

```js
// tailwind.config.js
export default {
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          500: '#5b7cfa',
          600: '#4f6fec',
          700: '#3f5fd8',
        },
        ink: {
          900: '#191f28',
          800: '#2b3440',
          700: '#4e5968',
          500: '#8b95a1',
          300: '#d1d6db',
        },
        line: '#e5e8eb',
        surface: '#ffffff',
        app: {
          bg: '#f8fafc',
          hero: '#eff6ff',
        },
        success: {
          50: '#f0fdf4',
          600: '#16a34a',
          700: '#15803d',
        },
        error: {
          50: '#fef2f2',
          100: '#fee2e2',
          600: '#dc2626',
          700: '#b91c1c',
        },
      },
      fontFamily: {
        sans: [
          'Pretendard',
          'Inter',
          '-apple-system',
          'BlinkMacSystemFont',
          'system-ui',
          'Segoe UI',
          'sans-serif',
        ],
      },
      boxShadow: {
        soft: '0 8px 24px rgba(25, 31, 40, 0.08)',
        card: '0 4px 16px rgba(25, 31, 40, 0.04)',
        input: '0 0 0 3px rgba(91, 124, 250, 0.16)',
      },
      borderRadius: {
        ui: '10px',
      },
    },
  },
};
```

## 2. 타이포그래피

### 2.1 폰트 패밀리

- 기본 폰트: `font-sans`
- 권장 순서: `Pretendard`, `Inter`, system UI
- 한국어 UI를 고려해 Pretendard를 우선 사용한다.

```html
<body class="font-sans text-ink-700 bg-app-bg">
```

### 2.2 사이즈 스케일

| 용도 | Tailwind 클래스 | 설명 |
| --- | --- | --- |
| Hero/Page Title | `text-3xl sm:text-4xl lg:text-5xl` | 로그인/메인 상단의 큰 제목 |
| Section Title | `text-xl sm:text-2xl` | Todo 섹션 제목 |
| Card Title | `text-lg sm:text-xl` | 인증 폼 제목, 사이드 카드 제목 |
| Body | `text-[15px] sm:text-base` | 기본 본문 |
| Todo Content | `text-base sm:text-lg` | Todo 항목 본문 |
| Meta/Help | `text-sm` | 날짜, 안내문, placeholder 주변 설명 |
| Caption | `text-xs` | 보조 배지, 작은 카운트 |

### 2.3 굵기

| 용도 | Tailwind 클래스 |
| --- | --- |
| 브랜드/페이지 제목 | `font-bold` |
| 섹션 제목 | `font-bold` |
| Todo 본문 | `font-semibold` |
| 버튼 | `font-semibold` |
| 보조 텍스트 | `font-medium` 또는 `font-normal` |

### 2.4 줄간격

| 용도 | Tailwind 클래스 |
| --- | --- |
| 큰 제목 | `leading-tight` |
| 폼 label, 버튼 | `leading-none` 또는 `leading-5` |
| 본문 | `leading-6` |
| 긴 Todo 내용 | `leading-7` |

전역 규칙:

- `tracking-normal`을 기본으로 사용한다.
- 스크린샷처럼 제목은 굵고 크지만, Todo 앱 내부의 반복 UI에서는 과도한 hero 크기를 쓰지 않는다.

## 3. 공통 컴포넌트 스타일

### 3.1 버튼

#### Primary Button

주요 제출 액션: 로그인, 회원가입, Todo 추가.

```txt
inline-flex h-12 items-center justify-center rounded-ui
bg-brand-600 px-5 text-base font-semibold text-white
transition-colors
hover:bg-brand-700
focus:outline-none focus:ring-4 focus:ring-brand-100
disabled:cursor-not-allowed disabled:opacity-50
```

모바일에서 전체 너비가 필요한 경우:

```txt
w-full sm:w-auto
```

#### Secondary Button

로그아웃, 필터 초기화, 보조 이동 액션.

```txt
inline-flex h-10 items-center justify-center rounded-ui
border border-line bg-surface px-4 text-sm font-semibold text-ink-700
transition-colors
hover:bg-slate-50
focus:outline-none focus:ring-4 focus:ring-brand-100
disabled:cursor-not-allowed disabled:opacity-50
```

#### Danger Button

Todo 삭제 액션.

```txt
inline-flex h-9 items-center justify-center rounded-ui
px-3 text-sm font-semibold text-ink-500
transition-colors
hover:bg-error-50 hover:text-error-600
focus:outline-none focus:ring-4 focus:ring-error-100
disabled:cursor-not-allowed disabled:opacity-50
```

### 3.2 입력폼

#### Label

```txt
mb-2 block text-sm font-semibold text-ink-800
```

#### 기본 입력

```txt
h-14 w-full rounded-ui border border-line bg-surface px-4
text-base text-ink-900 placeholder:text-ink-500
transition
focus:border-brand-500 focus:outline-none focus:shadow-input
disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-ink-500
```

#### 포커스 상태

```txt
border-brand-500 shadow-input outline-none
```

#### 에러 상태

```txt
border-error-600 bg-error-50
focus:border-error-600 focus:ring-4 focus:ring-error-100 focus:shadow-none
```

#### 에러 메시지

```txt
mt-2 text-sm font-medium text-error-600
```

#### 성공 메시지

```txt
mt-2 text-sm font-medium text-success-600
```

### 3.3 카드

인증 폼 카드:

```txt
w-full max-w-[400px] rounded-2xl border border-line
bg-surface p-6 shadow-soft sm:p-8
```

일반 패널:

```txt
rounded-2xl border border-line bg-surface p-5 shadow-card
```

사용 기준:

- 인증 화면에서는 폼을 카드로 감싼다.
- Todo 메인에서는 입력 영역과 리스트 항목을 카드처럼 분리하되, 카드 안에 또 다른 카드를 중첩하지 않는다.

### 3.4 리스트 아이템

Todo 기본 항목:

```txt
flex gap-3 rounded-ui border border-line bg-surface p-4
transition-colors
hover:border-brand-200 hover:bg-brand-50/30
```

Todo 내부 레이아웃:

```txt
grid flex-1 gap-1
```

Todo 본문:

```txt
text-base font-semibold leading-6 text-ink-800 sm:text-lg
```

Todo 메타:

```txt
text-sm leading-5 text-ink-500
```

완료 Todo:

```txt
bg-slate-50
```

완료 Todo 본문:

```txt
text-ink-500 line-through
```

체크박스:

```txt
mt-1 h-5 w-5 rounded border-line text-brand-600 accent-brand-600
focus:ring-4 focus:ring-brand-100
```

### 3.5 헤더 / 네비게이션

상단 헤더:

```txt
sticky top-0 z-20 border-b border-line bg-white/90 backdrop-blur
```

헤더 내부:

```txt
mx-auto flex h-16 max-w-5xl items-center justify-between px-4 sm:px-6 lg:px-8
```

브랜드:

```txt
text-xl font-bold text-ink-900
```

사용자 이메일:

```txt
hidden text-sm font-medium text-ink-500 sm:block
```

메인 상단 배경:

```txt
bg-[radial-gradient(circle_at_75%_10%,#bfdbfe_0%,#eff6ff_35%,#f8fafc_70%)]
```

메인 상단 컨테이너:

```txt
mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8 lg:py-16
```

### 3.6 Todo Composer

```txt
rounded-2xl border border-line bg-surface p-4 shadow-soft
sm:flex sm:items-start sm:gap-3
```

입력:

```txt
flex-1
```

버튼:

```txt
mt-3 w-full sm:mt-0 sm:w-auto
```

### 3.7 Empty / Loading / Error State

Empty State:

```txt
rounded-2xl border border-dashed border-line bg-surface px-6 py-10
text-center text-ink-500
```

Loading Text:

```txt
py-8 text-center text-sm font-medium text-ink-500
```

Global Error Banner:

```txt
rounded-ui border border-error-100 bg-error-50 px-4 py-3
text-sm font-medium text-error-600
```

Success Banner:

```txt
rounded-ui border border-green-100 bg-success-50 px-4 py-3
text-sm font-medium text-success-700
```

## 4. 반응형 브레이크포인트 적용 기준

PRD의 반응형 요구사항과 Tailwind 기본 브레이크포인트를 따른다.

### 기본값: 360px 이상 모바일

- 레이아웃은 단일 컬럼이다.
- 페이지 좌우 여백은 `px-4`를 기본으로 한다.
- 인증 폼, Todo 입력, 버튼은 `w-full`을 기본으로 한다.
- Todo Composer의 입력과 버튼은 세로로 배치한다.
- Todo 리스트 항목은 줄바꿈을 허용하고, 긴 Todo 텍스트는 화면 밖으로 넘치지 않아야 한다.

### `sm` 640px 이상

```txt
sm:px-6
sm:max-w-[400px]
sm:flex
sm:w-auto
sm:block
```

적용 기준:

- 인증 카드 최대 너비를 `max-w-[400px]`로 제한하고 중앙 정렬한다.
- Todo Composer는 입력과 Add 버튼을 한 줄로 전환한다.
- 헤더의 사용자 이메일을 표시한다.

### `md` 768px 이상

```txt
md:max-w-3xl
md:flex-row
md:items-center
md:justify-between
md:gap-6
```

적용 기준:

- Todo 본문 컨테이너는 `max-w-3xl` 수준으로 제한한다.
- Todo 요약, 필터, 정렬을 한 줄에 배치할 수 있다.
- 리스트 항목은 `checkbox | content/meta | action` 구조로 안정적인 가로 정렬을 사용한다.

### `lg` 1024px 이상

```txt
lg:max-w-5xl
lg:px-8
lg:py-16
lg:grid
lg:grid-cols-[minmax(0,2fr)_minmax(280px,1fr)]
lg:gap-8
```

적용 기준:

- 전체 콘텐츠 최대 너비는 `max-w-5xl`을 사용한다.
- Todo 앱은 반복 작업이 중심이므로, 기본은 중앙 단일 컬럼을 유지한다.
- 부가 요약 패널이 생길 경우에만 2컬럼을 사용한다.
- Todo 입력과 목록은 항상 주 컬럼에 둔다.

## 5. 다크모드 지원 여부 및 기준 색상

### 5.1 지원 여부

MVP에서는 라이트 모드를 우선한다. 첨부 스크린샷의 핵심 인상도 밝은 배경, 흰색 카드, 블루 포커스이므로 기본 경험은 라이트 모드로 설계한다.

단, Tailwind 설정은 `darkMode: 'class'`로 두어 추후 다크모드를 확장할 수 있게 한다.

### 5.2 다크모드 기준 색상

| 용도 | Tailwind 기준 |
| --- | --- |
| 페이지 배경 | `dark:bg-slate-950` |
| 카드/입력 표면 | `dark:bg-slate-900` |
| Border | `dark:border-slate-700` |
| 주요 텍스트 | `dark:text-slate-100` |
| 본문 텍스트 | `dark:text-slate-300` |
| 보조 텍스트 | `dark:text-slate-400` |
| Placeholder | `dark:placeholder:text-slate-500` |
| Primary | `dark:bg-[#6d8cff]` |
| Primary Hover | `dark:hover:bg-[#5b7cfa]` |
| Error Text | `dark:text-red-300` |
| Error Surface | `dark:bg-red-950/30` |

### 5.3 다크모드 컴포넌트 예시

```txt
bg-surface text-ink-700 border-line
dark:bg-slate-900 dark:text-slate-300 dark:border-slate-700
```

Primary Button:

```txt
bg-brand-600 text-white hover:bg-brand-700
dark:bg-[#6d8cff] dark:text-slate-950 dark:hover:bg-[#5b7cfa]
```

Input:

```txt
bg-surface text-ink-900 placeholder:text-ink-500
dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500
dark:border-slate-700
```

권장 기준:

- MVP UI 구현 시 다크모드 토글은 필수로 만들지 않는다.
- 다크모드가 필요해질 경우 `html` 또는 최상위 앱 루트에 `class="dark"`를 적용하는 방식으로 확장한다.
