import { Component } from '../core/Component.js';
import { DualNBackEngine } from '../core/DualNBackEngine.js';

export class DualNBackGame extends Component {
  constructor(config) {
    super(config);
    this.engine = new DualNBackEngine(2, 20); // Default to N=2
    this.timer = null;
    this.interval = 3000; // 3 seconds per turn
    this.isPlaying = false;

    // Audio synthesis
    this.synth = window.speechSynthesis;
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
                    <h2>Dual N-Back (N=${stats.level})</h2>
                    <div class="game-stats" style="display: flex; justify-content: Space-between; margin-bottom: 1rem;">
                        <span>Round: ${stats.round}/${stats.total}</span>
                        <span>Score: ${stats.score}</span>
                    </div>
                </div>

                <div class="grid-container" style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-bottom: 2rem; width: 300px; margin: 0 auto 2rem;">
                    ${Array(9)
                      .fill(0)
                      .map(
                        (_, i) => `
                        <div class="grid-cell" data-index="${i}" style="width: 90px; height: 90px; background: rgba(0,0,0,0.1); border-radius: 8px; transition: background 0.2s;"></div>
                    `
                      )
                      .join('')}
                </div>

                <div class="controls" style="display: ${this.isPlaying ? 'flex' : 'none'}; justify-content: center; gap: 20px;">
                    <button class="btn btn-audio-match" style="padding: 1rem 2rem;">Audio Match (A)</button>
                    <button class="btn btn-pos-match" style="padding: 1rem 2rem;">Position Match (L)</button>
                </div>

                <div class="start-screen" style="display: ${this.isPlaying ? 'none' : 'block'};">
                    <p>Remember both the Position and the Letter spoken ${stats.level} moves ago.</p>
                    <button class="btn-primary btn-start">Start Game</button>
                    <div style="margin-top: 2rem;">
                        <button class="btn-link btn-settings">Settings</button>
                    </div>
                </div>
            </div>
        `;
  }

  addEventListeners() {
    const startBtn = this.element.querySelector('.btn-start');
    if (startBtn) {
      startBtn.addEventListener('click', () => this.startGame());
    }

    const audioBtn = this.element.querySelector('.btn-audio-match');
    if (audioBtn) {
      audioBtn.addEventListener('click', () => this.handleInput('audio'));
    }

    const posBtn = this.element.querySelector('.btn-pos-match');
    if (posBtn) {
      posBtn.addEventListener('click', () => this.handleInput('position'));
    }

    // Keyboard support
    document.addEventListener('keydown', this.handleKey.bind(this));
  }

  handleKey(e) {
    if (!this.isPlaying) return;
    if (e.key.toLowerCase() === 'a') this.handleInput('audio');
    if (e.key.toLowerCase() === 'l') this.handleInput('position');
  }

  startGame() {
    this.isPlaying = true;
    this.engine.startGame();
    this.render(); // Update to show controls
    this.nextTurn();
  }

  nextTurn() {
    const stimulus = this.engine.nextRound();

    if (!stimulus) {
      this.endGame();
      return;
    }

    // Visual Stimulus
    this.flashCell(stimulus.position);

    // Audio Stimulus
    this.speak(stimulus.letter);

    // Update Stats UI without full re-render
    this.updateStatsUI();

    this.timer = setTimeout(() => {
      this.engine.evaluateRound(); // Penalize misses
      this.nextTurn();
    }, this.interval);
  }

  flashCell(index) {
    const cell = this.element.querySelector(`.grid-cell[data-index="${index}"]`);
    if (cell) {
      cell.style.background = '#00d2ff'; // Active color
      setTimeout(() => {
        cell.style.background = 'rgba(0,0,0,0.1)';
      }, 1000);
    }
  }

  speak(text) {
    if (this.synth) {
      const utter = new SpeechSynthesisUtterance(text);
      utter.rate = 1.2;
      this.synth.speak(utter);
    }
  }

  handleInput(type) {
    const btn = this.element.querySelector(
      type === 'audio' ? '.btn-audio-match' : '.btn-pos-match'
    );

    // Visual feedback
    if (btn) btn.classList.add('active-press');
    setTimeout(() => btn?.classList.remove('active-press'), 200);

    const result = this.engine.submitMatch(type);

    if (result) {
      // Hit (Correct)
      if (btn) {
        btn.style.borderColor = '#10b981';
        setTimeout(() => (btn.style.borderColor = ''), 300);
      }
    } else {
      // False Alarm
      if (btn) {
        btn.style.borderColor = '#ef4444';
        setTimeout(() => (btn.style.borderColor = ''), 300);
      }
    }
    this.updateStatsUI();
  }

  updateStatsUI() {
    const stats = this.engine.getStats();
    const scoreEl = this.element.querySelector('.game-stats span:nth-child(2)');
    const roundEl = this.element.querySelector('.game-stats span:first-child');

    if (scoreEl) scoreEl.textContent = `Score: ${stats.score}`;
    if (roundEl) roundEl.textContent = `Round: ${stats.round}/${stats.total}`;
  }

  endGame() {
    this.isPlaying = false;
    clearTimeout(this.timer);
    this.render();

    // Save to analytics
    if (window.app && window.app.store) {
      window.app.store.dispatch('recordSession', {
        game: 'DualNBack',
        score: this.engine.score,
        metrics: { level: this.engine.n },
      });
    }

    alert(`Game Over! Final Score: ${this.engine.score}`);
  }
}
