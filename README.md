# noticeboard-frontend

커뮤니티 게시판 프론트엔드. React + TypeScript + Vite 기반으로 Spring Boot 백엔드와 REST API로 통신한다.

## Tech Stack

| 분류 | 기술 |
|---|---|
| Framework | React 18 + TypeScript 5.5 |
| Build | Vite 5 |
| Styling | Tailwind CSS 3.4 |
| Animation | Framer Motion |
| Icons | lucide-react |
| Markdown | react-markdown |
| Font | Inter (Google Fonts) |

## Getting Started

```bash
npm install
npm run dev
```

## 환경 변수

프로젝트 루트에 `.env` 파일을 생성한다.

```env
VITE_API_URL=http://localhost:8080
```

## Scripts

```bash
npm run dev       # 개발 서버 실행
npm run build     # 프로덕션 빌드
npm run preview   # 빌드 결과 미리보기
npm run lint      # ESLint 실행
```

## Project Structure

```
src/
├── components/
│   ├── AuthCard.tsx            # 로그인/회원가입
│   ├── BoardList.tsx           # 게시글 목록 (그리드)
│   ├── CreatePost.tsx          # 게시글 작성/수정 폼 (isEditMode prop으로 분기)
│   ├── LikeButton.tsx          # 좋아요 버튼 (애니메이션)
│   ├── Navigation.tsx          # 상단 네비게이션 (알림 벨 포함)
│   ├── NotificationPanel.tsx   # 우측 슬라이드 알림 패널
│   ├── PostDetail.tsx          # 게시글 상세 + 댓글 (수정/삭제/답글)
│   └── Toast.tsx               # 토스트 알림
├── lib/
│   ├── api.ts                  # 백엔드 REST API 연동 (fetch + JWT 인증)
│   └── mockData.ts             # 구버전 Mock 데이터 (미사용)
├── App.tsx                     # 루트 컴포넌트 (상태 관리, 화면 전환)
├── index.tsx                   # React DOM 엔트리포인트
└── index.css                   # 글로벌 스타일 & Tailwind imports
```

## Architecture

- **라우팅:** React Router 미사용. `App.tsx`의 `currentScreen` state로 화면 전환 (`auth` | `board` | `post` | `newPost` | `editPost`)
- **상태 관리:** App 컴포넌트에서 `useState`로 관리, props/callback으로 하위 전달 (Redux/Context 미사용)
- **세션 복원:** `sessionStorage`에 현재 화면/게시글 ID 저장, 새로고침 시 자동 복원
- **API:** `src/lib/api.ts`의 `fetchWithAuth` 공통 함수로 JWT Bearer 토큰 인증
- **토큰 관리:** `localStorage`에 `accessToken`, `refreshToken`, `userEmail` 저장. 401 응답 시 자동 토큰 갱신(refresh) 후 재요청
- **실시간 알림:** SSE(`notificationApi.subscribe`)로 백엔드 구독, 신규 알림 수신 시 state 업데이트

## 주요 기능

- 로그인 / 회원가입 (JWT + Refresh Token)
- 게시글 목록 조회, 작성, 수정, 삭제
- 게시글 좋아요 / 취소
- 댓글 작성, 수정, 삭제, 대댓글 (재귀 구조)
- S3 이미지 업로드
- 실시간 알림 (SSE) + 전체 읽음 처리
- 토스트 알림

## 권한 기반 UI

- **게시글 수정/삭제:** 작성자 본인(`post.email === currentUserEmail`)만 버튼 노출
- **댓글 메뉴:**
  - 본인 댓글: 수정, 삭제, 답글 달기
  - 타인 댓글: 답글 달기만 표시

## API Endpoints

| 모듈 | 설명 |
|---|---|
| `authApi` | 로그인, 회원가입, 로그아웃, 토큰 갱신 |
| `postApi` | 게시글 CRUD, 페이지네이션 |
| `commentApi` | 댓글 CRUD (대댓글 parentId 지원) |
| `likeApi` | 좋아요 / 취소 |
| `notificationApi` | 알림 목록, 전체 읽음, 읽지 않은 수 조회, SSE 구독 |
| `imageApi` | S3 이미지 업로드 |

## 배포

GitHub Actions를 통해 `main` 브랜치 push 시 자동 배포된다.

1. `npm ci` → `npm run build`
2. S3(`noticeboard-front` 버킷)에 빌드 결과 업로드
3. CloudFront 캐시 무효화