import { Component } from '../core/Component.js';
import { StroopEngine } from '../core/StroopEngine.js';

export class StroopGame extends Component {
  constructor(config) {
    super(config);
    this.engine = new StroopEngine(20);
    this.isPlaying = false;
  }

  init() {
    this.render();
    this.addEventListeners();
  }

  render() {
    const stats = this.engine.getStats();

    this.element.innerHTML = `
            <div class="game-container" style="text-align: center; max-width: 500px; margin: 0 auto;">
                <div class="game-header" style="margin-bottom: 2rem;">
                    <h2>Stroop Test</h2>
                    <div class="game-stats" style="display: flex; justify-content: space-between; margin-bottom: 1rem; font-size: 0.9rem; color: #666;">
                        <span>Round: ${stats.round}/${stats.total}</span>
                        <span>Avg RT: ${stats.avgRT}ms</span>
                        <span>Score: ${stats.score}</span>
                    </div>
                </div>

                <div class="stimulus-area" style="height: 200px; display: flex; align-items: center; justify-content: center; margin-bottom: 2rem; background: #f8f9fa; border-radius: 12px;">
                    <h1 class="stimulus-text" style="font-size: 4rem; font-weight: 800; letter-spacing: 2px;">READY?</h1>
                </div>

                <div class="controls" style="display: ${this.isPlaying ? 'grid' : 'none'}; grid-template-columns: 1fr 1fr; gap: 15px;">
                    <button class="btn-color" data-color="red" style="background: #ef4444; color: white; padding: 1.5rem; border: none; border-radius: 8px; font-weight: bold;">RED</button>
                    <button class="btn-color" data-color="blue" style="background: #3b82f6; color: white; padding: 1.5rem; border: none; border-radius: 8px; font-weight: bold;">BLUE</button>
                    <button class="btn-color" data-color="green" style="background: #10b981; color: white; padding: 1.5rem; border: none; border-radius: 8px; font-weight: bold;">GREEN</button>
                    <button class="btn-color" data-color="yellow" style="background: #f59e0b; color: white; padding: 1.5rem; border: none; border-radius: 8px; font-weight: bold; text-shadow: 0 1px 2px rgba(0,0,0,0.2);">YELLOW</button>
                </div>

                <div class="start-screen" style="display: ${this.isPlaying ? 'none' : 'block'};">
                    <p style="margin-bottom: 2rem;">Click the button matching the <strong>INK COLOR</strong>, not the word text.</p>
                    <button class="btn-primary btn-start">Start Game</button>
                </div>
            </div>
        `;
  }

  addEventListeners() {
    const startBtn = this.element.querySelector('.btn-start');
    if (startBtn) {
      startBtn.addEventListener('click', () => this.startGame());
    }

    const colorBtns = this.element.querySelectorAll('.btn-color');
    colorBtns.forEach((btn) => {
      btn.addEventListener('click', (e) => this.handleInput(e.target.dataset.color, e.target));
    });
  }

  startGame() {
    this.isPlaying = true;
    this.engine.startGame();
    this.render();
    // Need to re-bind events after render
    this.addEventListeners();
    this.nextTurn();
  }

  nextTurn() {
    const stimulus = this.engine.nextRound();

    if (!stimulus) {
      this.endGame();
      return;
    }

    const stimulusEl = this.element.querySelector('.stimulus-text');

    // Reset state
    stimulusEl.style.opacity = '0';

    setTimeout(() => {
      stimulusEl.textContent = stimulus.text.toUpperCase();
      stimulusEl.style.color = this.getColorHex(stimulus.color);
      stimulusEl.style.opacity = '1';
    }, 200);
  }

  getColorHex(name) {
    const map = {
      red: '#ef4444',
      blue: '#3b82f6',
      green: '#10b981',
      yellow: '#f59e0b',
    };
    return map[name] || '#000';
  }

  handleInput(color, btn) {
    const result = this.engine.submitAnswer(color);

    // Feedback
    // If correct, maybe a subtle flash?
    // If wrong, shake the screen?

    this.updateStatsUI();
    this.nextTurn();
  }

  updateStatsUI() {
    const stats = this.engine.getStats();
    // Simply re-rendering might be too heavy/flickery for rapid Stroop, but let's try updating DOM directly
    const container = this.element.querySelector('.game-stats');
    if (container) {
      container.innerHTML = `
                <span>Round: ${stats.round}/${stats.total}</span>
                <span>Avg RT: ${stats.avgRT}ms</span>
                <span>Score: ${stats.score}</span>
            `;
    }
  }

  endGame() {
    this.isPlaying = false;
    this.render();
    this.addEventListeners();

    // Save to analytics
    if (window.app && window.app.store) {
      window.app.store.dispatch('recordSession', {
        game: 'Stroop',
        score: this.engine.score,
        metrics: { accuracy: this.engine.getStats().accuracy, avgRT: this.engine.getStats().avgRT },
      });
    }

    alert(`Game Over! Final Score: ${this.engine.score}`);
  }
}
