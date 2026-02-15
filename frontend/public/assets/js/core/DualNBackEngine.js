/**
 * DualNBackEngine.js
 * Core logic for the Dual N-Back working memory training game.
 * @module Core/Games
 */

export class DualNBackEngine {
  /**
   * @param {number} n - The 'N' in N-Back (default 1)
   * @param {number} totalRounds - Number of rounds per session (default 20)
   */
  constructor(n = 2, totalRounds = 20) {
    this.n = n;
    this.totalRounds = totalRounds;

    this.history = []; // Array of { position: number, letter: string }
    this.score = 0;
    this.currentRound = 0;

    // Configuration
    this.gridSize = 9; // 3x3 grid
    this.letters = ['A', 'B', 'C', 'H', 'K', 'L', 'O', 'Q', 'R', 'S', 'T'];

    // Validation state for current round
    this.userInput = {
      position: false,
      audio: false,
    };
  }

  /**
   * detailed game state reset
   */
  startGame() {
    this.history = [];
    this.score = 0;
    this.currentRound = 0;
    return this.nextRound();
  }

  /**
   * Generate next stimuli
   * @returns {Object} { position: number, letter: string, round: number }
   */
  nextRound() {
    if (this.currentRound >= this.totalRounds) {
      return null; // Game Over
    }

    // Logic to force matches occasionally (approx 30% chance)
    // This ensures the game isn't random noise and actually tests N-back
    const shouldMatchPosition = Math.random() < 0.3 && this.history.length >= this.n;
    const shouldMatchAudio = Math.random() < 0.3 && this.history.length >= this.n;

    let position, letter;

    if (shouldMatchPosition) {
      position = this.history[this.history.length - this.n].position;
    } else {
      // Pick random position, try to avoid accidental N-back match if possible
      do {
        position = Math.floor(Math.random() * this.gridSize);
      } while (
        this.history.length >= this.n &&
        position === this.history[this.history.length - this.n].position &&
        Math.random() > 0.1
      );
    }

    if (shouldMatchAudio) {
      letter = this.history[this.history.length - this.n].letter;
    } else {
      // Pick random letter
      do {
        letter = this.letters[Math.floor(Math.random() * this.letters.length)];
      } while (
        this.history.length >= this.n &&
        letter === this.history[this.history.length - this.n].letter &&
        Math.random() > 0.1
      );
    }

    const roundData = { position, letter, round: this.currentRound + 1 };
    this.history.push(roundData);
    this.currentRound++;

    // Reset user input for this new round
    this.userInput = { position: false, audio: false };

    return roundData;
  }

  /**
   * Process user input
   * @param {string} type - 'position' or 'audio'
   * @returns {boolean} - True if input was correct (Hit or Correct Rejection handled at end of turn usually, but here we validate immediate intention)
   * For N-Back, user presses button if they think there is a match.
   */
  submitMatch(type) {
    if (this.history.length <= this.n) return false; // Cannot match yet

    const currentItem = this.history[this.history.length - 1];
    const targetItem = this.history[this.history.length - 1 - this.n];

    let isMatch = false;
    if (type === 'position') {
      isMatch = currentItem.position === targetItem.position;
      this.userInput.position = true;
    } else if (type === 'audio') {
      isMatch = currentItem.letter === targetItem.letter;
      this.userInput.audio = true;
    }

    // Update score immediately for feedback?
    // Standard N-back usually scoring is complex (Hits, Misses, False Alarms).
    // Let's keep it simple: +10 for correct identification, -5 for false alarm.

    if (isMatch) {
      this.score += 10;
      return true; // Correct Hit
    } else {
      this.score -= 5;
      return false; // False Alarm
    }
  }

  /**
   * Check for missed matches before moving to next round
   * Call this right before nextRound()
   */
  evaluateRound() {
    if (this.history.length <= this.n) return;

    const currentItem = this.history[this.history.length - 1];
    const targetItem = this.history[this.history.length - 1 - this.n];

    // Check Misses (Match existed but user didn't press)
    const positionMatchExists = currentItem.position === targetItem.position;
    const audioMatchExists = currentItem.letter === targetItem.letter;

    if (positionMatchExists && !this.userInput.position) {
      this.score -= 5; // Miss penalty
    }
    if (audioMatchExists && !this.userInput.audio) {
      this.score -= 5;
    }
  }

  getStats() {
    return {
      score: this.score,
      round: this.currentRound,
      total: this.totalRounds,
      level: this.n,
    };
  }
}
