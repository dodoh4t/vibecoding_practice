# dodoTodoList Execution Plan

## 기준 문서

현재 저장소에는 `docs/` 폴더가 없으며, 실행계획은 저장소 루트의 다음 문서를 기준으로 작성한다.

- `PRD.md`: 기능 요구사항, 사용자 스토리, 비기능 요구사항
- `ERD.md`: `users`, `todos` 데이터 모델과 제약조건
- `api-spec.yaml`: OpenAPI 3.0 REST API 계약
- `wireframe.md`: 화면 구조, 사용자 흐름, 반응형 기준
- `style-guide.md`: TailwindCSS 색상, 타이포그래피, 컴포넌트 스타일

전체 목표는 React + Vite + TypeScript 프론트엔드, Node.js + Express 백엔드, Supabase PostgreSQL, 자체 JWT 인증을 사용하는 개인 TodoList MVP를 구현하고 Vercel에 배포하는 것이다.

## Task 0: 환경 세팅

예상 소요 시간: 2-3시간

### 세부 작업 목록

- [ ] 저장소 구조를 확정한다.
  - [ ] `client/`: React + Vite + TypeScript 프론트엔드
  - [ ] `server/`: Node.js + Express 백엔드
  - [ ] `server/src/`: 라우트, 미들웨어, DB 접근 코드
  - [ ] `server/db/`: SQL 스키마 또는 마이그레이션 파일
- [ ] 프론트엔드 프로젝트를 생성한다.
  - [ ] Vite React TypeScript 템플릿 적용
  - [ ] React Router 설치
  - [ ] TailwindCSS, PostCSS, Autoprefixer 설정
  - [ ] `style-guide.md`의 Tailwind theme 확장값 반영
- [ ] 백엔드 프로젝트를 생성한다.
  - [ ] Express 서버 기본 구조 생성
  - [ ] `pg`, `bcrypt`, `jsonwebtoken`, `cors`, `dotenv` 설치
  - [ ] 개발 편의를 위한 `nodemon` 또는 `tsx` 계열 스크립트 검토
- [ ] 공통 개발 스크립트를 정의한다.
  - [ ] 프론트엔드 `dev`, `build`, `preview`
  - [ ] 백엔드 `dev`, `start`
  - [ ] 루트에서 프론트/백엔드 동시 실행 방식 결정
- [ ] 환경변수 예시 파일을 만든다.
  - [ ] `server/.env.example`: `DATABASE_URL`, `JWT_SECRET`, `JWT_EXPIRES_IN`, `CLIENT_ORIGIN`, `PORT`
  - [ ] `client/.env.example`: `VITE_API_BASE_URL`
  - [ ] 실제 `.env`는 git에 커밋하지 않도록 `.gitignore`에 추가
- [ ] 로컬 헬스체크 경로를 준비한다.
  - [ ] `GET /api/health` 또는 `GET /health`
  - [ ] 로컬 서버 실행 확인용으로만 사용

### 완료 기준 Definition of Done

- [ ] `client` 개발 서버가 로컬에서 실행된다.
- [ ] `server` 개발 서버가 로컬에서 실행된다.
- [ ] 백엔드 헬스체크 API가 정상 응답한다.
- [ ] TailwindCSS가 프론트엔드에 적용된다.
- [ ] `style-guide.md`의 색상 토큰, 폰트, shadow, radius 설정이 Tailwind 설정에 반영된다.
- [ ] `.env.example`은 존재하지만 실제 secret 값은 커밋되지 않는다.

### 다음 Task로 넘어가기 전 확인사항

- [ ] `npm install` 또는 선택한 패키지 매니저 설치가 프론트/백엔드 모두 성공한다.
- [ ] 프론트엔드 기본 화면이 브라우저에서 렌더링된다.
- [ ] 백엔드 서버가 지정 포트에서 실행된다.
- [ ] `.gitignore`에 `.env`, `node_modules`, 빌드 산출물이 포함되어 있다.
- [ ] Vercel 배포를 고려한 폴더 구조와 빌드 명령이 정리되어 있다.

## Task 1: DB & 백엔드

예상 소요 시간: 6-8시간

### 세부 작업 목록

- [ ] Supabase PostgreSQL 프로젝트와 연결 정보를 준비한다.
- [ ] `ERD.md` 기준으로 DB 스키마를 작성한다.
  - [ ] `users` 테이블 생성
  - [ ] `todos` 테이블 생성
  - [ ] `users.email` 이메일 형식 검증 제약조건 추가
  - [ ] `users.email` 소문자 저장 제약조건 추가
  - [ ] `users.email` unique index 추가
  - [ ] `todos.content` 공백 제외 빈 문자열 금지 제약조건 추가
  - [ ] `todos.user_id -> users.id` FK와 `ON DELETE CASCADE` 적용
  - [ ] `todos(user_id, created_at DESC)` 인덱스 추가
  - [ ] `todos(user_id, is_completed)` 인덱스 추가
- [ ] 백엔드 DB 연결 레이어를 구현한다.
  - [ ] `pg` Pool 설정
  - [ ] 환경변수 기반 `DATABASE_URL` 로딩
  - [ ] 모든 SQL에 파라미터 바인딩 사용
- [ ] 인증 API를 구현한다.
  - [ ] `POST /auth/signup`
  - [ ] `POST /auth/login`
  - [ ] `POST /auth/logout`
  - [ ] 이메일 소문자 정규화
  - [ ] 비밀번호 8자 이상 검증
  - [ ] `bcrypt` 기반 비밀번호 해싱
  - [ ] JWT 발급 및 만료 시간 적용
- [ ] 인증 미들웨어를 구현한다.
  - [ ] `Authorization: Bearer <token>` 파싱
  - [ ] 만료, 위조, 누락 토큰 처리
  - [ ] 인증된 `userId`를 요청 컨텍스트에 주입
- [ ] Todo API를 구현한다.
  - [ ] `GET /todos`
  - [ ] `POST /todos`
  - [ ] `PATCH /todos/{todoId}`
  - [ ] `DELETE /todos/{todoId}`
  - [ ] `completed`, `sort` query 검증
  - [ ] `todoId` UUID 검증
  - [ ] Todo 내용 trim 및 공백 Todo 거부
  - [ ] 모든 Todo 조회/수정/삭제 쿼리에 인증 사용자 ID 조건 포함
- [ ] `api-spec.yaml`의 응답 형식을 맞춘다.
  - [ ] 성공 응답 필드는 camelCase로 반환
  - [ ] 에러 응답은 `{ error: { code, message } }` 형식으로 통일
  - [ ] `VALIDATION_ERROR`, `INVALID_CREDENTIALS`, `UNAUTHORIZED`, `TOKEN_EXPIRED`, `RATE_LIMITED`, `TODO_NOT_FOUND`, `INTERNAL_SERVER_ERROR` 코드 사용
- [ ] CORS를 설정한다.
  - [ ] 로컬 프론트엔드 origin 허용
  - [ ] 배포 환경에서는 `CLIENT_ORIGIN` 기준으로 허용

### 완료 기준 Definition of Done

- [ ] Supabase DB에 `users`, `todos` 테이블과 필수 제약조건이 생성되어 있다.
- [ ] `api-spec.yaml`에 정의된 모든 백엔드 엔드포인트가 구현되어 있다.
- [ ] 회원가입 시 비밀번호는 평문으로 저장되지 않는다.
- [ ] 로그인 성공 시 만료 시간이 있는 JWT가 발급된다.
- [ ] 인증이 필요한 Todo API는 JWT 없이 접근할 수 없다.
- [ ] 사용자는 자신의 Todo만 조회, 수정, 삭제할 수 있다.
- [ ] 잘못된 입력, 중복 이메일, 잘못된 로그인 정보, 만료 토큰, 존재하지 않는 Todo에 대해 명세와 일치하는 에러 응답을 반환한다.

### 다음 Task로 넘어가기 전 확인사항

- [ ] curl, Postman, HTTPie 중 하나로 전체 API smoke test를 완료했다.
- [ ] DB에 직접 잘못된 데이터를 넣으려 할 때 필수 제약조건이 동작한다.
- [ ] 두 개의 테스트 계정으로 서로의 Todo에 접근할 수 없음을 확인했다.
- [ ] 백엔드 환경변수 누락 시 명확히 실패한다.
- [ ] API 응답 필드가 프론트엔드에서 사용할 camelCase와 일치한다.

## Task 2: 프론트엔드

예상 소요 시간: 7-9시간

### 세부 작업 목록

- [ ] 라우팅 구조를 구현한다.
  - [ ] `/login`
  - [ ] `/signup`
  - [ ] `/todos` 또는 `/`
  - [ ] 보호 라우트 `ProtectedRoute`
  - [ ] 인증 사용자의 public route 접근 시 Todo 화면으로 리다이렉트
- [ ] 인증 상태 관리를 구현한다.
  - [ ] `AuthProvider`
  - [ ] JWT 저장 및 제거
  - [ ] 사용자 이메일 표시
  - [ ] 세션 만료 메시지 처리
- [ ] 로그인 화면을 구현한다.
  - [ ] 이메일/비밀번호 입력
  - [ ] 필수 입력 검증
  - [ ] `POST /auth/login` 연동
  - [ ] 실패 시 폼 에러 표시
- [ ] 회원가입 화면을 구현한다.
  - [ ] 이메일 형식 검증
  - [ ] 비밀번호 8자 이상 검증
  - [ ] `POST /auth/signup` 연동
  - [ ] 성공 시 로그인 화면으로 이동 및 성공 메시지 표시
  - [ ] 중복 이메일 에러 표시
- [ ] Todo 메인 화면을 구현한다.
  - [ ] TopBar: 앱 이름, 사용자 이메일, 로그아웃 버튼
  - [ ] TodoComposer: 입력 필드, Add 버튼, 인라인 검증 메시지
  - [ ] TodoToolbar: 전체/완료 수 요약, 선택 필터, 정렬
  - [ ] TodoListRegion: 로딩, Empty State, 목록
  - [ ] TodoItem: 체크박스, 내용, 메타, 삭제 버튼
  - [ ] GlobalErrorBanner
- [ ] Todo API를 연동한다.
  - [ ] 최초 진입 시 `GET /todos?sort=createdAtDesc`
  - [ ] 추가 시 `POST /todos`
  - [ ] 완료 변경 시 `PATCH /todos/{todoId}`
  - [ ] 삭제 시 `DELETE /todos/{todoId}`
  - [ ] 로그아웃 시 `POST /auth/logout` 후 토큰 제거
- [ ] 에러 처리 규칙을 구현한다.
  - [ ] API 에러 형식 `{ error: { code, message } }` 파싱
  - [ ] `401 UNAUTHORIZED`, `TOKEN_EXPIRED` 시 토큰 제거 및 로그인 화면 이동
  - [ ] 삭제 실패 시 기존 목록 상태 유지
- [ ] TailwindCSS 스타일을 적용한다.
  - [ ] `style-guide.md`의 Primary/Neutral/Error/Success 색상 적용
  - [ ] 입력, 버튼, 카드, 리스트 아이템 스타일 적용
  - [ ] 라이트 모드 우선 구현
  - [ ] 추후 확장을 위한 `dark:` 클래스 구조는 방해되지 않게 유지
- [ ] 접근성을 반영한다.
  - [ ] 입력 필드 label 연결
  - [ ] 체크박스 키보드 조작 가능
  - [ ] 삭제 버튼의 접근 가능한 이름 제공
  - [ ] 완료 상태를 색상만으로 표현하지 않음

### 완료 기준 Definition of Done

- [ ] 사용자가 회원가입, 로그인, Todo 조회, 추가, 완료 변경, 삭제, 로그아웃을 UI에서 수행할 수 있다.
- [ ] 빈 Todo와 공백 Todo는 클라이언트에서 먼저 차단된다.
- [ ] API 실패 시 사용자가 다음 행동을 이해할 수 있는 메시지가 표시된다.
- [ ] 인증 만료 시 토큰을 제거하고 로그인 화면으로 이동한다.
- [ ] `wireframe.md`의 화면 구조와 주요 상태가 구현되어 있다.
- [ ] `style-guide.md`의 Tailwind 스타일 방향을 따른다.
- [ ] 360px, 390px, 768px, 1024px, 1280px 너비에서 텍스트와 버튼이 겹치거나 잘리지 않는다.

### 다음 Task로 넘어가기 전 확인사항

- [ ] 인증되지 않은 사용자가 `/todos`에 접근하면 `/login`으로 이동한다.
- [ ] 인증된 사용자가 `/login` 또는 `/signup`에 접근하면 Todo 화면으로 이동한다.
- [ ] Todo 추가 후 입력 필드가 비워지고 목록이 즉시 갱신된다.
- [ ] 완료 체크 후 새로고침해도 상태가 유지된다.
- [ ] 삭제 실패 시 기존 Todo 목록이 유지된다.
- [ ] 키보드만으로 로그인, 회원가입, Todo 추가, 완료 체크, 삭제 버튼 포커스가 가능하다.

## Task 3: 연동 & 테스트

예상 소요 시간: 5-7시간

### 세부 작업 목록

- [ ] 로컬 프론트엔드와 백엔드를 실제 Supabase DB에 연결해 E2E 흐름을 점검한다.
- [ ] PRD 사용자 스토리별 수락 기준을 테스트한다.
  - [ ] 회원가입
  - [ ] 로그인
  - [ ] 할 일 추가
  - [ ] 완료 체크
  - [ ] 할 일 삭제
  - [ ] 전체 목록 조회
  - [ ] 로그아웃
- [ ] 백엔드 테스트를 추가한다.
  - [ ] 인증 입력 검증
  - [ ] 중복 이메일
  - [ ] 로그인 실패
  - [ ] JWT 누락, 만료, 위조
  - [ ] Todo CRUD
  - [ ] 사용자 소유권 검증
- [ ] 프론트엔드 테스트 또는 QA 체크리스트를 작성한다.
  - [ ] 로그인/회원가입 폼 검증
  - [ ] Todo 추가/완료/삭제
  - [ ] 세션 만료 처리
  - [ ] Empty/Loading/Error 상태
- [ ] API 명세와 실제 응답을 비교한다.
  - [ ] status code
  - [ ] requestBody
  - [ ] response schema
  - [ ] error code
- [ ] 반응형 UI를 검증한다.
  - [ ] 360px x 640px
  - [ ] 390px x 844px
  - [ ] 768px x 1024px
  - [ ] 1024px x 768px
  - [ ] 1280px x 720px 이상
- [ ] 접근성 기본 검증을 수행한다.
  - [ ] label
  - [ ] focus ring
  - [ ] keyboard navigation
  - [ ] checkbox 상태
  - [ ] 에러 메시지 연결
- [ ] production-like 환경변수로 로컬 빌드를 검증한다.

### 완료 기준 Definition of Done

- [ ] PRD의 모든 핵심 사용자 스토리가 로컬 환경에서 통과한다.
- [ ] 실제 API 동작이 `api-spec.yaml`과 일치한다.
- [ ] 사용자 A가 사용자 B의 Todo를 조회, 수정, 삭제할 수 없다.
- [ ] 모든 공통 에러 응답이 `{ error: { code, message } }` 형식으로 반환된다.
- [ ] 프론트엔드 빌드가 성공한다.
- [ ] 백엔드 서버가 production 환경변수 형태로 실행된다.
- [ ] 필수 반응형 해상도에서 UI가 겹치거나 잘리지 않는다.

### 다음 Task로 넘어가기 전 확인사항

- [ ] 프론트엔드 `npm run build`가 성공한다.
- [ ] 백엔드 start command가 정상 동작한다.
- [ ] Supabase 연결 문자열과 JWT secret이 환경변수로만 주입된다.
- [ ] Vercel에서 사용할 build command, output directory, server entrypoint가 정리되어 있다.
- [ ] 배포 전 남은 치명적 버그가 없다.

## Task 4: 배포

예상 소요 시간: 3-5시간

### 세부 작업 목록

- [ ] Vercel 배포 구조를 확정한다.
  - [ ] 프론트엔드와 백엔드를 각각 Vercel 프로젝트로 배포할지 결정
  - [ ] 또는 단일 저장소에서 Vercel 설정 파일로 라우팅할지 결정
- [ ] 프론트엔드 Vercel 프로젝트를 설정한다.
  - [ ] build command 설정
  - [ ] output directory 설정
  - [ ] `VITE_API_BASE_URL` 설정
- [ ] 백엔드 Vercel 프로젝트를 설정한다.
  - [ ] Express entrypoint 설정
  - [ ] serverless 환경에서 동작하도록 export 또는 handler 구조 조정
  - [ ] `DATABASE_URL`, `JWT_SECRET`, `JWT_EXPIRES_IN`, `CLIENT_ORIGIN` 설정
- [ ] Supabase production DB를 준비한다.
  - [ ] schema SQL 실행
  - [ ] 필수 제약조건과 인덱스 생성 확인
  - [ ] DB 접속 권한과 connection string 확인
- [ ] CORS를 production origin 기준으로 설정한다.
- [ ] 배포를 실행한다.
- [ ] production smoke test를 수행한다.
  - [ ] 회원가입
  - [ ] 로그인
  - [ ] Todo 목록 조회
  - [ ] Todo 추가
  - [ ] 완료 체크
  - [ ] 삭제
  - [ ] 로그아웃
  - [ ] 인증 없이 Todo API 접근 시 실패
- [ ] 배포 결과를 문서화한다.
  - [ ] 프론트엔드 URL
  - [ ] 백엔드 API URL
  - [ ] 설정한 환경변수 이름
  - [ ] 알려진 제한사항

### 완료 기준 Definition of Done

- [ ] Vercel production URL에서 Todo 앱이 정상 로드된다.
- [ ] 배포된 프론트엔드가 배포된 백엔드 API와 통신한다.
- [ ] Supabase PostgreSQL에 사용자와 Todo 데이터가 저장된다.
- [ ] JWT secret, DB 연결 문자열 등 secret이 코드에 노출되지 않는다.
- [ ] production smoke test가 통과한다.
- [ ] 배포 URL과 운영 환경변수 목록이 정리되어 있다.

### 다음 Task로 넘어가기 전 확인사항

- [ ] Task 4가 최종 단계이므로 다음 Task는 없다.
- [ ] 운영 URL에서 핵심 사용자 흐름이 재현 가능하다.
- [ ] Supabase와 Vercel의 무료 플랜 제한 또는 운영상 주의사항을 기록했다.
- [ ] 배포 후 발견된 이슈는 후속 작업 목록으로 분리했다.
