import { Component } from '../core/Component.js';
import { SpeedMatchEngine } from '../core/SpeedMatchEngine.js';

export class SpeedMatchGame extends Component {
  constructor(config) {
    super(config);
    this.engine = new SpeedMatchEngine(60); // 60s game
    this.timeLeft = 60;
    this.timer = null;
    this.isPlaying = false;
  }

  init() {
    this.render();
    this.addEventListeners();
  }

  render() {
    const stats = this.engine.getStats();

    this.element.innerHTML = `
            <div class="game-container" style="text-align: center; max-width: 600px; margin: 0 auto;">
                <div class="game-header" style="margin-bottom: 2rem;">
                    <h2>Speed Match</h2>
                    <div class="game-stats" style="display: flex; justify-content: space-between; margin-bottom: 1rem; font-size: 1.1rem;">
                        <span style="color: #667eea; font-weight: bold;">Time: ${this.timeLeft}s</span>
                        <span>Score: ${stats.score}</span>
                    </div>
                </div>

                <div class="game-area" style="display: ${this.isPlaying ? 'block' : 'none'};">
                    <div class="instruction" style="margin-bottom: 2rem; font-size: 1.2rem;">
                        Does the symbol 
                        <span class="ref-symbol" style="
                            font-size: 3rem; 
                            color: var(--primary-color); 
                            display: inline-block; 
                            margin: 0 10px; 
                            vertical-align: middle;
                            background: white;
                            padding: 0.5rem 1rem;
                            border-radius: 8px;
                            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                        ">?</span> 
                        appear below?
                    </div>

                    <div class="options-container" style="
                        display: flex; 
                        justify-content: center; 
                        gap: 15px; 
                        margin-bottom: 3rem;
                        background: #f8f9fa;
                        padding: 2rem;
                        border-radius: 12px;
                    ">
                        <!-- Options injected here -->
                    </div>

                    <div class="controls" style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                        <button class="btn-decision btn-no" style="background: #ef4444; color: white; padding: 1.5rem; border: none; border-radius: 8px; font-size: 1.5rem;">NO (Left)</button>
                        <button class="btn-decision btn-yes" style="background: #10b981; color: white; padding: 1.5rem; border: none; border-radius: 8px; font-size: 1.5rem;">YES (Right)</button>
                    </div>
                </div>

                <div class="start-screen" style="display: ${this.isPlaying ? 'none' : 'block'};">
                    <p style="margin-bottom: 2rem; font-size: 1.1rem;">Scan the symbols quickly. Press <strong>YES</strong> if the target symbol is present, <strong>NO</strong> if it's missing.</p>
                    <button class="btn-primary btn-start" style="font-size: 1.2rem; padding: 1rem 3rem;">Start Game (60s)</button>
                </div>
            </div>
        `;
  }

  addEventListeners() {
    const startBtn = this.element.querySelector('.btn-start');
    if (startBtn) startBtn.addEventListener('click', () => this.startGame());

    const yesBtn = this.element.querySelector('.btn-yes');
    const noBtn = this.element.querySelector('.btn-no');

    if (yesBtn) yesBtn.addEventListener('click', () => this.handleDecision(true));
    if (noBtn) noBtn.addEventListener('click', () => this.handleDecision(false));

    document.addEventListener('keydown', this.handleKey.bind(this));
  }

  handleKey(e) {
    if (!this.isPlaying) return;
    if (e.key === 'ArrowRight') this.handleDecision(true);
    if (e.key === 'ArrowLeft') this.handleDecision(false);
  }

  startGame() {
    this.isPlaying = true;
    this.timeLeft = 60;
    this.engine.startGame();
    this.render();
    this.addEventListeners();
    this.nextTurn();

    this.timer = setInterval(() => {
      this.timeLeft--;
      this.updateTimerUI();
      if (this.timeLeft <= 0) {
        this.endGame();
      }
    }, 1000);
  }

  nextTurn() {
    const set = this.engine.nextSet();

    // Update Reference
    const refEl = this.element.querySelector('.ref-symbol');
    if (refEl) refEl.textContent = set.reference;

    // Update Options
    const container = this.element.querySelector('.options-container');
    if (container) {
      container.innerHTML = set.options
        .map(
          (s) => `
                <div class="symbol-card" style="
                    font-size: 2.5rem; 
                    width: 60px; 
                    height: 60px; 
                    display: flex; 
                    align-items: center; 
                    justify-content: center;
                    background: white;
                    border: 1px solid #e2e8f0;
                    border-radius: 8px;
                ">${s}</div>
            `
        )
        .join('');
    }
  }

  handleDecision(userSaysYes) {
    const result = this.engine.submitAnswer(userSaysYes);

    // Feedback
    const feedbackColor = result.correct ? '#10b981' : '#ef4444';
    const gameContainer = this.element.querySelector('.game-container');
    gameContainer.style.borderColor = feedbackColor;
    gameContainer.style.boxShadow = `0 0 20px ${feedbackColor}40`;

    setTimeout(() => {
      gameContainer.style.borderColor = '';
      gameContainer.style.boxShadow = '';
    }, 200);

    this.updateStatsUI();
    this.nextTurn();
  }

  updateTimerUI() {
    const timerEl = this.element.querySelector('.game-stats span:first-child');
    if (timerEl) {
      timerEl.textContent = `Time: ${this.timeLeft}s`;
      if (this.timeLeft < 10) timerEl.style.color = '#ef4444';
    }
  }

  updateStatsUI() {
    const stats = this.engine.getStats();
    const scoreEl = this.element.querySelector('.game-stats span:nth-child(2)');
    if (scoreEl) scoreEl.textContent = `Score: ${stats.score}`;
  }

  endGame() {
    this.isPlaying = false;
    clearInterval(this.timer);
    this.render();
    this.addEventListeners();

    // Save to analytics
    if (window.app && window.app.store) {
      window.app.store.dispatch('recordSession', {
        game: 'SpeedMatch',
        score: this.engine.score,
        metrics: this.engine.getStats(),
      });
    }

    alert(`Time's Up! Final Score: ${this.engine.score}`);
  }
}
