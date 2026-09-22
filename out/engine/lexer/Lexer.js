"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Lexer = void 0;
const Token_1 = require("./Token");
const TokenType_1 = require("./TokenType");
const DiagnosticError_1 = require("../errors/DiagnosticError");
class Lexer {
    source;
    position = 0;
    line = 1;
    column = 1;
    static KEYWORDS = {
        'كاش_كاين': TokenType_1.TokenType.KEYWORD_VAR,
        'مدام': TokenType_1.TokenType.KEYWORD_WHILE,
        'وري': TokenType_1.TokenType.KEYWORD_PRINT,
        'صح': TokenType_1.TokenType.BOOLEAN_TRUE,
        'غلط': TokenType_1.TokenType.BOOLEAN_FALSE
    };
    constructor(source) {
        this.source = source;
    }
    tokenize() {
        const tokens = [];
        while (!this.isAtEnd()) {
            this.skipWhitespaceAndComments();
            if (this.isAtEnd()) {
                break;
            }
            const startLine = this.line;
            const startCol = this.column;
            const ch = this.peek();
            // Identifiers & Keywords
            if (this.isIdentifierStart(ch)) {
                tokens.push(this.readIdentifierOrKeyword());
                continue;
            }
            // Numbers
            if (this.isDigit(ch)) {
                tokens.push(this.readNumber());
                continue;
            }
            // Strings
            if (ch === '"') {
                tokens.push(this.readString());
                continue;
            }
            // Operators and punctuation
            const twoChar = this.source.slice(this.position, this.position + 2);
            if (twoChar === '==') {
                this.advance(2);
                tokens.push(new Token_1.Token(TokenType_1.TokenType.EQUAL, '==', startLine, startCol, 2));
            }
            else if (twoChar === '!=') {
                this.advance(2);
                tokens.push(new Token_1.Token(TokenType_1.TokenType.NOT_EQUAL, '!=', startLine, startCol, 2));
            }
            else if (twoChar === '<=') {
                this.advance(2);
                tokens.push(new Token_1.Token(TokenType_1.TokenType.LESS_EQUAL, '<=', startLine, startCol, 2));
            }
            else if (twoChar === '>=') {
                this.advance(2);
                tokens.push(new Token_1.Token(TokenType_1.TokenType.GREATER_EQUAL, '>=', startLine, startCol, 2));
            }
            else if (twoChar === '&&') {
                this.advance(2);
                tokens.push(new Token_1.Token(TokenType_1.TokenType.AND, '&&', startLine, startCol, 2));
            }
            else if (twoChar === '||') {
                this.advance(2);
                tokens.push(new Token_1.Token(TokenType_1.TokenType.OR, '||', startLine, startCol, 2));
            }
            else if (ch === '=') {
                this.advance(1);
                tokens.push(new Token_1.Token(TokenType_1.TokenType.ASSIGN, '=', startLine, startCol, 1));
            }
            else if (ch === '<') {
                this.advance(1);
                tokens.push(new Token_1.Token(TokenType_1.TokenType.LESS, '<', startLine, startCol, 1));
            }
            else if (ch === '>') {
                this.advance(1);
                tokens.push(new Token_1.Token(TokenType_1.TokenType.GREATER, '>', startLine, startCol, 1));
            }
            else if (ch === '+') {
                this.advance(1);
                tokens.push(new Token_1.Token(TokenType_1.TokenType.PLUS, '+', startLine, startCol, 1));
            }
            else if (ch === '-') {
                this.advance(1);
                tokens.push(new Token_1.Token(TokenType_1.TokenType.MINUS, '-', startLine, startCol, 1));
            }
            else if (ch === '*') {
                this.advance(1);
                tokens.push(new Token_1.Token(TokenType_1.TokenType.STAR, '*', startLine, startCol, 1));
            }
            else if (ch === '/') {
                this.advance(1);
                tokens.push(new Token_1.Token(TokenType_1.TokenType.SLASH, '/', startLine, startCol, 1));
            }
            else if (ch === '!') {
                this.advance(1);
                tokens.push(new Token_1.Token(TokenType_1.TokenType.NOT, '!', startLine, startCol, 1));
            }
            else if (ch === '(') {
                this.advance(1);
                tokens.push(new Token_1.Token(TokenType_1.TokenType.LPAREN, '(', startLine, startCol, 1));
            }
            else if (ch === ')') {
                this.advance(1);
                tokens.push(new Token_1.Token(TokenType_1.TokenType.RPAREN, ')', startLine, startCol, 1));
            }
            else if (ch === '{') {
                this.advance(1);
                tokens.push(new Token_1.Token(TokenType_1.TokenType.LBRACE, '{', startLine, startCol, 1));
            }
            else if (ch === '}') {
                this.advance(1);
                tokens.push(new Token_1.Token(TokenType_1.TokenType.RBRACE, '}', startLine, startCol, 1));
            }
            else if (ch === ',') {
                this.advance(1);
                tokens.push(new Token_1.Token(TokenType_1.TokenType.COMMA, ',', startLine, startCol, 1));
            }
            else if (ch === ';') {
                this.advance(1);
                tokens.push(new Token_1.Token(TokenType_1.TokenType.SEMICOLON, ';', startLine, startCol, 1));
            }
            else {
                throw new DiagnosticError_1.DiagnosticError(`Unexpected character '${ch}' at line ${startLine}, column ${startCol}.`, startLine, startCol, 1);
            }
        }
        tokens.push(new Token_1.Token(TokenType_1.TokenType.EOF, null, this.line, this.column, 0));
        return tokens;
    }
    isAtEnd() {
        return this.position >= this.source.length;
    }
    peek() {
        return this.source[this.position] || '\0';
    }
    peekNext() {
        return this.source[this.position + 1] || '\0';
    }
    advance(count = 1) {
        let result = '';
        for (let i = 0; i < count; i++) {
            if (this.position < this.source.length) {
                const char = this.source[this.position];
                result += char;
                this.position++;
                if (char === '\n') {
                    this.line++;
                    this.column = 1;
                }
                else {
                    this.column++;
                }
            }
        }
        return result;
    }
    skipWhitespaceAndComments() {
        while (!this.isAtEnd()) {
            const ch = this.peek();
            if (ch === ' ' || ch === '\t' || ch === '\r' || ch === '\n') {
                this.advance();
            }
            else if (ch === '/' && this.peekNext() === '/') {
                // Single-line comment
                this.advance(2);
                while (!this.isAtEnd() && this.peek() !== '\n') {
                    this.advance();
                }
            }
            else {
                break;
            }
        }
    }
    isIdentifierStart(ch) {
        return /^[\p{L}_]$/u.test(ch);
    }
    isIdentifierPart(ch) {
        return /^[\p{L}\p{N}_]$/u.test(ch);
    }
    isDigit(ch) {
        return /^[0-9]$/.test(ch);
    }
    readIdentifierOrKeyword() {
        const startLine = this.line;
        const startCol = this.column;
        let text = '';
        while (!this.isAtEnd() && this.isIdentifierPart(this.peek())) {
            text += this.advance();
        }
        const keywordType = Lexer.KEYWORDS[text];
        if (keywordType !== undefined) {
            const val = keywordType === TokenType_1.TokenType.BOOLEAN_TRUE ? true : keywordType === TokenType_1.TokenType.BOOLEAN_FALSE ? false : text;
            return new Token_1.Token(keywordType, val, startLine, startCol, text.length);
        }
        return new Token_1.Token(TokenType_1.TokenType.IDENTIFIER, text, startLine, startCol, text.length);
    }
    readNumber() {
        const startLine = this.line;
        const startCol = this.column;
        let text = '';
        while (!this.isAtEnd() && this.isDigit(this.peek())) {
            text += this.advance();
        }
        // Floating point
        if (this.peek() === '.' && this.isDigit(this.peekNext())) {
            text += this.advance(); // consume '.'
            while (!this.isAtEnd() && this.isDigit(this.peek())) {
                text += this.advance();
            }
        }
        const value = parseFloat(text);
        return new Token_1.Token(TokenType_1.TokenType.NUMBER, value, startLine, startCol, text.length);
    }
    readString() {
        const startLine = this.line;
        const startCol = this.column;
        this.advance(); // consume opening quote
        let result = '';
        while (!this.isAtEnd() && this.peek() !== '"') {
            if (this.peek() === '\n') {
                throw new DiagnosticError_1.DiagnosticError(`Unterminated string literal at line ${startLine}, column ${startCol}.`, startLine, startCol, this.column - startCol);
            }
            if (this.peek() === '\\') {
                this.advance(); // consume backslash
                if (this.isAtEnd()) {
                    throw new DiagnosticError_1.DiagnosticError(`Unterminated escape sequence in string literal at line ${startLine}, column ${startCol}.`, startLine, startCol, 1);
                }
                const esc = this.advance();
                switch (esc) {
                    case 'n':
                        result += '\n';
                        break;
                    case 't':
                        result += '\t';
                        break;
                    case 'r':
                        result += '\r';
                        break;
                    case '"':
                        result += '"';
                        break;
                    case '\\':
                        result += '\\';
                        break;
                    default:
                        result += esc;
                        break;
                }
            }
            else {
                result += this.advance();
            }
        }
        if (this.isAtEnd()) {
            throw new DiagnosticError_1.DiagnosticError(`Unterminated string literal at line ${startLine}, column ${startCol}.`, startLine, startCol, this.column - startCol);
        }
        this.advance(); // consume closing quote
        const length = (this.line === startLine) ? (this.column - startCol) : (result.length + 2);
        return new Token_1.Token(TokenType_1.TokenType.STRING, result, startLine, startCol, length);
    }
}
exports.Lexer = Lexer;
//# sourceMappingURL=Lexer.js.map