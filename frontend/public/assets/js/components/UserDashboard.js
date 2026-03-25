import { Component } from '../core/Component.js';
import { eventBus } from '../core/EventBus.js';
import { BADGES } from '../core/Badges.js';

export class UserDashboard extends Component {
  constructor(config) {
    super(config);
    this.unsubscribeState = null;
  }

  init() {
    this.render();
    // Subscribe to store changes to re-render or update UI
    if (window.app && window.app.store) {
      // In a real framework we'd use reactive bindings.
      // For now, we subscribe to EventBus 'stateChange' or just re-render on specific events if we had them.
      // Our Store emits 'stateChange'.
      this.unsubscribeState = eventBus.subscribe('stateChange', (data) => {
        if (['xp', 'level', 'streak', 'profile', 'achievements'].includes(data.key)) {
          this.render();
        }
      });
    }
  }

  render() {
    const state = window.app?.store?.state || {};
    const xp = state.xp || 0;
    const level = state.level || 1;
    const streak = state.streak || 0;

    // Calculate progress to next level
    const nextLevelXP = this.getNextLevelXP(level);
    const prevLevelXP = this.getLevelXP(level);
    const progressPercent = Math.min(
      100,
      Math.max(0, ((xp - prevLevelXP) / (nextLevelXP - prevLevelXP)) * 100)
    );

    this.element.innerHTML = `
            <div class="dashboard-card" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 1.5rem; border-radius: 16px; margin-bottom: 2rem; box-shadow: 0 10px 20px rgba(102, 126, 234, 0.2);">
                <div class="dashboard-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                    <div class="user-info">
                        <h2 style="margin: 0; font-size: 1.5rem;">Running on Brain OS 🧠</h2>
                        <p style="margin: 0; opacity: 0.9;">Level ${level} Explorer</p>
                    </div>
                    <div class="streak-badge" style="text-align: center; background: rgba(255,255,255,0.2); padding: 0.5rem 1rem; border-radius: 12px;">
                        <span style="font-size: 1.5rem;">🔥</span>
                        <div style="font-weight: bold; font-size: 0.9rem;">${streak} Day Streak</div>
                    </div>
                </div>
                
                <div class="xp-progress-container" style="margin-bottom: 1rem;">
                    <div style="display: flex; justify-content: space-between; font-size: 0.85rem; margin-bottom: 0.25rem;">
                        <span>XP: ${xp}</span>
                        <span>Next Level: ${nextLevelXP}</span>
                    </div>
                    <div class="progress-bar-bg" 
                         role="progressbar" 
                         aria-valuenow="${progressPercent}" 
                         aria-valuemin="0" 
                         aria-valuemax="100" 
                         aria-label="XP Progress to next level"
                         style="width: 100%; height: 8px; background: rgba(0,0,0,0.2); border-radius: 4px; overflow: hidden;">
                        <div class="progress-bar-fill" style="width: ${progressPercent}%; height: 100%; background: #00d2ff; transition: width 0.5s ease;"></div>
                    </div>
                </div>

                <div class="dashboard-stats" style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 1rem;">
                    <div class="stat-box" style="background: rgba(255,255,255,0.1); padding: 10px; border-radius: 8px; text-align: center;">
                        <div style="font-size: 1.5rem;">🏆</div>
                        <div style="font-size: 0.8rem;">${state.achievements?.length || 0} Badges</div>
                    </div>
                    <div class="stat-box" style="background: rgba(255,255,255,0.1); padding: 10px; border-radius: 8px; text-align: center;">
                        <div style="font-size: 1.5rem;">📈</div>
                        <div style="font-size: 0.8rem;">Rank #${level * 145 + (xp % 100)}</div>
                    </div>
                </div>

                ${this.renderRecentBadges(state.achievements)}

                <div class="quick-stats" style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; text-align: center; margin-top: 1.5rem;">
                    <button onclick="window.location.href='/notion'" style="background: rgba(255,255,255,0.15); border: none; color: white; padding: 0.5rem; border-radius: 8px; cursor: pointer; transition: background 0.2s;">
                        📊 Stats
                    </button>
                    <button onclick="window.app.store.dispatch('checkDailyStreak')" style="background: rgba(255,255,255,0.15); border: none; color: white; padding: 0.5rem; border-radius: 8px; cursor: pointer; transition: background 0.2s;">
                        📅 Check-in
                    </button>
                    <button onclick="window.location.href='/gym'" style="background: rgba(255,255,255,0.15); border: none; color: white; padding: 0.5rem; border-radius: 8px; cursor: pointer; transition: background 0.2s;">
                        🎮 Train
                    </button>
                </div>
            </div>
        `;
  }

  renderRecentBadges(unlockedIds) {
    if (!unlockedIds || unlockedIds.length === 0) return '';

    // Get last 3 badges
    const recent = unlockedIds.slice(-3).reverse();

    return `
            <div class="recent-badges" style="margin-top: 1rem;">
                <div style="font-size: 0.8rem; margin-bottom: 0.5rem; opacity: 0.8;">Recent Achievements</div>
                <div style="display: flex; gap: 8px; background: rgba(0,0,0,0.1); padding: 8px; border-radius: 8px;">
                    ${recent
                      .map((id) => {
                        const badge = BADGES.find((b) => b.id === id);
                        return badge
                          ? `<div title="${badge.name}" style="background: rgba(255,255,255,0.2); width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: help;">${badge.icon}</div>`
                          : '';
                      })
                      .join('')}
                </div>
            </div>
        `;
  }

  getNextLevelXP(level) {
    // Mock logic matching GamificationStore roughly
    const LEVELS = [0, 100, 250, 500, 1000, 2000, 4000, 8000, 16000, 32000];
    return LEVELS[level] || LEVELS[LEVELS.length - 1];
  }

  getLevelXP(level) {
    const LEVELS = [0, 100, 250, 500, 1000, 2000, 4000, 8000, 16000, 32000];
    return LEVELS[level - 1] || 0;
  }
}
