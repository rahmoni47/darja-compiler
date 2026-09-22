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
exports.DzaCompletionProvider = void 0;
const vscode = __importStar(require("vscode"));
class DzaCompletionProvider {
    provideCompletionItems(_document, _position, _token, _context) {
        const items = [];
        // 1. كاش_كاين (Variable Declaration)
        const varItem = new vscode.CompletionItem('كاش_كاين', vscode.CompletionItemKind.Keyword);
        varItem.detail = 'كاش_كاين (Variable Declaration)';
        varItem.documentation = new vscode.MarkdownString('**DZA Variable Declaration**\n\nDeclares one or more variables.\n\n```dza\nكاش_كاين a, b;\n```');
        varItem.insertText = new vscode.SnippetString('كاش_كاين ${1:variable_name};');
        items.push(varItem);
        // Latin alias: kash
        const varAlias = new vscode.CompletionItem('kash_kayen', vscode.CompletionItemKind.Keyword);
        varAlias.detail = 'kash_kayen -> كاش_كاين (Variable Declaration)';
        varAlias.insertText = new vscode.SnippetString('كاش_كاين ${1:variable_name};');
        items.push(varAlias);
        // 2. مدام (While Loop)
        const whileItem = new vscode.CompletionItem('مدام', vscode.CompletionItemKind.Keyword);
        whileItem.detail = 'مدام (While Loop)';
        whileItem.documentation = new vscode.MarkdownString('**DZA While Loop**\n\nRepeats a block of code while condition evaluates to true.\n\n```dza\nمدام (condition) {\n    statements\n}\n```');
        whileItem.insertText = new vscode.SnippetString('مدام (${1:condition}) {\n\t${2:// statements}\n}');
        items.push(whileItem);
        // Latin alias: madam
        const whileAlias = new vscode.CompletionItem('madam', vscode.CompletionItemKind.Keyword);
        whileAlias.detail = 'madam -> مدام (While Loop)';
        whileAlias.insertText = new vscode.SnippetString('مدام (${1:condition}) {\n\t${2:// statements}\n}');
        items.push(whileAlias);
        // 3. وري (Print Statement)
        const printItem = new vscode.CompletionItem('وري', vscode.CompletionItemKind.Function);
        printItem.detail = 'وري (Print Statement)';
        printItem.documentation = new vscode.MarkdownString('**DZA Output Function**\n\nPrints value or expression result to output console.\n\n```dza\nوري(expression);\n```');
        printItem.insertText = new vscode.SnippetString('وري(${1:expression});');
        items.push(printItem);
        // Latin alias: wari
        const printAlias = new vscode.CompletionItem('wari', vscode.CompletionItemKind.Function);
        printAlias.detail = 'wari -> وري (Print Statement)';
        printAlias.insertText = new vscode.SnippetString('وري(${1:expression});');
        items.push(printAlias);
        // 4. صح (Boolean True)
        const trueItem = new vscode.CompletionItem('صح', vscode.CompletionItemKind.Constant);
        trueItem.detail = 'صح (Boolean True)';
        trueItem.documentation = new vscode.MarkdownString('DZA boolean literal for `true`.');
        trueItem.insertText = 'صح';
        items.push(trueItem);
        // Latin alias: shih / true
        const trueAlias = new vscode.CompletionItem('shih', vscode.CompletionItemKind.Constant);
        trueAlias.detail = 'shih -> صح (Boolean True)';
        trueAlias.insertText = 'صح';
        items.push(trueAlias);
        // 5. غلط (Boolean False)
        const falseItem = new vscode.CompletionItem('غلط', vscode.CompletionItemKind.Constant);
        falseItem.detail = 'غلط (Boolean False)';
        falseItem.documentation = new vscode.MarkdownString('DZA boolean literal for `false`.');
        falseItem.insertText = 'غلط';
        items.push(falseItem);
        // Latin alias: ghalat / false
        const falseAlias = new vscode.CompletionItem('ghalat', vscode.CompletionItemKind.Constant);
        falseAlias.detail = 'ghalat -> غلط (Boolean False)';
        falseAlias.insertText = 'غلط';
        items.push(falseAlias);
        return items;
    }
}
exports.DzaCompletionProvider = DzaCompletionProvider;
//# sourceMappingURL=CompletionProvider.js.map