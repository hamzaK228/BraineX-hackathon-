/**
 * Programs Page JavaScript
 * Features: Filter, Search, Countdown Timers, Featured Carousel, Application Assistant
 */

(function () {
  'use strict';

  // State
  let programs = [];
  let filteredPrograms = [];
  let currentCarouselIndex = 0;
  let currentApplicationProgram = null;
  let currentStep = 0;

  // DOM Elements
  const elements = {
    grid: document.getElementById('programsGrid'),
    searchInput: document.getElementById('programSearch'),
    searchBtn: document.getElementById('searchBtn'),
    resultsCount: document.getElementById('resultsCount'),
    noResults: document.getElementById('noResults'),
    sortSelect: document.getElementById('sortSelect'),
    clearFilters: document.getElementById('clearFilters'),
    resetFilters: document.getElementById('resetFilters'),
    filterSidebar: document.getElementById('filterSidebar'),
    toggleFilter: document.getElementById('toggleFilter'),
    carouselTrack: document.getElementById('carouselTrack'),
    carouselPrev: document.getElementById('carouselPrev'),
    carouselNext: document.getElementById('carouselNext'),
    carouselDots: document.getElementById('carouselDots'),
    applicationModal: document.getElementById('applicationModal'),
    applicationBody: document.getElementById('applicationBody'),
    closeApplication: document.getElementById('closeApplication'),
    prevStep: document.getElementById('prevStep'),
    nextStep: document.getElementById('nextStep'),
    stepIndicator: document.getElementById('stepIndicator'),
  };

  // Initialize
  async function init() {
    await loadPrograms();
    setupEventListeners();
    applyFilters();
    renderFeaturedCarousel();
    startCountdownTimers();
  }

  // Load programs data
  async function loadPrograms() {
    try {
      let response;
      try {
        // Try API first
        response = await fetch('/api/programs');
        if (!response.ok) throw new Error('API not available');
        programs = await response.json();
      } catch {
        try {
          // Fallback to static JSON
          response = await fetch('/data/programs.json');
          if (!response.ok) throw new Error('Static data not found');
          programs = await response.json();
        } catch (e) {
          console.error('All fetch attempts failed:', e);
          programs = [];
        }
      }
      console.log(`Loaded ${programs.length} programs`);
    } catch (error) {
      console.error('Error loading programs:', error);
      showError();
    }
  }

  // Setup event listeners
  function setupEventListeners() {
    // Search
    if (elements.searchInput) {
      elements.searchInput.addEventListener('input', debounce(applyFilters, 300));
    }
    if (elements.searchBtn) {
      elements.searchBtn.addEventListener('click', applyFilters);
    }

    // Sort
    if (elements.sortSelect) {
      elements.sortSelect.addEventListener('change', applyFilters);
    }

    // Clear/Reset filters
    if (elements.clearFilters) {
      elements.clearFilters.addEventListener('click', resetAllFilters);
    }
    if (elements.resetFilters) {
      elements.resetFilters.addEventListener('click', resetAllFilters);
    }

    // Filter checkboxes and radios
    document.querySelectorAll('.filter-checkbox input, .filter-radio input').forEach((input) => {
      input.addEventListener('change', applyFilters);
    });

    // Filter toggle (collapsible)
    document.querySelectorAll('.filter-title').forEach((title) => {
      title.addEventListener('click', () => {
        title.classList.toggle('collapsed');
        const options = title.nextElementSibling;
        if (options) {
          options.style.display = title.classList.contains('collapsed') ? 'none' : 'flex';
        }
      });
    });

    // Carousel
    if (elements.carouselPrev) {
      elements.carouselPrev.addEventListener('click', () => moveCarousel(-1));
    }
    if (elements.carouselNext) {
      elements.carouselNext.addEventListener('click', () => moveCarousel(1));
    }

    // Application Modal
    if (elements.closeApplication) {
      elements.closeApplication.addEventListener('click', closeApplicationModal);
    }
    if (elements.prevStep) {
      elements.prevStep.addEventListener('click', () => navigateStep(-1));
    }
    if (elements.nextStep) {
      elements.nextStep.addEventListener('click', () => navigateStep(1));
    }

    // Modal close on backdrop click
    if (elements.applicationModal) {
      elements.applicationModal.addEventListener('click', (e) => {
        if (e.target === elements.applicationModal) {
          closeApplicationModal();
        }
      });
    }

    // Mobile filter toggle
    if (elements.toggleFilter) {
      elements.toggleFilter.addEventListener('click', toggleFilterSidebar);
    }

    // Close on escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        closeApplicationModal();
        if (elements.filterSidebar) {
          elements.filterSidebar.classList.remove('active');
        }
      }
    });
  }

  // Get current filter values
  function getFilters() {
    const filters = {
      search: elements.searchInput?.value?.toLowerCase() || '',
      categories: [],
      age: 'all',
      locationTypes: [],
      cost: 'all',
      competitive: [],
    };

    // Category filters
    document.querySelectorAll('#categoryFilters input:checked').forEach((input) => {
      filters.categories.push(input.value);
    });

    // Age filter
    const ageInput = document.querySelector('#ageFilters input:checked');
    if (ageInput) filters.age = ageInput.value;

    // Location type filters
    document.querySelectorAll('#locationFilters input:checked').forEach((input) => {
      filters.locationTypes.push(input.value);
    });

    // Cost filter
    const costInput = document.querySelector('#costFilters input:checked');
    if (costInput) filters.cost = costInput.value;

    // Competitive filter
    document.querySelectorAll('#competitiveFilters input:checked').forEach((input) => {
      filters.competitive.push(input.value);
    });

    return filters;
  }

  // Apply filters and render
  function applyFilters() {
    const filters = getFilters();

    filteredPrograms = programs.filter((prog) => {
      // Search filter
      if (filters.search) {
        const searchStr =
          `${prog.name} ${prog.shortName} ${prog.organization} ${prog.category} ${prog.location}`.toLowerCase();
        if (!searchStr.includes(filters.search)) return false;
      }

      // Category filter
      if (filters.categories.length > 0 && !filters.categories.includes(prog.category)) {
        return false;
      }

      // Age filter
      if (filters.age !== 'all') {
        const minAge = parseInt(filters.age);
        if (prog.ageMax < minAge) return false;
      }

      // Location type filter
      if (filters.locationTypes.length > 0 && !filters.locationTypes.includes(prog.locationType)) {
        return false;
      }

      // Cost filter
      if (filters.cost !== 'all') {
        switch (filters.cost) {
          case 'free':
            if (prog.cost > 0) return false;
            break;
          case 'under5k':
            if (prog.cost >= 5000) return false;
            break;
          case 'under10k':
            if (prog.cost >= 10000) return false;
            break;
          case 'paid':
            if (prog.cost === 0) return false;
            break;
        }
      }

      // Competitive filter
      if (filters.competitive.length > 0) {
        const isCompetitive = prog.competitive ? 'true' : 'false';
        if (!filters.competitive.includes(isCompetitive)) return false;
      }

      return true;
    });

    // Sort
    const sortBy = elements.sortSelect?.value || 'deadline';
    sortPrograms(sortBy);

    // Render
    renderPrograms();
    updateResultsCount();
  }

  // Sort programs
  function sortPrograms(sortBy) {
    filteredPrograms.sort((a, b) => {
      switch (sortBy) {
        case 'deadline':
          return new Date(a.deadline) - new Date(b.deadline);
        case 'name':
          return a.name.localeCompare(b.name);
        case 'acceptance':
          return (a.acceptanceRate || 100) - (b.acceptanceRate || 100);
        case 'cost-low':
          return a.cost - b.cost;
        case 'cost-high':
          return b.cost - a.cost;
        default:
          return new Date(a.deadline) - new Date(b.deadline);
      }
    });
  }

  // Render programs
  function renderPrograms() {
    if (!elements.grid) return;

    if (filteredPrograms.length === 0) {
      elements.grid.innerHTML = '';
      if (elements.noResults) elements.noResults.style.display = 'block';
      return;
    }

    if (elements.noResults) elements.noResults.style.display = 'none';

    elements.grid.innerHTML = filteredPrograms.map((prog) => createProgramCard(prog)).join('');

    // Attach guide button listeners
    elements.grid.querySelectorAll('.btn-guide').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const btnEl = e.target.closest('.btn-guide');
        if (!btnEl) return;
        const id = btnEl.dataset.id;
        openApplicationGuide(id);
      });
    });

    // Attach details button listeners
    elements.grid.querySelectorAll('.btn-details').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const btnEl = e.target.closest('.btn-details');
        if (!btnEl) return;
        const id = btnEl.dataset.id;
        // For now, show alert or expand -> ideally open a modal
        // Simplest: Redirect to a details view with query param (which we need to handle or create)
        // window.location.href = `/program-details.html?id=${id}`; // File doesn't exist
        // Better: Reuse application modal for now or just log
        // User asked "View Details (open page)".
        // I'll assume they want a page. I'll make it link to `?view=details&id=${id}` and handle in `init`.
        // But for now, let's simple open the website as fallback or show the guide.
        // Actually, let's open the website for "View Details" if no internal page exists,
        // OR better, create a simple details modal.
        viewProgramDetails(id);
      });
    });

    // Update countdowns
    updateCountdowns();
  }

  // Create program card HTML
  function createProgramCard(prog) {
    const countdown = getCountdown(prog.deadline);
    const competitiveClass = prog.competitive ? 'competitive' : '';

    return `
            <article class="program-card ${competitiveClass}" data-id="${prog.id}">
                <div class="card-header">
                    <div class="program-organization">${prog.organization}</div>
                    <h3 class="program-name">${prog.name}</h3>
                    <div class="program-meta">
                        <span>📍 ${prog.location}</span>
                        <span>⏱️ ${prog.duration}</span>
                        <span>👤 Ages ${prog.ageMin}-${prog.ageMax}</span>
                    </div>
                    <p class="program-description" style="font-size: 0.9rem; color: #666; margin: 10px 0; overflow: hidden; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical;">
                        ${prog.description || 'No description available.'}
                    </p>
                </div>

                <div class="countdown-container" data-deadline="${prog.deadline}">
                    <div class="countdown-label">Application Deadline</div>
                    ${
                      countdown.expired
                        ? `<div class="countdown-expired">❌ Deadline Passed</div>`
                        : `<div class="countdown-timer">
                            <div class="countdown-unit">
                                <span class="countdown-value" data-days>${countdown.days}</span>
                                <span class="countdown-text">Days</span>
                            </div>
                            <div class="countdown-unit">
                                <span class="countdown-value" data-hours>${countdown.hours}</span>
                                <span class="countdown-text">Hours</span>
                            </div>
                            <div class="countdown-unit">
                                <span class="countdown-value" data-mins>${countdown.mins}</span>
                                <span class="countdown-text">Mins</span>
                            </div>
                        </div>`
                    }
                </div>

                <div class="card-stats">
                    <span class="stat-badge ${prog.cost === 0 ? 'free' : ''}">
                        💰 ${prog.costLabel}
                    </span>
                    <span class="stat-badge ${prog.competitive ? 'competitive' : ''}">
                        📊 ${prog.acceptanceRate}% acceptance
                    </span>
                    <span class="stat-badge">
                        📚 ${prog.category}
                    </span>
                </div>

                <div class="card-actions">
                    <button class="btn-guide" data-id="${prog.id}">
                        📋 App Roadmap
                    </button>
                    <button class="btn-details btn-secondary" data-id="${prog.id}" style="padding: 12px 16px; background: transparent; color: #667eea; border: 1px solid #667eea; border-radius: 8px; font-weight: 600; cursor: pointer;">
                        View Details
                    </button>
                    <a href="${prog.website}" target="_blank" rel="noopener" class="btn-apply">
                        Apply Now
                    </a>
                </div>
            </article>
        `;
  }

  // Get countdown values
  function getCountdown(deadline) {
    const now = new Date();
    const deadlineDate = new Date(deadline);
    const diff = deadlineDate - now;

    if (diff <= 0) {
      return { expired: true, days: 0, hours: 0, mins: 0 };
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    return { expired: false, days, hours, mins };
  }

  // Update all countdowns
  function updateCountdowns() {
    document.querySelectorAll('.countdown-container').forEach((container) => {
      const deadline = container.dataset.deadline;
      const countdown = getCountdown(deadline);

      if (countdown.expired) return;

      const daysEl = container.querySelector('[data-days]');
      const hoursEl = container.querySelector('[data-hours]');
      const minsEl = container.querySelector('[data-mins]');

      if (daysEl) daysEl.textContent = countdown.days;
      if (hoursEl) hoursEl.textContent = countdown.hours;
      if (minsEl) minsEl.textContent = countdown.mins;
    });
  }

  // Start countdown timers
  function startCountdownTimers() {
    setInterval(updateCountdowns, 60000); // Update every minute
  }

  // Update results count
  function updateResultsCount() {
    if (elements.resultsCount) {
      elements.resultsCount.textContent = filteredPrograms.length;
    }
  }

  // ========================================
  // Featured Carousel
  // ========================================
  function renderFeaturedCarousel() {
    const featured = programs.filter((p) => p.featured);
    if (!elements.carouselTrack || featured.length === 0) return;

    elements.carouselTrack.innerHTML = featured
      .map(
        (prog) => `
            <div class="featured-card">
                <span class="featured-badge">⭐ Featured</span>
                <div class="program-organization">${prog.organization}</div>
                <h3 class="program-name">${prog.shortName || prog.name}</h3>
                <div class="program-meta">
                    <span>📍 ${prog.location}</span>
                    <span>⏱️ ${prog.duration}</span>
                </div>
                <div class="countdown-container" data-deadline="${prog.deadline}">
                    <div class="countdown-label">Deadline</div>
                    ${renderCountdownTimer(prog.deadline)}
                </div>
                <div class="card-stats">
                    <span class="stat-badge ${prog.cost === 0 ? 'free' : ''}">${prog.costLabel || '$' + prog.cost}</span>
                    <span class="stat-badge">${prog.acceptanceRate ? prog.acceptanceRate + '%' : 'N/A'} rate</span>
                </div>
                <div class="card-actions" style="margin-top: 12px; display: flex; gap: 10px;">
                    <a href="${prog.website}" target="_blank" class="btn-apply" style="flex: 1; text-align: center;">Apply Now</a>
                    <button class="btn-guide btn-secondary" data-id="${prog.id}" style="flex: 1; padding: 0.5rem; border-radius: 6px; border: 1px solid #ddd; background: #fff; cursor: pointer;">View Detail</button>
                </div>
            </div>
        `
      )
      .join('');

    // Attach listeners to carousel buttons
    elements.carouselTrack.querySelectorAll('.btn-guide').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const btnEl = e.target.closest('.btn-guide');
        if (!btnEl) return;
        openApplicationGuide(btnEl.dataset.id);
      });
    });

    // Render dots
    if (elements.carouselDots) {
      const numDots = Math.ceil(featured.length / 3);
      elements.carouselDots.innerHTML = Array(numDots)
        .fill(0)
        .map(
          (_, i) =>
            `<button class="carousel-dot ${i === 0 ? 'active' : ''}" data-index="${i}"></button>`
        )
        .join('');

      elements.carouselDots.querySelectorAll('.carousel-dot').forEach((dot) => {
        dot.addEventListener('click', () => {
          currentCarouselIndex = parseInt(dot.dataset.index);
          updateCarousel();
        });
      });
    }
  }

  function renderCountdownTimer(deadline) {
    const countdown = getCountdown(deadline);
    if (countdown.expired) {
      return `<div class="countdown-expired">Deadline Passed</div>`;
    }
    return `
            <div class="countdown-timer">
                <div class="countdown-unit">
                    <span class="countdown-value">${countdown.days}</span>
                    <span class="countdown-text">Days</span>
                </div>
                <div class="countdown-unit">
                    <span class="countdown-value">${countdown.hours}</span>
                    <span class="countdown-text">Hrs</span>
                </div>
            </div>
        `;
  }

  function moveCarousel(direction) {
    const featured = programs.filter((p) => p.featured);
    const maxIndex = Math.ceil(featured.length / 3) - 1;
    currentCarouselIndex = Math.max(0, Math.min(maxIndex, currentCarouselIndex + direction));
    updateCarousel();
  }

  function updateCarousel() {
    if (!elements.carouselTrack) return;
    const cardWidth = 350 + 24; // card width + gap
    const offset = currentCarouselIndex * cardWidth * 3;
    elements.carouselTrack.style.transform = `translateX(-${offset}px)`;

    // Update dots
    elements.carouselDots?.querySelectorAll('.carousel-dot').forEach((dot, i) => {
      dot.classList.toggle('active', i === currentCarouselIndex);
    });
  }

  // ========================================
  // Application Assistant
  // ========================================
  function openApplicationGuide(programId) {
    currentApplicationProgram = programs.find((p) => p.id === programId);
    if (!currentApplicationProgram) return;

    currentStep = 0;
    renderApplicationSteps();

    if (elements.applicationModal) {
      elements.applicationModal.style.display = 'flex';
      document.body.style.overflow = 'hidden';
    }
  }

  function closeApplicationModal() {
    if (elements.applicationModal) {
      elements.applicationModal.style.display = 'none';
      document.body.style.overflow = '';
    }
  }

  function renderApplicationSteps() {
    if (!elements.applicationBody || !currentApplicationProgram) return;

    const prog = currentApplicationProgram;
    const steps = [
      {
        title: 'Step 1: Research & Preparation',
        items: [
          {
            title: 'Visit Official Website',
            desc: `Review ${prog.organization}'s program page for latest requirements`,
          },
          {
            title: 'Check Eligibility',
            desc: `Confirm you meet age (${prog.ageMin}-${prog.ageMax}) and grade requirements`,
          },
          {
            title: 'Review Deadline',
            desc: `Application due: ${new Date(prog.deadline).toLocaleDateString()}`,
          },
          {
            title: 'Gather Materials List',
            desc: 'Identify all required documents before starting',
          },
        ],
      },
      {
        title: 'Step 2: Gather Documents',
        items: [
          {
            title: 'Academic Transcript',
            desc: 'Request official transcript from your school (allow 1-2 weeks)',
          },
          { title: 'Test Scores', desc: 'SAT/ACT/AP scores if required' },
          { title: 'Resume/CV', desc: 'Update with activities, awards, and experiences' },
          { title: 'Photo/ID', desc: 'Passport-style photo if required' },
        ],
      },
      {
        title: 'Step 3: Request Recommendations',
        items: [
          { title: 'Identify Recommenders', desc: 'Choose teachers or mentors who know you well' },
          { title: 'Request Early', desc: 'Ask at least 2-3 weeks before deadline' },
          {
            title: 'Provide Context',
            desc: 'Share your goals and program details with recommenders',
          },
          { title: 'Follow Up', desc: 'Send polite reminder 1 week before deadline' },
        ],
      },
      {
        title: 'Step 4: Write Essays',
        items: [
          { title: 'Analyze Prompts', desc: 'Understand what each essay question is asking' },
          {
            title: 'Brainstorm Ideas',
            desc: 'List unique experiences and achievements to highlight',
          },
          { title: 'Write First Draft', desc: 'Focus on content first, edit later' },
          { title: 'Revise & Polish', desc: 'Get feedback from teachers, parents, or mentors' },
          { title: 'Proofread', desc: 'Check for grammar, spelling, and word count' },
        ],
      },
      {
        title: 'Step 5: Submit & Follow Up',
        items: [
          { title: 'Complete Application', desc: 'Fill all required fields accurately' },
          { title: 'Upload Documents', desc: 'Ensure all files are in correct format and size' },
          {
            title: 'Pay Fees',
            desc:
              prog.cost === 0
                ? 'This program is FREE to apply!'
                : 'Payment required - check for fee waivers',
          },
          { title: 'Submit Early', desc: 'Avoid last-minute technical issues' },
          { title: 'Save Confirmation', desc: 'Screenshot or save application confirmation' },
          { title: 'Check Status', desc: 'Monitor email and portal for updates' },
        ],
      },
    ];

    elements.applicationBody.innerHTML = `
            <h3 style="margin-bottom: 1rem;">📚 ${prog.shortName || prog.name}</h3>
            ${steps
              .map(
                (step, i) => `
                <div class="step-content ${i === currentStep ? 'active' : ''}" data-step="${i}">
                    <div class="step-title">${step.title}</div>
                    <div class="step-description">Complete these tasks to prepare your application</div>
                    <ul class="step-checklist">
                        ${step.items
                          .map(
                            (item) => `
                            <li>
                                <input type="checkbox">
                                <div class="item-text">
                                    <div class="item-title">${item.title}</div>
                                    <div class="item-desc">${item.desc}</div>
                                </div>
                            </li>
                        `
                          )
                          .join('')}
                    </ul>
                </div>
            `
              )
              .join('')}
        `;

    updateStepNavigation(steps.length);
  }

  function navigateStep(direction) {
    const steps = elements.applicationBody?.querySelectorAll('.step-content');
    if (!steps) return;

    const maxStep = steps.length - 1;
    currentStep = Math.max(0, Math.min(maxStep, currentStep + direction));

    steps.forEach((step, i) => {
      step.classList.toggle('active', i === currentStep);
    });

    updateStepNavigation(steps.length);
  }

  function updateStepNavigation(totalSteps) {
    if (elements.stepIndicator) {
      elements.stepIndicator.textContent = `Step ${currentStep + 1} of ${totalSteps}`;
    }
    if (elements.prevStep) {
      elements.prevStep.disabled = currentStep === 0;
    }
    if (elements.nextStep) {
      elements.nextStep.textContent = currentStep === totalSteps - 1 ? 'Done ✓' : 'Next →';
    }
  }

  // ========================================
  // Utility Functions
  // ========================================
  function resetAllFilters() {
    if (elements.searchInput) elements.searchInput.value = '';

    document.querySelectorAll('.filter-checkbox input').forEach((input) => {
      input.checked = true;
    });

    document.querySelectorAll('.filter-radio input[value="all"]').forEach((input) => {
      input.checked = true;
    });

    if (elements.sortSelect) elements.sortSelect.value = 'deadline';

    applyFilters();
  }

  function toggleFilterSidebar() {
    if (elements.filterSidebar) {
      elements.filterSidebar.classList.toggle('active');
    }
  }

  function showError() {
    if (elements.grid) {
      elements.grid.innerHTML = `
                <div class="no-results">
                    <div class="no-results-icon">⚠️</div>
                    <h3>Unable to load programs</h3>
                    <p>Please refresh the page or try again later.</p>
                    <button class="btn-reset" onclick="location.reload()">Refresh Page</button>
                </div>
            `;
    }
  }

  function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  function viewProgramDetails(id) {
    const prog = programs.find((p) => p.id === id);
    if (!prog) return;

    // Check if we have a details modal
    let modal = document.getElementById('detailsModal');
    if (!modal) {
      // Create modal dynamically if missing
      modal = document.createElement('div');
      modal.id = 'detailsModal';
      modal.className = 'modal';
      modal.innerHTML = `
            <div class="modal-content">
                <button class="close-modal">&times;</button>
                <h2 id="detailTitle"></h2>
                <div id="detailBody" style="margin-top: 1rem; line-height: 1.6;"></div>
                <div class="form-footer" style="margin-top: 2rem;">
                     <button class="btn-close-modal">Close</button>
                </div>
            </div>
          `;
      document.body.appendChild(modal);

      modal.querySelector('.close-modal').onclick = () => (modal.style.display = 'none');
      modal.querySelector('.btn-close-modal').onclick = () => (modal.style.display = 'none');
      modal.onclick = (e) => {
        if (e.target === modal) modal.style.display = 'none';
      };
    }

    modal.querySelector('#detailTitle').textContent = prog.name;
    modal.querySelector('#detailBody').innerHTML = `
        <p><strong>Organization:</strong> ${prog.organization}</p>
        <p><strong>Location:</strong> ${prog.location} (${prog.locationType})</p>
        <p><strong>Duration:</strong> ${prog.duration}</p>
        <p><strong>Cost:</strong> ${prog.costLabel || '$' + prog.cost}</p>
        <p><strong>Acceptance Rate:</strong> ${prog.acceptanceRate}%</p>
        <hr style="margin: 1rem 0; border: 0; border-top: 1px solid #eee;">
        <p>${prog.description || 'No description available.'}</p>
        <div style="margin-top: 1.5rem;">
            <a href="${prog.website}" target="_blank" class="btn btn-primary" style="text-decoration:none;">Visit Official Website</a>
        </div>
      `;

    modal.style.display = 'flex';
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
