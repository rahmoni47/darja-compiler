"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DiagnosticError = void 0;
class DiagnosticError extends Error {
    line;
    column;
    length;
    severity;
    constructor(message, line, column, length = 1, severity = 'error') {
        super(message);
        this.line = line;
        this.column = column;
        this.length = length;
        this.severity = severity;
        this.name = 'DiagnosticError';
    }
}
exports.DiagnosticError = DiagnosticError;
//# sourceMappingURL=DiagnosticError.js.map