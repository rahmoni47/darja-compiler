"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.DiagnosticsProvider = void 0;
const vscode = __importStar(require("vscode"));
const engine_1 = require("../engine");
class DiagnosticsProvider {
    diagnosticCollection;
    constructor(context) {
        this.diagnosticCollection = vscode.languages.createDiagnosticCollection('dza');
        context.subscriptions.push(this.diagnosticCollection);
        // Validate on open
        context.subscriptions.push(vscode.workspace.onDidOpenTextDocument((document) => {
            this.validateDocument(document);
        }));
        // Validate on change
        context.subscriptions.push(vscode.workspace.onDidChangeTextDocument((event) => {
            this.validateDocument(event.document);
        }));
        // Validate on save
        context.subscriptions.push(vscode.workspace.onDidSaveTextDocument((document) => {
            this.validateDocument(document);
        }));
        // Clear diagnostics on close
        context.subscriptions.push(vscode.workspace.onDidCloseTextDocument((document) => {
            this.diagnosticCollection.delete(document.uri);
        }));
        // Validate all active editors on startup
        if (vscode.window.activeTextEditor) {
            this.validateDocument(vscode.window.activeTextEditor.document);
        }
    }
    validateDocument(document) {
        if (document.languageId !== 'dza' && !document.fileName.endsWith('.dza')) {
            return;
        }
        const text = document.getText();
        const errors = (0, engine_1.validate)(text);
        const diagnostics = [];
        for (const err of errors) {
            // VS Code positions are 0-indexed; our engine line/column are 1-indexed
            const lineIndex = Math.max(0, err.line - 1);
            const colIndex = Math.max(0, err.column - 1);
            const length = Math.max(1, err.length);
            const range = new vscode.Range(new vscode.Position(lineIndex, colIndex), new vscode.Position(lineIndex, colIndex + length));
            const diagnostic = new vscode.Diagnostic(range, err.message, vscode.DiagnosticSeverity.Error);
            diagnostic.source = 'DZA';
            diagnostics.push(diagnostic);
        }
        this.diagnosticCollection.set(document.uri, diagnostics);
    }
}
exports.DiagnosticsProvider = DiagnosticsProvider;
//# sourceMappingURL=DiagnosticsProvider.js.map