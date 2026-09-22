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
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.tokenize = tokenize;
exports.parse = parse;
exports.validate = validate;
exports.run = run;
const Lexer_1 = require("./lexer/Lexer");
const Parser_1 = require("./parser/Parser");
const Interpreter_1 = require("./interpreter/Interpreter");
const SemanticAnalyzer_1 = require("./analyzer/SemanticAnalyzer");
const DiagnosticError_1 = require("./errors/DiagnosticError");
__exportStar(require("./lexer/TokenType"), exports);
__exportStar(require("./lexer/Token"), exports);
__exportStar(require("./lexer/Lexer"), exports);
__exportStar(require("./ast/AST"), exports);
__exportStar(require("./parser/Parser"), exports);
__exportStar(require("./interpreter/Environment"), exports);
__exportStar(require("./interpreter/Interpreter"), exports);
__exportStar(require("./analyzer/SemanticAnalyzer"), exports);
__exportStar(require("./errors/DiagnosticError"), exports);
function tokenize(source) {
    const lexer = new Lexer_1.Lexer(source);
    return lexer.tokenize();
}
function parse(source) {
    const tokens = tokenize(source);
    const parser = new Parser_1.Parser(tokens);
    return parser.parse();
}
function validate(source) {
    try {
        const tokens = tokenize(source);
        const parser = new Parser_1.Parser(tokens);
        const ast = parser.parse();
        const analyzer = new SemanticAnalyzer_1.SemanticAnalyzer();
        return analyzer.analyze(ast);
    }
    catch (err) {
        if (err instanceof DiagnosticError_1.DiagnosticError) {
            return [err];
        }
        return [new DiagnosticError_1.DiagnosticError(err.message || 'Unknown error', 1, 1, 1)];
    }
}
function run(source, options = {}) {
    const logs = [];
    const capturePrint = (msg) => {
        logs.push(msg);
        if (options.onPrint) {
            options.onPrint(msg);
        }
    };
    try {
        const tokens = tokenize(source);
        const parser = new Parser_1.Parser(tokens);
        const ast = parser.parse();
        const interpreter = new Interpreter_1.Interpreter({
            ...options,
            onPrint: capturePrint
        });
        interpreter.execute(ast);
        return { output: logs };
    }
    catch (err) {
        if (err instanceof DiagnosticError_1.DiagnosticError) {
            return { output: logs, error: err };
        }
        const fallbackErr = new DiagnosticError_1.DiagnosticError(err.message || String(err), 1, 1, 1);
        return { output: logs, error: fallbackErr };
    }
}
//# sourceMappingURL=index.js.map