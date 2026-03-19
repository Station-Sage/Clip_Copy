import * as vscode from 'vscode';

let statusBar: vscode.StatusBarItem | null = null;

export function initStatusBar(context: vscode.ExtensionContext): void {
  statusBar = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
  statusBar.command = 'codebreeze.openControlPanel';
  statusBar.text = '$(robot) CodeBreeze';
  statusBar.tooltip = 'CodeBreeze — Click to open control panel';
  statusBar.show();
  context.subscriptions.push(statusBar);
}

export function updateStatusBar(text: string, tooltip?: string, isError = false): void {
  if (!statusBar) return;
  statusBar.text = `$(robot) ${text}`;
  if (tooltip) statusBar.tooltip = tooltip;
  statusBar.backgroundColor = isError
    ? new vscode.ThemeColor('statusBarItem.errorBackground')
    : undefined;
}

let flashTimer: ReturnType<typeof setTimeout> | null = null;

export function flashStatusBar(text: string, durationMs = 3000): void {
  // B-024: cancel any previous flash to prevent race
  if (flashTimer) clearTimeout(flashTimer);
  const original = '$(robot) CodeBreeze';
  updateStatusBar(text);
  flashTimer = setTimeout(() => {
    flashTimer = null;
    if (statusBar) statusBar.text = original;
  }, durationMs);
}
