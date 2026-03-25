/**
 * Component.js
 * Base class for UI Components
 */
export class Component {
  /**
   * @param {Object} props
   * @param {HTMLElement} props.element - The DOM element to attach to
   * @param {Store} props.store - Central state store
   */
  constructor({ element, store }) {
    this.element = element instanceof HTMLElement ? element : document.querySelector(element);
    this.store = store;

    if (this.element) {
      this.init();
    }
  }

  /**
   * Initialize the component
   */
  init() {
    this.render();
    this.addEventListeners();
  }

  /**
   * Render the component (Override this)
   */
  render() {
    // Default render: no-op
  }

  /**
   * Add event listeners (Override this)
   */
  addEventListeners() {
    // Default: no-op
  }

  /**
   * Utility to sanitize HTML
   * @param {string} str
   */
  escapeHtml(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }
}
