import { DiagnosticError } from '../errors/DiagnosticError';

export class Environment {
  private values: Map<string, any> = new Map();
  private declared: Set<string> = new Set();
  private parent: Environment | null;

  constructor(parent: Environment | null = null) {
    this.parent = parent;
  }

  public declare(name: string): void {
    this.declared.add(name);
    if (!this.values.has(name)) {
      this.values.set(name, undefined);
    }
  }

  public isDeclared(name: string): boolean {
    if (this.declared.has(name)) {
      return true;
    }
    if (this.parent !== null) {
      return this.parent.isDeclared(name);
    }
    return false;
  }

  public assign(name: string, value: any, line: number, column: number, length: number): void {
    if (this.declared.has(name)) {
      this.values.set(name, value);
      return;
    }

    if (this.parent !== null && this.parent.isDeclared(name)) {
      this.parent.assign(name, value, line, column, length);
      return;
    }

    throw new DiagnosticError(
      `Variable '${name}' is not declared.`,
      line,
      column,
      length
    );
  }

  public get(name: string, line: number, column: number, length: number): any {
    if (this.declared.has(name)) {
      const val = this.values.get(name);
      return val;
    }

    if (this.parent !== null) {
      return this.parent.get(name, line, column, length);
    }

    throw new DiagnosticError(
      `Variable '${name}' is not declared.`,
      line,
      column,
      length
    );
  }

  public getAllDeclared(): string[] {
    const list = Array.from(this.declared);
    if (this.parent) {
      return [...list, ...this.parent.getAllDeclared()];
    }
    return list;
  }
}
