"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Interpreter = void 0;
const Environment_1 = require("./Environment");
const DiagnosticError_1 = require("../errors/DiagnosticError");
class Interpreter {
    globalEnvironment;
    currentEnvironment;
    onPrint;
    maxLoopIterations;
    constructor(options = {}) {
        this.globalEnvironment = new Environment_1.Environment();
        this.currentEnvironment = this.globalEnvironment;
        this.onPrint = options.onPrint ?? ((text) => console.log(text));
        this.maxLoopIterations = options.maxLoopIterations ?? 50000;
    }
    execute(program) {
        for (const stmt of program.body) {
            this.executeStatement(stmt);
        }
    }
    executeStatement(stmt) {
        switch (stmt.type) {
            case 'VariableDeclaration':
                this.executeVariableDeclaration(stmt);
                break;
            case 'AssignmentStatement':
                this.executeAssignmentStatement(stmt);
                break;
            case 'PrintStatement':
                this.executePrintStatement(stmt);
                break;
            case 'WhileStatement':
                this.executeWhileStatement(stmt);
                break;
            case 'BlockStatement':
                this.executeBlockStatement(stmt);
                break;
            default: {
                const node = stmt;
                throw new DiagnosticError_1.DiagnosticError(`Unknown statement type: ${node.type}`, node.line ?? 1, node.column ?? 1, node.length ?? 1);
            }
        }
    }
    executeVariableDeclaration(stmt) {
        for (const id of stmt.identifiers) {
            this.currentEnvironment.declare(id.name);
        }
    }
    executeAssignmentStatement(stmt) {
        const value = this.evaluateExpression(stmt.value);
        this.currentEnvironment.assign(stmt.identifier.name, value, stmt.identifier.line, stmt.identifier.column, stmt.identifier.length);
    }
    executePrintStatement(stmt) {
        const value = this.evaluateExpression(stmt.expression);
        let output;
        if (value === true) {
            output = 'صح';
        }
        else if (value === false) {
            output = 'غلط';
        }
        else if (value === null || value === undefined) {
            output = 'والو';
        }
        else {
            output = String(value);
        }
        this.onPrint(output);
    }
    executeWhileStatement(stmt) {
        let iterations = 0;
        while (this.isTruthy(this.evaluateExpression(stmt.condition))) {
            iterations++;
            if (iterations > this.maxLoopIterations) {
                throw new DiagnosticError_1.DiagnosticError(`Runtime error: Maximum loop iterations (${this.maxLoopIterations}) exceeded. Possible infinite loop detected.`, stmt.line, stmt.column, stmt.length);
            }
            this.executeBlockStatement(stmt.body);
        }
    }
    executeBlockStatement(block) {
        const previous = this.currentEnvironment;
        // For educational mini-language, maintain current scope or child scope.
        // DZA variable declarations are function/file scoped like JavaScript 'var' or block scoped.
        // Having block scoped environment with parent lookup ensures variables declared outside are updated inside!
        this.currentEnvironment = new Environment_1.Environment(previous);
        try {
            for (const stmt of block.statements) {
                this.executeStatement(stmt);
            }
        }
        finally {
            this.currentEnvironment = previous;
        }
    }
    evaluateExpression(expr) {
        switch (expr.type) {
            case 'Literal':
                return expr.value;
            case 'Identifier':
                return this.currentEnvironment.get(expr.name, expr.line, expr.column, expr.length);
            case 'UnaryExpression':
                return this.evaluateUnaryExpression(expr);
            case 'BinaryExpression':
                return this.evaluateBinaryExpression(expr);
            default: {
                const node = expr;
                throw new DiagnosticError_1.DiagnosticError(`Unknown expression type: ${node.type}`, node.line ?? 1, node.column ?? 1, node.length ?? 1);
            }
        }
    }
    evaluateUnaryExpression(expr) {
        const arg = this.evaluateExpression(expr.argument);
        switch (expr.operator) {
            case '!':
                return !this.isTruthy(arg);
            case '-':
                if (typeof arg !== 'number') {
                    throw new DiagnosticError_1.DiagnosticError(`Runtime error: Unary '-' operator requires a number, got ${typeof arg} at line ${expr.line}, column ${expr.column}.`, expr.line, expr.column, expr.length);
                }
                return -arg;
            default:
                throw new DiagnosticError_1.DiagnosticError(`Runtime error: Unknown unary operator '${expr.operator}' at line ${expr.line}, column ${expr.column}.`, expr.line, expr.column, expr.length);
        }
    }
    evaluateBinaryExpression(expr) {
        const left = this.evaluateExpression(expr.left);
        // Short-circuit logical operators
        if (expr.operator === '&&') {
            return this.isTruthy(left) && this.isTruthy(this.evaluateExpression(expr.right));
        }
        if (expr.operator === '||') {
            return this.isTruthy(left) || this.isTruthy(this.evaluateExpression(expr.right));
        }
        const right = this.evaluateExpression(expr.right);
        switch (expr.operator) {
            case '+':
                if (typeof left === 'string' || typeof right === 'string') {
                    return String(left) + String(right);
                }
                return Number(left) + Number(right);
            case '-':
                return Number(left) - Number(right);
            case '*':
                return Number(left) * Number(right);
            case '/':
                if (Number(right) === 0) {
                    throw new DiagnosticError_1.DiagnosticError(`Runtime error: Division by zero at line ${expr.line}, column ${expr.column}.`, expr.line, expr.column, expr.length);
                }
                return Number(left) / Number(right);
            case '<':
                return Number(left) < Number(right);
            case '<=':
                return Number(left) <= Number(right);
            case '>':
                return Number(left) > Number(right);
            case '>=':
                return Number(left) >= Number(right);
            case '==':
                return left === right;
            case '!=':
                return left !== right;
            default:
                throw new DiagnosticError_1.DiagnosticError(`Runtime error: Unknown binary operator '${expr.operator}' at line ${expr.line}, column ${expr.column}.`, expr.line, expr.column, expr.length);
        }
    }
    isTruthy(value) {
        if (value === false || value === null || value === undefined || value === 0 || value === '') {
            return false;
        }
        return true;
    }
}
exports.Interpreter = Interpreter;
//# sourceMappingURL=Interpreter.js.map