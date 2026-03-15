import * as vscode from 'vscode';

// Apply
import { applyFromClipboard } from './apply/clipboardApply';
import { undoLastApply } from './apply/safetyGuard';

// Collect
import { copyFileForAI, copySelectionForAI, copyMultipleFilesForAI } from './collect/fileCopy';
import { copyGitDiffForAI, copyGitLogForAI } from './collect/gitCollector';
import { copyErrorsForAI } from './collect/errorCollector';
import { runBuildAndCopy, runTestAndCopy, copyLastBuildLog } from './collect/localBuildCollector';
import { copyBuildLogFromGitHub } from './collect/githubLogCollector';
import { copySmartContext } from './collect/smartContext';

// UI
import { AiBridgeSidebarProvider } from './ui/sidebarProvider';
import { initHistoryStore } from './ui/historyStore';
import { initStatusBar, flashStatusBar } from './ui/statusBarItem';
import { openChatPanel, openControlPanel } from './ui/chatPanel';

// Monitor
import { registerTaskMonitor } from './monitor/taskMonitor';
import { registerTerminalMonitor } from './monitor/terminalMonitor';
import { registerDiagnosticsMonitor, onDiagnosticsChanged } from './monitor/diagnosticsMonitor';
import { registerGitEventMonitor } from './monitor/gitEventMonitor';

export function activate(context: vscode.ExtensionContext): void {
  // Initialize stores
  initHistoryStore(context);
  initStatusBar(context);

  // Register sidebar
  const sidebarProvider = new AiBridgeSidebarProvider();
  const sidebarDisposable = vscode.window.registerTreeDataProvider(
    'aiBridgeSidebar',
    sidebarProvider
  );
  context.subscriptions.push(sidebarDisposable);

  // Register monitors
  registerTaskMonitor(context);
  registerTerminalMonitor(context);
  registerDiagnosticsMonitor(context);
  registerGitEventMonitor(context);

  // Update status bar on diagnostics change
  onDiagnosticsChanged((errors, warnings) => {
    if (errors > 0) {
      flashStatusBar(`${errors} error(s)`, 5000);
    }
    sidebarProvider.refresh();
  });

  // Register all commands
  const commands: [string, (...args: unknown[]) => unknown][] = [
    ['aibridge.applyFromClipboard', () => applyFromClipboard()],
    ['aibridge.undoLastApply', () => undoLastApply()],
    ['aibridge.copyFileForAI', (uri?: unknown) => copyFileForAI(uri as vscode.Uri | undefined)],
    ['aibridge.copySelectionForAI', () => copySelectionForAI()],
    ['aibridge.copyGitDiffForAI', () => copyGitDiffForAI()],
    ['aibridge.copyGitLogForAI', () => copyGitLogForAI()],
    ['aibridge.copyErrorsForAI', () => copyErrorsForAI()],
    ['aibridge.runBuildAndCopy', () => runBuildAndCopy()],
    ['aibridge.runTestAndCopy', () => runTestAndCopy()],
    ['aibridge.copyLastBuildLog', () => copyLastBuildLog()],
    ['aibridge.copyBuildLogFromGitHub', () => copyBuildLogFromGitHub()],
    ['aibridge.copySmartContext', () => copySmartContext()],
    ['aibridge.openChatPanel', () => openChatPanel()],
    ['aibridge.openControlPanel', () => openControlPanel(context)],
    ['aibridge.refreshSidebar', () => sidebarProvider.refresh()],
  ];

  for (const [id, handler] of commands) {
    context.subscriptions.push(vscode.commands.registerCommand(id, handler));
  }
}

export function deactivate(): void {
  // Cleanup handled by subscriptions
}
