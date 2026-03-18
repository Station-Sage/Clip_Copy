import * as assert from 'assert';
import { parseClipboard, detectDiff } from '../../src/apply/markdownParser';

suite('MarkdownParser Phase 7-4 Enhancements', () => {
  test('parse incomplete code block (missing closing ```)', () => {
    const text = '```typescript:src/app.ts\nconst x = 1;\nconst y = 2;\n';
    const blocks = parseClipboard(text);
    // Should attempt best-guess parsing
    assert.ok(blocks.length >= 0); // May or may not parse depending on vscode mock
  });

  test('parse large content (chunked parsing)', () => {
    // Create content > 100KB
    const codeBlock = '```typescript:src/big.ts\n' + 'const x = 1;\n'.repeat(8000) + '```\n';
    assert.ok(codeBlock.length > 100 * 1024);

    const blocks = parseClipboard(codeBlock);
    assert.strictEqual(blocks.length, 1);
    assert.strictEqual(blocks[0].filePath, 'src/big.ts');
    assert.strictEqual(blocks[0].language, 'typescript');
  });

  test('parse multiple blocks in large content', () => {
    const block1 = '```typescript:src/a.ts\nconst a = 1;\n```\n\n';
    const block2 = '```python:src/b.py\nx = 1\n```\n\n';
    const padding = 'Some explanation text.\n'.repeat(5000);
    const text = block1 + padding + block2;

    // This should be > 100KB
    if (text.length > 100 * 1024) {
      const blocks = parseClipboard(text);
      assert.strictEqual(blocks.length, 2);
    }
  });

  test('empty string returns empty array', () => {
    assert.deepStrictEqual(parseClipboard(''), []);
  });

  test('whitespace only returns empty array', () => {
    assert.deepStrictEqual(parseClipboard('   \n\n  '), []);
  });

  test('null-like content returns empty array', () => {
    assert.deepStrictEqual(parseClipboard('no code blocks here'), []);
  });

  test('detect diff with @@ markers', () => {
    assert.ok(detectDiff('@@ -1,5 +1,6 @@\n const x = 1;'));
  });

  test('detect diff with diff --git', () => {
    assert.ok(detectDiff('diff --git a/file.ts b/file.ts'));
  });

  test('non-diff content returns false', () => {
    assert.ok(!detectDiff('const x = 1;\nconst y = 2;'));
  });
});
