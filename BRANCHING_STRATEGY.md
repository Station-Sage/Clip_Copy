# Branching Strategy — CodeBreeze

## 🎯 브랜치 전략 개요

CodeBreeze는 **Git Flow 변형** 전략을 사용하여 CI/CD 오버헤드를 최소화하고 안정적인 릴리스를 보장합니다.

```
main (protected)
  ├── dev (통합 & 테스트)
  │     ├── claude/** (AI 작업 브랜치)
  │     ├── feature/** (수동 기능 개발)
  │     └── fix/** (버그 수정)
  └── release/** (릴리스 준비, 선택사항)
```

---

## 📌 브랜치 설명

### `main` — Production Branch
- **목적**: 프로덕션 릴리스만 포함 (안정적인 버전)
- **규칙**:
  - 직접 커밋 **금지** (PR only)
  - `develop` 또는 `release/**`에서만 머지 가능
  - 머지 시 자동으로 GitHub Release 생성 (태그 기반)
- **CI**: Release 워크플로우만 실행 (VSIX 빌드 + 배포)

### `dev` — Integration Branch
- **목적**: 모든 개발 작업이 통합되는 메인 개발 브랜치
- **규칙**:
  - 기능 브랜치(`claude/**`, `feature/**`, `fix/**`)에서 PR로 머지
  - 여기서 통합 테스트 및 CI 전체 검증
  - 안정화되면 `main`으로 릴리스
- **CI**: 전체 CI (컴파일, 테스트, 린트, 패키징, **아티팩트 업로드**)
- **아티팩트**: VSIX 파일 자동 생성 및 다운로드 가능 (30일 보관)

### `claude/**` — Claude Code AI Branches
- **목적**: Claude Code AI가 자동 생성하는 작업 브랜치
- **네이밍**: `claude/feature-name-{random-id}` (예: `claude/implement-collect-flow-GYaFa`)
- **규칙**:
  - Claude는 `dev`를 base로 새 브랜치 생성
  - 작업 완료 후 `dev`로 PR 생성
  - PR 승인 후 머지, 브랜치 삭제
- **CI**: 경량 CI (컴파일 + 기본 린트만 실행)

### `feature/**` — Manual Feature Branches
- **목적**: 수동으로 개발하는 새 기능
- **네이밍**: `feature/feature-name` (예: `feature/add-remote-api`)
- **규칙**:
  - `dev`에서 분기, 작업 완료 후 `dev`로 PR
  - PR 머지 전 squash 권장 (커밋 정리)
- **CI**: PR 생성 시 전체 CI 실행

### `fix/**` — Bugfix Branches
- **목적**: 버그 수정 (긴급 수정 포함)
- **네이밍**: `fix/bug-description` (예: `fix/clipboard-crash`)
- **규칙**:
  - 일반 버그: `dev`에서 분기 → `dev`로 PR
  - 긴급 수정(hotfix): `main`에서 분기 → `main` + `dev` 양쪽 머지
- **CI**: PR 생성 시 전체 CI 실행

### `release/**` — Release Preparation Branches (선택사항)
- **목적**: 릴리스 준비 및 최종 검증 (큰 버전 업데이트 시)
- **네이밍**: `release/v1.2.0` (버전 번호 명시)
- **규칙**:
  - `dev`에서 분기
  - 버전 업데이트(`package.json`), 문서 정리, 최종 테스트
  - 완료 후 `main` + `dev` 양쪽에 머지
  - `main` 머지 시 자동으로 GitHub Release 생성
- **CI**: 전체 CI + Release 워크플로우
- **언제 사용?**:
  - **작은 버전 업데이트**: `dev`에서 직접 `main`으로 머지 (release 브랜치 생략 가능)
  - **큰 버전 업데이트**: 여러 기능 통합 후 최종 검증 필요 시 사용
  - **예**: v0.1.0 → v0.2.0 (여러 기능), v1.0.0 릴리스 (메이저 업데이트)

---

## 🔄 워크플로우 예시

### 1. Claude Code AI 작업 플로우
```bash
# Claude가 자동 수행:
# 1. dev에서 claude/new-feature-XXX 브랜치 생성
# 2. 코드 작성 및 커밋
# 3. dev로 PR 생성

# 사용자가 수행:
# 1. PR 리뷰 및 승인
# 2. "Squash and merge" 클릭 (커밋 정리)
# 3. 브랜치 자동 삭제
```

### 2. 수동 기능 개발 플로우
```bash
# dev에서 새 브랜치 생성
git checkout dev
git pull origin dev
git checkout -b feature/my-new-feature

# 작업 및 자주 커밋 (로컬에만)
git commit -m "wip: 작업 중..."
git commit -m "wip: 거의 완료..."

# push 전 커밋 정리 (선택사항)
git rebase -i HEAD~3  # 최근 3개 커밋 squash

# push 및 PR 생성
git push origin feature/my-new-feature
# GitHub에서 PR 생성 (dev <- feature/my-new-feature)

# PR 머지 (Squash and merge 권장)
```

### 3. 릴리스 플로우 (선택사항: 큰 버전 업데이트 시)
```bash
# dev에서 release 브랜치 생성
git checkout dev
git pull origin dev
git checkout -b release/v0.2.0

# 버전 업데이트
# - package.json의 version 수정
# - CHANGELOG.md 업데이트
git commit -m "chore: bump version to v0.2.0"

# 최종 테스트 및 수정
# (버그 발견 시 수정 커밋)

# main과 dev에 머지
git checkout main
git merge --no-ff release/v0.2.0
git tag v0.2.0
git push origin main --tags

git checkout dev
git merge --no-ff release/v0.2.0
git push origin dev

# release 브랜치 삭제
git branch -d release/v0.2.0
```

### 4. 간단한 릴리스 플로우 (release 브랜치 생략)
```bash
# dev가 안정적이면 바로 main으로 머지
git checkout dev
git pull origin dev

# package.json 버전 업데이트
git commit -m "chore: bump version to v0.1.1"
git push origin dev

# main에 머지 및 태그
git checkout main
git merge --no-ff dev
git tag v0.1.1
git push origin main --tags

# dev 동기화
git checkout dev
git merge main
git push origin dev
```

### 5. 긴급 수정 플로우 (Hotfix)
```bash
# main에서 hotfix 브랜치 생성
git checkout main
git pull origin main
git checkout -b fix/critical-bug

# 버그 수정 및 커밋
git commit -m "fix: resolve critical clipboard crash"

# main과 dev 양쪽에 머지
git checkout main
git merge --no-ff fix/critical-bug
git push origin main

git checkout dev
git merge --no-ff fix/critical-bug
git push origin dev

# hotfix 브랜치 삭제
git branch -d fix/critical-bug
```

---

## 🚀 CI/CD 동작 방식

### CI 워크플로우 분리

| 브랜치 패턴 | 워크플로우 | 실행 내용 |
|------------|-----------|----------|
| `claude/**` push | `ci-claude.yml` | 컴파일 + 기본 린트 (빠름) |
| `dev` push/PR | `ci-dev.yml` | 컴파일 + 테스트 + 린트 + 패키징 + **VSIX 다운로드** |
| `main` push (태그) | `release.yml` | VSIX 빌드 + GitHub Release 생성 |

### CI 실행 빈도 최소화
- `claude/**` 브랜치: push마다 경량 CI (1-2분)
- `dev` 브랜치: PR 머지 시에만 전체 CI (3-5분)
- `main` 브랜치: 릴리스 시에만 (태그 기반)

### VSIX 다운로드
- **`dev` 브랜치**: Actions 탭 → 최신 워크플로우 → Artifacts에서 VSIX 다운로드 가능
- **`main` 브랜치**: Releases 페이지에서 공식 릴리스 VSIX 다운로드

---

## 📋 커밋 메시지 규칙

**Conventional Commits** 형식 사용:
```
<type>(<scope>): <subject>

<body>

<footer>
```

**Type 종류:**
- `feat`: 새 기능
- `fix`: 버그 수정
- `docs`: 문서 변경
- `style`: 포맷, 세미콜론 등 (코드 변경 없음)
- `refactor`: 리팩토링
- `test`: 테스트 추가/수정
- `chore`: 빌드, 패키지 매니저 설정 등

**예시:**
```bash
git commit -m "feat(collect): add GitHub API integration for remote CI logs"
git commit -m "fix(apply): resolve null pointer in patch parser"
git commit -m "docs: update branching strategy guide"
```

---

## 🛡️ 브랜치 보호 규칙 (권장)

GitHub 저장소 Settings → Branches에서 설정:

### `main` 브랜치
- ✅ Require pull request before merging
- ✅ Require status checks to pass (CI 성공 필수)
- ✅ Require branches to be up to date
- ✅ Do not allow bypassing the above settings

### `dev` 브랜치
- ✅ Require pull request before merging
- ✅ Require status checks to pass
- ⚠️ Allow force pushes (rebase 허용, 선택사항)

---

## 💡 팁 & 베스트 프랙티스

### 1. 로컬 커밋은 자유롭게, Push는 신중하게
```bash
# 로컬에서 자주 커밋 (백업 용도)
git commit -m "wip: work in progress"

# push 전에 커밋 정리 (squash)
git rebase -i HEAD~5
# 또는
git reset --soft HEAD~5
git commit -m "feat: implement complete feature X"
```

### 2. PR 머지 시 "Squash and merge" 사용
- 여러 WIP 커밋을 하나의 깔끔한 커밋으로 정리
- `develop`/`main` 브랜치 히스토리 깔끔하게 유지

### 3. Claude 작업 시 주의사항
- Claude는 `dev` base로 작업
- PR 생성 시 제목/설명 명확히 작성
- 머지 전 코드 리뷰 필수 (AI도 실수 가능)

### 4. CI 실패 시 대처
```bash
# 로컬에서 CI와 동일한 검증 실행
npm run compile  # TypeScript 컴파일
npm test         # 단위 테스트
npm run lint     # ESLint 검사
npx vsce package # VSIX 패키징 테스트
```

### 5. 브랜치 정리
```bash
# 머지된 로컬 브랜치 정리
git branch --merged dev | grep -v "\*\|main\|dev" | xargs -n 1 git branch -d

# 원격에서 삭제된 브랜치 로컬 동기화
git fetch --prune
```

---

## 📞 문제 발생 시

- **CI가 너무 자주 실행됨**: `claude/**` 브랜치에서 작업 중인지 확인
- **머지 충돌**: `dev` 최신 변경사항 먼저 rebase
- **Release가 자동 생성 안 됨**: `main` 브랜치에 태그(`v*.*.*`) 확인
- **VSIX 다운로드**: Actions 탭 → Artifacts 섹션 (dev), Releases 페이지 (main)

---

**마지막 업데이트**: 2026-03-15
