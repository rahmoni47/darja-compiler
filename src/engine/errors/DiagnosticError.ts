export type DiagnosticSeverity = 'error' | 'warning' | 'info';

export class DiagnosticError extends Error {
  constructor(
    message: string,
    public readonly line: number,
    public readonly column: number,
    public readonly length: number = 1,
    public readonly severity: DiagnosticSeverity = 'error'
  ) {
    super(message);
    this.name = 'DiagnosticError';
  }
}
