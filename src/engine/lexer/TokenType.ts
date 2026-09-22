export enum TokenType {
  // Keywords
  KEYWORD_VAR = 'KEYWORD_VAR',       // كاش_كاين
  KEYWORD_WHILE = 'KEYWORD_WHILE',   // مدام
  KEYWORD_PRINT = 'KEYWORD_PRINT',   // وري
  BOOLEAN_TRUE = 'BOOLEAN_TRUE',     // صح
  BOOLEAN_FALSE = 'BOOLEAN_FALSE',   // غلط

  // Literals & Identifiers
  IDENTIFIER = 'IDENTIFIER',
  NUMBER = 'NUMBER',
  STRING = 'STRING',

  // Operators
  ASSIGN = 'ASSIGN',                 // =
  PLUS = 'PLUS',                     // +
  MINUS = 'MINUS',                   // -
  STAR = 'STAR',                     // *
  SLASH = 'SLASH',                   // /

  // Comparisons
  EQUAL = 'EQUAL',                   // ==
  NOT_EQUAL = 'NOT_EQUAL',           // !=
  LESS = 'LESS',                     // <
  LESS_EQUAL = 'LESS_EQUAL',         // <=
  GREATER = 'GREATER',               // >
  GREATER_EQUAL = 'GREATER_EQUAL',   // >=

  // Logical
  AND = 'AND',                       // &&
  OR = 'OR',                         // ||
  NOT = 'NOT',                       // !

  // Delimiters
  LPAREN = 'LPAREN',                 // (
  RPAREN = 'RPAREN',                 // )
  LBRACE = 'LBRACE',                 // {
  RBRACE = 'RBRACE',                 // }
  COMMA = 'COMMA',                   // ,
  SEMICOLON = 'SEMICOLON',           // ;

  EOF = 'EOF'
}
