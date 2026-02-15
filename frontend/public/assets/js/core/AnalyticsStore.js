/**
 * AnalyticsStore.js
 * Tracks user sessions, cognitive metrics, and usage stats.
 * @module Core/Analytics
 */

export const analyticsModule = {
  /**
   * @typedef {Object} AnalyticsState
   * @property {Array} sessions - History of game sessions
   * @property {Object} profile - Aggregated cognitive metrics
   */
  state: {
    sessions: [], // { game: string, score: number, timestamp: string, metrics: Object }
    profile: {
      memory: 50,
      focus: 50,
      speed: 50,
      problemSolving: 50,
    },
  },

  mutations: {
    ADD_SESSION(state, session) {
      state.sessions.push(session);
    },
    LOG_SESSION(state, session) {
      state.sessions.push({
        ...session,
        id: Date.now(),
        timestamp: new Date().toISOString(),
      });
      // Keep only last 100 sessions to save space
      if (state.sessions.length > 100) {
        state.sessions.shift();
      }
    },
    UPDATE_PROFILE(state, { category, value }) {
      if (state.profile[category] !== undefined) {
        // Simple moving average or direct update
        // For now, let's just update it towards the new value (learning rate 0.2)
        const current = state.profile[category];
        state.profile[category] = Math.round(current + (value - current) * 0.2);
      }
    },
  },

  actions: {
    recordSession({ commit, dispatch }, session) {
      const sessionWithTime = {
        ...session,
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
      };
      commit('ADD_SESSION', sessionWithTime);

      // Calculate metrics update
      if (session.game === 'DualNBack') {
        commit('UPDATE_PROFILE', { category: 'memory', value: (session.score / 20) * 10 }); // Normalize roughly
      } else if (session.game === 'Stroop') {
        commit('UPDATE_PROFILE', { category: 'focus', value: (session.score / 2000) * 100 });
      } else if (session.game === 'SpeedMatch') {
        commit('UPDATE_PROFILE', { category: 'speed', value: (session.score / 1500) * 100 });
      }

      // Cross-module: Award XP based on score
      // 10% of score as XP
      const xp = Math.floor((session.score || 0) * 0.1);
      if (xp > 0) {
        dispatch('awardXP', xp);
        dispatch('checkUnlockables', sessionWithTime);
      }
    },

    getAnalyticsSummary({ state }) {
      // Return processed stats for dashboard
      return {
        totalSessions: state.sessions.length,
        lastSession: state.sessions[state.sessions.length - 1],
        profile: state.profile,
      };
    },
  },
};
