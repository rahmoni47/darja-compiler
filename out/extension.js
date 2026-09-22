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
exports.activate = activate;
exports.deactivate = deactivate;
const vscode = __importStar(require("vscode"));
const DiagnosticsProvider_1 = require("./diagnostics/DiagnosticsProvider");
const CompletionProvider_1 = require("./completion/CompletionProvider");
const Runner_1 = require("./runner/Runner");
function activate(context) {
    // Initialize Diagnostics Provider
    new DiagnosticsProvider_1.DiagnosticsProvider(context);
    // Initialize Code Runner
    const runner = new Runner_1.DzaRunner(context);
    // Register "DZA: Run File" Command
    const runCommand = vscode.commands.registerCommand('dza.runFile', async () => {
        await runner.runCurrentFile();
    });
    context.subscriptions.push(runCommand);
    // Register Autocomplete & Snippet Provider
    const completionProvider = vscode.languages.registerCompletionItemProvider({ scheme: 'file', language: 'dza' }, new CompletionProvider_1.DzaCompletionProvider(), 'ك', 'م', 'و', 'ص', 'غ', 'k', 'm', 'w', 's', 'g');
    context.subscriptions.push(completionProvider);
    // Optional Status Bar Item for quick execution
    const runStatusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
    runStatusBarItem.command = 'dza.runFile';
    runStatusBarItem.text = '$(play) Run DZA';
    runStatusBarItem.tooltip = 'Execute active DZA file';
    function updateStatusBarItem() {
        const editor = vscode.window.activeTextEditor;
        if (editor && (editor.document.languageId === 'dza' || editor.document.fileName.endsWith('.dza'))) {
            runStatusBarItem.show();
        }
        else {
            runStatusBarItem.hide();
        }
    }
    context.subscriptions.push(vscode.window.onDidChangeActiveTextEditor(updateStatusBarItem), vscode.workspace.onDidOpenTextDocument(updateStatusBarItem), runStatusBarItem);
    updateStatusBarItem();
}
function deactivate() { }
//# sourceMappingURL=extension.js.map