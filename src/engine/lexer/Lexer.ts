import { Token } from './Token';
import { TokenType } from './TokenType';
import { DiagnosticError } from '../errors/DiagnosticError';

export class Lexer {
  private readonly source: string;
  private position: number = 0;
  private line: number = 1;
  private column: number = 1;

  private static readonly KEYWORDS: Record<string, TokenType> = {
    'كاش_كاين': TokenType.KEYWORD_VAR,
    'مدام': TokenType.KEYWORD_WHILE,
    'وري': TokenType.KEYWORD_PRINT,
    'صح': TokenType.BOOLEAN_TRUE,
    'غلط': TokenType.BOOLEAN_FALSE
  };

  constructor(source: string) {
    this.source = source;
  }

  public tokenize(): Token[] {
    const tokens: Token[] = [];

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
        tokens.push(new Token(TokenType.EQUAL, '==', startLine, startCol, 2));
      } else if (twoChar === '!=') {
        this.advance(2);
        tokens.push(new Token(TokenType.NOT_EQUAL, '!=', startLine, startCol, 2));
      } else if (twoChar === '<=') {
        this.advance(2);
        tokens.push(new Token(TokenType.LESS_EQUAL, '<=', startLine, startCol, 2));
      } else if (twoChar === '>=') {
        this.advance(2);
        tokens.push(new Token(TokenType.GREATER_EQUAL, '>=', startLine, startCol, 2));
      } else if (twoChar === '&&') {
        this.advance(2);
        tokens.push(new Token(TokenType.AND, '&&', startLine, startCol, 2));
      } else if (twoChar === '||') {
        this.advance(2);
        tokens.push(new Token(TokenType.OR, '||', startLine, startCol, 2));
      } else if (ch === '=') {
        this.advance(1);
        tokens.push(new Token(TokenType.ASSIGN, '=', startLine, startCol, 1));
      } else if (ch === '<') {
        this.advance(1);
        tokens.push(new Token(TokenType.LESS, '<', startLine, startCol, 1));
      } else if (ch === '>') {
        this.advance(1);
        tokens.push(new Token(TokenType.GREATER, '>', startLine, startCol, 1));
      } else if (ch === '+') {
        this.advance(1);
        tokens.push(new Token(TokenType.PLUS, '+', startLine, startCol, 1));
      } else if (ch === '-') {
        this.advance(1);
        tokens.push(new Token(TokenType.MINUS, '-', startLine, startCol, 1));
      } else if (ch === '*') {
        this.advance(1);
        tokens.push(new Token(TokenType.STAR, '*', startLine, startCol, 1));
      } else if (ch === '/') {
        this.advance(1);
        tokens.push(new Token(TokenType.SLASH, '/', startLine, startCol, 1));
      } else if (ch === '!') {
        this.advance(1);
        tokens.push(new Token(TokenType.NOT, '!', startLine, startCol, 1));
      } else if (ch === '(') {
        this.advance(1);
        tokens.push(new Token(TokenType.LPAREN, '(', startLine, startCol, 1));
      } else if (ch === ')') {
        this.advance(1);
        tokens.push(new Token(TokenType.RPAREN, ')', startLine, startCol, 1));
      } else if (ch === '{') {
        this.advance(1);
        tokens.push(new Token(TokenType.LBRACE, '{', startLine, startCol, 1));
      } else if (ch === '}') {
        this.advance(1);
        tokens.push(new Token(TokenType.RBRACE, '}', startLine, startCol, 1));
      } else if (ch === ',') {
        this.advance(1);
        tokens.push(new Token(TokenType.COMMA, ',', startLine, startCol, 1));
      } else if (ch === ';') {
        this.advance(1);
        tokens.push(new Token(TokenType.SEMICOLON, ';', startLine, startCol, 1));
      } else {
        throw new DiagnosticError(
          `Unexpected character '${ch}' at line ${startLine}, column ${startCol}.`,
          startLine,
          startCol,
          1
        );
      }
    }

    tokens.push(new Token(TokenType.EOF, null, this.line, this.column, 0));
    return tokens;
  }

  private isAtEnd(): boolean {
    return this.position >= this.source.length;
  }

  private peek(): string {
    return this.source[this.position] || '\0';
  }

  private peekNext(): string {
    return this.source[this.position + 1] || '\0';
  }

  private advance(count: number = 1): string {
    let result = '';
    for (let i = 0; i < count; i++) {
      if (this.position < this.source.length) {
        const char = this.source[this.position];
        result += char;
        this.position++;
        if (char === '\n') {
          this.line++;
          this.column = 1;
        } else {
          this.column++;
        }
      }
    }
    return result;
  }

  private skipWhitespaceAndComments(): void {
    while (!this.isAtEnd()) {
      const ch = this.peek();
      if (ch === ' ' || ch === '\t' || ch === '\r' || ch === '\n') {
        this.advance();
      } else if (ch === '/' && this.peekNext() === '/') {
        // Single-line comment
        this.advance(2);
        while (!this.isAtEnd() && this.peek() !== '\n') {
          this.advance();
        }
      } else {
        break;
      }
    }
  }

  private isIdentifierStart(ch: string): boolean {
    return /^[\p{L}_]$/u.test(ch);
  }

  private isIdentifierPart(ch: string): boolean {
    return /^[\p{L}\p{N}_]$/u.test(ch);
  }

  private isDigit(ch: string): boolean {
    return /^[0-9]$/.test(ch);
  }

  private readIdentifierOrKeyword(): Token {
    const startLine = this.line;
    const startCol = this.column;
    let text = '';

    while (!this.isAtEnd() && this.isIdentifierPart(this.peek())) {
      text += this.advance();
    }

    const keywordType = Lexer.KEYWORDS[text];
    if (keywordType !== undefined) {
      const val = keywordType === TokenType.BOOLEAN_TRUE ? true : keywordType === TokenType.BOOLEAN_FALSE ? false : text;
      return new Token(keywordType, val, startLine, startCol, text.length);
    }

    return new Token(TokenType.IDENTIFIER, text, startLine, startCol, text.length);
  }

  private readNumber(): Token {
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
    return new Token(TokenType.NUMBER, value, startLine, startCol, text.length);
  }

  private readString(): Token {
    const startLine = this.line;
    const startCol = this.column;
    this.advance(); // consume opening quote

    let result = '';
    while (!this.isAtEnd() && this.peek() !== '"') {
      if (this.peek() === '\n') {
        throw new DiagnosticError(
          `Unterminated string literal at line ${startLine}, column ${startCol}.`,
          startLine,
          startCol,
          this.column - startCol
        );
      }

      if (this.peek() === '\\') {
        this.advance(); // consume backslash
        if (this.isAtEnd()) {
          throw new DiagnosticError(
            `Unterminated escape sequence in string literal at line ${startLine}, column ${startCol}.`,
            startLine,
            startCol,
            1
          );
        }
        const esc = this.advance();
        switch (esc) {
          case 'n': result += '\n'; break;
          case 't': result += '\t'; break;
          case 'r': result += '\r'; break;
          case '"': result += '"'; break;
          case '\\': result += '\\'; break;
          default: result += esc; break;
        }
      } else {
        result += this.advance();
      }
    }

    if (this.isAtEnd()) {
      throw new DiagnosticError(
        `Unterminated string literal at line ${startLine}, column ${startCol}.`,
        startLine,
        startCol,
        this.column - startCol
      );
    }

    this.advance(); // consume closing quote
    const length = (this.line === startLine) ? (this.column - startCol) : (result.length + 2);
    return new Token(TokenType.STRING, result, startLine, startCol, length);
  }
}
