# 향후 확장 로드맵

## Phase 1: 안정화 (현재)
현재 구현된 기능의 안정성 확보.
컴파일 에러 수정, 핵심 흐름 E2E 검증, edge case 처리.

## Phase 2: 스마트 컨텍스트 강화 ✅ 완료 (2026-03-16)
### 프로젝트 맵 생성 ✅
- TS/JS/TSX/JSX/Python/Kotlin/Java/Go/Rust 정규식 기반 심볼 추출 (I-002)
- `codebreeze.copyProjectMap` 커맨드, 200파일 한도, `_` 접두사 심볼 제외
- tree-sitter 미사용 (네이티브 빌드 필요 → VSIX 배포 불가), 정규식으로 95% 정확도

### 에러 추적 연쇄 수집
- 에러 메시지에서 참조되는 파일/줄을 재귀적으로 추적
- 호출 스택 기반 관련 함수 자동 수집
- 최대 깊이 제한 (설정 가능)
- **상태**: 미구현 (향후 errorCollector.ts 확장)

### 청크 분할 개선
- 긴 파일을 함수/클래스 단위로 의미 있게 분할 (현재: 줄 수 기반)
- 각 청크에 컨텍스트 헤더 (파일 경로, 줄 범위, 이전/다음 청크 존재 여부)
- **상태**: 미구현 (향후 fileCopy.ts 확장)

## Phase 3: MCP 서버 모드 ✅ 완료 (2026-03-16)
### 구현 내용
- `src/mcp/mcpServer.ts` — `@modelcontextprotocol/sdk` 공식 라이브러리 기반
- `McpServer` + `StreamableHTTPServerTransport` 사용 (커스텀 JSON-RPC 제거)
- 포트 3700 (`codebreeze.mcpPort` 설정), localhost 전용
- **9개 도구**: `read_file`, `write_file`, `list_files`, `get_errors`, `get_git_diff`, `run_build`, `apply_code`, `get_project_map`, `apply_code_headless`
- `/health` 엔드포인트 (상태 확인용)
- 커맨드: `codebreeze.startMcpServer`, `codebreeze.stopMcpServer`

### 연결 방법
Claude Desktop `~/.claude_desktop_config.json`:
```json
{
  "mcpServers": {
    "codebreeze": {
      "url": "http://localhost:3700/mcp"
    }
  }
}
```

### 남은 작업
- [ ] MCP transport per-request 패턴 (현재 단일 transport, stateless 완전 지원)
- [ ] 인증 토큰 선택적 추가

## Phase 4: WebSocket 브릿지 ✅ 완료 (2026-03-16)
### 구현 내용
- `src/bridge/wsBridgeServer.ts` — `ws` 라이브러리 기반 (커스텀 RFC 6455 프레임 파서 제거)
- 포트 3701 (`codebreeze.wsBridgePort` 설정), `noServer` + `handleUpgrade` 패턴
- `broadcastToBrowser()` 함수로 연결된 모든 클라이언트에 브로드캐스트
- 커맨드: `codebreeze.startWsBridge`, `codebreeze.stopWsBridge`

### 남은 작업
- [ ] 브라우저 확장 (Chrome/Firefox Extension) 개발 — AI챗 페이지에서 코드 블록 감지 → WebSocket 전송

## Phase 5: code-server 완전 호환 ✅ 완료 (2026-03-16)
### 구현 내용
- `src/utils/clipboardCompat.ts` — VS Code Clipboard API 실패 시 `.codebreeze-clipboard.md` 파일 기반 폴백 (I-001)
- `showManualPastePanel()` — WebView textarea를 통한 수동 붙여넣기 (`codebreeze.manualPaste` 커맨드)
- `docs/code-server-guide.md` — web, code-server, Termux+code-server 설치/실행 가이드

### 참고
- MCP 서버 모드 완성으로 클립보드 의존도 자체가 감소
- Termux에서 code-server로 VS Code 확장 실행 가능 (상세: docs/code-server-guide.md)

## 설계 원칙 — 확장 방향에 걸쳐 공통
1. 기존 모듈(apply/, collect/, monitor/) 재사용
2. types.ts를 공유 스키마로 유지
3. AI 서비스 비종속
4. 점진적 활성화: 사용자가 필요한 기능만 켜는 방식
