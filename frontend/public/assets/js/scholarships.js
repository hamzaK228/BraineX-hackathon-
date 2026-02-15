/* eslint-disable no-console, no-unused-vars */
/**
 * Scholarships Page JavaScript
 * Handles scholarship listing, filtering, search, and interactions.
 */

document.addEventListener('DOMContentLoaded', () => {
  // Initialize
  loadScholarships();

  // Setup tabs
  setupSearchTabs();
  setupFilterTabs();

  // Modal Close
  document.getElementById('closeScholarshipModal')?.addEventListener('click', () => {
    document.getElementById('scholarshipModal').style.display = 'none';
  });
  window.onclick = function (event) {
    const modal = document.getElementById('scholarshipModal');
    if (event.target === modal) {
      modal.style.display = 'none';
    }
  };

  // Check URL params
  const urlParams = new URLSearchParams(window.location.search);
  const filterId = urlParams.get('id');
  const filterField = urlParams.get('field');

  if (filterId) {
    setTimeout(() => showScholarshipDetails(filterId), 500);
  } else if (filterField) {
    document.querySelector(`.filter-tab[data-filter="${filterField}"]`)?.click();
  }

  // Delegation for scholarship cards
  const grid = document.getElementById('scholarshipGrid');
  if (grid) {
    grid.addEventListener('click', (e) => {
      if (e.target.classList.contains('btn-apply')) {
        const id = e.target.getAttribute('data-id');
        if (id) window.applyToScholarship(id);
      }
    });
  }

  // Delegation for resource cards
  document.querySelectorAll('.resource-card').forEach((card) => {
    card.addEventListener('click', function () {
      const type = this.getAttribute('data-type');
      if (type) window.openResourceLink(type);
    });
  });

  // Delegation for search and filter buttons
  document
    .querySelector('.btn-search-advanced')
    ?.addEventListener('click', window.performAdvancedSearch);
  document.querySelector('.btn-reset-filters')?.addEventListener('click', window.resetAllFilters);
  document.querySelector('.btn-back-to-all')?.addEventListener('click', () => {
    window.resetAllFilters();
    document.getElementById('scholarshipGrid')?.scrollIntoView({ behavior: 'smooth' });
  });
  document.querySelector('.btn-reset-sort')?.addEventListener('click', window.resetSort);
  document.getElementById('sortDropdown')?.addEventListener('change', window.sortScholarships);
  document
    .querySelector('.field-search .btn-search')
    ?.addEventListener('click', window.performScholarshipSearch);
});

// State
let allScholarships = [];
let filteredScholarships = [];

/**
 * Load scholarships from API or Fallback
 */
async function loadScholarships() {
  const container = document.getElementById('scholarshipGrid');
  if (!container) return;

  container.innerHTML = '<div class="loading">Loading scholarships...</div>';

  try {
    const response = await fetch('/api/scholarships');
    const data = await response.json();

    if (data.success && data.data && data.data.length > 0) {
      allScholarships = data.data;
    } else {
      if (typeof process !== 'undefined' && process.env.NODE_ENV === 'development') {
        console.warn('API returned no scholarships, using fallback data.');
      }
      allScholarships = getFallbackScholarships();
    }
  } catch (error) {
    if (window.location.hostname === 'localhost') {
      console.error('Error loading scholarships:', error);
    }
    allScholarships = getFallbackScholarships();
  }

  filteredScholarships = [...allScholarships];
  renderScholarships(filteredScholarships);
  renderFeaturedScholarships();
}

/**
 * Render scholarships to grid
 */
function renderScholarships(scholarships) {
  const container = document.getElementById('scholarshipGrid');
  if (!container) return;

  if (scholarships.length === 0) {
    container.innerHTML =
      '<div class="no-results">No scholarships found matching your criteria.</div>';
    return;
  }

  container.innerHTML = scholarships
    .map(
      (sch) => `
        <div class="scholarship-card" data-category="${sch.category || 'other'}" data-level="${sch.level || ''}">
            <div class="scholarship-header">
                <h3>${escapeHtml(sch.name)}</h3>
                <span class="scholarship-amount">${escapeHtml(sch.amount || 'Variable')}</span>
            </div>
            <div class="scholarship-details">
                <p><strong>Organization:</strong> ${escapeHtml(sch.organization || sch.university || 'N/A')}</p>
                <p><strong>Field:</strong> ${escapeHtml(sch.field || 'General')}</p>
                <p><strong>Deadline:</strong> ${escapeHtml(sch.deadline || 'Open')}</p>
                <p><strong>Level:</strong> ${escapeHtml(sch.level || 'All Levels')}</p>
            </div>
            <p class="scholarship-description">${escapeHtml(sch.description || '')}</p>
            <div class="scholarship-tags">
                 ${(sch.tags || []).map((tag) => `<span class="tag">${escapeHtml(tag)}</span>`).join('')}
            </div>
            <button class="btn-apply" data-id="${sch.id}">View Details</button>
        </div>
    `
    )
    .join('');
}

/**
 * Filter by Category (Global)
 */
window.filterScholarshipsByCategory = function (category) {
  if (category === 'all') {
    filteredScholarships = [...allScholarships];
  } else {
    filteredScholarships = allScholarships.filter(
      (s) =>
        (s.category && s.category.toLowerCase().includes(category.toLowerCase())) ||
        (s.tags && s.tags.some((t) => t.toLowerCase().includes(category)))
    );
  }

  // Update active tab state if exists
  document.querySelectorAll('.filter-tab').forEach((t) => {
    if (t.dataset.filter === category) t.classList.add('active');
    else t.classList.remove('active');
  });

  renderScholarships(filteredScholarships);
  document.getElementById('scholarshipGrid')?.scrollIntoView({ behavior: 'smooth' });
};

/**
 * Setup Filter Tabs
 */
function setupFilterTabs() {
  const tabs = document.querySelectorAll('.filter-tab');
  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      const category = tab.dataset.filter;
      window.filterScholarshipsByCategory(category);
    });
  });
}

/**
 * Basic Search
 */
window.performScholarshipSearch = function () {
  const input = document.querySelector('.search-input');
  const query = input ? input.value.toLowerCase().trim() : '';

  if (!query) {
    filteredScholarships = [...allScholarships];
  } else {
    filteredScholarships = allScholarships.filter(
      (s) =>
        s.name.toLowerCase().includes(query) ||
        s.description.toLowerCase().includes(query) ||
        s.organization?.toLowerCase().includes(query)
    );
  }
  renderScholarships(filteredScholarships);
  document.getElementById('scholarshipGrid')?.scrollIntoView({ behavior: 'smooth' });
};

// Enter key search
document.querySelector('.field-search .search-input')?.addEventListener('keyup', (e) => {
  if (e.key === 'Enter') window.performScholarshipSearch();
});

/**
 * Advanced Search
 */
window.performAdvancedSearch = function () {
  const field = document.getElementById('fieldSelect')?.value;
  const level = document.getElementById('levelSelect')?.value;
  const country = document.getElementById('countrySelect')?.value;
  const funding = document.getElementById('fundingSelect')?.value;
  const deadline = document.getElementById('deadlineSelect')?.value;
  const eligibility = document.getElementById('eligibilitySelect')?.value;

  const gpa = document.querySelector(
    '.search-content#advanced-search select:nth-of-type(1)'
  )?.value; // Using selectors or adding IDs to HTML would be better
  const need = document.querySelector(
    '.search-content#advanced-search select:nth-of-type(2)'
  )?.value;

  filteredScholarships = allScholarships.filter((s) => {
    if (field && !matchField(s, field)) return false;
    if (level && !matchLevel(s, level)) return false;
    if (country && !matchCountry(s, country)) return false;
    if (funding && !matchFunding(s, funding)) return false;

    // Future: Add logic for deadline, eligibility, gpa, need if data supports it
    // For now, at least include Funding matching
    return true;
  });

  renderScholarships(filteredScholarships);
  document.getElementById('scholarshipGrid')?.scrollIntoView({ behavior: 'smooth' });
};

function matchField(s, field) {
  return (
    (s.field || '').toLowerCase().includes(field.toLowerCase()) ||
    (s.tags || []).some((t) => t.toLowerCase().includes(field.toLowerCase()))
  );
}

function matchLevel(s, level) {
  return (s.level || '').toLowerCase().includes(level.toLowerCase());
}

function matchCountry(s, country) {
  return (s.country || '').toLowerCase().includes(country.toLowerCase());
}

function matchFunding(s, funding) {
  const amount = (s.amount || '').toLowerCase();
  const description = (s.description || '').toLowerCase();

  switch (funding) {
    case 'full-tuition':
      return (
        amount.includes('full') || description.includes('full tuition') || amount.includes('100%')
      );
    case 'partial-tuition':
      return amount.includes('und') || !amount.includes('full');
    case 'living-allowance':
      return (
        description.includes('living') ||
        description.includes('stipend') ||
        amount.includes('stipend')
      );
    case 'research-funding':
      return (
        s.category === 'research' ||
        description.includes('research') ||
        (s.tags || []).includes('Research')
      );
    case 'travel-grants':
      return description.includes('travel') || description.includes('conference');
    default:
      return true;
  }
}

window.resetAllFilters = function () {
  document.querySelectorAll('select').forEach((s) => (s.value = ''));
  filteredScholarships = [...allScholarships];
  renderScholarships(filteredScholarships);
};

/**
 * Sort Scholarships
 */
window.sortScholarships = function () {
  const sortValue = document.getElementById('sortDropdown').value;
  let sorted = [...filteredScholarships];

  switch (sortValue) {
    case 'name':
      sorted.sort((a, b) => a.name.localeCompare(b.name));
      break;
    case 'amount':
      // Simple naive sort for strings like "$1000"
      sorted.sort((a, b) => (b.amount || '').length - (a.amount || '').length);
      break;
    case 'deadline':
      sorted.sort((a, b) => (a.deadline || '').localeCompare(b.deadline || ''));
      break;
  }

  renderScholarships(sorted);
};

window.resetSort = function () {
  document.getElementById('sortDropdown').value = 'deadline';
  window.sortScholarships();
};

/**
 * Setup Search Tabs (Basic/Advanced/Profile)
 */
function setupSearchTabs() {
  const tabs = document.querySelectorAll('.search-tab');
  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      tabs.forEach((t) => t.classList.remove('active'));
      tab.classList.add('active');

      const targetId =
        tab.dataset.tab === 'basic'
          ? 'basic-search'
          : tab.dataset.tab === 'advanced'
            ? 'advanced-search'
            : 'profile-search';

      document.querySelectorAll('.search-content').forEach((c) => c.classList.remove('active'));
      document.getElementById(targetId)?.classList.add('active');
    });
  });
}

/**
 * Show Details / Apply
 */
window.applyToScholarship = function (id) {
  // If user is logged in (check auth-api or similar), apply.
  // Else show login or redirect to external.
  // Given the HTML says "Apply" or "View Details", let's open details.

  // Force modal open to allow user to see details before applying
  const sch = allScholarships.find((s) => s.id == id);
  if (!sch) return;

  const modal = document.getElementById('scholarshipModal');
  const content = document.getElementById('scholarshipModalContent');
  if (modal && content) {
    content.innerHTML = `
          <h2>${escapeHtml(sch.name)}</h2>
          <div class="scholarship-meta" style="margin: 15px 0; display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
              <div><strong>Organization:</strong> ${escapeHtml(sch.organization)}</div>
              <div><strong>Amount:</strong> ${escapeHtml(sch.amount)}</div>
              <div><strong>Deadline:</strong> ${escapeHtml(sch.deadline)}</div>
              <div><strong>Field:</strong> ${escapeHtml(sch.field)}</div>
          </div>
          <p>${escapeHtml(sch.description)}</p>
          <div style="margin-top: 20px; text-align: right;">
              <button class="btn-primary" onclick="window.open('${sch.website || '#'}', '_blank')">Apply on Website</button>
          </div>
      `;
    modal.style.display = 'block';
  }
};

window.showScholarshipDetails = function (nameOrId) {
  // Find by name or ID
  const sch = allScholarships.find((s) => s.id == nameOrId || s.name === nameOrId);
  if (sch) applyToScholarship(sch.id);
  else alert('Scholarship details not found.');
};

/**
 * Resource Links
 */
window.openResourceLink = function (type) {
  const links = {
    essays:
      'https://bigfuture.collegeboard.org/pay-for-college/scholarship-search/how-to-write-a-scholarship-essay',
    deadlines:
      'https://www.scholarships.com/financial-aid/college-scholarships/scholarship-application-strategies/scholarship-application-calendar/',
    tips: 'https://www.fastweb.com/college-scholarships/articles/top-12-tips-for-winning-scholarships',
    search: 'https://scholarships360.org/',
    interviews: 'https://www.youtube.com/results?search_query=scholarship+interview+questions',
  };
  if (links[type]) window.open(links[type], '_blank');
};

/**
 * Fallback Data
 */
function getFallbackScholarships() {
  return [
    {
      id: 'gates',
      name: 'Gates Cambridge Scholarship',
      amount: 'Full Funding',
      organization: 'University of Cambridge',
      field: 'All Fields',
      deadline: '2025-10-15',
      level: 'Graduate',
      country: 'UK',
      description:
        'Prestigious scholarship for outstanding applicants from outside the UK to pursue graduate study at Cambridge.',
      tags: ['Full Funding', 'International', 'Graduate'],
      category: 'general',
      website: 'https://www.gatescambridge.org/',
      featured: true,
    },
    {
      id: 'nsf',
      name: 'NSF Graduate Research Fellowship',
      amount: '$37,000/year',
      organization: 'National Science Foundation',
      field: 'STEM',
      deadline: '2025-10-25',
      level: 'Graduate',
      country: 'USA',
      description:
        'Support for graduate research in science, technology, engineering, and mathematics.',
      tags: ['STEM', 'Research', 'USA'],
      category: 'stem',
      website: 'https://www.nsfgrfp.org/',
      featured: true,
    },
    {
      id: 'rhodes',
      name: 'Rhodes Scholarship',
      amount: 'Full Funding',
      organization: 'University of Oxford',
      field: 'All Fields',
      deadline: '2025-10-06',
      level: 'Graduate',
      country: 'UK',
      description:
        'The oldest graduate scholarship in the world, bringing students from many countries to study at Oxford.',
      tags: ['Full Funding', 'Leadership', 'Network'],
      category: 'general',
      website: 'https://www.rhodeshouse.ox.ac.uk/',
      featured: false,
    },
    // ... (rest with featured flags)
    {
      id: 'chevening',
      name: 'Chevening Scholarship',
      amount: 'Full Funding',
      organization: 'UK Government',
      field: 'Various',
      deadline: '2025-11-02',
      level: 'Master',
      country: 'UK',
      description:
        'UK government’s global scholarship programme, funded by the FCDO and partner organizations.',
      tags: ['Leadership', 'International', 'Government'],
      category: 'social',
      website: 'https://www.chevening.org/',
      featured: false,
    },
    {
      id: 'fulbright',
      name: 'Fulbright Program',
      amount: 'Variable',
      organization: 'USA Government',
      field: 'All Fields',
      deadline: '2025-10-11',
      level: 'Graduate',
      country: 'USA/Global',
      description: 'One of several United States Cultural Exchange Programs.',
      tags: ['Exchange', 'Global', 'Culture'],
      category: 'social',
      website: 'https://us.fulbrightonline.org/',
      featured: true,
    },
    {
      id: 'daad',
      name: 'DAAD Scholarships',
      amount: '€850-1,200/mo',
      organization: 'German Academic Exchange Service',
      field: 'All Fields',
      deadline: 'Varies',
      level: 'Graduate',
      country: 'Germany',
      description: 'Scholarships for international students for a range of positons in Germany.',
      tags: ['Germany', 'Exchange', 'Europe'],
      category: 'general',
      website: 'https://www.daad.de/en/',
      featured: false,
    },
    {
      id: 'google-ai',
      name: 'Google AI Scholarship',
      amount: '$15,000',
      organization: 'Google',
      field: 'Computer Science',
      deadline: '2025-12-01',
      level: 'Undergraduate',
      country: 'Global',
      description: 'Supporting underrepresented groups in AI and machine learning.',
      tags: ['AI', 'Tech', 'Diversity'],
      category: 'stem',
      website: 'https://buildyourfuture.withgoogle.com/scholarships',
      featured: true,
    },
  ];
}

function renderFeaturedScholarships() {
  const container = document.querySelector('.pathways-grid');
  if (!container) return;

  // Fallback to top 3 if no featured flag
  let featured = allScholarships.filter((s) => s.featured);
  if (featured.length === 0) featured = allScholarships.slice(0, 3);

  container.innerHTML = featured
    .map(
      (sch) => `
        <div class="pathway-card">
            <div class="pathway-icon">🏆</div>
            <h3>${escapeHtml(sch.name)}</h3>
            <div class="pathway-info">
                <span class="growth-rate">🔥 Popular</span>
                <span class="avg-salary">${escapeHtml(sch.amount)}</span>
            </div>
            <p>${escapeHtml(sch.description)}</p>
            <div class="required-skills">
                <span class="skill">${escapeHtml(sch.country)}</span>
                <span class="skill">${escapeHtml(sch.level)}</span>
                <span class="skill">Deadline: ${escapeHtml(sch.deadline)}</span>
            </div>
            <button class="btn-pathway" onclick="window.applyToScholarship('${sch.id}')" style="border:none; cursor:pointer; width:100%;">View Details</button>
        </div>
    `
    )
    .join('');
}

function escapeHtml(text) {
  if (!text) return '';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
