/**
 * Store.js
 * Centralized State Management (Redux-lite pattern)
 */
import { eventBus } from './EventBus.js';

export class Store {
  /**
   * @param {Object} params
   * @param {Object} params.state - Initial state
   * @param {Object} params.mutations - Functions to mutate state synchronously
   * @param {Object} params.actions - Async actions that can commit mutations
   */
  constructor({ state = {}, mutations = {}, actions = {}, persistenceKey = null }) {
    // Load persisted state if available
    let savedState = {};
    if (persistenceKey) {
      try {
        const stored = localStorage.getItem(persistenceKey);
        if (stored) {
          savedState = JSON.parse(stored);
        }
      } catch (e) {
        console.warn('Failed to load persisted state:', e);
      }
    }

    const initialState = { ...state, ...savedState };

    // Create a Proxy to intercept state changes
    this.state = new Proxy(initialState || {}, {
      set: (target, key, value) => {
        target[key] = value;
        eventBus.publish('stateChange', { key, value, state: target });

        // Persist state if key provided
        if (persistenceKey) {
          try {
            localStorage.setItem(persistenceKey, JSON.stringify(target));
          } catch (e) {
            console.warn('Failed to save state:', e);
          }
        }
        return true;
      },
    });

    this.mutations = mutations;
    this.actions = actions;
  }

  /**
   * Commit a mutation
   * @param {string} type - Mutation name
   * @param {any} payload - Data for the mutation
   */
  commit(type, payload) {
    if (typeof this.mutations[type] !== 'function') {
      console.error(`Mutation "${type}" doesn't exist.`);
      return false;
    }

    // Run the mutation
    // We pass the RAW state to mutations? Or the proxy?
    // Passing the proxy ensures our 'set' trap triggers events.
    this.mutations[type](this.state, payload);
    return true;
  }

  /**
   * Dispatch an action
   * @param {string} type - Action name
   * @param {any} payload - Data for the action
   */
  async dispatch(type, payload) {
    if (typeof this.actions[type] !== 'function') {
      console.error(`Action "${type}" doesn't exist.`);
      return false;
    }

    // Context passed to actions
    const context = {
      state: this.state,
      commit: this.commit.bind(this),
      dispatch: this.dispatch.bind(this),
    };

    return await this.actions[type](context, payload);
  }
}
