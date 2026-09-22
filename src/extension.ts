import * as vscode from 'vscode';
import { DiagnosticsProvider } from './diagnostics/DiagnosticsProvider';
import { DzaCompletionProvider } from './completion/CompletionProvider';
import { DzaRunner } from './runner/Runner';

export function activate(context: vscode.ExtensionContext) {
  // Initialize Diagnostics Provider
  new DiagnosticsProvider(context);

  // Initialize Code Runner
  const runner = new DzaRunner(context);

  // Register "DZA: Run File" Command
  const runCommand = vscode.commands.registerCommand('dza.runFile', async () => {
    await runner.runCurrentFile();
  });
  context.subscriptions.push(runCommand);

  // Register Autocomplete & Snippet Provider
  const completionProvider = vscode.languages.registerCompletionItemProvider(
    { scheme: 'file', language: 'dza' },
    new DzaCompletionProvider(),
    'ك', 'م', 'و', 'ص', 'غ', 'k', 'm', 'w', 's', 'g'
  );
  context.subscriptions.push(completionProvider);

  // Optional Status Bar Item for quick execution
  const runStatusBarItem = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Right,
    100
  );
  runStatusBarItem.command = 'dza.runFile';
  runStatusBarItem.text = '$(play) Run DZA';
  runStatusBarItem.tooltip = 'Execute active DZA file';

  function updateStatusBarItem() {
    const editor = vscode.window.activeTextEditor;
    if (editor && (editor.document.languageId === 'dza' || editor.document.fileName.endsWith('.dza'))) {
      runStatusBarItem.show();
    } else {
      runStatusBarItem.hide();
    }
  }

  context.subscriptions.push(
    vscode.window.onDidChangeActiveTextEditor(updateStatusBarItem),
    vscode.workspace.onDidOpenTextDocument(updateStatusBarItem),
    runStatusBarItem
  );

  updateStatusBarItem();
}

export function deactivate() {}
