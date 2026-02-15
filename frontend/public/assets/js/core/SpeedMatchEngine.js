/**
 * SpeedMatchEngine.js
 * Core logic for Speed Processing/Pattern Matching game.
 * @module Core/Games
 */

export class SpeedMatchEngine {
  constructor(duration = 60) {
    this.duration = duration; // seconds
    this.score = 0;
    this.matches = 0;
    this.errors = 0;
    this.currentSet = null;

    // Symbols library
    this.symbols = ['★', '⚡', '♦', '♠', '♥', '♣', '●', '■', '▲', '▼', '∞', '♫', '☼', '⚓'];
  }

  startGame() {
    this.score = 0;
    this.matches = 0;
    this.errors = 0;
    return this.nextSet();
  }

  nextSet() {
    // Generate a reference symbol and a set of options
    // 50% chance the reference is present in the options
    const reference = this.symbols[Math.floor(Math.random() * this.symbols.length)];
    const isPresent = Math.random() > 0.5;

    const options = [];
    const numOptions = 5; // 5 symbols to scan

    if (isPresent) {
      options.push(reference);
      // Fill rest with random other symbols
      while (options.length < numOptions) {
        const s = this.symbols[Math.floor(Math.random() * this.symbols.length)];
        if (s !== reference && !options.includes(s)) options.push(s);
      }
    } else {
      // Fill all with random other symbols
      while (options.length < numOptions) {
        const s = this.symbols[Math.floor(Math.random() * this.symbols.length)];
        if (s !== reference && !options.includes(s)) options.push(s);
      }
    }

    // Shuffle options
    for (let i = options.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [options[i], options[j]] = [options[j], options[i]];
    }

    this.currentSet = { reference, options, isPresent };
    return this.currentSet;
  }

  submitAnswer(userSaysPresent) {
    const isCorrect = userSaysPresent === this.currentSet.isPresent;

    if (isCorrect) {
      this.score += 50;
      this.matches++;
      return { correct: true, points: 50 };
    } else {
      this.score -= 20;
      this.errors++;
      return { correct: false, points: -20 };
    }
  }

  getStats() {
    return {
      score: this.score,
      matches: this.matches,
      errors: this.errors,
      accuracy:
        this.matches + this.errors > 0
          ? Math.round((this.matches / (this.matches + this.errors)) * 100)
          : 0,
    };
  }
}
