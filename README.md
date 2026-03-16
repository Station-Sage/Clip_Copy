# CodeBreeze

**Automate code transfer between AI chats (Genspark, ChatGPT, Claude, etc.) and VS Code via clipboard.**

CodeBreeze removes the friction of copy-pasting code between AI chat tools and your editor. It works with any AI service — no special integration required.

> **Also works on tablets and browsers** via code-server. See [docs/code-server-guide.md](docs/code-server-guide.md) for setup instructions.

---

## Features

### Apply Code from AI Chat → VS Code

| Action | Shortcut |
|--------|----------|
| Apply code blocks from clipboard | `Ctrl+Shift+A` |
| Open CodeBreeze Control Panel | `Ctrl+Shift+I` |

- Parses markdown code blocks from clipboard (supports ` ```lang:filepath ` format)
- Extracts file paths from block headers or preceding comments
- Multi-block support: QuickPick to select which files to apply
- Unified diff patch detection and application
- **Diff Preview**: See inline `+`/`-` diff before applying (🔍 button in Control Panel)
- Safety: git stash or undo point created before applying

### Copy Context from VS Code → AI Chat

| Action | Shortcut |
|--------|----------|
| Copy current file | `Ctrl+Shift+C` |
| Copy selection | Right-click → "Copy Selection for AI" |
| Copy project map | Command Palette → "Copy Project Map for AI" |

- Current file / selection → markdown code block
- **Project Map**: Auto-generate symbol index for 8 languages (TS/JS/Py/Kotlin/Java/Go/Rust/TSX)
- Git diff / log → formatted output
- VS Code Problems panel errors with code context (±15 lines)
- Run local build/test and copy output
- Smart context: auto-collect current file + errors + recent git changes

### CodeBreeze Control Panel (`Ctrl+Shift+I`)

A split panel with:
- **Left (Send)**: Buttons to copy file, selection, errors, git diff, run build/test, copy project map
- **Right (Receive)**: Clipboard code blocks listed with file names, **🔍 Preview** (inline diff) & Apply buttons
- **Auto-watch**: Toggle clipboard monitoring — auto-updates when AI chat response is copied

### MCP Server Mode (Phase 3)

Let AI agents (Claude Desktop, Cursor, etc.) directly read and write your workspace files — no clipboard needed.

```bash
# Start MCP server (port 3700)
Ctrl+Shift+P → "CodeBreeze: Start MCP Server"
```

**Available MCP tools:** `read_file`, `write_file`, `list_files`, `get_errors`, `get_git_diff`, `run_build`, `apply_code`, `get_project_map`, `apply_code_headless`

**Claude Desktop configuration** (`~/.claude_desktop_config.json`):
```json
{
  "mcpServers": {
    "codebreeze": {
      "url": "http://localhost:3700/mcp"
    }
  }
}
```

Health check: `curl http://localhost:3700/health`

### Browser Extension Bridge (Phase 4)

Real-time bridge between browser AI chat pages and VS Code — no copy-paste required.

```bash
# Start WebSocket bridge (port 3701)
Ctrl+Shift+P → "CodeBreeze: Start Browser Bridge"
```

Browser extensions can connect to `ws://localhost:3701` to push code blocks directly into VS Code.

### Open AI Chat in VS Code

Click **💬 Open AI Chat** in the sidebar or run `CodeBreeze: Open AI Chat` to open your configured AI chat URL (default: Genspark) in a browser tab.

### VS Code Event Monitoring

CodeBreeze monitors VS Code internally and notifies you when:
- Build/compile tasks complete (success or failure)
- Terminal output contains errors
- Compiler diagnostics (errors/warnings) change
- Git state changes (commits, branch switches)

---

## Configuration

| Setting | Default | Description |
|---------|---------|-------------|
| `codebreeze.chatUrl` | `https://www.genspark.ai/agents?type=ai_chat` | AI chat URL to open |
| `codebreeze.buildCommands` | `["npm run build"]` | Local build commands |
| `codebreeze.testCommands` | `["npm test"]` | Local test commands |
| `codebreeze.gitDiffMode` | `unstaged` | Git diff mode (staged/unstaged/both) |
| `codebreeze.contextLines` | `15` | Lines around errors to include |
| `codebreeze.autoLevel` | `notify` | Automation level (off/notify/auto) |
| `codebreeze.autoWatchClipboard` | `false` | Auto-watch clipboard in control panel |
| `codebreeze.githubToken` | `` | GitHub PAT for remote CI logs (optional) |
| `codebreeze.mcpPort` | `3700` | Port for MCP server (Phase 3) |
| `codebreeze.wsBridgePort` | `3701` | Port for browser WebSocket bridge (Phase 4) |

### Project-level config

Create `.codebreeze.json` in your workspace root to override settings:

```json
{
  "buildCommands": ["make build"],
  "testCommands": ["make test"],
  "chatUrl": "https://chat.openai.com"
}
```

---

## Code Block Format

CodeBreeze recognizes these formats from AI chat responses:

**Inline filepath (preferred):**
````
```typescript:src/app.ts
// code here
```
````

**Comment-based filepath:**
````
// filepath: src/app.ts
```typescript
// code here
```
````

---

## Commands

All commands are available via `Ctrl+Shift+P` → `CodeBreeze`:

**Apply (AI → VS Code)**
- `Apply Code from Clipboard`
- `Undo Last Apply`
- `Manual Paste` *(for code-server / tablet environments)*

**Collect (VS Code → AI)**
- `Copy File for AI`
- `Copy Selection for AI`
- `Copy Multiple Files for AI`
- `Copy Git Diff for AI`
- `Copy Git Log for AI`
- `Copy Errors for AI`
- `Run Build and Copy Log`
- `Run Test and Copy Log`
- `Copy Smart Context for AI`
- `Copy Project Map for AI`

**UI**
- `Open AI Chat`
- `Open CodeBreeze Control Panel`

**MCP Server**
- `Start MCP Server`
- `Stop MCP Server`

**Browser Bridge**
- `Start Browser Bridge`
- `Stop Browser Bridge`

---

## Running on Tablets & Browsers (code-server)

CodeBreeze works in browser-based VS Code environments. See **[docs/code-server-guide.md](docs/code-server-guide.md)** for:

- code-server on a remote server/VPS
- Termux + code-server on Android tablets
- Clipboard fallback behavior in browser environments

---

## Development

### Branch Strategy

CodeBreeze uses a modified Git Flow strategy to minimize CI/CD overhead:

- **`main`**: Production releases only (protected, tag-based)
- **`dev`**: Integration branch for all development work
- **`claude/**`**: Claude Code AI working branches
- **`feature/**`**: Manual feature development
- **`fix/**`**: Bug fixes (hotfix for critical issues)
- **`release/**`**: Release preparation (optional, for major versions)

**For contributors:**
1. Create feature branches from `dev`
2. Submit PR to `dev` (not `main`)
3. Squash commits before merge (clean history)
4. See `BRANCHING_STRATEGY.md` for full details

### CI/CD Workflow

| Branch | CI Action | Speed | Output |
|--------|-----------|-------|--------|
| `claude/**` | Lightweight (compile + lint) | ~2 min | - |
| `dev` | Full CI (test + package) | ~5 min | **VSIX downloadable** (Actions → Artifacts) |
| `main` (tags) | Release (GitHub Release) | ~5 min | Official VSIX (Releases page) |

### Local Development

```bash
# Compile
npm run compile

# Run tests
npm test

# Lint
npm run lint

# Package VSIX
npm run package
```

---

## License

MIT
