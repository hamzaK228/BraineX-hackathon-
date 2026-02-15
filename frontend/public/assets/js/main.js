/* eslint-disable no-console, no-unused-vars */
/**
 * main.js - Application Entry Point (ES6 Module)
 */
import { Store } from './core/Store.js';
import { eventBus } from './core/EventBus.js';
import { filterModule } from './core/FilterStore.js';
import { gamificationModule } from './core/GamificationStore.js';
import { analyticsModule } from './core/AnalyticsStore.js';
import { escapeHtml } from './utils/sanitize.js';
import { delegate, stop } from './utils/Delegate.js';
import { ErrorBoundary } from './utils/ErrorBoundary.js';
import { performanceMonitor } from './core/PerformanceMonitor.js';

// Initialize Global Error Handlers
ErrorBoundary.initGlobal();
performanceMonitor.init();

// Initialize Global Store with persistence
const appStore = new Store({
  state: {
    ...filterModule.state,
    ...gamificationModule.state,
    ...analyticsModule.state,
    user: null,
    theme: 'light',
    fields: [], // Initialize empty
    scholarships: [], // Initialize empty
  },
});

// Initialize global accessors
window.app = {
  store: appStore,
  eventBus,
};
window.appState = appStore.state;

// Global Modal Helpers
window.closeModal = function () {
  document.querySelectorAll('.modal').forEach((modal) => {
    modal.style.display = 'none';
    modal.classList.remove('show');
  });
};

window.openModal = function (id) {
  const modal = document.getElementById(id);
  if (modal) {
    modal.style.display = 'block';
    setTimeout(() => modal.classList.add('show'), 10);
  }
};

// --- Modal Content Renderers ---

function openTrackModal(fieldData) {
  const content = document.getElementById('trackModalContent');
  if (!content) return;

  content.innerHTML = `
        <h2>${fieldData.icon || '🎓'} ${escapeHtml(fieldData.name)}</h2>
        <div class="modal-body">
            <p class="modal-description">${escapeHtml(fieldData.description || 'Explore opportunities in this field.')}</p>
            <div class="modal-stats">
                 <div class="stat"><span>Scholarships:</span> <strong>${fieldData.scholarshipsCount || '100+'}</strong></div>
                 <div class="stat"><span>Mentors:</span> <strong>${fieldData.mentorsCount || '50+'}</strong></div>
            </div>
            <div class="modal-actions">
                <a href="/fields?track=${encodeURIComponent(fieldData.name)}" class="btn-primary">View Full Roadmap</a>
            </div>
        </div>
    `;
  window.openModal('trackModal');
}

function openScholarshipModal(scholarship) {
  const content = document.getElementById('scholarshipModalContent');
  if (!content) return;

  content.innerHTML = `
        <h2>${escapeHtml(scholarship.name)}</h2>
        <div class="modal-body">
            <div class="scholarship-meta">
                <p><strong>University:</strong> ${escapeHtml(scholarship.university || 'N/A')}</p>
                <p><strong>Level:</strong> ${escapeHtml(scholarship.level || 'All')}</p>
                <p><strong>Amount:</strong> ${escapeHtml(scholarship.amount || 'Varies')}</p>
                <p><strong>Deadline:</strong> ${escapeHtml(scholarship.deadline || 'Open')}</p>
            </div>
            <p class="modal-description">${escapeHtml(scholarship.description || 'No description available.')}</p>
            <div class="modal-actions">
                <a href="/scholarships?id=${encodeURIComponent(scholarship.id || scholarship.name)}" class="btn-primary">Apply Now</a>
            </div>
        </div>
    `;
  window.openModal('scholarshipModal');
}

// Track data for Featured Tracks section
const trackData = {
  'ai-data-science': {
    name: 'Artificial Intelligence & Data Science',
    icon: '🤖',
    description:
      'Explore the cutting-edge world of AI, machine learning, and data analytics. Build the future with intelligent systems.',
    scholarshipsCount: 152,
    roadmapsCount: 18,
    mentorsCount: 6,
    skills: ['Machine Learning', 'Deep Learning', 'Python', 'TensorFlow', 'Data Analysis'],
    careers: ['AI Engineer', 'Data Scientist', 'ML Researcher', 'AI Product Manager'],
  },
  biotech: {
    name: 'Biotech & Health Sciences',
    icon: '🧬',
    description:
      'Advance medical research and healthcare innovation. Pioneer breakthrough treatments and technologies.',
    scholarshipsCount: 128,
    roadmapsCount: 15,
    mentorsCount: 8,
    skills: ['Molecular Biology', 'Genetics', 'Bioinformatics', 'Clinical Research'],
    careers: ['Biotech Researcher', 'Clinical Scientist', 'Bioinformatician', 'Medical Director'],
  },
  'climate-tech': {
    name: 'Climate Tech & Sustainability',
    icon: '🌱',
    description:
      'Build solutions for environmental challenges and create a sustainable future for all.',
    scholarshipsCount: 94,
    roadmapsCount: 12,
    mentorsCount: 5,
    skills: ['Environmental Science', 'Renewable Energy', 'Carbon Analysis', 'Policy'],
    careers: ['Sustainability Consultant', 'Climate Scientist', 'Green Energy Engineer'],
  },
  engineering: {
    name: 'Engineering & Robotics',
    icon: '⚙️',
    description:
      'Design and build the technologies of tomorrow. Create innovative solutions through engineering excellence.',
    scholarshipsCount: 176,
    roadmapsCount: 22,
    mentorsCount: 10,
    skills: ['Mechanical Design', 'Electronics', 'Control Systems', 'CAD/CAM'],
    careers: ['Robotics Engineer', 'Mechanical Engineer', 'Systems Architect'],
  },
  entrepreneurship: {
    name: 'Entrepreneurship & Innovation',
    icon: '💡',
    description:
      'Turn your ideas into impactful startups and ventures. Learn to build and scale successful businesses.',
    scholarshipsCount: 86,
    roadmapsCount: 14,
    mentorsCount: 12,
    skills: ['Business Strategy', 'Fundraising', 'Product Development', 'Leadership'],
    careers: ['Startup Founder', 'Product Manager', 'Venture Capitalist', 'Innovation Lead'],
  },
  'social-impact': {
    name: 'Social Impact & Global Policy',
    icon: '🌍',
    description:
      'Drive change in diplomacy, human rights, and sustainable development around the world.',
    scholarshipsCount: 112,
    roadmapsCount: 16,
    mentorsCount: 7,
    skills: ['Policy Analysis', 'International Relations', 'Advocacy', 'Research'],
    careers: ['Policy Analyst', 'NGO Director', 'Diplomat', 'Social Entrepreneur'],
  },
  'creative-tech': {
    name: 'Digital Media, Design & Creative Tech',
    icon: '🎨',
    description: 'Create immersive experiences and digital art. Blend creativity with technology.',
    scholarshipsCount: 68,
    roadmapsCount: 10,
    mentorsCount: 9,
    skills: ['UI/UX Design', 'Motion Graphics', '3D Modeling', 'Creative Coding'],
    careers: ['UX Designer', 'Creative Director', 'Motion Designer', 'Game Designer'],
  },
  economics: {
    name: 'Economics & Finance',
    icon: '💰',
    description: 'Master financial systems and economic policy. Drive decisions in global markets.',
    scholarshipsCount: 142,
    roadmapsCount: 19,
    mentorsCount: 11,
    skills: ['Financial Analysis', 'Econometrics', 'Investment Strategy', 'Risk Management'],
    careers: ['Investment Banker', 'Economist', 'Financial Analyst', 'Quant Trader'],
  },
};

// Global function for opening track detail modal
window.openTrackDetail = function (trackId) {
  const track = trackData[trackId];
  if (!track) {
    console.warn('Track not found:', trackId);
    return;
  }

  const content = document.getElementById('trackModalContent');
  if (!content) {
    // Create modal if it doesn't exist
    if (window.InteractionHandler) {
      window.InteractionHandler.showDynamicModal({
        id: 'trackDetailModal',
        title: `${track.icon} ${track.name}`,
        content: generateTrackContent(track, trackId),
        size: 'large',
        actions: [
          {
            label: 'View Full Roadmap',
            primary: true,
            href: `/pages/roadmaps.html?track=${trackId}`,
          },
          { label: 'Browse Scholarships', href: `/pages/scholarships.html?field=${trackId}` },
        ],
      });
    }
    return;
  }

  content.innerHTML = generateTrackContent(track, trackId);
  window.openModal('trackModal');
};

function generateTrackContent(track, trackId) {
  return `
        <h2>${track.icon} ${escapeHtml(track.name)}</h2>
        <div class="modal-body">
            <p class="modal-description" style="font-size: 1.1rem; color: var(--text-secondary); margin-bottom: 1.5rem;">${escapeHtml(track.description)}</p>
            
            <div class="modal-stats" style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; margin-bottom: 1.5rem;">
                <div class="stat" style="text-align: center; padding: 1rem; background: var(--bg-secondary, #f3f4f6); border-radius: 8px;">
                    <span style="display: block; font-size: 1.5rem; font-weight: 700; color: var(--primary-color, #667eea);">${track.scholarshipsCount}</span>
                    <span style="font-size: 0.875rem; color: var(--text-secondary);">Scholarships</span>
                </div>
                <div class="stat" style="text-align: center; padding: 1rem; background: var(--bg-secondary, #f3f4f6); border-radius: 8px;">
                    <span style="display: block; font-size: 1.5rem; font-weight: 700; color: var(--primary-color, #667eea);">${track.roadmapsCount}</span>
                    <span style="font-size: 0.875rem; color: var(--text-secondary);">Roadmaps</span>
                </div>
                <div class="stat" style="text-align: center; padding: 1rem; background: var(--bg-secondary, #f3f4f6); border-radius: 8px;">
                    <span style="display: block; font-size: 1.5rem; font-weight: 700; color: var(--primary-color, #667eea);">${track.mentorsCount}</span>
                    <span style="font-size: 0.875rem; color: var(--text-secondary);">Mentors</span>
                </div>
            </div>

            <div style="margin-bottom: 1.5rem;">
                <h4 style="margin-bottom: 0.75rem; color: var(--text-primary);">Key Skills</h4>
                <div style="display: flex; flex-wrap: wrap; gap: 0.5rem;">
                    ${track.skills.map((skill) => `<span style="padding: 0.25rem 0.75rem; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border-radius: 20px; font-size: 0.875rem;">${escapeHtml(skill)}</span>`).join('')}
                </div>
            </div>

            <div style="margin-bottom: 1.5rem;">
                <h4 style="margin-bottom: 0.75rem; color: var(--text-primary);">Career Paths</h4>
                <div style="display: flex; flex-wrap: wrap; gap: 0.5rem;">
                    ${track.careers.map((career) => `<span style="padding: 0.25rem 0.75rem; background: var(--bg-secondary, #f3f4f6); color: var(--text-primary); border-radius: 20px; font-size: 0.875rem; border: 1px solid var(--border-color, #e5e7eb);">${escapeHtml(career)}</span>`).join('')}
                </div>
            </div>

            <div class="modal-actions" style="display: flex; gap: 1rem; margin-top: 2rem;">
                <a href="/pages/roadmaps.html?track=${trackId}" class="btn btn-primary" style="flex: 1; text-align: center; padding: 0.75rem 1.5rem; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border-radius: 8px; text-decoration: none; font-weight: 600;">View Full Roadmap</a>
                <a href="/pages/scholarships.html?field=${trackId}" class="btn btn-secondary" style="flex: 1; text-align: center; padding: 0.75rem 1.5rem; background: var(--bg-secondary, #f3f4f6); color: var(--text-primary); border-radius: 8px; text-decoration: none; font-weight: 600; border: 1px solid var(--border-color, #e5e7eb);">Browse Scholarships</a>
            </div>
        </div>
    `;
}

// --- Event Delegates ---

// NOTE: "Explore Track" buttons use onclick="openTrackDetail('...')" attribute directly
// No delegate handler needed here - removed to prevent double-trigger conflicts

// Handle "Apply/View Details" buttons
delegate(document.body, 'click', '.btn-apply', (e, target) => {
  stop(e);
  const card = target.closest('.scholarship-card');
  if (!card) return;

  const title = card.querySelector('h3').textContent.trim();
  const scholarships = window.appState.scholarships || [];

  const scholarship = scholarships.find((s) => s.name === title);

  if (scholarship) {
    openScholarshipModal(scholarship);
  } else {
    console.warn('Scholarship data not found for:', title);
    // Fallback
    const href = target.getAttribute('href');
    if (href) window.location.href = href;
  }
});

// --- Setup Functions ---

function setupScholarshipFilters() {
  const filterContainer = document.querySelector('.scholarship-filters');
  if (!filterContainer) return;

  delegate(filterContainer, 'click', '.filter-btn', (e, target) => {
    // Update UI
    filterContainer.querySelectorAll('.filter-btn').forEach((b) => b.classList.remove('active'));
    target.classList.add('active');

    const filter = target.getAttribute('data-filter');
    const cards = document.querySelectorAll('.scholarship-card');

    cards.forEach((card) => {
      const category = card.getAttribute('data-category')?.toLowerCase() || '';
      if (filter === 'all' || category.includes(filter)) {
        card.style.display = '';
      } else {
        card.style.display = 'none';
      }
    });
  });
}

function setupRoadmapTabs() {
  delegate(document.body, 'click', '.roadmap-tab', (e, target) => {
    const tabs = document.querySelectorAll('.roadmap-tab');
    const contents = document.querySelectorAll('.roadmap-content');

    // Deactivate all
    tabs.forEach((t) => {
      t.classList.remove('active');
      t.setAttribute('aria-selected', 'false');
    });
    contents.forEach((c) => {
      c.classList.remove('active');
      c.setAttribute('aria-hidden', 'true');
    });

    // Activate clicked
    target.classList.add('active');
    target.setAttribute('aria-selected', 'true');

    const tabId = target.getAttribute('data-tab');
    const contentId = `${tabId}-roadmap`;
    const content = document.getElementById(contentId);
    if (content) {
      content.classList.add('active');
      content.setAttribute('aria-hidden', 'false');
    }
  });
}

function setupToggleGroup() {
  // FAQ Toggle
  delegate(document.body, 'click', '.faq-question', (e, target) => {
    const item = target.closest('.faq-item');
    if (item) {
      item.classList.toggle('active');
      const toggle = item.querySelector('.faq-toggle');
      if (toggle) {
        toggle.textContent = item.classList.contains('active') ? '-' : '+';
      }
    }
  });
}

function setupTracksSlider() {
  const slider = document.getElementById('tracksSlider');
  if (!slider) return;

  // Simple button handlers
  delegate(document.body, 'click', '.btn-next', () => {
    slider.scrollBy({ left: 300, behavior: 'smooth' });
  });
  delegate(document.body, 'click', '.btn-prev', () => {
    slider.scrollBy({ left: -300, behavior: 'smooth' });
  });
}

// Dummy/Stub functions for others to prevent crashes
function setupMobileMenu() { }
function setupSmoothScroll() { }
function setupIntersectionObservers() { }
function animateStatsInit() { }
function setupServiceWorker() { }
function setupMultiSelect() { }
function setupFormValidation() { }

// --- Data Loading (Mock) ---

function loadData() {
  // Mock Fields
  window.appState.fields = [
    {
      name: 'Artificial Intelligence',
      icon: '🤖',
      description: 'Explore AI, Machine Learning, and Data Science.',
    },
    { name: 'Entrepreneurship', icon: '💡', description: 'Start your own business.' },
    { name: 'Social Impact', icon: '🌍', description: 'Make a difference properly.' },
    { name: 'Digital Media', icon: '🎨', description: 'Creative arts and design.' },
    { name: 'Economics', icon: '💰', description: 'Finance and global markets.' },
    { name: 'Health', icon: '🧬', description: 'Medical research and biotech.' },
    { name: 'Climate', icon: '🌱', description: 'Sustainable solutions.' },
  ];

  // Mock Scholarships
  window.appState.scholarships = [
    {
      name: 'Gates Cambridge Scholarship',
      university: 'University of Cambridge',
      level: 'Graduate',
      amount: 'Full Funding',
      description: 'Prestigious scholarship for outstanding applicants from outside the UK.',
    },
    {
      name: 'NSF Graduate Research Fellowship',
      university: 'NSF',
      level: 'Graduate',
      amount: '$37,000/year',
      description: 'Support for graduate research in STEM.',
    },
    {
      name: 'Rhodes Scholarship',
      university: 'University of Oxford',
      level: 'Graduate',
      amount: 'Full Funding',
      description: "World's oldest graduate scholarship.",
    },
    {
      name: "Erasmus+ Master's Programme",
      university: 'Various (EU)',
      level: "Master's",
      amount: '€1,400/month',
      description: "Joint master's programmes in Europe.",
    },
  ];
}

// --- Initialization ---

document.addEventListener('DOMContentLoaded', () => {
  loadData();
  setupScholarshipFilters();
  setupRoadmapTabs();
  setupTracksSlider();
  setupToggleGroup();

  // Run stubs
  setupMobileMenu();
  setupSmoothScroll();
  setupIntersectionObservers();
  animateStatsInit();
  setupServiceWorker();
  setupMultiSelect();
  setupFormValidation();

  // Handle initial hash for modals (e.g., #login, #signup)
  const handleHash = () => {
    const hash = window.location.hash;
    if (hash === '#login' || hash === '#loginModal') {
      window.openModal('loginModal');
    } else if (hash === '#signup' || hash === '#signupModal') {
      window.openModal('signupModal');
    }
  };

  handleHash();
  window.addEventListener('hashchange', handleHash);

  console.log('Main.js initialized successfully.');
});
