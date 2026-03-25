/**
 * MicroInteractions.js
 * Handles visual flair, animations, and haptic feedback.
 */

export const microInteractions = {
  /**
   * Add ripple effect to an element on click
   * @param {MouseEvent} event
   * @param {HTMLElement} element
   */
  ripple(event, element) {
    const circle = document.createElement('span');
    const diameter = Math.max(element.clientWidth, element.clientHeight);
    const radius = diameter / 2;

    const rect = element.getBoundingClientRect();

    circle.style.width = circle.style.height = `${diameter}px`;
    circle.style.left = `${event.clientX - rect.left - radius}px`;
    circle.style.top = `${event.clientY - rect.top - radius}px`;
    circle.classList.add('ripple');

    const existingRipple = element.querySelector('.ripple');
    if (existingRipple) {
      existingRipple.remove();
    }

    element.appendChild(circle);

    // Remove after animation
    setTimeout(() => circle.remove(), 600);
  },

  /**
   * Trigger a simple confetti burst (CSS only to avoid heavy libs)
   * @param {HTMLElement} element - Anchor element
   */
  confetti(element) {
    // Simple confetti implementation or log for now
    // In a real app, we'd use canvas-confetti or similar
    console.log('🎉 Confetti Triggered!');

    // Add a temporary class to shake or celebrate
    element.classList.add('celebrate');
    setTimeout(() => element.classList.remove('celebrate'), 1000);

    // Attempt haptic
    this.haptic('medium');
  },

  /**
   * Trigger Haptic Feedback (Mobile only)
   * @param {string} type - 'light', 'medium', 'heavy', 'success', 'warning', 'error'
   */
  haptic(type = 'light') {
    if (!navigator.vibrate) return;

    switch (type) {
      case 'light':
        navigator.vibrate(5);
        break;
      case 'medium':
        navigator.vibrate(15);
        break;
      case 'heavy':
        navigator.vibrate(30);
        break;
      case 'success':
        navigator.vibrate([10, 30, 10]);
        break;
      case 'warning':
        navigator.vibrate([30, 50, 10]);
        break;
      case 'error':
        navigator.vibrate([50, 100, 50]);
        break;
    }
  },
};
