"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TokenType = void 0;
var TokenType;
(function (TokenType) {
    // Keywords
    TokenType["KEYWORD_VAR"] = "KEYWORD_VAR";
    TokenType["KEYWORD_WHILE"] = "KEYWORD_WHILE";
    TokenType["KEYWORD_PRINT"] = "KEYWORD_PRINT";
    TokenType["BOOLEAN_TRUE"] = "BOOLEAN_TRUE";
    TokenType["BOOLEAN_FALSE"] = "BOOLEAN_FALSE";
    // Literals & Identifiers
    TokenType["IDENTIFIER"] = "IDENTIFIER";
    TokenType["NUMBER"] = "NUMBER";
    TokenType["STRING"] = "STRING";
    // Operators
    TokenType["ASSIGN"] = "ASSIGN";
    TokenType["PLUS"] = "PLUS";
    TokenType["MINUS"] = "MINUS";
    TokenType["STAR"] = "STAR";
    TokenType["SLASH"] = "SLASH";
    // Comparisons
    TokenType["EQUAL"] = "EQUAL";
    TokenType["NOT_EQUAL"] = "NOT_EQUAL";
    TokenType["LESS"] = "LESS";
    TokenType["LESS_EQUAL"] = "LESS_EQUAL";
    TokenType["GREATER"] = "GREATER";
    TokenType["GREATER_EQUAL"] = "GREATER_EQUAL";
    // Logical
    TokenType["AND"] = "AND";
    TokenType["OR"] = "OR";
    TokenType["NOT"] = "NOT";
    // Delimiters
    TokenType["LPAREN"] = "LPAREN";
    TokenType["RPAREN"] = "RPAREN";
    TokenType["LBRACE"] = "LBRACE";
    TokenType["RBRACE"] = "RBRACE";
    TokenType["COMMA"] = "COMMA";
    TokenType["SEMICOLON"] = "SEMICOLON";
    TokenType["EOF"] = "EOF";
})(TokenType || (exports.TokenType = TokenType = {}));
//# sourceMappingURL=TokenType.js.map