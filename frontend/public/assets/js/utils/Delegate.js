/**
 * Delegate.js
 * Utility for robust event delegation.
 */

/**
 * Delegate an event to a selector.
 * @param {Element} el - The parent element to attach the listener to
 * @param {string} evt - The event name (e.g., 'click')
 * @param {string} sel - The selector to match
 * @param {Function} handler - The callback function
 */
export function delegate(el, evt, sel, handler) {
  el.addEventListener(evt, function (event) {
    const t = event.target;
    // Check if the target or any of its parents match the selector
    const matchingParent = t.closest(sel);

    // Ensure the matching parent is actually inside the delegated element
    if (matchingParent && el.contains(matchingParent)) {
      handler.call(matchingParent, event, matchingParent);
    }
  });
}

/**
 * Prevent propagation helper
 * @param {Event} e
 */
export function stop(e) {
  if (e) {
    e.stopPropagation();
    e.preventDefault();
  }
}
