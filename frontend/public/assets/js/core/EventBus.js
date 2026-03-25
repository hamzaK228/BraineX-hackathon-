/**
 * EventBus.js
 * Implements a Pub/Sub pattern for decoupled component communication.
 */
export class EventBus {
  constructor() {
    this.listeners = {};
  }

  /**
   * Subscribe to an event
   * @param {string} event - Event name
   * @param {Function} callback - Function to run when event is published
   * @returns {Function} - Unsubscribe function
   */
  subscribe(event, callback) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);

    // Return unsubscribe function
    return () => this.unsubscribe(event, callback);
  }

  /**
   * Publish an event
   * @param {string} event - Event name
   * @param {any} data - Data to pass to subscribers
   */
  publish(event, data) {
    if (!this.listeners[event]) return;

    this.listeners[event].forEach((callback) => {
      try {
        callback(data);
      } catch (error) {
        console.error(`Error handling event "${event}":`, error);
      }
    });
  }

  /**
   * Unsubscribe from an event
   * @param {string} event
   * @param {Function} callback
   */
  unsubscribe(event, callback) {
    if (!this.listeners[event]) return;
    this.listeners[event] = this.listeners[event].filter((cb) => cb !== callback);
  }
}

// Singleton instance
export const eventBus = new EventBus();
