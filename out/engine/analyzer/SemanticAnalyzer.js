"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SemanticAnalyzer = void 0;
const DiagnosticError_1 = require("../errors/DiagnosticError");
class SemanticAnalyzer {
    declaredVariables = new Set();
    errors = [];
    analyze(program) {
        this.declaredVariables.clear();
        this.errors = [];
        // Pre-declare variables or traverse sequentially
        for (const stmt of program.body) {
            this.analyzeStatement(stmt);
        }
        return this.errors;
    }
    analyzeStatement(stmt) {
        switch (stmt.type) {
            case 'VariableDeclaration':
                for (const id of stmt.identifiers) {
                    this.declaredVariables.add(id.name);
                }
                break;
            case 'AssignmentStatement':
                if (!this.declaredVariables.has(stmt.identifier.name)) {
                    this.errors.push(new DiagnosticError_1.DiagnosticError(`Variable '${stmt.identifier.name}' is not declared.`, stmt.identifier.line, stmt.identifier.column, stmt.identifier.length));
                }
                this.analyzeExpression(stmt.value);
                break;
            case 'PrintStatement':
                this.analyzeExpression(stmt.expression);
                break;
            case 'WhileStatement':
                this.analyzeExpression(stmt.condition);
                this.analyzeBlock(stmt.body);
                break;
            case 'BlockStatement':
                this.analyzeBlock(stmt);
                break;
        }
    }
    analyzeBlock(block) {
        for (const stmt of block.statements) {
            this.analyzeStatement(stmt);
        }
    }
    analyzeExpression(expr) {
        switch (expr.type) {
            case 'Identifier':
                if (!this.declaredVariables.has(expr.name)) {
                    this.errors.push(new DiagnosticError_1.DiagnosticError(`Variable '${expr.name}' is not declared.`, expr.line, expr.column, expr.length));
                }
                break;
            case 'BinaryExpression':
                this.analyzeExpression(expr.left);
                this.analyzeExpression(expr.right);
                break;
            case 'UnaryExpression':
                this.analyzeExpression(expr.argument);
                break;
            case 'Literal':
                break;
        }
    }
}
exports.SemanticAnalyzer = SemanticAnalyzer;
//# sourceMappingURL=SemanticAnalyzer.js.map