import * as assert from 'assert';
import {
  buildErrorFixPrompt,
  buildIterationPrompt,
  summarizeErrors,
  IterationRecord,
} from '../../src/bridge/promptBuilder';

suite('promptBuilder', () => {
  test('buildErrorFixPrompt includes error count', () => {
    const prompt = buildErrorFixPrompt(3, 'some errors here', '');
    assert.ok(prompt.includes('3 error(s)'));
    assert.ok(prompt.includes('some errors here'));
    assert.ok(prompt.includes('Requirements:'));
  });

  test('buildErrorFixPrompt includes chain context', () => {
    const prompt = buildErrorFixPrompt(1, 'errors', '### Related Files\nsome chain');
    assert.ok(prompt.includes('Related Files'));
    assert.ok(prompt.includes('some chain'));
  });

  test('buildErrorFixPrompt without chain context', () => {
    const prompt = buildErrorFixPrompt(2, 'context', '');
    assert.ok(!prompt.includes('Related Files'));
  });

  test('buildIterationPrompt includes history', () => {
    const history: IterationRecord[] = [
      {
        iteration: 1,
        errorSummary: 'app.ts: Cannot find name x',
        appliedFiles: ['src/app.ts'],
        buildExitCode: 1,
        errorCount: 3,
      },
    ];
    const prompt = buildIterationPrompt(2, 'error context', '', history);
    assert.ok(prompt.includes('after 1 attempt(s)'));
    assert.ok(prompt.includes('Attempt 1'));
    assert.ok(prompt.includes('Cannot find name x'));
    assert.ok(prompt.includes('src/app.ts'));
    assert.ok(prompt.includes('avoid repeating'));
  });

  test('buildIterationPrompt with multiple history entries', () => {
    const history: IterationRecord[] = [
      { iteration: 1, errorSummary: 'err1', appliedFiles: ['a.ts'], buildExitCode: 1, errorCount: 2 },
      { iteration: 2, errorSummary: 'err2', appliedFiles: ['b.ts'], buildExitCode: 1, errorCount: 1 },
    ];
    const prompt = buildIterationPrompt(1, 'ctx', '', history);
    assert.ok(prompt.includes('after 2 attempt(s)'));
    assert.ok(prompt.includes('Attempt 1'));
    assert.ok(prompt.includes('Attempt 2'));
  });

  test('summarizeErrors with no errors', () => {
    assert.strictEqual(summarizeErrors([]), 'no errors');
  });

  test('summarizeErrors with few errors', () => {
    const items = [
      { file: '/path/to/app.ts', message: 'Cannot find name x' },
      { file: '/path/to/utils.ts', message: 'Type error' },
    ];
    const summary = summarizeErrors(items);
    assert.ok(summary.includes('app.ts'));
    assert.ok(summary.includes('Cannot find name x'));
    assert.ok(summary.includes('utils.ts'));
  });

  test('summarizeErrors truncates after 3', () => {
    const items = [
      { file: '/a.ts', message: 'err1' },
      { file: '/b.ts', message: 'err2' },
      { file: '/c.ts', message: 'err3' },
      { file: '/d.ts', message: 'err4' },
      { file: '/e.ts', message: 'err5' },
    ];
    const summary = summarizeErrors(items);
    assert.ok(summary.includes('+2 more'));
  });
});
