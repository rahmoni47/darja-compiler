"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Environment = void 0;
const DiagnosticError_1 = require("../errors/DiagnosticError");
class Environment {
    values = new Map();
    declared = new Set();
    parent;
    constructor(parent = null) {
        this.parent = parent;
    }
    declare(name) {
        this.declared.add(name);
        if (!this.values.has(name)) {
            this.values.set(name, undefined);
        }
    }
    isDeclared(name) {
        if (this.declared.has(name)) {
            return true;
        }
        if (this.parent !== null) {
            return this.parent.isDeclared(name);
        }
        return false;
    }
    assign(name, value, line, column, length) {
        if (this.declared.has(name)) {
            this.values.set(name, value);
            return;
        }
        if (this.parent !== null && this.parent.isDeclared(name)) {
            this.parent.assign(name, value, line, column, length);
            return;
        }
        throw new DiagnosticError_1.DiagnosticError(`Variable '${name}' is not declared.`, line, column, length);
    }
    get(name, line, column, length) {
        if (this.declared.has(name)) {
            const val = this.values.get(name);
            return val;
        }
        if (this.parent !== null) {
            return this.parent.get(name, line, column, length);
        }
        throw new DiagnosticError_1.DiagnosticError(`Variable '${name}' is not declared.`, line, column, length);
    }
    getAllDeclared() {
        const list = Array.from(this.declared);
        if (this.parent) {
            return [...list, ...this.parent.getAllDeclared()];
        }
        return list;
    }
}
exports.Environment = Environment;
//# sourceMappingURL=Environment.js.map