# 버그 목록

## B-001: Termux code-server activation 실패
- **발견**: 2026-03-17
- **증상**: 사이드바 "There is no data provider registered", 명령 실행 시 "command not found"
- **원인 1**: `@modelcontextprotocol/sdk` 의존성인 `fast-deep-equal`이 VSIX 번들에 누락 → extension.js 로드 시 크래시 → `activate()` 전체 실패
- **원인 2**: `src/extension.ts`에서 `mcpServer`/`wsBridgeServer`를 static import하여 모듈 로드 실패가 activation 전체를 중단시킴
- **수정**:
  - `src/extension.ts`: `mcpServer`, `wsBridgeServer` static import 제거 → dynamic import로 전환 (명령 실행 시점 로드)
  - `.vscodeignore`: `fast-deep-equal`, `ajv`, `json-schema-traverse` 화이트리스트 추가
  - `src/extension.ts`: commands 배열 중복 항목 제거
- **상태**: 수정 완료 (2026-03-17) — `fix/activation-events` 브랜치

---

# 개선사항

## I-001: code-server 클립보드 폴백
- 브라우저 환경에서 Clipboard API 실패 시 대체 수단 필요
- **상태**: 구현 완료 (2026-03-15)
  - `src/utils/clipboardCompat.ts`: 파일 기반 폴백 (.codebreeze-clipboard.md)
  - `codebreeze.manualPaste`: WebView 수동 붙여넣기 패널 (code-server/태블릿용)

## I-002: 프로젝트 맵 자동 생성
- 현재 스마트 컨텍스트는 에러 위치 기반 코드 수집만 지원
- **상태**: 구현 완료 (2026-03-15)
  - `src/collect/projectMapCollector.ts`: 정규식 기반 심볼 추출 (TS/JS/Py/Kotlin/Go/Rust)
  - 명령: `codebreeze.copyProjectMap`

## I-003: 컨트롤 패널 Receive 측 미리보기
- 코드 블록 적용 전 diff 미리보기 (현재 파일 vs 적용 후) 표시
- **상태**: 구현 완료 (2026-03-15)
  - `src/apply/diffPreview.ts`: diff 패키지 기반 인라인 diff
  - 컨트롤 패널 🔍 버튼으로 토글

## I-004: Marketplace 아이콘 등록
- 발견: 2026-03-15 (낮음, UX)
- resources/icon.png (128x128) 생성 후 package.json에 `"icon": "resources/icon.png"` 재추가 필요
- **상태**: 미구현
