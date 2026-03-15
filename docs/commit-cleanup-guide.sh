#!/bin/bash
# 커밋 정리 가이드 스크립트
# 사용법: ./docs/commit-cleanup-guide.sh

echo "📋 CodeBreeze 커밋 정리 가이드"
echo "================================"
echo ""

echo "현재 브랜치:"
git branch --show-current
echo ""

echo "최근 10개 커밋:"
git log --oneline -10
echo ""

echo "📝 커밋 정리 방법:"
echo ""
echo "1. 대화형 rebase로 커밋 정리 (권장):"
echo "   git rebase -i HEAD~5"
echo "   (최근 5개 커밋을 하나로 합치기)"
echo ""
echo "2. 비대화형 squash (빠른 방법):"
echo "   git reset --soft HEAD~5"
echo "   git commit -m 'chore: squash commits - <작업 요약>'"
echo ""
echo "3. 특정 커밋부터 정리:"
echo "   git rebase -i <commit-hash>"
echo "   (해당 커밋 이후 모든 커밋 정리)"
echo ""

echo "⚠️ 주의사항:"
echo "- 이미 push한 커밋을 정리하면 force push 필요: git push -f origin <branch>"
echo "- main 브랜치는 절대 force push 금지!"
echo "- 작업 브랜치(claude/**, feature/**)에서만 사용"
echo ""

echo "💡 현재 상황 분석:"
COMMIT_COUNT=$(git rev-list --count HEAD ^origin/main 2>/dev/null || echo "0")
echo "main 이후 커밋 수: $COMMIT_COUNT"
echo ""

if [ "$COMMIT_COUNT" -gt "3" ]; then
    echo "✅ 커밋이 많습니다. 정리를 권장합니다."
    echo "   추천 명령: git reset --soft HEAD~$COMMIT_COUNT && git commit"
else
    echo "✅ 커밋 수가 적절합니다."
fi
