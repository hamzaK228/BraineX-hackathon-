/**
 * StroopEngine.js
 * Core logic for the Stroop Test (Inhibitory Control).
 * @module Core/Games
 */

export class StroopEngine {
  constructor(totalRounds = 20) {
    this.totalRounds = totalRounds;
    this.score = 0;
    this.currentRound = 0;
    this.history = []; // { stimulus, reactionTime, isCorrect }

    this.colors = ['red', 'blue', 'green', 'yellow'];
    this.startTime = 0;
  }

  startGame() {
    this.score = 0;
    this.currentRound = 0;
    this.history = [];
    return this.nextRound();
  }

  nextRound() {
    if (this.currentRound >= this.totalRounds) return null;

    // Generate stimulus
    // 50% chance of Congruent (Red written in Red)
    // 50% chance of Incongruent (Red written in Blue)
    const text = this.colors[Math.floor(Math.random() * this.colors.length)];
    const isCongruent = Math.random() > 0.5;
    let color;

    if (isCongruent) {
      color = text;
    } else {
      do {
        color = this.colors[Math.floor(Math.random() * this.colors.length)];
      } while (color === text);
    }

    this.currentStimulus = { text, color, isCongruent };
    this.currentRound++;
    this.startTime = performance.now(); // High precision timer

    return this.currentStimulus;
  }

  /**
   * Submit user answer
   * @param {string} selectedColor - The color the user clicked
   */
  submitAnswer(selectedColor) {
    const endTime = performance.now();
    const reactionTime = endTime - this.startTime;
    const isCorrect = selectedColor === this.currentStimulus.color;

    // Scoring:
    // Correct: +100 - (ReactionTime / 10). Fast = more points. Max 100.
    // Incorrect: -50
    let points = 0;
    if (isCorrect) {
      // Cap RT penalty at 1000ms (so min positive score is usually achieved)
      const speedBonus = Math.max(0, 1000 - reactionTime);
      // Base score 50 + speed bonus up to 50
      points = 50 + speedBonus / 20;
      points = Math.round(points);
    } else {
      points = -20;
    }

    this.score += points;
    this.history.push({
      round: this.currentRound,
      rt: reactionTime,
      correct: isCorrect,
      stimulus: this.currentStimulus,
    });

    return { isCorrect, points, reactionTime };
  }

  getStats() {
    const correctCount = this.history.filter((h) => h.correct).length;
    const avgRT =
      this.history.length > 0
        ? this.history.reduce((acc, h) => acc + h.rt, 0) / this.history.length
        : 0;

    return {
      score: this.score,
      round: this.currentRound,
      total: this.totalRounds,
      accuracy: Math.round((correctCount / this.currentRound) * 100) || 0,
      avgRT: Math.round(avgRT),
    };
  }
}
