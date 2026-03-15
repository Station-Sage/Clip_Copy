# Branching Strategy (Summary for AI Agents)

## ⚠️ Critical Rules

### Base Branch
- **ALWAYS** create branches from `dev` (NOT `main`)
- `main` is production-only, protected

### Branch Naming
- Claude Code AI: `claude/**` (auto-generated)
- Manual features: `feature/**`
- Bug fixes: `fix/**`

### Pull Request Target
- **ALWAYS** create PR to `dev` (NOT `main`)
- Squash commits before PR (clean up WIP commits)

### Workflow
```
dev (your base)
  ├── claude/** (your work branches)
  │     └── PR → dev
  └── feature/** (manual work)
        └── PR → dev

main (release only, DO NOT touch)
```

### CI Behavior
- `claude/**` push: Lightweight CI (~2 min) - compile + lint only
- `dev` push/PR: Full CI (~5 min) - compile + test + lint + VSIX package
- `main` push: Release workflow (tags only)

### Commit Strategy
- Local: Commit frequently (backup)
- Before push: Squash WIP commits into meaningful commits
- Use conventional commits: `feat:`, `fix:`, `docs:`, `refactor:`, `test:`, `chore:`

### Example Workflow
```bash
# 1. Create branch from dev
git checkout dev
git pull origin dev
git checkout -b claude/my-feature-XYZ

# 2. Work and commit
git commit -m "feat: implement X"

# 3. Push to trigger lightweight CI
git push origin claude/my-feature-XYZ

# 4. Create PR to dev (not main!)
# 5. Squash and merge after review
```

---

**Full details**: See `/BRANCHING_STRATEGY.md` (human-readable)
