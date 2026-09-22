import * as vscode from 'vscode';
import { validate } from '../engine';

export class DiagnosticsProvider {
  private diagnosticCollection: vscode.DiagnosticCollection;

  constructor(context: vscode.ExtensionContext) {
    this.diagnosticCollection = vscode.languages.createDiagnosticCollection('dza');
    context.subscriptions.push(this.diagnosticCollection);

    // Validate on open
    context.subscriptions.push(
      vscode.workspace.onDidOpenTextDocument((document) => {
        this.validateDocument(document);
      })
    );

    // Validate on change
    context.subscriptions.push(
      vscode.workspace.onDidChangeTextDocument((event) => {
        this.validateDocument(event.document);
      })
    );

    // Validate on save
    context.subscriptions.push(
      vscode.workspace.onDidSaveTextDocument((document) => {
        this.validateDocument(document);
      })
    );

    // Clear diagnostics on close
    context.subscriptions.push(
      vscode.workspace.onDidCloseTextDocument((document) => {
        this.diagnosticCollection.delete(document.uri);
      })
    );

    // Validate all active editors on startup
    if (vscode.window.activeTextEditor) {
      this.validateDocument(vscode.window.activeTextEditor.document);
    }
  }

  public validateDocument(document: vscode.TextDocument): void {
    if (document.languageId !== 'dza' && !document.fileName.endsWith('.dza')) {
      return;
    }

    const text = document.getText();
    const errors = validate(text);
    const diagnostics: vscode.Diagnostic[] = [];

    for (const err of errors) {
      // VS Code positions are 0-indexed; our engine line/column are 1-indexed
      const lineIndex = Math.max(0, err.line - 1);
      const colIndex = Math.max(0, err.column - 1);
      const length = Math.max(1, err.length);

      const range = new vscode.Range(
        new vscode.Position(lineIndex, colIndex),
        new vscode.Position(lineIndex, colIndex + length)
      );

      const diagnostic = new vscode.Diagnostic(
        range,
        err.message,
        vscode.DiagnosticSeverity.Error
      );
      diagnostic.source = 'DZA';
      diagnostics.push(diagnostic);
    }

    this.diagnosticCollection.set(document.uri, diagnostics);
  }
}
