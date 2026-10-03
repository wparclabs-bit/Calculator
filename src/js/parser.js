/**
 * CalcParser — Tokenizer and recursive-descent AST builder.
 *
 * Grammar:
 *   expression → term (('+' | '-') term)*
 *   term       → power (('*' | '/') power)*
 *   power      → unary ('^' power)?
 *   unary      → ('-' | '+')? primary
 *   primary    → NUMBER | FUNCTION '(' expression ')' | CONSTANT | '(' expression ')'
 *
 * @module parser
 */
const CalcParser = (() => {
  const { OPERATORS, FUNCTIONS, CONSTANTS } = CalcConstants;
  const TOK = { NUMBER: 'Number', OPERATOR: 'Operator', FUNCTION: 'Function',
    CONSTANT: 'Constant', LPAREN: '(', RPAREN: ')', EOF: 'EOF' };

  /**
   * Tokenize an expression string into an array of tokens.
   * @param {string} expr — Raw expression string.
   * @returns {{type: string, value?: *}[]} Array of tokens.
   */
  function tokenize(expr) {
    const tokens = [];
    let i = 0;
    while (i < expr.length) {
      const ch = expr[i];
      if (/\s/.test(ch)) { i++; continue; }
      if (/[0-9.]/.test(ch)) {
        let num = '';
        while (i < expr.length && /[0-9.]/.test(expr[i])) num += expr[i++];
        tokens.push({ type: TOK.NUMBER, value: parseFloat(num) });
        continue;
      }
      if (OPERATORS.includes(ch)) { tokens.push({ type: TOK.OPERATOR, value: ch }); i++; continue; }
      if (ch === '(') { tokens.push({ type: TOK.LPAREN }); i++; continue; }
      if (ch === ')') { tokens.push({ type: TOK.RPAREN }); i++; continue; }
      if (/[a-zA-Z]/.test(ch)) {
        let ident = '';
        while (i < expr.length && /[a-zA-Z]/.test(expr[i])) ident += expr[i++];
        const lower = ident.toLowerCase();
        if (FUNCTIONS.includes(lower)) tokens.push({ type: TOK.FUNCTION, value: lower });
        else if (CONSTANTS.includes(lower)) tokens.push({ type: TOK.CONSTANT, value: lower });
        else throw new Error(`Unknown identifier: ${ident}`);
        continue;
      }
      throw new Error(`Unexpected character: ${ch}`);
    }
    tokens.push({ type: TOK.EOF });
    return tokens;
  }

  /**
   * Parse tokens into an AST node.
   * @param {Token[]} tokens
   * @returns {Object|null}
   */
  function parse(tokens) {
    if (tokens.length === 0 || tokens[0].type === TOK.EOF) return null;
    const ctx = { tokens, pos: 0 };
    const node = parseExpression(ctx);
    if (ctx.pos < ctx.tokens.length && ctx.tokens[ctx.pos].type !== TOK.EOF) {
      throw new Error('Unexpected token after expression');
    }
    return node;
  }

  function parseExpression(ctx) {
    let left = parseTerm(ctx);
    while (ctx.tokens[ctx.pos].type === TOK.OPERATOR &&
      (ctx.tokens[ctx.pos].value === '+' || ctx.tokens[ctx.pos].value === '-')) {
      const op = ctx.tokens[ctx.pos].value; ctx.pos++;
      left = { type: 'Operator', op, left, right: parseTerm(ctx) };
    }
    return left;
  }

  function parseTerm(ctx) {
    let left = parsePower(ctx);
    while (ctx.tokens[ctx.pos].type === TOK.OPERATOR &&
      (ctx.tokens[ctx.pos].value === '*' || ctx.tokens[ctx.pos].value === '/')) {
      const op = ctx.tokens[ctx.pos].value; ctx.pos++;
      left = { type: 'Operator', op, left, right: parsePower(ctx) };
    }
    return left;
  }

  function parsePower(ctx) {
    const base = parseUnary(ctx);
    if (ctx.tokens[ctx.pos].type === TOK.OPERATOR && ctx.tokens[ctx.pos].value === '^') {
      ctx.pos++;
      return { type: 'Operator', op: '^', left: base, right: parsePower(ctx) };
    }
    return base;
  }

  function parseUnary(ctx) {
    if (ctx.tokens[ctx.pos].type === TOK.OPERATOR &&
      (ctx.tokens[ctx.pos].value === '-' || ctx.tokens[ctx.pos].value === '+')) {
      const op = ctx.tokens[ctx.pos].value; ctx.pos++;
      return { type: 'UnaryOperator', op, arg: parseUnary(ctx) };
    }
    return parsePrimary(ctx);
  }

  function parsePrimary(ctx) {
    const tok = ctx.tokens[ctx.pos];
    if (tok.type === TOK.NUMBER) { ctx.pos++; return { type: 'Number', value: tok.value }; }
    if (tok.type === TOK.CONSTANT) { ctx.pos++; return { type: 'Number', value: CalcConstants.getValue(tok.value) }; }
    if (tok.type === TOK.FUNCTION) {
      const name = tok.value; ctx.pos++;
      if (ctx.tokens[ctx.pos].type !== TOK.LPAREN) throw new Error(`Expected '(' after '${name}'`);
      ctx.pos++;
      const arg = parseExpression(ctx);
      if (ctx.tokens[ctx.pos].type !== TOK.RPAREN) throw new Error(`Expected ')' after '${name}'`);
      ctx.pos++;
      return { type: 'FunctionCall', name, arg };
    }
    if (tok.type === TOK.LPAREN) {
      ctx.pos++;
      const node = parseExpression(ctx);
      if (ctx.tokens[ctx.pos].type !== TOK.RPAREN) throw new Error('Unmatched parenthesis');
      ctx.pos++;
      return node;
    }
    throw new Error(`Unexpected token: ${tok.type}${tok.value ?? ''}`);
  }

  /**
   * Public API: parse an expression string into an AST.
   * @param {string} expression — The expression to parse.
   * @returns {Object|null} AST node, or null if expression is empty.
   */
  function parse(expression) {
    if (!expression || expression.trim() === '') return null;
    return parse(tokenize(expression));
  }

  return { parse };
})();
