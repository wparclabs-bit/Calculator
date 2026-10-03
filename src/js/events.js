/**
 * CalcEvents — event delegation module (click + keyboard).
 * Single delegated click listener on the button container and a
 * single keydown listener on document (ADR-01 §2.3). Handlers mutate
 * CalcState; the UI re-renders via Pub/Sub (see ui.js).
 *
 * @module events
 */
const CalcEvents = (() => {
  const container = document.querySelector('.buttons');
  /**
   * Append text to the current expression.
   * @param {string} text — Digit, operator, function, or parenthesis.
   */
  function append(text) {
    CalcState.setExpression(CalcState.expression + text);
  }
  /** Append a decimal point, ignoring a duplicate dot. */
  function appendDecimal() {
    if (CalcState.expression.slice(-1) === '.') return;
    append('.');
  }
  /** Remove the last character from the expression. */
  function backspace() {
    CalcState.setExpression(CalcState.expression.slice(0, -1));
  }
  /** Toggle a leading minus sign on the expression. */
  function toggleSign() {
    const expr = CalcState.expression;
    CalcState.setExpression(expr.startsWith('-') ? expr.slice(1) : '-' + expr);
  }
  /** Clear all state (expression, result, error). */
  function clearAll() {
    CalcState.clear();
  }
  /** Parse + evaluate the current expression and store the result. */
  function evaluate() {
    if (!CalcState.expression.trim()) return;
    try {
      const ast = CalcParser.parse(CalcState.expression);
      const value = CalcEvaluator.evaluate(ast);
      CalcState.setResult(Number(value.toFixed(10)).toString());
      CalcState.setError(null);
    } catch (err) {
      CalcState.setError(err.message);
    }
  }
  /**
   * Handler map keyed by the data-action values in src/index.html.
   * 'pow' and 'fact' are intentionally absent (deferred per Task 04).
   */
  const handlers = {
    'open-paren': () => append('('),
    'close-paren': () => append(')'),
    decimal: appendDecimal,
    clear: clearAll,
    backspace: backspace,
    negate: toggleSign,
    equals: evaluate,
  };
  const opSymbols = { 'op-add': '+', 'op-subtract': '-', 'op-multiply': '*', 'op-divide': '/' };
  for (const [action, sym] of Object.entries(opSymbols)) handlers[action] = () => append(sym);
  for (const name of CalcConstants.FUNCTIONS) handlers[name] = () => append(name + '(');
  for (const name of CalcConstants.CONSTANTS) handlers[name] = () => append(name);
  for (const d of CalcConstants.DIGITS) handlers['digit-' + d] = () => append(d);
  /**
   * Delegated click handler: routes to the matching action handler.
   * @param {MouseEvent} e
   */
  function onClick(e) {
    const btn = e.target.closest('button');
    if (!btn) return;
    handlers[btn.dataset.action]?.();
  }
  /**
   * Delegated keyboard handler (PRD FR-07 key map).
   * @param {KeyboardEvent} e
   */
  function onKeydown(e) {
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    const key = e.key;
    if (key >= '0' && key <= '9') { append(key); e.preventDefault(); }
    else if (key === '+' || key === '-' || key === '*' || key === '/') append(key);
    else if (key === '(' || key === ')') append(key);
    else if (key === '.') appendDecimal();
    else if (key === 'Enter') { evaluate(); e.preventDefault(); }
    else if (key === 'Escape') clearAll();
    else if (key === 'Backspace') backspace();
  }
  /**
   * Attach the delegated click and keyboard listeners.
   * Called once from the bootstrap (task/05 app.js).
   */
  function init() {
    container.addEventListener('click', onClick);
    document.addEventListener('keydown', onKeydown);
  }
  return { init, handlers };
})();
