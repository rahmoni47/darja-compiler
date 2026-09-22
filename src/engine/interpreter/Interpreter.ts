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
import { Environment } from './Environment';
import { DiagnosticError } from '../errors/DiagnosticError';

export interface InterpreterOptions {
  onPrint?: (text: string) => void;
  maxLoopIterations?: number;
}

export class Interpreter {
  private globalEnvironment: Environment;
  private currentEnvironment: Environment;
  private onPrint: (text: string) => void;
  private maxLoopIterations: number;

  constructor(options: InterpreterOptions = {}) {
    this.globalEnvironment = new Environment();
    this.currentEnvironment = this.globalEnvironment;
    this.onPrint = options.onPrint ?? ((text: string) => console.log(text));
    this.maxLoopIterations = options.maxLoopIterations ?? 50000;
  }

  public execute(program: Program): void {
    for (const stmt of program.body) {
      this.executeStatement(stmt);
    }
  }

  private executeStatement(stmt: Statement): void {
    switch (stmt.type) {
      case 'VariableDeclaration':
        this.executeVariableDeclaration(stmt);
        break;
      case 'AssignmentStatement':
        this.executeAssignmentStatement(stmt);
        break;
      case 'PrintStatement':
        this.executePrintStatement(stmt);
        break;
      case 'WhileStatement':
        this.executeWhileStatement(stmt);
        break;
      case 'BlockStatement':
        this.executeBlockStatement(stmt);
        break;
      default: {
        const node = stmt as any;
        throw new DiagnosticError(
          `Unknown statement type: ${node.type}`,
          node.line ?? 1,
          node.column ?? 1,
          node.length ?? 1
        );
      }
    }
  }

  private executeVariableDeclaration(stmt: VariableDeclaration): void {
    for (const id of stmt.identifiers) {
      this.currentEnvironment.declare(id.name);
    }
  }

  private executeAssignmentStatement(stmt: AssignmentStatement): void {
    const value = this.evaluateExpression(stmt.value);
    this.currentEnvironment.assign(
      stmt.identifier.name,
      value,
      stmt.identifier.line,
      stmt.identifier.column,
      stmt.identifier.length
    );
  }

  private executePrintStatement(stmt: PrintStatement): void {
    const value = this.evaluateExpression(stmt.expression);
    let output: string;

    if (value === true) {
      output = 'صح';
    } else if (value === false) {
      output = 'غلط';
    } else if (value === null || value === undefined) {
      output = 'والو';
    } else {
      output = String(value);
    }

    this.onPrint(output);
  }

  private executeWhileStatement(stmt: WhileStatement): void {
    let iterations = 0;

    while (this.isTruthy(this.evaluateExpression(stmt.condition))) {
      iterations++;
      if (iterations > this.maxLoopIterations) {
        throw new DiagnosticError(
          `Runtime error: Maximum loop iterations (${this.maxLoopIterations}) exceeded. Possible infinite loop detected.`,
          stmt.line,
          stmt.column,
          stmt.length
        );
      }
      this.executeBlockStatement(stmt.body);
    }
  }

  private executeBlockStatement(block: BlockStatement): void {
    const previous = this.currentEnvironment;
    // For educational mini-language, maintain current scope or child scope.
    // DZA variable declarations are function/file scoped like JavaScript 'var' or block scoped.
    // Having block scoped environment with parent lookup ensures variables declared outside are updated inside!
    this.currentEnvironment = new Environment(previous);
    try {
      for (const stmt of block.statements) {
        this.executeStatement(stmt);
      }
    } finally {
      this.currentEnvironment = previous;
    }
  }

  public evaluateExpression(expr: Expression): any {
    switch (expr.type) {
      case 'Literal':
        return expr.value;

      case 'Identifier':
        return this.currentEnvironment.get(
          expr.name,
          expr.line,
          expr.column,
          expr.length
        );

      case 'UnaryExpression':
        return this.evaluateUnaryExpression(expr);

      case 'BinaryExpression':
        return this.evaluateBinaryExpression(expr);

      default: {
        const node = expr as any;
        throw new DiagnosticError(
          `Unknown expression type: ${node.type}`,
          node.line ?? 1,
          node.column ?? 1,
          node.length ?? 1
        );
      }
    }
  }

  private evaluateUnaryExpression(expr: UnaryExpression): any {
    const arg = this.evaluateExpression(expr.argument);

    switch (expr.operator) {
      case '!':
        return !this.isTruthy(arg);
      case '-':
        if (typeof arg !== 'number') {
          throw new DiagnosticError(
            `Runtime error: Unary '-' operator requires a number, got ${typeof arg} at line ${expr.line}, column ${expr.column}.`,
            expr.line,
            expr.column,
            expr.length
          );
        }
        return -arg;
      default:
        throw new DiagnosticError(
          `Runtime error: Unknown unary operator '${expr.operator}' at line ${expr.line}, column ${expr.column}.`,
          expr.line,
          expr.column,
          expr.length
        );
    }
  }

  private evaluateBinaryExpression(expr: BinaryExpression): any {
    const left = this.evaluateExpression(expr.left);

    // Short-circuit logical operators
    if (expr.operator === '&&') {
      return this.isTruthy(left) && this.isTruthy(this.evaluateExpression(expr.right));
    }
    if (expr.operator === '||') {
      return this.isTruthy(left) || this.isTruthy(this.evaluateExpression(expr.right));
    }

    const right = this.evaluateExpression(expr.right);

    switch (expr.operator) {
      case '+':
        if (typeof left === 'string' || typeof right === 'string') {
          return String(left) + String(right);
        }
        return Number(left) + Number(right);

      case '-':
        return Number(left) - Number(right);

      case '*':
        return Number(left) * Number(right);

      case '/':
        if (Number(right) === 0) {
          throw new DiagnosticError(
            `Runtime error: Division by zero at line ${expr.line}, column ${expr.column}.`,
            expr.line,
            expr.column,
            expr.length
          );
        }
        return Number(left) / Number(right);

      case '<':
        return Number(left) < Number(right);

      case '<=':
        return Number(left) <= Number(right);

      case '>':
        return Number(left) > Number(right);

      case '>=':
        return Number(left) >= Number(right);

      case '==':
        return left === right;

      case '!=':
        return left !== right;

      default:
        throw new DiagnosticError(
          `Runtime error: Unknown binary operator '${expr.operator}' at line ${expr.line}, column ${expr.column}.`,
          expr.line,
          expr.column,
          expr.length
        );
    }
  }

  private isTruthy(value: any): boolean {
    if (value === false || value === null || value === undefined || value === 0 || value === '') {
      return false;
    }
    return true;
  }
}
