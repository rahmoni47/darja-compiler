import { TokenType } from './TokenType';

export interface SourceLocation {
  line: number;      // 1-indexed
  column: number;    // 1-indexed
  length: number;
}

export class Token {
  constructor(
    public readonly type: TokenType,
    public readonly value: any,
    public readonly line: number,
    public readonly column: number,
    public readonly length: number
  ) {}

  public toString(): string {
    return `Token(${this.type}, ${JSON.stringify(this.value)}, line ${this.line}, col ${this.column})`;
  }
}
