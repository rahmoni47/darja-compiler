import { describe, it } from 'node:test';
import assert from 'node:assert';
import { run, validate, tokenize, parse, TokenType, DiagnosticError } from '../src/engine/index';

describe('Algerian Darija (DZA) Language Engine', () => {

  it('1. Variable declaration', () => {
    const code = `كاش_كاين a, b, c;`;
    const tokens = tokenize(code);
    assert.strictEqual(tokens[0].type, TokenType.KEYWORD_VAR);
    assert.strictEqual(tokens[1].type, TokenType.IDENTIFIER);
    assert.strictEqual(tokens[1].value, 'a');
    assert.strictEqual(tokens[2].type, TokenType.COMMA);
    assert.strictEqual(tokens[3].type, TokenType.IDENTIFIER);
    assert.strictEqual(tokens[3].value, 'b');

    const result = run(code);
    assert.strictEqual(result.error, undefined);
    assert.deepStrictEqual(result.output, []);
  });

  it('2. Variable assignment and retrieval', () => {
    const code = `
      كاش_كاين x;
      x = 42;
      وري(x);
    `;
    const result = run(code);
    assert.strictEqual(result.error, undefined);
    assert.deepStrictEqual(result.output, ['42']);
  });

  it('3. Arithmetic operations (+, -, *, /)', () => {
    const code = `
      كاش_كاين a, b, c, d;
      a = 10 + 5;
      b = 20 - 4;
      c = 3 * 7;
      d = 50 / 2;
      وري(a);
      وري(b);
      وري(c);
      وري(d);
    `;
    const result = run(code);
    assert.strictEqual(result.error, undefined);
    assert.deepStrictEqual(result.output, ['15', '16', '21', '25']);
  });

  it('4. Print expressions and values', () => {
    const code = `
      كاش_كاين a, b;
      a = 10;
      b = 20;
      وري(a + b);
      وري("سلام يا خويا");
    `;
    const result = run(code);
    assert.strictEqual(result.error, undefined);
    assert.deepStrictEqual(result.output, ['30', 'سلام يا خويا']);
  });

  it('5. While loop (مدام)', () => {
    const code = `
      كاش_كاين count;
      count = 0;
      مدام (count < 3) {
        وري(count);
        count = count + 1;
      }
    `;
    const result = run(code);
    assert.strictEqual(result.error, undefined);
    assert.deepStrictEqual(result.output, ['0', '1', '2']);
  });

  it('6. Comparison operators (<, >, <=, >=, ==, !=)', () => {
    const code = `
      كاش_كاين r1, r2, r3, r4, r5, r6;
      r1 = 5 < 10;
      r2 = 10 > 5;
      r3 = 10 <= 10;
      r4 = 5 >= 6;
      r5 = 100 == 100;
      r6 = 10 != 10;
      وري(r1);
      وري(r2);
      وري(r3);
      وري(r4);
      وري(r5);
      وري(r6);
    `;
    const result = run(code);
    assert.strictEqual(result.error, undefined);
    assert.deepStrictEqual(result.output, ['صح', 'صح', 'صح', 'غلط', 'صح', 'غلط']);
  });

  it('7. Undefined variable error detection (runtime & static)', () => {
    const code = `a = 10;`;
    const result = run(code);
    assert.notStrictEqual(result.error, undefined);
    assert.match(result.error!.message, /Variable 'a' is not declared/);

    const diagnostics = validate(code);
    assert.strictEqual(diagnostics.length, 1);
    assert.match(diagnostics[0].message, /Variable 'a' is not declared/);
  });

  it('8. Syntax errors with line and column reporting', () => {
    const code = `مدام (a < ) {\n  وري(a);\n}`;
    let threw = false;
    try {
      parse(code);
    } catch (e: any) {
      threw = true;
      assert(e instanceof DiagnosticError);
      assert.strictEqual(e.line, 1);
      assert.match(e.message, /Expected expression after '<'/);
    }
    assert.strictEqual(threw, true);

    const diagnostics = validate(code);
    assert.strictEqual(diagnostics.length, 1);
    assert.strictEqual(diagnostics[0].line, 1);
  });

  it('9. Operator precedence (multiplication before addition, parentheses)', () => {
    const code = `
      كاش_كاين x, y;
      x = 2 + 3 * 4;
      y = (2 + 3) * 4;
      وري(x);
      وري(y);
    `;
    const result = run(code);
    assert.strictEqual(result.error, undefined);
    assert.deepStrictEqual(result.output, ['14', '20']);
  });

  it('10. String support and concatenation', () => {
    const code = `
      كاش_كاين name, greeting;
      name = "Rahmoni";
      greeting = "Saha " + name;
      وري(greeting);
    `;
    const result = run(code);
    assert.strictEqual(result.error, undefined);
    assert.deepStrictEqual(result.output, ['Saha Rahmoni']);
  });

  it('11. Boolean values (صح and غلط) and logical operators', () => {
    const code = `
      كاش_كاين t, f, testAnd, testOr, testNot;
      t = صح;
      f = غلط;
      testAnd = t && f;
      testOr = t || f;
      testNot = !t;
      وري(t);
      وري(f);
      وري(testAnd);
      وري(testOr);
      وري(testNot);
    `;
    const result = run(code);
    assert.strictEqual(result.error, undefined);
    assert.deepStrictEqual(result.output, ['صح', 'غلط', 'غلط', 'صح', 'غلط']);
  });

  it('12. Full integration test: counter loop step by 5 up to 100', () => {
    const code = `
كاش_كاين a,b;

a = 0;
b = 5;

مدام (a < 100) {
    وري(a);
    a = a + b;
}
    `;
    const result = run(code);
    assert.strictEqual(result.error, undefined);

    const expected = [
      '0', '5', '10', '15', '20',
      '25', '30', '35', '40', '45',
      '50', '55', '60', '65', '70',
      '75', '80', '85', '90', '95'
    ];
    assert.deepStrictEqual(result.output, expected);
  });

  it('13. Infinite loop guard protection', () => {
    const infiniteCode = `
      مدام (صح) {
      }
    `;
    const result = run(infiniteCode, { maxLoopIterations: 100 });
    assert.notStrictEqual(result.error, undefined);
    assert.match(result.error!.message, /Maximum loop iterations/);
  });
});
