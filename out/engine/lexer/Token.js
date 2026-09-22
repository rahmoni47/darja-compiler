"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Token = void 0;
class Token {
    type;
    value;
    line;
    column;
    length;
    constructor(type, value, line, column, length) {
        this.type = type;
        this.value = value;
        this.line = line;
        this.column = column;
        this.length = length;
    }
    toString() {
        return `Token(${this.type}, ${JSON.stringify(this.value)}, line ${this.line}, col ${this.column})`;
    }
}
exports.Token = Token;
//# sourceMappingURL=Token.js.map