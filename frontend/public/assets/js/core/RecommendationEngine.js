/**
 * RecommendationEngine.js
 * Provides content suggestions based on user profile and behavior.
 * Implements Strategy Pattern for flexible scoring.
 * @module Core/Recommendation
 */

/**
 * Strategy Interface
 * @typedef {Object} ScoringStrategy
 * @property {string} name
 * @property {function(any, Object): number} calculateScore
 */

// --- Strategies ---

const FieldMatchStrategy = {
  name: 'FieldMatch',
  calculateScore(item, userState) {
    const interestField = userState.filters?.fields?.[0]?.toLowerCase() || '';
    if (!interestField) return 0;

    const itemTags = (item.tags || [])
      .concat(item.category ? [item.category] : [])
      .map((t) => t.toLowerCase());
    return itemTags.some((t) => t.includes(interestField)) ? 10 : 0;
  },
};

const UrgencyStrategy = {
  name: 'Urgency',
  calculateScore(item, userState) {
    if (!item.deadline) return 0;
    const daysLeft = (new Date(item.deadline) - new Date()) / (1000 * 60 * 60 * 24);
    // Urgent (less than 30 days) but not expired
    return daysLeft > 0 && daysLeft < 30 ? 5 : 0;
  },
};

const UserTagsStrategy = {
  name: 'UserTags',
  calculateScore(item, userState) {
    const userTags = userState.user?.tags || [];
    if (userTags.length === 0) return 0;

    const itemTags = (item.tags || [])
      .concat(item.category ? [item.category] : [])
      .map((t) => t.toLowerCase());
    let matches = 0;
    userTags.forEach((tag) => {
      if (itemTags.includes(tag.toLowerCase())) matches++;
    });
    return matches * 2;
  },
};

const CognitiveNeedsStrategy = {
  name: 'CognitiveNeeds',
  calculateScore(item, userState) {
    // Only applicable for Game items
    if (item.type !== 'game') return 0;

    const profile = userState.profile || {};

    // Recommend games improving weak areas
    if (item.id === 'dual-n-back' && (profile.memory || 50) < 60) return 15;
    if (item.id === 'stroop' && (profile.focus || 50) < 60) return 15;
    if (item.id === 'speed-match' && (profile.speed || 50) < 60) return 15;

    return 0;
  },
};

// --- Engine ---

export class RecommendationEngine {
  constructor(store) {
    this.store = store;
    /** @type {ScoringStrategy[]} */
    this.strategies = [
      FieldMatchStrategy,
      UrgencyStrategy,
      UserTagsStrategy,
      CognitiveNeedsStrategy,
    ];
  }

  /**
   * Add a new custom strategy
   * @param {ScoringStrategy} strategy
   */
  addStrategy(strategy) {
    this.strategies.push(strategy);
  }

  /**
   * Get recommended items based on a dataset and user profile
   * @param {Array} items - The list of items (scholarships, mentors, etc.)
   * @param {Object} options - Filtering options
   * @returns {Array} - Sorted list of recommended items
   */
  recommend(items, { type = 'general', limit = 5 } = {}) {
    const userState = this.store.state;

    // Calculate scores using all strategies
    const scoredItems = items.map((item) => {
      let totalScore = 0;

      this.strategies.forEach((strategy) => {
        try {
          totalScore += strategy.calculateScore(item, userState);
        } catch (e) {
          console.warn(`Strategy ${strategy.name} failed:`, e);
        }
      });

      return { item, score: totalScore };
    });

    // Sort by score desc, then return items
    return scoredItems
      .sort((a, b) => b.score - a.score)
      .map((entry) => entry.item)
      .slice(0, limit);
  }

  /**
   * Adaptive Logic for Difficulty (Placeholder for Phase 4)
   * @param {number} currentPerformance - User's recent score (0-100)
   * @returns {string} - 'easy', 'medium', 'hard'
   */
  adjustDifficulty(currentPerformance) {
    if (currentPerformance > 80) return 'hard';
    if (currentPerformance < 40) return 'easy';
    return 'medium';
  }
}
