/**
 * CalcApp — application bootstrap glue.
 *
 * Wires the modules together once the DOM is ready. It holds no state of its
 * own; it only fires CalcEvents.init() so the delegated click/keyboard
 * listeners attach (ADR-01 §2.2, task/05 bootstrap order — loads last).
 *
 * @module app
 */
const CalcApp = (() => {
  /**
   * Attach the event listeners. Called once when the DOM is ready.
   */
  function init() {
    CalcEvents.init();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  return { init };
})();
