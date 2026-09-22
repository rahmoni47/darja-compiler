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
exports.DzaRunner = void 0;
const vscode = __importStar(require("vscode"));
const engine_1 = require("../engine");
class DzaRunner {
    outputChannel;
    constructor(context) {
        this.outputChannel = vscode.window.createOutputChannel('DZA Output');
        context.subscriptions.push(this.outputChannel);
    }
    async runCurrentFile() {
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
        const result = (0, engine_1.run)(source, {
            onPrint: (message) => {
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
            vscode.window.showErrorMessage(`DZA Execution Failed: ${err.message} (Line ${err.line}, Col ${err.column})`);
        }
        else {
            this.outputChannel.appendLine(`----------------------------------------`);
            this.outputChannel.appendLine(`[DZA] Finished successfully in ${elapsed}ms.`);
            this.outputChannel.appendLine(`========================================`);
        }
    }
}
exports.DzaRunner = DzaRunner;
//# sourceMappingURL=Runner.js.map