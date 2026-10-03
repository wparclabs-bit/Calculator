/**
 * CalcUI — DOM rendering module.
 *
 * Subscribes to CalcState Pub/Sub and re-renders only the affected
 * display elements. `src/index.html` provides `#expression` and
 * `#result`; error messages are surfaced in the result element
 * (the markup has no dedicated error node).
 *
 * @module ui
 */
const CalcUI = (() => {
  const expressionEl = document.getElementById('expression');
  const resultEl = document.getElementById('result');

  /**
   * Render the current expression string into the display.
   * @param {string} value — New expression value from CalcState.
   */
  function renderExpression(value) {
    expressionEl.textContent = value;
  }

  /**
   * Render the current result string into the display.
   * @param {string} value — New result value from CalcState.
   */
  function renderResult(value) {
    resultEl.textContent = value || '0';
  }

  /**
   * Render an error message in the result element, or restore the
   * last result when the error is cleared (value is null).
   * @param {string|null} value — New error value from CalcState.
   */
  function renderError(value) {
    resultEl.textContent = value || CalcState.result || '0';
  }

  /**
   * Subscribe the render functions to CalcState Pub/Sub.
   * CalcState.clear() notifies all three keys, which clears the
   * display elements automatically — no separate clear wiring needed.
   */
  function init() {
    CalcState.subscribe('expression', renderExpression);
    CalcState.subscribe('result', renderResult);
    CalcState.subscribe('error', renderError);
  }

  return { init, renderExpression, renderResult, renderError };
})();
