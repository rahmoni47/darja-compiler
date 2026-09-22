# Algerian Darija (DZA) Programming Language & VS Code Extension

<div align="center">
  <h3>🇩🇿 لغة البرمجة بالدارجة الجزائرية في فيجوال ستوديو كود</h3>
  <p>An educational and fun programming language written using Algerian Darija / Arabic keywords, complete with a clean language engine (Lexer, Parser, AST, Interpreter) and a full-featured VS Code extension.</p>
</div>

---

## 📑 Table of Contents
1. [Overview](#overview)
2. [Language Syntax & Keywords](#language-syntax--keywords)
   - [Variables Declaration (`كاش_كاين`)](#1-variables-declaration-كاش_كاين)
   - [Assignments (`=`)](#2-assignments-)
   - [Output & Printing (`وري`)](#3-output--printing-وري)
   - [While Loop (`مدام`)](#4-while-loop-مدام)
   - [Data Types & Booleans (`صح` / `غلط`)](#5-data-types--booleans-صح--غلط)
   - [Operators](#6-operators)
   - [Comments](#7-comments)
3. [Examples](#examples)
4. [VS Code Extension Features](#vs-code-extension-features)
5. [How to Run and Debug](#how-to-run-and-debug)
6. [Architecture & Pipeline](#architecture--pipeline)
7. [Running Tests](#running-tests)

---

## Overview

**DZA** (`.dza`) is a custom experimental programming language designed to introduce programming concepts using everyday Algerian Darija terms. It features a standalone compiler/interpreter engine written in TypeScript with zero third-party runtime dependencies, accompanied by a VS Code extension that provides syntax highlighting, diagnostics (real-time error checking), code snippets, autocompletion, and one-click execution.

---

## Language Syntax & Keywords

### 1. Variables Declaration (`كاش_كاين`)
In Algerian Darija, **كاش_كاين** means *"Is there any / Let there be"*. It is used to declare one or multiple variables before assigning or reading them. Every declaration statement must end with a semicolon `;`.

```dza
كاش_كاين a;
كاش_كاين x, y, z;
```

> **Note:** Accessing or assigning to an undeclared variable produces a diagnostic error: `Variable 'x' is not declared.`

---

### 2. Assignments (`=`)
Values can be assigned to previously declared variables using `=`.

```dza
كاش_كاين a, b;

a = 10;
b = (a + 5) * 2;
```

---

### 3. Output & Printing (`وري`)
**وري** in Darija means *"show / display"*. It outputs numbers, strings, or boolean results directly to the VS Code Output Channel or console.

```dza
كاش_كاين greeting;
greeting = "صحا خويا!";
وري(greeting);
وري(100 * 2);
```

---

### 4. While Loop (`مدام`)
**مدام** in Darija means *"as long as / while"*. It repeatedly executes a block of code enclosed in `{ ... }` as long as its condition evaluates to true (`صح`).

```dza
كاش_كاين a, b;

a = 0;
b = 5;

مدام (a < 100) {
    وري(a);
    a = a + b;
}
```

---

### 5. Data Types & Booleans (`صح` / `غلط`)
The language engine natively supports:
* **Integers & Floats**: `42`, `3.14`, `0`
* **Strings**: `"سلام"`, `"Rahmoni"` (supports escape characters like `\n`, `\t`, `\"`)
* **Booleans**:
  * `صح` = `true`
  * `غلط` = `false`

```dza
كاش_كاين active, score, player;
active = صح;
score = 98.5;
player = "Amine";

وري(active); // prints صح
```

---

### 6. Operators
* **Arithmetic**: `+`, `-`, `*`, `/` (division by zero is safely trapped with descriptive error).
* **Comparison**: `<`, `<=`, `>`, `>=`, `==`, `!=`
* **Logical**: `&&` (AND), `||` (OR), `!` (NOT)
* **Parentheses**: `(` and `)` are supported to override standard operator precedence.

---

### 7. Comments
Single-line comments start with `//`:

```dza
// هذا تعليق بالدارجة
كاش_كاين a; // تعليق جانبي
```

---

## Examples

### Canonical Counter Loop (0 to 95 in steps of 5)
```dza
كاش_كاين a,b;

a = 0;
b = 5;

مدام (a < 100) {
    وري(a);
    a = a + b;
}
```

**Output:**
```text
0
5
10
15
20
25
30
35
40
45
50
55
60
65
70
75
80
85
90
95
```

---

## VS Code Extension Features

1. **Syntax Highlighting**:
   - Arabic keywords (`كاش_كاين`, `مدام`, `وري`, `صح`, `غلط`)
   - Numbers, strings, operators, and comments
   - Full Unicode support
2. **Real-time Diagnostics**:
   - Highlights syntax errors (e.g. `Expected expression after '<'`) directly in the editor with red squigglies and entry in the **Problems** tab.
   - Detects undeclared variable usage before runtime (`Variable 'x' is not declared`).
3. **One-Click Execution**:
   - **Editor Title Play Button**: Click `$(play)` in the top-right corner when editing any `.dza` file.
   - **Command Palette**: `Ctrl+Shift+P` -> `DZA: Run File`.
   - **Status Bar**: Click `$(play) Run DZA` in the bottom status bar.
   - Output is instantly streamed to the dedicated `"DZA Output"` channel.
4. **Autocomplete & Snippets**:
   - Type `كاش` or `kash` to autocomplete variable declarations.
   - Type `مدام` or `madam` for while loops.
   - Type `وري` or `wari` for print statements.

---

## How to Run and Debug

### 1. Install Dependencies
```bash
npm install
```

### 2. Compile TypeScript
```bash
npm run compile
```

### 3. Launch Extension in VS Code
1. Open this repository folder in VS Code.
2. Press **`F5`** (or go to *Run and Debug* tab and click **Launch Extension**).
3. A new **[Extension Development Host]** window will open.
4. In the new window, open `examples/hello.dza`.
5. Click the **Play button `$(play)`** at the top right, or press `Ctrl+Shift+P` and choose **`DZA: Run File`**.
6. The `"DZA Output"` channel will display the execution output.

### 4. Running directly from the Command Line (CLI)
You can also run `.dza` files directly from the terminal without launching VS Code:
```bash
npm run run:file examples/hello.dza
```

---

## Architecture & Pipeline

```text
Source Code (.dza)
       ↓
    [Lexer]               (UTF-16 Unicode character tokenization, tracks line/column)
       ↓
   Token Stream           (KEYWORD_VAR, IDENTIFIER, ASSIGN, NUMBER, ...)
       ↓
    [Parser]              (Recursive descent parser with precedence climbing)
       ↓
      AST                 (Abstract Syntax Tree with source mapping)
       ↓
 [Static Analyzer]        (Verifies variable declaration scopes and diagnostics)
       ↓
  [Interpreter]           (Evaluates AST nodes, manages scopes, traps infinite loops)
       ↓
  Program Output          (Dispatched to OutputChannel or Console)
```

The language engine in `src/engine/` is completely decoupled from `vscode` API, allowing it to be embedded in CLI runners, web REPLs, and automated test runners.

---

## Running Tests

Unit and integration tests cover all 13 core requirements:
```bash
npm test
```

Test coverage includes:
- Variable declarations (`كاش_كاين`)
- Variable assignment and state retention
- Arithmetic operations (`+`, `-`, `*`, `/`)
- Output printing (`وري`)
- While loop execution (`مدام`)
- Comparison operations (`<`, `>`, `<=`, `>=`, `==`, `!=`)
- Static and runtime undefined variable errors
- Syntax error reporting with exact line and column
- Operator precedence
- Strings and concatenation
- Boolean literals (`صح`, `غلط`) and logical operators
- Infinite loop guard protection
- The complete 0..95 integration test
