# 버그 감사 결과 — Phase 1~11 전체 점검

**일시**: 2026-03-18
**범위**: 전체 소스 파일 직접 확인 (src/, browser-extension/)
**심각도 기준**: Critical(즉시 수정) / High(수정 권장) / Medium(개선) / Low(참고)

---

## 식별된 버그 요약

| ID | 심각도 | Phase | 파일 | 문제 |
|-----|--------|-------|------|------|
| B-014 | Critical | 11 | inlineCompletionProvider.ts | requestViaBridge() dead code — 즉시 null 반환 |
| B-015 | High | 9 | agentLoop.ts | stopAgentLoop() pending Promise 미해제 |
| B-016 | High | 11 | backgroundAgent.ts | OutputChannel 매회 생성 누수 |
| B-017 | High | 1 | patchApplier.ts | path traversal 미검증 |
| B-018 | High | 3 | mcpServer.ts | symlink으로 path 검증 우회 |
| B-019 | High | 1 | exec.ts | spawnAsync timeout 미존재 |
| B-020 | High | 1 | safetyGuard.ts | stash 경합 조건 |
| B-021 | Medium | 4 | wsBridgeServer.ts | scheduleRetry 이중 setTimeout |
| B-022 | Medium | 2 | gitCollector.ts | gitLogCount 범위 미제한 |
| B-023 | Medium | 10 | lspReferences.ts | Promise.all 전체 실패 |
| B-024 | Low | 9 | statusBarItem.ts | flashStatusBar 경합 |
| B-025 | Medium | 3 | mcpServer.ts | CORS wildcard |
| B-026 | Low | 7 | content.js | MutationObserver timer 미정리 |
| B-027 | Medium | 2 | githubLogCollector.ts | HTTP 상태 코드 미처리 |
| B-028 | Medium | 5 | chatPanel.ts | clipboardWatcher async 중첩 |
| B-029 | Low | 5 | gitEventMonitor.ts | activate() 미대기 |

**총 16건**: Critical 1, High 6, Medium 6, Low 3

---

## False Positive 제외 목록

| 보고 내용 | 판단 | 사유 |
|-----------|------|------|
| diffPreview lineNo 계산 오류 | FP | original 기준 lineNo이므로 removed+context만 증가시키는 것이 정확 |
| agentLoop timeout race condition | FP | resolveResponse=null 후 timeout이 if 체크하므로 안전 |
| fileMatcher path traversal | FP | `vscode.Uri.joinPath` + `vscode.workspace.findFiles`가 workspace 범위 제한 |
| gitCollector command injection | FP | VS Code 설정이 number 타입 강제 → 문자열 주입 불가 |
| errorCollector Array out of bounds | FP | `Math.max(0, ...)` 로 방어되어 있음 |
| config.ts JSON parse 무시 | 설계의도 | 로컬 설정 파일 파싱 실패 시 기본값 사용이 의도된 동작 |

---

## 수정 우선순위

### 1차 (Critical + High 보안)
B-014, B-017, B-018, B-019

### 2차 (High 안정성)
B-015, B-016, B-019, B-020

### 3차 (Medium)
B-021 ~ B-028

### 4차 (Low — 선택적)
B-024, B-026, B-029
