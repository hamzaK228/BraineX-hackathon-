/**
 * sanitize.js
 * Utility for sanitizing HTML inputs to prevent XSS.
 */

// Basic map of characters to escape
const escapeMap = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#x27;',
  '/': '&#x2F;',
};

const regex = /[&<>"'/]/g;

/**
 * Escapes unsafe characters in a string.
 * @param {string} string
 * @returns {string} Escaped string
 */
export function escapeHtml(string) {
  if (typeof string !== 'string') return String(string);
  return string.replace(regex, (match) => escapeMap[match]);
}

/**
 * Sanitizes a template literal value.
 * Usage: html`<div>${unsafeInput}</div>`
 */
export function html(strings, ...values) {
  return strings.reduce((result, string, i) => {
    const value = values[i] || ''; // Handle undefined/null
    return (
      result +
      string +
      (Array.isArray(value)
        ? value.join('') // Arrays are joined (e.g. map results)
        : escapeHtml(value))
    );
  }, '');
}
