import { Token } from '../lexer/Token';
import { TokenType } from '../lexer/TokenType';
import { DiagnosticError } from '../errors/DiagnosticError';
import {
  Program,
  Statement,
  VariableDeclaration,
  AssignmentStatement,
  PrintStatement,
  WhileStatement,
  BlockStatement,
  Expression,
  BinaryExpression,
  UnaryExpression,
  Literal,
  Identifier
} from '../ast/AST';

export class Parser {
  private readonly tokens: Token[];
  private current: number = 0;

  constructor(tokens: Token[]) {
    this.tokens = tokens;
  }

  public parse(): Program {
    const startToken = this.peek();
    const statements: Statement[] = [];

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

  private statement(): Statement {
    if (this.match(TokenType.KEYWORD_VAR)) {
      return this.variableDeclaration(this.previous());
    }

    if (this.match(TokenType.KEYWORD_WHILE)) {
      return this.whileStatement(this.previous());
    }

    if (this.match(TokenType.KEYWORD_PRINT)) {
      return this.printStatement(this.previous());
    }

    if (this.match(TokenType.LBRACE)) {
      return this.blockStatement(this.previous());
    }

    if (this.check(TokenType.IDENTIFIER)) {
      return this.assignmentStatement();
    }

    const token = this.peek();
    throw new DiagnosticError(
      `Syntax error: Unexpected token '${token.value ?? token.type}' at line ${token.line}, column ${token.column}.`,
      token.line,
      token.column,
      token.length
    );
  }

  private variableDeclaration(keywordToken: Token): VariableDeclaration {
    const identifiers: Identifier[] = [];

    do {
      if (!this.check(TokenType.IDENTIFIER)) {
        const token = this.peek();
        throw new DiagnosticError(
          `Syntax error: Expected variable name at line ${token.line}, column ${token.column}.`,
          token.line,
          token.column,
          token.length || 1
        );
      }
      const idToken = this.advance();
      identifiers.push({
        type: 'Identifier',
        name: idToken.value,
        line: idToken.line,
        column: idToken.column,
        length: idToken.length
      });
    } while (this.match(TokenType.COMMA));

    this.consume(TokenType.SEMICOLON, "Expected ';' after variable declaration");

    return {
      type: 'VariableDeclaration',
      identifiers,
      line: keywordToken.line,
      column: keywordToken.column,
      length: this.previous().column + this.previous().length - keywordToken.column
    };
  }

  private assignmentStatement(): AssignmentStatement {
    const idToken = this.advance(); // consume identifier
    const identifier: Identifier = {
      type: 'Identifier',
      name: idToken.value,
      line: idToken.line,
      column: idToken.column,
      length: idToken.length
    };

    this.consume(TokenType.ASSIGN, `Expected '=' after variable '${identifier.name}'`);
    const expr = this.expression();
    this.consume(TokenType.SEMICOLON, "Expected ';' after assignment");

    return {
      type: 'AssignmentStatement',
      identifier,
      value: expr,
      line: idToken.line,
      column: idToken.column,
      length: this.previous().column + this.previous().length - idToken.column
    };
  }

  private printStatement(keywordToken: Token): PrintStatement {
    this.consume(TokenType.LPAREN, "Expected '(' after 'وري'");
    const expr = this.expression();
    this.consume(TokenType.RPAREN, "Expected ')' after expression in 'وري'");
    this.consume(TokenType.SEMICOLON, "Expected ';' after 'وري(...)'");

    return {
      type: 'PrintStatement',
      expression: expr,
      line: keywordToken.line,
      column: keywordToken.column,
      length: this.previous().column + this.previous().length - keywordToken.column
    };
  }

  private whileStatement(keywordToken: Token): WhileStatement {
    this.consume(TokenType.LPAREN, "Expected '(' after 'مدام'");
    const condition = this.expression();
    this.consume(TokenType.RPAREN, "Expected ')' after condition in 'مدام'");

    if (!this.check(TokenType.LBRACE)) {
      const token = this.peek();
      throw new DiagnosticError(
        `Syntax error: Expected '{' to start while loop body at line ${token.line}, column ${token.column}.`,
        token.line,
        token.column,
        token.length || 1
      );
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

  private blockStatement(lbraceToken: Token): BlockStatement {
    const statements: Statement[] = [];

    while (!this.check(TokenType.RBRACE) && !this.isAtEnd()) {
      statements.push(this.statement());
    }

    this.consume(TokenType.RBRACE, "Expected '}' at the end of block");

    return {
      type: 'BlockStatement',
      statements,
      line: lbraceToken.line,
      column: lbraceToken.column,
      length: this.previous().column + this.previous().length - lbraceToken.column
    };
  }

  // --- Expressions (Precedence climbing) ---

  public expression(): Expression {
    return this.logicalOr();
  }

  private logicalOr(): Expression {
    let expr = this.logicalAnd();

    while (this.match(TokenType.OR)) {
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

  private logicalAnd(): Expression {
    let expr = this.equality();

    while (this.match(TokenType.AND)) {
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

  private equality(): Expression {
    let expr = this.comparison();

    while (this.match(TokenType.EQUAL, TokenType.NOT_EQUAL)) {
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

  private comparison(): Expression {
    let expr = this.term();

    while (this.match(TokenType.LESS, TokenType.LESS_EQUAL, TokenType.GREATER, TokenType.GREATER_EQUAL)) {
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

  private term(): Expression {
    let expr = this.factor();

    while (this.match(TokenType.PLUS, TokenType.MINUS)) {
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

  private factor(): Expression {
    let expr = this.unary();

    while (this.match(TokenType.STAR, TokenType.SLASH)) {
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

  private unary(): Expression {
    if (this.match(TokenType.NOT, TokenType.MINUS)) {
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

  private primary(): Expression {
    const token = this.peek();

    if (this.match(TokenType.NUMBER)) {
      return {
        type: 'Literal',
        value: token.value,
        line: token.line,
        column: token.column,
        length: token.length
      };
    }

    if (this.match(TokenType.STRING)) {
      return {
        type: 'Literal',
        value: token.value,
        line: token.line,
        column: token.column,
        length: token.length
      };
    }

    if (this.match(TokenType.BOOLEAN_TRUE)) {
      return {
        type: 'Literal',
        value: true,
        line: token.line,
        column: token.column,
        length: token.length
      };
    }

    if (this.match(TokenType.BOOLEAN_FALSE)) {
      return {
        type: 'Literal',
        value: false,
        line: token.line,
        column: token.column,
        length: token.length
      };
    }

    if (this.match(TokenType.IDENTIFIER)) {
      return {
        type: 'Identifier',
        name: token.value,
        line: token.line,
        column: token.column,
        length: token.length
      };
    }

    if (this.match(TokenType.LPAREN)) {
      const expr = this.expression();
      this.consume(TokenType.RPAREN, "Expected ')' after expression");
      return expr;
    }

    throw new DiagnosticError(
      `Syntax error: Unexpected token '${token.value ?? token.type}' where an expression was expected at line ${token.line}, column ${token.column}.`,
      token.line,
      token.column,
      token.length || 1
    );
  }

  private ensureExpressionFollows(opToken: Token): void {
    if (
      this.isAtEnd() ||
      this.check(TokenType.RPAREN) ||
      this.check(TokenType.SEMICOLON) ||
      this.check(TokenType.RBRACE) ||
      this.check(TokenType.COMMA)
    ) {
      const errorCol = opToken.column + opToken.length;
      throw new DiagnosticError(
        `Syntax error: Expected expression after '${opToken.value}' at line ${opToken.line}, column ${errorCol}.`,
        opToken.line,
        errorCol,
        1
      );
    }
  }

  // --- Helper Methods ---

  private match(...types: TokenType[]): boolean {
    for (const type of types) {
      if (this.check(type)) {
        this.advance();
        return true;
      }
    }
    return false;
  }

  private check(type: TokenType): boolean {
    if (this.isAtEnd()) return false;
    return this.peek().type === type;
  }

  private advance(): Token {
    if (!this.isAtEnd()) this.current++;
    return this.previous();
  }

  private isAtEnd(): boolean {
    return this.peek().type === TokenType.EOF;
  }

  private peek(): Token {
    return this.tokens[this.current] || this.tokens[this.tokens.length - 1];
  }

  private previous(): Token {
    return this.tokens[this.current - 1];
  }

  private consume(type: TokenType, message: string): Token {
    if (this.check(type)) return this.advance();

    const token = this.peek();
    throw new DiagnosticError(
      `Syntax error: ${message} at line ${token.line}, column ${token.column}.`,
      token.line,
      token.column,
      token.length || 1
    );
  }
}
