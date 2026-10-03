/**
 * CalcConstants — Literal values module.
 *
 * Exposes all operator symbols, function names, digit strings,
 * mathematical constants, and precision settings used by the
 * parser and evaluator. No logic is contained here.
 *
 * @module constants
 */
const CalcConstants = (() => {
  /** @type {string[]} */
  const OPERATORS = ['+', '-', '*', '/', '^'];

  /** @type {string[]} */
  const FUNCTIONS = ['sqrt', 'sin', 'cos', 'tan', 'log', 'ln'];

  /** @type {string[]} */
  const CONSTANTS = ['pi', 'e'];

  /** @type {string[]} */
  const DIGITS = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];

  /** Maximum number of decimal places shown in results. */
  const PRECISION = 10;

  /** Mapping from symbol names to their numeric values. */
  const VALUE_MAP = {
    pi: Math.PI,
    e: Math.E,
  };

  /**
   * Returns the numeric value for a named constant.
   * @param {string} name — Constant name (e.g. 'pi', 'e').
   * @returns {number} The numeric value.
   */
  function getValue(name) {
    return VALUE_MAP[name] ?? 0;
  }

  return { OPERATORS, FUNCTIONS, CONSTANTS, DIGITS, PRECISION, getValue };
})();
