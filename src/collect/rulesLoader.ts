/**
 * Rules Loader — Phase 8-2
 *
 * Loads project rules from .codebreeze-rules.md (or configured path).
 * Rules are auto-prepended to AI context (Smart Context, Agent Loop).
 */
import * as fs from 'fs';
import * as path from 'path';
import { getConfig, getWorkspaceRoot } from '../config';

let cachedRules: string | null = null;
let cachedRulesPath: string | null = null;
let cachedMtime: number = 0;

/**
 * Load project rules from the configured rules file.
 * Returns the rules content or empty string if not found.
 * Results are cached until the file is modified.
 */
export function loadProjectRules(): string {
  const workspaceRoot = getWorkspaceRoot();
  if (!workspaceRoot) return '';

  const config = getConfig();
  const rulesPath = path.join(workspaceRoot, config.rulesFile);

  // Check cache
  if (cachedRulesPath === rulesPath && cachedRules !== null) {
    try {
      const stat = fs.statSync(rulesPath);
      if (stat.mtimeMs === cachedMtime) return cachedRules;
    } catch {
      cachedRules = '';
      return '';
    }
  }

  // Load rules
  try {
    if (!fs.existsSync(rulesPath)) {
      cachedRules = '';
      cachedRulesPath = rulesPath;
      return '';
    }

    const content = fs.readFileSync(rulesPath, 'utf8').trim();
    const stat = fs.statSync(rulesPath);
    cachedRules = content;
    cachedRulesPath = rulesPath;
    cachedMtime = stat.mtimeMs;
    return content;
  } catch {
    cachedRules = '';
    cachedRulesPath = rulesPath;
    return '';
  }
}

/**
 * Format project rules as a markdown section for prepending to context.
 * Returns empty string if no rules file exists.
 */
export function formatProjectRulesSection(): string {
  const rules = loadProjectRules();
  if (!rules) return '';

  return `## Project Rules\n\n${rules}`;
}

/**
 * Check if a project rules file exists in the workspace.
 */
export function hasProjectRules(): boolean {
  return loadProjectRules().length > 0;
}

/** Clear the rules cache (useful for testing) */
export function clearRulesCache(): void {
  cachedRules = null;
  cachedRulesPath = null;
  cachedMtime = 0;
}
