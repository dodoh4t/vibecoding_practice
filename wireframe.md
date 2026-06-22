# dodoTodoList Wireframe

## 1. 화면 도출 요약

| 화면 | 라우트 예시 | 근거 사용자 스토리 | 주요 API |
| --- | --- | --- | --- |
| 로그인 화면 | `/login` | 3.2 로그인, 3.6 비로그인 사용자의 Todo 접근 제한 | `POST /auth/login` |
| 회원가입 화면 | `/signup` | 3.1 회원가입 | `POST /auth/signup` |
| Todo 메인 화면 | `/todos` 또는 `/` | 3.3 할 일 추가, 3.4 완료 체크, 3.5 할 일 삭제, 3.6 전체 목록 조회, 로그아웃 | `GET /todos`, `POST /todos`, `PATCH /todos/{todoId}`, `DELETE /todos/{todoId}`, `POST /auth/logout` |
| 인증 가드 및 세션 만료 상태 | 라우트 공통 처리 | 로그인하지 않은 사용자는 Todo 목록에 접근할 수 없음, JWT 만료/위조 토큰 거부 | Todo API의 `401` 응답 |

ERD 기준으로 화면에 필요한 데이터는 `users.email`, `todos.id`, `todos.content`, `todos.is_completed`, `todos.created_at`, `todos.updated_at`이다. API 응답은 `api-spec.yaml`에 따라 camelCase 필드인 `email`, `id`, `content`, `isCompleted`, `createdAt`, `updatedAt`을 사용한다.

## 2. 로그인 화면

### 근거가 되는 사용자 스토리

- 3.2 로그인: 나는 개인 사용자로서 내 Todo 목록에 접근하기 위해 로그인을 원한다.
- 3.6 전체 목록 조회: 로그인하지 않은 사용자는 Todo 목록에 접근할 수 없다.

### ASCII 레이아웃 스케치

```text
┌────────────────────────────────────────┐
│                dodoTodoList            │
│                                        │
│  Email                                 │
│  ┌──────────────────────────────────┐  │
│  │ user@example.com                 │  │
│  └──────────────────────────────────┘  │
│                                        │
│  Password                              │
│  ┌──────────────────────────────────┐  │
│  │ ********                         │  │
│  └──────────────────────────────────┘  │
│                                        │
│  ┌──────────────────────────────────┐  │
│  │             Log in               │  │
│  └──────────────────────────────────┘  │
│                                        │
│  Email or password is incorrect.       │
│                                        │
│  Don't have an account? Sign up        │
└────────────────────────────────────────┘
```

### 호출하는 API 엔드포인트

- `POST /auth/login`
  - requestBody: `{ email, password }`
  - success: `200`, `accessToken`, `tokenType`, `expiresIn`, `user`
  - error: `400 VALIDATION_ERROR`, `401 INVALID_CREDENTIALS`, `500 INTERNAL_SERVER_ERROR`

### 컴포넌트 트리

```text
LoginPage
  AuthLayout
    AppBrand
    LoginForm
      EmailField
      PasswordField
      SubmitButton
      FormErrorMessage
    AuthSwitchLink
```

### 사용자 인터랙션 흐름

1. 사용자가 이메일과 비밀번호를 입력한다.
2. `Log in` 버튼을 누르면 필수 입력값을 클라이언트에서 먼저 검증한다.
3. 검증 성공 시 `POST /auth/login`을 호출한다.
4. 성공하면 JWT와 사용자 정보를 저장하고 Todo 메인 화면으로 이동한다.
5. `400` 또는 `401` 응답이면 같은 화면에 에러 메시지를 표시한다.
6. 이미 인증된 사용자가 `/login`에 접근하면 Todo 메인 화면으로 리다이렉트한다.

### 반응형 레이아웃 변화

- 모바일 360px-639px: 화면 전체 너비를 사용하되 좌우 16px 이상의 여백을 둔다. 입력 필드와 버튼은 세로로 배치하고 전체 너비를 사용한다.
- 태블릿 640px-1023px: 인증 패널의 최대 너비를 약 400px로 제한하고 화면 중앙에 배치한다.
- 데스크톱 1024px 이상: 인증 패널은 중앙에 유지하며 지나치게 넓어지지 않도록 최대 너비를 유지한다.

## 3. 회원가입 화면

### 근거가 되는 사용자 스토리

- 3.1 회원가입: 나는 개인 사용자로서 내 Todo를 안전하게 관리하기 위해 회원가입을 원한다.

### ASCII 레이아웃 스케치

```text
┌────────────────────────────────────────┐
│                dodoTodoList            │
│                                        │
│  Email                                 │
│  ┌──────────────────────────────────┐  │
│  │ user@example.com                 │  │
│  └──────────────────────────────────┘  │
│                                        │
│  Password                              │
│  ┌──────────────────────────────────┐  │
│  │ at least 8 characters            │  │
│  └──────────────────────────────────┘  │
│  Password must be at least 8 chars.    │
│                                        │
│  ┌──────────────────────────────────┐  │
│  │          Create account          │  │
│  └──────────────────────────────────┘  │
│                                        │
│  This email is already registered.     │
│                                        │
│  Already have an account? Log in       │
└────────────────────────────────────────┘
```

### 호출하는 API 엔드포인트

- `POST /auth/signup`
  - requestBody: `{ email, password }`
  - success: `201`, `user`
  - error: `400 VALIDATION_ERROR`, `409 EMAIL_ALREADY_EXISTS`, `500 INTERNAL_SERVER_ERROR`

### 컴포넌트 트리

```text
SignupPage
  AuthLayout
    AppBrand
    SignupForm
      EmailField
      PasswordField
      PasswordRequirementHint
      SubmitButton
      FormErrorMessage
      FormSuccessMessage
    AuthSwitchLink
```

### 사용자 인터랙션 흐름

1. 사용자가 이메일과 비밀번호를 입력한다.
2. 클라이언트에서 이메일 형식과 8자 이상 비밀번호를 검증한다.
3. 검증 성공 시 `POST /auth/signup`을 호출한다.
4. 성공하면 로그인 화면으로 이동하고 "Account created. Log in with your new account." 메시지를 보여준다.
5. 이미 가입된 이메일이면 `409` 응답 메시지를 폼 하단에 표시한다.
6. 이메일은 백엔드 정책과 맞게 소문자 정규화 대상임을 전제로 한다.

### 반응형 레이아웃 변화

- 모바일 360px-639px: 로그인 화면과 동일하게 단일 컬럼 전체 너비 폼으로 구성한다.
- 태블릿 640px-1023px: 최대 너비 400px 안에서 중앙 정렬한다.
- 데스크톱 1024px 이상: 폼 폭은 고정하고 여백만 넓어진다. 입력 필드, 안내문, 에러 메시지가 겹치지 않도록 수직 간격을 유지한다.

## 4. Todo 메인 화면

### 근거가 되는 사용자 스토리

- 3.3 할 일 추가: 나는 개인 사용자로서 해야 할 일을 기록하기 위해 할 일 추가를 원한다.
- 3.4 완료 체크: 나는 개인 사용자로서 작업 진행 상태를 관리하기 위해 완료 체크를 원한다.
- 3.5 할 일 삭제: 나는 개인 사용자로서 불필요한 항목을 정리하기 위해 할 일 삭제를 원한다.
- 3.6 전체 목록 조회: 나는 개인 사용자로서 내 작업을 한눈에 확인하기 위해 전체 목록 조회를 원한다.
- 핵심 기능 목록: 로그아웃.

### ASCII 레이아웃 스케치

```text
┌──────────────────────────────────────────────────────────────────┐
│ dodoTodoList                         user@example.com  [Log out] │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│ Add a todo                                                       │
│ ┌──────────────────────────────────────────────┐ ┌─────────────┐ │
│ │ Write a new todo...                          │ │ Add         │ │
│ └──────────────────────────────────────────────┘ └─────────────┘ │
│ Todo content must not be empty.                                  │
│                                                                  │
│ All todos     5 total / 2 completed                              │
│ Show: [All v]                         Sort: [Newest first v]     │
│                                                                  │
│ ┌──────────────────────────────────────────────────────────────┐ │
│ │ [ ] Write PRD                                      [Delete]  │ │
│ │     Created Jun 22, 2026                                    │ │
│ └──────────────────────────────────────────────────────────────┘ │
│ ┌──────────────────────────────────────────────────────────────┐ │
│ │ [x] Review ERD                                    [Delete]  │ │
│ │     Created Jun 22, 2026 · Completed                        │ │
│ └──────────────────────────────────────────────────────────────┘ │
│ ┌──────────────────────────────────────────────────────────────┐ │
│ │ [ ] Implement API                                 [Delete]  │ │
│ └──────────────────────────────────────────────────────────────┘ │
│                                                                  │
│ Empty state: No todos yet. Add your first todo above.            │
└──────────────────────────────────────────────────────────────────┘
```

### 호출하는 API 엔드포인트

- `GET /todos?sort=createdAtDesc`
  - 화면 진입 시 Todo 목록 조회
  - 선택 필터 사용 시 `completed=true` 또는 `completed=false`
- `POST /todos`
  - requestBody: `{ content }`
  - 새 Todo 생성, 기본 `isCompleted: false`
- `PATCH /todos/{todoId}`
  - requestBody: `{ isCompleted }`
  - 완료 또는 미완료 상태 변경
- `DELETE /todos/{todoId}`
  - Todo 삭제
- `POST /auth/logout`
  - JWT 기반 로그아웃 흐름 종료
  - 서버 세션 폐기가 아니라 클라이언트 토큰 제거가 핵심 동작

### 컴포넌트 트리

```text
TodoPage
  ProtectedRoute
    AppShell
      TopBar
        AppTitle
        UserEmail
        LogoutButton
      TodoMain
        TodoComposer
          TodoInput
          AddTodoButton
          InlineValidationMessage
        TodoToolbar
          TodoCountSummary
          FilterSelect
          SortSelect
        TodoListRegion
          LoadingState
          EmptyState
          TodoList
            TodoItem
              CompletionCheckbox
              TodoContent
              TodoMeta
              DeleteButton
              ItemErrorMessage
        GlobalErrorBanner
```

### 사용자 인터랙션 흐름

1. 화면 진입 시 저장된 JWT가 없으면 로그인 화면으로 이동한다.
2. JWT가 있으면 `GET /todos?sort=createdAtDesc`를 호출한다.
3. 목록 로딩 중에는 로딩 상태를 표시한다.
4. 목록이 비어 있으면 Empty State를 표시한다.
5. 사용자가 Todo 내용을 입력하고 `Add`를 누른다.
6. 입력값을 trim한 결과가 비어 있으면 API를 호출하지 않고 인라인 에러를 표시한다.
7. 유효한 입력이면 `POST /todos`를 호출한다.
8. 생성 성공 시 입력 필드를 비우고 반환된 Todo를 목록에 추가한다.
9. 사용자가 체크박스를 누르면 현재 값의 반대로 `PATCH /todos/{todoId}`를 호출한다.
10. 완료 변경 성공 시 체크박스 상태, 완료 표시, `updatedAt` 기반 메타 정보를 갱신한다.
11. 사용자가 삭제 버튼을 누르면 `DELETE /todos/{todoId}`를 호출한다.
12. 삭제 성공 시 해당 Todo를 목록에서 제거한다.
13. 삭제 실패 시 기존 Todo 목록 상태를 유지하고 에러를 표시한다.
14. 사용자가 로그아웃을 누르면 `POST /auth/logout`을 호출한 뒤 저장된 JWT와 사용자 정보를 제거하고 로그인 화면으로 이동한다.
15. 어떤 Todo API에서든 `401 TOKEN_EXPIRED` 또는 `UNAUTHORIZED`가 오면 토큰을 제거하고 로그인 화면으로 이동한다.

### 반응형 레이아웃 변화

- 모바일 360px-639px:
  - TopBar는 앱 이름과 로그아웃 버튼을 첫 줄에 두고, 사용자 이메일은 둘째 줄로 내려도 된다.
  - Todo 입력 필드와 Add 버튼은 세로로 쌓는다.
  - 필터와 정렬 컨트롤은 세로 스택 또는 2열 균등 배치로 둔다.
  - TodoItem은 체크박스와 내용이 한 줄을 이루고, 삭제 버튼은 오른쪽 끝 또는 다음 줄에 배치한다.
  - 긴 Todo 내용은 줄바꿈하며 화면 밖으로 넘치지 않아야 한다.
- 640px-767px:
  - Todo 입력 필드와 Add 버튼을 한 줄로 전환할 수 있다.
  - Todo 목록은 단일 컬럼을 유지한다.
  - 인증 화면과 동일하게 주요 콘텐츠 폭을 제한한다.
- 768px-1023px:
  - 본문 최대 너비를 약 640px-760px로 제한하고 중앙 정렬한다.
  - 요약 정보, 필터, 정렬을 같은 줄에 배치할 수 있다.
  - TodoItem은 `checkbox | content/meta | delete` 구조로 안정적인 가로 정렬을 사용한다.
- 1024px 이상:
  - 본문 최대 너비를 약 720px-880px로 제한한다.
  - 입력 영역, 요약/툴바, 목록 간 간격을 넉넉히 둔다.
  - 목록 행의 체크박스, 텍스트, 삭제 버튼 위치를 고정해 반복 사용 시 스캔이 쉽도록 한다.

## 5. 인증 가드 및 세션 만료 상태

### 근거가 되는 사용자 스토리

- 3.2 로그인: 로그인 성공 시 JWT로 인증 상태가 유지된다.
- 3.6 전체 목록 조회: 로그인하지 않은 사용자는 Todo 목록에 접근할 수 없다.
- 보안 요구사항: 만료되었거나 위조된 토큰은 거부해야 한다.

### ASCII 레이아웃 스케치

```text
사용자가 /todos 접근
        │
        ├─ JWT 있음 ───────────────> Todo 메인 화면
        │
        └─ JWT 없음 또는 만료됨 ───> 로그인 화면
                                   ┌──────────────────────────────┐
                                   │ Your session has expired.    │
                                   │ Please log in again.         │
                                   └──────────────────────────────┘
```

### 호출하는 API 엔드포인트

- 별도 확인용 API는 두지 않는다.
- 보호 화면 진입 시 `GET /todos` 호출 결과가 `401`이면 토큰을 제거하고 로그인 화면으로 이동한다.

### 컴포넌트 트리

```text
AuthProvider
  ProtectedRoute
    TodoPage
  PublicOnlyRoute
    LoginPage
    SignupPage
  SessionExpiredNotice
```

### 사용자 인터랙션 흐름

1. 앱 시작 시 로컬 저장소 또는 메모리 상태에서 JWT를 확인한다.
2. JWT가 없으면 보호 라우트 접근 시 로그인 화면으로 이동한다.
3. JWT가 있으면 보호 화면을 렌더링하고 필요한 API를 호출한다.
4. API가 `401 TOKEN_EXPIRED` 또는 `UNAUTHORIZED`를 반환하면 JWT를 제거한다.
5. 로그인 화면으로 이동하며 세션 만료 메시지를 표시한다.

### 반응형 레이아웃 변화

- 세션 만료 메시지는 로그인 화면의 폼 상단 또는 하단에 표시한다.
- 모바일에서는 한 줄이 길어지지 않도록 메시지를 줄바꿈한다.
- 데스크톱에서는 인증 패널 내부의 고정 폭 메시지 영역을 사용한다.

## 6. 전역 상태 및 오류 표시 규칙

### API 오류 형식

`api-spec.yaml`의 모든 에러는 다음 형식을 사용한다.

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Todo content must not be empty."
  }
}
```

### 화면별 오류 표시

- 폼 입력 오류: 해당 폼 내부의 `FormErrorMessage` 또는 `InlineValidationMessage`에 표시한다.
- Todo 항목 단위 오류: 해당 `TodoItem`의 `ItemErrorMessage`에 표시한다.
- 목록 조회 실패 또는 알 수 없는 서버 오류: `GlobalErrorBanner`에 표시한다.
- 인증 오류: 토큰을 제거하고 로그인 화면으로 이동한다.

## 7. 접근성 및 키보드 동작

- 모든 입력 필드는 시각적 label 또는 접근 가능한 이름을 가진다.
- `Enter` 키로 로그인, 회원가입, Todo 추가를 제출할 수 있다.
- Todo 완료 체크박스는 키보드로 포커스 및 토글 가능해야 한다.
- 삭제 버튼은 `Delete todo: {content}` 형태의 접근 가능한 이름을 가진다.
- 완료 상태는 체크박스 상태와 텍스트 스타일을 함께 사용하며, 색상만으로 전달하지 않는다.
- 에러 메시지는 관련 입력 필드와 연결할 수 있도록 구현한다.
