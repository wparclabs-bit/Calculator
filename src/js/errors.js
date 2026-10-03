/**
 * CalcErrors — error message factory and domain-check helpers.
 * User-friendly, PRD-aligned strings (FR-09/10/11). Standalone, no deps.
 * @module errors
 */
const CalcErrors = (() => {
  /** Division-by-zero message (PRD FR-09). @returns {string} */
  function divisionByZero() {
    return 'Cannot divide by zero';
  }

  /** Syntax-error message (PRD FR-10). @param {string} msg @returns {string} */
  function syntaxError(msg) {
    return `Syntax error: ${msg}`;
  }

  /** Domain-error message (PRD FR-11). @param {string} func @param {number} val @returns {string} */
  function domainError(func, val) {
    return `Domain error: ${func}(${val}) is undefined`;
  }

  /** Invalid-expression message (PRD FR-10). @param {string} msg @returns {string} */
  function invalidExpression(msg) {
    return `Invalid expression: ${msg}`;
  }

  /** True when a division would divide by zero. @param {number} dividend @param {number} divisor @returns {boolean} */
  function isDivisionByZero(dividend, divisor) {
    return divisor === 0;
  }

  /** True when val is a valid √ argument (non-negative). @param {number} val @returns {boolean} */
  function isValidSqrtArg(val) {
    return val >= 0;
  }

  /** True when val is a valid log/ln argument (positive). @param {number} val @returns {boolean} */
  function isValidLogArg(val) {
    return val > 0;
  }

  return {
    divisionByZero,
    syntaxError,
    domainError,
    invalidExpression,
    isDivisionByZero,
    isValidSqrtArg,
    isValidLogArg,
  };
})();
