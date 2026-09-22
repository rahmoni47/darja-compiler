import {
  Program,
  Statement,
  Expression,
  VariableDeclaration,
  AssignmentStatement,
  PrintStatement,
  WhileStatement,
  BlockStatement,
  BinaryExpression,
  UnaryExpression,
  Identifier
} from '../ast/AST';
import { DiagnosticError } from '../errors/DiagnosticError';

export class SemanticAnalyzer {
  private declaredVariables: Set<string> = new Set();
  private errors: DiagnosticError[] = [];

  public analyze(program: Program): DiagnosticError[] {
    this.declaredVariables.clear();
    this.errors = [];

    // Pre-declare variables or traverse sequentially
    for (const stmt of program.body) {
      this.analyzeStatement(stmt);
    }

    return this.errors;
  }

  private analyzeStatement(stmt: Statement): void {
    switch (stmt.type) {
      case 'VariableDeclaration':
        for (const id of stmt.identifiers) {
          this.declaredVariables.add(id.name);
        }
        break;

      case 'AssignmentStatement':
        if (!this.declaredVariables.has(stmt.identifier.name)) {
          this.errors.push(
            new DiagnosticError(
              `Variable '${stmt.identifier.name}' is not declared.`,
              stmt.identifier.line,
              stmt.identifier.column,
              stmt.identifier.length
            )
          );
        }
        this.analyzeExpression(stmt.value);
        break;

      case 'PrintStatement':
        this.analyzeExpression(stmt.expression);
        break;

      case 'WhileStatement':
        this.analyzeExpression(stmt.condition);
        this.analyzeBlock(stmt.body);
        break;

      case 'BlockStatement':
        this.analyzeBlock(stmt);
        break;
    }
  }

  private analyzeBlock(block: BlockStatement): void {
    for (const stmt of block.statements) {
      this.analyzeStatement(stmt);
    }
  }

  private analyzeExpression(expr: Expression): void {
    switch (expr.type) {
      case 'Identifier':
        if (!this.declaredVariables.has(expr.name)) {
          this.errors.push(
            new DiagnosticError(
              `Variable '${expr.name}' is not declared.`,
              expr.line,
              expr.column,
              expr.length
            )
          );
        }
        break;

      case 'BinaryExpression':
        this.analyzeExpression(expr.left);
        this.analyzeExpression(expr.right);
        break;

      case 'UnaryExpression':
        this.analyzeExpression(expr.argument);
        break;

      case 'Literal':
        break;
    }
  }
}
