/**
 * GamificationStore.js
 * Manages user progression, XP, Levels, and Streaks.
 * @module Core/Gamification
 */

import { BADGES } from './Badges.js';

const LEVELS = [0, 100, 250, 500, 1000, 2000, 4000, 8000, 16000, 32000]; // XP thresholds

/**
 * @typedef {Object} GamificationState
 * @property {number} xp - Current experience points
 * @property {number} level - Current user level
 * @property {number} streak - Current daily streak
 * @property {string|null} lastLogin - ISO date string of last login
 * @property {string[]} achievements - List of unlocked achievement IDs
 */

export const gamificationModule = {
  /** @type {GamificationState} */
  state: {
    xp: 0,
    level: 1,
    streak: 0,
    lastLogin: null,
    achievements: [], // Array of achievement IDs
  },

  mutations: {
    ADD_XP(state, amount) {
      state.xp += amount;
      // Calculate Level
      // Simple logic: Find highest level threshold exceeded
      let newLevel = 1;
      for (let i = 0; i < LEVELS.length; i++) {
        if (state.xp >= LEVELS[i]) {
          newLevel = i + 1;
        }
      }
      if (newLevel > state.level) {
        state.level = newLevel;
        // We could dispatch a 'LEVEL_UP' event via EventBus in the action, not mutation
      }
    },
    UPDATE_STREAK(state) {
      const today = new Date().toDateString();
      if (state.lastLogin === today) return; // Already logged in today

      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      if (state.lastLogin === yesterday.toDateString()) {
        state.streak += 1;
      } else {
        state.streak = 1; // Reset streak if missed a day (or first login)
      }
      state.lastLogin = today;
    },
    UNLOCK_ACHIEVEMENT(state, achievementId) {
      if (!state.achievements.includes(achievementId)) {
        state.achievements.push(achievementId);
      }
    },
  },

  actions: {
    addXP({ commit, state }, amount) {
      const oldLevel = state.level;
      commit('ADD_XP', amount);
      if (state.level > oldLevel) {
        // Return metadata for UI to show toast
        return { levelUp: true, newLevel: state.level };
      }
      return { levelUp: false };
    },
    checkDailyStreak({ commit }) {
      commit('UPDATE_STREAK');
    },
  },
};
