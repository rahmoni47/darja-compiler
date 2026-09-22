"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Parser = void 0;
const TokenType_1 = require("../lexer/TokenType");
const DiagnosticError_1 = require("../errors/DiagnosticError");
class Parser {
    tokens;
    current = 0;
    constructor(tokens) {
        this.tokens = tokens;
    }
    parse() {
        const startToken = this.peek();
        const statements = [];
        while (!this.isAtEnd()) {
            statements.push(this.statement());
        }
        return {
            type: 'Program',
            body: statements,
            line: startToken.line,
            column: startToken.column,
            length: 0
        };
    }
    // --- Statements ---
    statement() {
        if (this.match(TokenType_1.TokenType.KEYWORD_VAR)) {
            return this.variableDeclaration(this.previous());
        }
        if (this.match(TokenType_1.TokenType.KEYWORD_WHILE)) {
            return this.whileStatement(this.previous());
        }
        if (this.match(TokenType_1.TokenType.KEYWORD_PRINT)) {
            return this.printStatement(this.previous());
        }
        if (this.match(TokenType_1.TokenType.LBRACE)) {
            return this.blockStatement(this.previous());
        }
        if (this.check(TokenType_1.TokenType.IDENTIFIER)) {
            return this.assignmentStatement();
        }
        const token = this.peek();
        throw new DiagnosticError_1.DiagnosticError(`Syntax error: Unexpected token '${token.value ?? token.type}' at line ${token.line}, column ${token.column}.`, token.line, token.column, token.length);
    }
    variableDeclaration(keywordToken) {
        const identifiers = [];
        do {
            if (!this.check(TokenType_1.TokenType.IDENTIFIER)) {
                const token = this.peek();
                throw new DiagnosticError_1.DiagnosticError(`Syntax error: Expected variable name at line ${token.line}, column ${token.column}.`, token.line, token.column, token.length || 1);
            }
            const idToken = this.advance();
            identifiers.push({
                type: 'Identifier',
                name: idToken.value,
                line: idToken.line,
                column: idToken.column,
                length: idToken.length
            });
        } while (this.match(TokenType_1.TokenType.COMMA));
        this.consume(TokenType_1.TokenType.SEMICOLON, "Expected ';' after variable declaration");
        return {
            type: 'VariableDeclaration',
            identifiers,
            line: keywordToken.line,
            column: keywordToken.column,
            length: this.previous().column + this.previous().length - keywordToken.column
        };
    }
    assignmentStatement() {
        const idToken = this.advance(); // consume identifier
        const identifier = {
            type: 'Identifier',
            name: idToken.value,
            line: idToken.line,
            column: idToken.column,
            length: idToken.length
        };
        this.consume(TokenType_1.TokenType.ASSIGN, `Expected '=' after variable '${identifier.name}'`);
        const expr = this.expression();
        this.consume(TokenType_1.TokenType.SEMICOLON, "Expected ';' after assignment");
        return {
            type: 'AssignmentStatement',
            identifier,
            value: expr,
            line: idToken.line,
            column: idToken.column,
            length: this.previous().column + this.previous().length - idToken.column
        };
    }
    printStatement(keywordToken) {
        this.consume(TokenType_1.TokenType.LPAREN, "Expected '(' after 'وري'");
        const expr = this.expression();
        this.consume(TokenType_1.TokenType.RPAREN, "Expected ')' after expression in 'وري'");
        this.consume(TokenType_1.TokenType.SEMICOLON, "Expected ';' after 'وري(...)'");
        return {
            type: 'PrintStatement',
            expression: expr,
            line: keywordToken.line,
            column: keywordToken.column,
            length: this.previous().column + this.previous().length - keywordToken.column
        };
    }
    whileStatement(keywordToken) {
        this.consume(TokenType_1.TokenType.LPAREN, "Expected '(' after 'مدام'");
        const condition = this.expression();
        this.consume(TokenType_1.TokenType.RPAREN, "Expected ')' after condition in 'مدام'");
        if (!this.check(TokenType_1.TokenType.LBRACE)) {
            const token = this.peek();
            throw new DiagnosticError_1.DiagnosticError(`Syntax error: Expected '{' to start while loop body at line ${token.line}, column ${token.column}.`, token.line, token.column, token.length || 1);
        }
        const lbrace = this.advance();
        const body = this.blockStatement(lbrace);
        return {
            type: 'WhileStatement',
            condition,
            body,
            line: keywordToken.line,
            column: keywordToken.column,
            length: body.column + body.length - keywordToken.column
        };
    }
    blockStatement(lbraceToken) {
        const statements = [];
        while (!this.check(TokenType_1.TokenType.RBRACE) && !this.isAtEnd()) {
            statements.push(this.statement());
        }
        this.consume(TokenType_1.TokenType.RBRACE, "Expected '}' at the end of block");
        return {
            type: 'BlockStatement',
            statements,
            line: lbraceToken.line,
            column: lbraceToken.column,
            length: this.previous().column + this.previous().length - lbraceToken.column
        };
    }
    // --- Expressions (Precedence climbing) ---
    expression() {
        return this.logicalOr();
    }
    logicalOr() {
        let expr = this.logicalAnd();
        while (this.match(TokenType_1.TokenType.OR)) {
            const opToken = this.previous();
            this.ensureExpressionFollows(opToken);
            const right = this.logicalAnd();
            expr = {
                type: 'BinaryExpression',
                operator: opToken.value,
                left: expr,
                right,
                line: expr.line,
                column: expr.column,
                length: right.column + right.length - expr.column
            };
        }
        return expr;
    }
    logicalAnd() {
        let expr = this.equality();
        while (this.match(TokenType_1.TokenType.AND)) {
            const opToken = this.previous();
            this.ensureExpressionFollows(opToken);
            const right = this.equality();
            expr = {
                type: 'BinaryExpression',
                operator: opToken.value,
                left: expr,
                right,
                line: expr.line,
                column: expr.column,
                length: right.column + right.length - expr.column
            };
        }
        return expr;
    }
    equality() {
        let expr = this.comparison();
        while (this.match(TokenType_1.TokenType.EQUAL, TokenType_1.TokenType.NOT_EQUAL)) {
            const opToken = this.previous();
            this.ensureExpressionFollows(opToken);
            const right = this.comparison();
            expr = {
                type: 'BinaryExpression',
                operator: opToken.value,
                left: expr,
                right,
                line: expr.line,
                column: expr.column,
                length: right.column + right.length - expr.column
            };
        }
        return expr;
    }
    comparison() {
        let expr = this.term();
        while (this.match(TokenType_1.TokenType.LESS, TokenType_1.TokenType.LESS_EQUAL, TokenType_1.TokenType.GREATER, TokenType_1.TokenType.GREATER_EQUAL)) {
            const opToken = this.previous();
            this.ensureExpressionFollows(opToken);
            const right = this.term();
            expr = {
                type: 'BinaryExpression',
                operator: opToken.value,
                left: expr,
                right,
                line: expr.line,
                column: expr.column,
                length: right.column + right.length - expr.column
            };
        }
        return expr;
    }
    term() {
        let expr = this.factor();
        while (this.match(TokenType_1.TokenType.PLUS, TokenType_1.TokenType.MINUS)) {
            const opToken = this.previous();
            this.ensureExpressionFollows(opToken);
            const right = this.factor();
            expr = {
                type: 'BinaryExpression',
                operator: opToken.value,
                left: expr,
                right,
                line: expr.line,
                column: expr.column,
                length: right.column + right.length - expr.column
            };
        }
        return expr;
    }
    factor() {
        let expr = this.unary();
        while (this.match(TokenType_1.TokenType.STAR, TokenType_1.TokenType.SLASH)) {
            const opToken = this.previous();
            this.ensureExpressionFollows(opToken);
            const right = this.unary();
            expr = {
                type: 'BinaryExpression',
                operator: opToken.value,
                left: expr,
                right,
                line: expr.line,
                column: expr.column,
                length: right.column + right.length - expr.column
            };
        }
        return expr;
    }
    unary() {
        if (this.match(TokenType_1.TokenType.NOT, TokenType_1.TokenType.MINUS)) {
            const opToken = this.previous();
            this.ensureExpressionFollows(opToken);
            const argument = this.unary();
            return {
                type: 'UnaryExpression',
                operator: opToken.value,
                argument,
                line: opToken.line,
                column: opToken.column,
                length: argument.column + argument.length - opToken.column
            };
        }
        return this.primary();
    }
    primary() {
        const token = this.peek();
        if (this.match(TokenType_1.TokenType.NUMBER)) {
            return {
                type: 'Literal',
                value: token.value,
                line: token.line,
                column: token.column,
                length: token.length
            };
        }
        if (this.match(TokenType_1.TokenType.STRING)) {
            return {
                type: 'Literal',
                value: token.value,
                line: token.line,
                column: token.column,
                length: token.length
            };
        }
        if (this.match(TokenType_1.TokenType.BOOLEAN_TRUE)) {
            return {
                type: 'Literal',
                value: true,
                line: token.line,
                column: token.column,
                length: token.length
            };
        }
        if (this.match(TokenType_1.TokenType.BOOLEAN_FALSE)) {
            return {
                type: 'Literal',
                value: false,
                line: token.line,
                column: token.column,
                length: token.length
            };
        }
        if (this.match(TokenType_1.TokenType.IDENTIFIER)) {
            return {
                type: 'Identifier',
                name: token.value,
                line: token.line,
                column: token.column,
                length: token.length
            };
        }
        if (this.match(TokenType_1.TokenType.LPAREN)) {
            const expr = this.expression();
            this.consume(TokenType_1.TokenType.RPAREN, "Expected ')' after expression");
            return expr;
        }
        throw new DiagnosticError_1.DiagnosticError(`Syntax error: Unexpected token '${token.value ?? token.type}' where an expression was expected at line ${token.line}, column ${token.column}.`, token.line, token.column, token.length || 1);
    }
    ensureExpressionFollows(opToken) {
        if (this.isAtEnd() ||
            this.check(TokenType_1.TokenType.RPAREN) ||
            this.check(TokenType_1.TokenType.SEMICOLON) ||
            this.check(TokenType_1.TokenType.RBRACE) ||
            this.check(TokenType_1.TokenType.COMMA)) {
            const errorCol = opToken.column + opToken.length;
            throw new DiagnosticError_1.DiagnosticError(`Syntax error: Expected expression after '${opToken.value}' at line ${opToken.line}, column ${errorCol}.`, opToken.line, errorCol, 1);
        }
    }
    // --- Helper Methods ---
    match(...types) {
        for (const type of types) {
            if (this.check(type)) {
                this.advance();
                return true;
            }
        }
        return false;
    }
    check(type) {
        if (this.isAtEnd())
            return false;
        return this.peek().type === type;
    }
    advance() {
        if (!this.isAtEnd())
            this.current++;
        return this.previous();
    }
    isAtEnd() {
        return this.peek().type === TokenType_1.TokenType.EOF;
    }
    peek() {
        return this.tokens[this.current] || this.tokens[this.tokens.length - 1];
    }
    previous() {
        return this.tokens[this.current - 1];
    }
    consume(type, message) {
        if (this.check(type))
            return this.advance();
        const token = this.peek();
        throw new DiagnosticError_1.DiagnosticError(`Syntax error: ${message} at line ${token.line}, column ${token.column}.`, token.line, token.column, token.length || 1);
    }
}
exports.Parser = Parser;
//# sourceMappingURL=Parser.js.map