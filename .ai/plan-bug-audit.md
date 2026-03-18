# 버그 감사 계획 — Phase 1~11 전체 점검

전체 소스 분석 결과, 아래 버그들이 식별되었습니다.
**심각도 기준**: Critical(즉시 수정) / High(수정 권장) / Medium(개선) / Low(참고)

---

## 단계 1: Critical 버그 수정

### B-014: inlineCompletionProvider.ts requestViaBridge() 즉시 null 반환
- **파일**: `src/providers/inlineCompletionProvider.ts:116-129`
- **증상**: `requestViaBridge()`가 Promise 내에서 `checkInterval`/`timeout`을 설정한 직후 즉시 clear하고 `resolve(null)` 호출 → 항상 null 반환, bridge 응답 대기 불가
- **수정**: 현재 bridge 기반 completion은 pull 방식으로 작동 불가 (AI 응답 타이밍 비동기). `requestViaBridge()`를 정리하여 context만 전송하고 즉시 null 반환하되, 불필요한 dead code(interval, timeout, require) 제거
- **심각도**: Critical (dead code + 혼동)

### B-015: diffPreview.ts lineNo 계산 오류
- **파일**: `src/apply/diffPreview.ts:29-37`
- **증상**: `added` 라인에 `lineNo`를 증가시키지 않고, `removed` 라인에 증가시킴 → 원본 파일 기준 라인 번호는 맞지만, 최종 파일 라인 번호가 틀림
- **분석**: 실제로 이 코드는 `original` 파일 기준으로 lineNo를 매기는 것이므로, `removed`와 `context`에서만 증가시키는 현재 로직은 **정확함**. added는 원본에 없으므로 lineNo 없음이 맞음.
- **심각도**: ~~High~~ → **False Positive** (코드 정상)

### B-016: agentLoop.ts waitForAIResponse timeout race condition
- **파일**: `src/bridge/agentLoop.ts:64-73`
- **증상**: timeout 콜백이 `state.resolveResponse` null 여부를 확인하지만, response 도착과 timeout 사이에 미세한 race 존재. 그러나 실제로는 response 처리(line 58-59)에서 `resolveResponse = null` 후 timeout이 `if (state.resolveResponse)` 체크하므로 안전.
- **추가 문제**: `stopAgentLoop()`이 `state.resolveResponse = null`로 설정하면 대기 중인 Promise가 영원히 resolve/reject 되지 않음 → 메모리 누수
- **수정**: `stopAgentLoop()`에서 pending promise reject 처리
- **심각도**: High

### B-017: backgroundAgent.ts OutputChannel 누수
- **파일**: `src/bridge/backgroundAgent.ts:169`
- **증상**: `tryTriggerAgentLoop()` 호출마다 새 `OutputChannel` 생성, dispose 안 됨
- **수정**: OutputChannel을 state에 저장하고 재사용
- **심각도**: High

---

## 단계 2: High 버그 수정

### B-018: patchApplier.ts path.join traversal
- **파일**: `src/apply/patchApplier.ts:21`
- **증상**: `targetFile`이 `../` 포함 시 workspace 밖 파일에 patch 적용 가능
- **수정**: `absPath.startsWith(workspaceRoot)` 검증 추가
- **심각도**: High (보안)

### B-019: mcpServer.ts path.join symlink bypass
- **파일**: `src/mcp/mcpServer.ts:59-70`
- **증상**: `path.join` + `startsWith` 검증은 symlink로 우회 가능
- **수정**: `fs.realpathSync()` 사용하여 심링크 해석 후 검증
- **심각도**: High (보안)

### B-020: exec.ts spawnAsync timeout 미존재
- **파일**: `src/utils/exec.ts:14-52`
- **증상**: spawn된 프로세스가 hang 시 Promise가 영원히 resolve 안 됨
- **수정**: timeout 파라미터 추가, 초과 시 `proc.kill()` + resolve
- **심각도**: High

### B-021: safetyGuard.ts stash 경합
- **파일**: `src/apply/safetyGuard.ts:22,45`
- **증상**: `stash@{0}` 사용 시 다른 stash 작업이 사이에 끼면 잘못된 stash pop
- **수정**: stash push 후 `git stash list` 첫 줄에서 message 기반으로 매칭
- **심각도**: High

---

## 단계 3: Medium 버그 수정

### B-022: gitCollector.ts gitLogCount 미검증
- **파일**: `src/collect/gitCollector.ts:52-53, 81`
- **증상**: `config.gitLogCount`가 숫자가 아니거나 음수일 때 비정상 동작
- **참고**: `execSync`이 `cp.execSync`을 shell 경유 실행하나, 설정값은 VS Code 설정에서 number 타입으로 강제됨 → 실질적 command injection 위험은 없음
- **수정**: `Math.min(Math.max(1, count), 100)` 범위 제한
- **심각도**: Medium

### B-023: lspReferences.ts Promise.all 전체 실패
- **파일**: `src/collect/lspReferences.ts:49-62`
- **증상**: 하나의 document open 실패 시 전체 findReferences 실패
- **수정**: `Promise.allSettled()` 사용
- **심각도**: Medium

### B-024: backgroundAgent.ts 중복 startBackgroundAgent 방어 부족
- **파일**: `src/bridge/backgroundAgent.ts:211-227`
- **증상**: `state.enabled` 체크는 있지만, stop 후 start 시 이전 disposable이 context.subscriptions에 남아있을 수 있음
- **수정**: start 시 기존 diagnosticsDisposable dispose 확인
- **심각도**: Medium

### B-025: mcpServer.ts CORS wildcard
- **파일**: `src/mcp/mcpServer.ts:294`
- **증상**: `Access-Control-Allow-Origin: *`로 모든 origin 허용
- **수정**: `127.0.0.1` 바인딩이므로 로컬 전용이긴 하나, localhost origin만 허용하도록 변경
- **심각도**: Medium (보안)

### B-026: content.js MutationObserver debounce timer 미정리
- **파일**: `browser-extension/content.js`
- **증상**: `debounceTimer`가 beforeunload 시 정리되지 않음
- **수정**: beforeunload 리스너 추가
- **심각도**: Medium

---

## 단계 4: 문서화 및 마무리

- BUGS.md에 B-014 ~ B-026 기록
- 컴파일 확인
- 커밋 & 푸시

---

## 수정 순서 요약

| 단계 | 버그 | 심각도 | 파일 |
|------|------|--------|------|
| 1 | B-014 | Critical | inlineCompletionProvider.ts |
| 1 | B-016 | High | agentLoop.ts |
| 1 | B-017 | High | backgroundAgent.ts |
| 2 | B-018 | High | patchApplier.ts |
| 2 | B-019 | High | mcpServer.ts |
| 2 | B-020 | High | exec.ts |
| 2 | B-021 | High | safetyGuard.ts |
| 3 | B-022 | Medium | gitCollector.ts |
| 3 | B-023 | Medium | lspReferences.ts |
| 3 | B-024 | Medium | backgroundAgent.ts |
| 3 | B-025 | Medium | mcpServer.ts |
| 3 | B-026 | Medium | content.js |
| 4 | — | — | BUGS.md, compile, commit |
