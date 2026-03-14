import * as vscode from 'vscode';
import * as path from 'path';
import { getWorkspaceRoot } from '../config';
import { execSync } from '../utils/exec';

export async function applyPatch(patchContent: string): Promise<boolean> {
  const workspaceRoot = getWorkspaceRoot();
  if (!workspaceRoot) {
    vscode.window.showErrorMessage('AI Bridge: No workspace open');
    return false;
  }

  // Extract target file from patch header
  const targetMatch = patchContent.match(/^(?:\+\+\+\s+b\/|diff --git a\/.+? b\/)(.+)$/m);
  if (!targetMatch) {
    vscode.window.showErrorMessage('AI Bridge: Could not determine target file from patch');
    return false;
  }

  const targetFile = targetMatch[1].trim();
  const targetPath = path.join(workspaceRoot, targetFile);

  // Write patch to temp file and apply with git apply
  const tmpPatch = path.join(workspaceRoot, '.ai-bridge-patch.diff');
  const encoder = new TextEncoder();
  await vscode.workspace.fs.writeFile(vscode.Uri.file(tmpPatch), encoder.encode(patchContent));

  try {
    execSync('git apply --check .ai-bridge-patch.diff', workspaceRoot);
    execSync('git apply .ai-bridge-patch.diff', workspaceRoot);

    // Open the patched file
    const doc = await vscode.workspace.openTextDocument(targetPath);
    await vscode.window.showTextDocument(doc);
    vscode.window.showInformationMessage(`AI Bridge: Patch applied to ${targetFile}`);
    return true;
  } catch (err) {
    vscode.window.showErrorMessage(
      `AI Bridge: Failed to apply patch: ${err instanceof Error ? err.message : String(err)}`
    );
    return false;
  } finally {
    try {
      await vscode.workspace.fs.delete(vscode.Uri.file(tmpPatch));
    } catch {
      // ignore cleanup errors
    }
  }
}
