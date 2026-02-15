/**
 * Badges.js
 * Definitions for Gamification Badges.
 */

export const BADGES = [
  {
    id: 'new_brain',
    name: 'New Brain',
    description: 'Completed your first cognitive training session.',
    icon: '🧠',
    condition: (state, session) => state.sessions?.length >= 1,
  },
  {
    id: 'streak_week',
    name: 'Consistency King',
    description: 'Maintained a 7-day streak.',
    icon: '🔥',
    condition: (state) => state.streak >= 7,
  },
  {
    id: 'nback_novice',
    name: 'Memory Master I',
    description: 'Reached N-Level 3 in Dual N-Back.',
    icon: '⚡',
    condition: (state, session) => session?.game === 'DualNBack' && session?.metrics?.level >= 3,
  },
  {
    id: 'stroop_sniper',
    name: 'Focus Ninja',
    description: 'Scored over 1000 in Stroop Test.',
    icon: '🎯',
    condition: (state, session) => session?.game === 'Stroop' && session?.score >= 1000,
  },
  {
    id: 'speed_demon',
    name: 'Speed Demon',
    description: 'Processed 20+ matches in Speed Match.',
    icon: '⚡',
    condition: (state, session) =>
      session?.game === 'SpeedMatch' && session?.metrics?.matches >= 20,
  },
];
