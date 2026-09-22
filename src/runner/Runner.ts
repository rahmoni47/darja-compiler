import * as vscode from 'vscode';
import { run } from '../engine';

export class DzaRunner {
  private outputChannel: vscode.OutputChannel;

  constructor(context: vscode.ExtensionContext) {
    this.outputChannel = vscode.window.createOutputChannel('DZA Output');
    context.subscriptions.push(this.outputChannel);
  }

  public async runCurrentFile(): Promise<void> {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      vscode.window.showWarningMessage('No active editor found to run DZA file.');
      return;
    }

    const document = editor.document;
    if (document.languageId !== 'dza' && !document.fileName.endsWith('.dza')) {
      vscode.window.showWarningMessage('The active file is not a DZA (.dza) file.');
      return;
    }

    if (document.isDirty) {
      await document.save();
    }

    const source = document.getText();
    const fileName = document.fileName.split(/[\\/]/).pop() || 'file.dza';

    this.outputChannel.clear();
    this.outputChannel.show(true);

    const startTime = Date.now();
    this.outputChannel.appendLine(`========================================`);
    this.outputChannel.appendLine(`[DZA] Executing: ${fileName}`);
    this.outputChannel.appendLine(`========================================\n`);

    const result = run(source, {
      onPrint: (message: string) => {
        this.outputChannel.appendLine(message);
      }
    });

    const elapsed = Date.now() - startTime;
    this.outputChannel.appendLine('');

    if (result.error) {
      const err = result.error;
      this.outputChannel.appendLine(`----------------------------------------`);
      this.outputChannel.appendLine(`[DZA Error] ${err.message}`);
      this.outputChannel.appendLine(`Location: Line ${err.line}, Column ${err.column}`);
      this.outputChannel.appendLine(`----------------------------------------`);

      vscode.window.showErrorMessage(
        `DZA Execution Failed: ${err.message} (Line ${err.line}, Col ${err.column})`
      );
    } else {
      this.outputChannel.appendLine(`----------------------------------------`);
      this.outputChannel.appendLine(`[DZA] Finished successfully in ${elapsed}ms.`);
      this.outputChannel.appendLine(`========================================`);
    }
  }
}
