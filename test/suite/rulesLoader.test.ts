import * as assert from 'assert';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import {
  loadProjectRules,
  formatProjectRulesSection,
  hasProjectRules,
  clearRulesCache,
} from '../../src/collect/rulesLoader';

suite('rulesLoader', () => {
  // These tests run without VS Code context, so getWorkspaceRoot() returns undefined.
  // We test the cache and formatting logic.

  setup(() => {
    clearRulesCache();
  });

  test('loadProjectRules returns empty string when no workspace', () => {
    const result = loadProjectRules();
    assert.strictEqual(result, '');
  });

  test('formatProjectRulesSection returns empty string when no rules', () => {
    const result = formatProjectRulesSection();
    assert.strictEqual(result, '');
  });

  test('hasProjectRules returns false when no workspace', () => {
    assert.strictEqual(hasProjectRules(), false);
  });

  test('clearRulesCache does not throw', () => {
    assert.doesNotThrow(() => clearRulesCache());
  });
});
