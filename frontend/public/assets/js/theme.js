/**
 * Global Theme Manager - Works across all pages
 */

// Initialize theme on page load
(function initTheme() {
  const savedTheme = localStorage.getItem('brainex_theme') || 'light';
  document.documentElement.setAttribute('data-theme', savedTheme);

  // Update button text if it exists
  const btn = document.querySelector('.theme-toggle');
  if (btn) {
    btn.innerHTML = savedTheme === 'dark' ? '☀️ Light' : '🌙 Dark';
    btn.setAttribute('aria-pressed', savedTheme === 'dark');
    btn.setAttribute('aria-label', `Switch to ${savedTheme === 'dark' ? 'light' : 'dark'} mode`);
  }
})();

// Theme toggle function
window.toggleTheme = function () {
  const html = document.documentElement;
  const btn = document.querySelector('.theme-toggle');

  // Add transition class for smooth change
  html.classList.add('theme-transitioning');

  const currentTheme = html.getAttribute('data-theme');
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

  html.setAttribute('data-theme', newTheme);
  localStorage.setItem('brainex_theme', newTheme);

  if (btn) {
    btn.innerHTML = newTheme === 'dark' ? '☀️ Light' : '🌙 Dark';
    btn.setAttribute('aria-pressed', newTheme === 'dark');
    btn.setAttribute('aria-label', `Switch to ${newTheme === 'dark' ? 'light' : 'dark'} mode`);
  }

  // Remove transition class after animation
  setTimeout(() => {
    html.classList.remove('theme-transitioning');
  }, 500);
};

// Add event listeners when DOM is ready
document.addEventListener('DOMContentLoaded', function () {
  const themeBtn = document.querySelector('.theme-toggle');
  if (themeBtn) {
    themeBtn.addEventListener('click', window.toggleTheme);
  }
});
