# 개발 활동 기록

## 2026-04-29

### 앱 이름 변경: 유리의 벽 → 벽로그
- `frontend/index.html` — 탭 타이틀
- `frontend/src/pages/LoginPage.jsx` — 로그인 화면 하단
- `frontend/src/components/layout/Navbar.jsx` — 상단 헤더
- `frontend/src/components/share/CameraOverlay.jsx` — 파일명, 공유 타이틀
- `frontend/src/components/share/DailyShareButton.jsx` — 파일명, 공유 타이틀
- `frontend/src/components/share/ShareCard.jsx` — 공유 카드 푸터

### Capacitor 설정 (Android 앱 빌드 준비)
- `@capacitor/core`, `@capacitor/cli`, `@capacitor/android`, `@capacitor/camera` 설치
- `capacitor.config.json` 생성 (appId: `com.yuri.climbing`, appName: `벽로그`)
- `android/` 폴더 생성 (Android 네이티브 프로젝트)
- `AndroidManifest.xml`에 카메라 권한 추가
- `package.json`에 스크립트 추가:
  - `npm run sync` — 빌드 후 Android 동기화
  - `npm run android` — sync 후 Android Studio 열기
