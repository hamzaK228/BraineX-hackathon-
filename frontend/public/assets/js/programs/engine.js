/**
 * SUMMER PROGRAMS ENGINE
 * Handles listings, countdowns, and application wizard.
 */
class ProgramsEngine {
  constructor() {
    this.data = [];
    this.container = document.getElementById('programsGrid');

    this.init();
  }

  async init() {
    try {
      const response = await fetch('/data/programs.json');
      this.data = await response.json();

      this.render(this.data);
      this.startTimers();
      this.setupCategoryFilter();
    } catch (error) {
      console.error(error);
    }
  }

  setupCategoryFilter() {
    const filter = document.getElementById('programCategory');
    if (!filter) return;

    filter.addEventListener('change', (e) => {
      const cat = e.target.value;
      const filtered = cat ? this.data.filter((p) => p.category === cat) : this.data;
      this.render(filtered);
    });
  }

  render(programs) {
    if (!this.container) return;

    const now = new Date();

    this.container.innerHTML = programs
      .map((p) => {
        const deadline = new Date(p.deadline);
        const isExpired = now > deadline;

        return `
            <div class="program-card">
                <span class="prog-badge ${p.cost === 0 ? 'badge-free' : 'badge-paid'}">
                    ${p.cost === 0 ? 'Full Scholarship' : '$' + p.cost}
                </span>
                
                <div class="prog-header">
                    <div class="prog-provider">${p.provider}</div>
                    <h3 class="prog-title">${p.name}</h3>
                </div>

                <div class="countdown-container">
                    <span class="timer-label">Application Deadline</span>
                    <span class="timer-val" data-deadline="${p.deadline}">
                        ${isExpired ? 'CLOSED' : 'Loading...'}
                    </span>
                </div>

                <div class="prog-details">
                    <div class="detail-row"><i class="fas fa-map-marker-alt"></i> ${p.location}</div>
                    <div class="detail-row"><i class="fas fa-calendar"></i> ${p.dates}</div>
                    <div class="detail-row"><i class="fas fa-tag"></i> ${p.category}</div>
                </div>

                <a href="application-guide.html?id=${p.id}" class="btn btn-primary btn-block">
                    ${isExpired ? 'View Details' : 'Start Application'}
                </a>
            </div>
            `;
      })
      .join('');
  }

  startTimers() {
    setInterval(() => {
      document.querySelectorAll('.timer-val').forEach((el) => {
        const deadlineStr = el.dataset.deadline;
        if (!deadlineStr) return;

        const deadline = new Date(deadlineStr);
        const now = new Date();
        const diff = deadline - now;

        if (diff <= 0) {
          el.textContent = 'CLOSED';
          el.style.color = '#94a3b8';
          return;
        }

        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

        el.textContent = `${days}d ${hours}h remaining`;
      });
    }, 1000);
  }
}

// Application Wizard Logic
class ApplicationWizard {
  constructor() {
    this.step = 1;
    this.totalSteps = 4;
    this.progress = document.querySelector('.progress-fill');

    this.init();
  }

  init() {
    this.setupButtons();
    this.updateUI();
  }

  setupButtons() {
    document.querySelectorAll('.js-next').forEach((btn) => {
      btn.addEventListener('click', () => this.nextStep());
    });
    document.querySelectorAll('.js-prev').forEach((btn) => {
      btn.addEventListener('click', () => this.prevStep());
    });
  }

  nextStep() {
    if (this.step < this.totalSteps) {
      this.step++;
      this.updateUI();
    }
  }

  prevStep() {
    if (this.step > 1) {
      this.step--;
      this.updateUI();
    }
  }

  updateUI() {
    // Hide all steps
    document.querySelectorAll('.guide-step').forEach((el) => {
      el.classList.remove('active');
    });

    // Show current
    const current = document.getElementById(`step${this.step}`);
    if (current) current.classList.add('active');

    // Update bar
    if (this.progress) {
      const pct = ((this.step - 1) / (this.totalSteps - 1)) * 100;
      this.progress.style.width = `${pct}%`;
    }
  }
}

// Init
document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('programsGrid')) {
    new ProgramsEngine();
  }
  if (document.querySelector('.guide-container')) {
    new ApplicationWizard();
  }
});
