import { Lexer } from './lexer/Lexer';
import { Parser } from './parser/Parser';
import { Interpreter, InterpreterOptions } from './interpreter/Interpreter';
import { SemanticAnalyzer } from './analyzer/SemanticAnalyzer';
import { DiagnosticError } from './errors/DiagnosticError';
import { Token } from './lexer/Token';
import { TokenType } from './lexer/TokenType';
import { Program } from './ast/AST';

export * from './lexer/TokenType';
export * from './lexer/Token';
export * from './lexer/Lexer';
export * from './ast/AST';
export * from './parser/Parser';
export * from './interpreter/Environment';
export * from './interpreter/Interpreter';
export * from './analyzer/SemanticAnalyzer';
export * from './errors/DiagnosticError';

export interface RunResult {
  output: string[];
  error?: DiagnosticError;
}

export function tokenize(source: string): Token[] {
  const lexer = new Lexer(source);
  return lexer.tokenize();
}

export function parse(source: string): Program {
  const tokens = tokenize(source);
  const parser = new Parser(tokens);
  return parser.parse();
}

export function validate(source: string): DiagnosticError[] {
  try {
    const tokens = tokenize(source);
    const parser = new Parser(tokens);
    const ast = parser.parse();
    const analyzer = new SemanticAnalyzer();
    return analyzer.analyze(ast);
  } catch (err: any) {
    if (err instanceof DiagnosticError) {
      return [err];
    }
    return [new DiagnosticError(err.message || 'Unknown error', 1, 1, 1)];
  }
}

export function run(source: string, options: InterpreterOptions = {}): RunResult {
  const logs: string[] = [];
  const capturePrint = (msg: string) => {
    logs.push(msg);
    if (options.onPrint) {
      options.onPrint(msg);
    }
  };

  try {
    const tokens = tokenize(source);
    const parser = new Parser(tokens);
    const ast = parser.parse();
    const interpreter = new Interpreter({
      ...options,
      onPrint: capturePrint
    });
    interpreter.execute(ast);
    return { output: logs };
  } catch (err: any) {
    if (err instanceof DiagnosticError) {
      return { output: logs, error: err };
    }
    const fallbackErr = new DiagnosticError(err.message || String(err), 1, 1, 1);
    return { output: logs, error: fallbackErr };
  }
}
