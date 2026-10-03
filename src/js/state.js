/**
 * CalcState — State management and Pub/Sub module.
 *
 * Holds expression, result, and error. Notifies subscribers
 * on changes via subscribe(key, fn) / notify(key).
 *
 * @module state
 */
const CalcState = (() => {
  let expression = '';
  let result = '';
  let error = null;
  const subscribers = new Map();

  /**
   * Subscribe to changes for a given state key.
   * @param {string} key — One of 'expression', 'result', 'error'.
   * @param {Function} fn — Callback invoked with the new value.
   */
  function subscribe(key, fn) {
    if (!subscribers.has(key)) subscribers.set(key, new Set());
    subscribers.get(key).add(fn);
  }

  /**
   * Notify all subscribers for a given state key.
   * @param {string} key
   */
  function notify(key) {
    subscribers.get(key)?.forEach((fn) => fn({ expression, result, error }[key]));
  }

  /**
   * Set the expression string and notify subscribers.
   * @param {string} val
   */
  function setExpression(val) { expression = val; notify('expression'); }

  /**
   * Set the result string and notify subscribers.
   * @param {string} val
   */
  function setResult(val) { result = val; notify('result'); }

  /**
   * Set an error message and notify subscribers.
   * @param {string|null} msg
   */
  function setError(msg) { error = msg; notify('error'); }

  /**
   * Clear all state back to initial values.
   */
  function clear() {
    expression = ''; result = ''; error = null;
    notify('expression'); notify('result'); notify('error');
  }

  return {
    get expression() { return expression; },
    get result() { return result; },
    get error() { return error; },
    setExpression, setResult, setError, clear, subscribe, notify,
  };
})();
