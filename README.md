# noticeboard-front

커뮤니티 게시판 프론트엔드. React + TypeScript + Vite 기반으로 Spring Boot 백엔드와 연동한다.

## Tech Stack

- React 18 + TypeScript 5.5
- Vite 5
- Tailwind CSS 3.4
- Framer Motion
- lucide-react

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

## 주요 기능

- 로그인 / 회원가입
- 게시글 목록 조회, 작성, 수정, 삭제
- 게시글 좋아요
- 댓글 작성, 수정, 삭제, 대댓글
- S3 이미지 업로드
- 실시간 알림 (SSE)

## 권한 처리

- 게시글 수정/삭제: 작성자 본인(`post.email === currentUserEmail`)만 버튼 노출
- 댓글 수정/삭제: 작성자 본인(`comment.email === currentUserEmail`)만 메뉴 노출

## Scripts

```bash
npm run dev       # 개발 서버
npm run build     # 프로덕션 빌드
npm run preview   # 빌드 미리보기
npm run lint      # ESLint
```
