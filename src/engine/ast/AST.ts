import { SourceLocation } from '../lexer/Token';

export type NodeType =
  | 'Program'
  | 'VariableDeclaration'
  | 'AssignmentStatement'
  | 'PrintStatement'
  | 'WhileStatement'
  | 'BlockStatement'
  | 'BinaryExpression'
  | 'UnaryExpression'
  | 'Literal'
  | 'Identifier';

export interface ASTNode extends SourceLocation {
  type: NodeType;
}

export interface Program extends ASTNode {
  type: 'Program';
  body: Statement[];
}

export type Statement =
  | VariableDeclaration
  | AssignmentStatement
  | PrintStatement
  | WhileStatement
  | BlockStatement;

export interface VariableDeclaration extends ASTNode {
  type: 'VariableDeclaration';
  identifiers: Identifier[];
}

export interface AssignmentStatement extends ASTNode {
  type: 'AssignmentStatement';
  identifier: Identifier;
  value: Expression;
}

export interface PrintStatement extends ASTNode {
  type: 'PrintStatement';
  expression: Expression;
}

export interface WhileStatement extends ASTNode {
  type: 'WhileStatement';
  condition: Expression;
  body: BlockStatement;
}

export interface BlockStatement extends ASTNode {
  type: 'BlockStatement';
  statements: Statement[];
}

export type Expression =
  | BinaryExpression
  | UnaryExpression
  | Literal
  | Identifier;

export interface BinaryExpression extends ASTNode {
  type: 'BinaryExpression';
  left: Expression;
  operator: string;
  right: Expression;
}

export interface UnaryExpression extends ASTNode {
  type: 'UnaryExpression';
  operator: string;
  argument: Expression;
}

export interface Literal extends ASTNode {
  type: 'Literal';
  value: string | number | boolean;
}

export interface Identifier extends ASTNode {
  type: 'Identifier';
  name: string;
}
