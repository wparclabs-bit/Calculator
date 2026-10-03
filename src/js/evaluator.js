/**
 * CalcEvaluator — AST evaluator using the Strategy pattern.
 *
 * Accepts a plain AST object (produced by CalcParser) and returns
 * a numeric result. Each AST node type has its own strategy
 * handler. Errors are thrown with descriptive messages.
 *
 * @module evaluator
 */
const CalcEvaluator = (() => {
  const { FUNCTIONS, PRECISION } = CalcConstants;

  /**
   * Round a number to the configured precision, trimming trailing zeros.
   * @param {number} n
   * @returns {number}
   */
  function round(n) {
    return Number(n.toFixed(PRECISION));
  }

  /**
   * Strategy: evaluate a Number node.
   * @param {Object} node
   * @returns {number}
   */
  function evalNumber(node) {
    return node.value;
  }

  /**
   * Strategy: evaluate an Operator node.
   * Supports +, -, *, /, ^.
   * @param {Object} node
   * @returns {number}
   */
  function evalOperator(node) {
    const left = evaluate(node.left);
    const right = evaluate(node.right);

    switch (node.op) {
      case '+': return round(left + right);
      case '-': return round(left - right);
      case '*': return round(left * right);
      case '/':
        if (right === 0) throw new Error('Cannot divide by zero');
        return round(left / right);
      case '^': return round(Math.pow(left, right));
      default:
        throw new Error(`Unsupported operator: ${node.op}`);
    }
  }

  /**
   * Strategy: evaluate a FunctionCall node.
   * Supports sqrt, sin, cos, tan, log (base 10), ln (natural log).
   * @param {Object} node
   * @returns {number}
   */
  function evalFunctionCall(node) {
    const arg = evaluate(node.arg);

    switch (node.name) {
      case 'sqrt':
        if (arg < 0) throw new Error('Cannot take square root of a negative number');
        return round(Math.sqrt(arg));
      case 'sin': return round(Math.sin(arg));
      case 'cos': return round(Math.cos(arg));
      case 'tan': return round(Math.tan(arg));
      case 'log':
        if (arg <= 0) throw new Error('Cannot take logarithm of a non-positive number');
        return round(Math.log10(arg));
      case 'ln':
        if (arg <= 0) throw new Error('Cannot take natural logarithm of a non-positive number');
        return round(Math.log(arg));
      default:
        throw new Error(`Unsupported function: ${node.name}`);
    }
  }

  /**
   * Strategy: evaluate a UnaryOperator node.
   * Supports '-' (negation) and '+' (identity).
   * @param {Object} node
   * @returns {number}
   */
  function evalUnaryOperator(node) {
    const arg = evaluate(node.arg);
    if (node.op === '-') return round(-arg);
    if (node.op === '+') return round(arg);
    throw new Error(`Unsupported unary operator: ${node.op}`);
  }

  /**
   * Dispatch an AST node to the correct strategy handler.
   * @param {Object|null} node — AST node or null.
   * @returns {number} Numeric result.
   */
  function evaluate(node) {
    if (node === null || node === undefined) return 0;

    switch (node.type) {
      case 'Number': return evalNumber(node);
      case 'Operator': return evalOperator(node);
      case 'FunctionCall': return evalFunctionCall(node);
      case 'UnaryOperator': return evalUnaryOperator(node);
      default:
        throw new Error(`Unknown AST node type: ${node.type}`);
    }
  }

  return { evaluate };
})();
