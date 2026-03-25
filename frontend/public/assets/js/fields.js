/**
 * Fields Page JavaScript
 * Handles field discovery, filtering, search, and interactions.
 */

document.addEventListener('DOMContentLoaded', () => {
  // Initialize fields
  loadFields();

  // Setup event listeners for filters
  setupFilters();

  // Setup Search
  document
    .querySelector('.field-search .btn-search')
    ?.addEventListener('click', window.performFieldSearch);

  // Setup Sort
  document.getElementById('sortDropdown')?.addEventListener('change', window.sortFields);
  document.querySelector('.btn-reset')?.addEventListener('click', window.resetSort);

  // Setup Delegation for card buttons
  const grid = document.getElementById('fieldsGrid');
  if (grid) {
    grid.addEventListener('click', (e) => {
      if (e.target.classList.contains('btn-explore-field')) {
        const btn = e.target;
        // Find ID
        const id = btn.getAttribute('data-id');
        if (id) {
          window.exploreField(id);
        }
      }
    });
  }

  // Setup Resource links delegation
  document.querySelectorAll('.resource-card').forEach((card) => {
    card.addEventListener('click', function () {
      const type = this.getAttribute('data-type');
      if (type) window.openResourceLink(type);
    });
  });

  // Setup listener for Category Explore buttons
  document.querySelectorAll('.field-categories .btn-explore').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      const category = e.target.dataset.category;
      if (category) {
        window.filterByCategory(category);
      }
    });
  });

  // Setup theme if not already handled by theme.js (it is handled there)
});

// State
let allFields = [];
let filteredFields = [];

/**
 * Load fields from API or Fallback
 */
async function loadFields() {
  const container = document.getElementById('fieldsGrid'); // ID from fields.html
  if (!container) return;

  container.innerHTML = '<div class="loading">Loading fields...</div>';

  try {
    const response = await fetch('/api/fields');
    const data = await response.json();

    if (data.success && data.data && data.data.length > 0) {
      allFields = data.data;
    } else {
      if (typeof process !== 'undefined' && process.env.NODE_ENV === 'development') {
        console.warn('API returned no fields, using fallback data.');
      }
      allFields = getFallbackFields();
    }
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Error loading fields from API:', error);
    }
    allFields = getFallbackFields();
  }

  filteredFields = [...allFields];

  // Check for URL parameters
  const urlParams = new URLSearchParams(window.location.search);
  const trackParam = urlParams.get('track');
  const searchParam = urlParams.get('search');

  if (trackParam) {
    const query = trackParam.replace(/-/g, ' ').toLowerCase();
    filteredFields = allFields.filter(
      (f) =>
        f.name.toLowerCase().includes(query) ||
        (f.tags && f.tags.some((t) => t.toLowerCase().includes(query)))
    );
    // Update search input to reflect logic
    const searchInput = document.querySelector('.field-search .search-input');
    if (searchInput) searchInput.value = query;
  } else if (searchParam) {
    // Logic for search param if used
    const query = searchParam.toLowerCase();
    filteredFields = allFields.filter((f) => f.name.toLowerCase().includes(query));
  }

  renderFields(filteredFields);
}

/**
 * Render fields to the grid
 */
function renderFields(fields) {
  const container = document.getElementById('fieldsGrid');
  if (!container) return;

  if (fields.length === 0) {
    container.innerHTML = '<div class="no-results">No fields found matching your criteria.</div>';
    return;
  }

  container.innerHTML = fields
    .map(
      (field) => `
        <div class="field-card" data-category="${field.category || 'other'}">
            <div class="field-icon">${field.icon || '🎓'}</div>
            <h3>${escapeHtml(field.name)}</h3>
            <p class="field-description">${escapeHtml(field.description || '')}</p>
            <div class="field-stats">
                <div class="stat"><strong>Avg Salary:</strong> ${escapeHtml(field.salary || 'N/A')}</div>
                <div class="stat"><strong>Growth:</strong> ${escapeHtml(field.growth_rate || 'N/A')}</div>
            </div>
            <div class="field-actions" style="display: flex; gap: 10px; margin-top: 15px;">
                <button class="btn btn-primary btn-explore-field" data-id="${field.id}" style="flex: 1;">Explore Field</button>
                <button class="btn btn-outline btn-view-pathway" onclick="showPathwayDetails('${escapeHtml(field.name)}')" style="flex: 1;">View Pathway</button>
            </div>
        </div>
    `
    )
    .join('');
}

/**
 * Filter fields by category
 * Global function as used in HTML onclicks
 */
window.filterByCategory = function (category) {
  // Update active tab UI
  const tabs = document.querySelectorAll('.filter-tab');
  tabs.forEach((tab) => {
    if (tab.dataset.filter === category) {
      tab.classList.add('active');
    } else {
      tab.classList.remove('active');
    }
  });

  // Scroll to fields section
  document.getElementById('detailedFields').scrollIntoView({ behavior: 'smooth' });

  // Filter logic
  if (category === 'all') {
    filteredFields = [...allFields];
  } else {
    filteredFields = allFields.filter(
      (field) =>
        (field.category && field.category.toLowerCase() === category.toLowerCase()) ||
        (field.tags && field.tags.includes(category))
    );
  }
  renderFields(filteredFields);
};

/**
 * Setup filter tab click listeners
 */
function setupFilters() {
  const tabs = document.querySelectorAll('.filter-tab');
  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      const category = tab.dataset.filter;
      window.filterByCategory(category);
    });
  });
}

/**
 * Search fields
 */
window.performFieldSearch = function () {
  const searchInput = document.querySelector('.field-search .search-input');
  const query = searchInput.value.toLowerCase().trim();

  if (!query) {
    filteredFields = [...allFields];
  } else {
    filteredFields = allFields.filter(
      (field) =>
        field.name.toLowerCase().includes(query) ||
        field.description.toLowerCase().includes(query) ||
        (field.tags && field.tags.some((tag) => tag.toLowerCase().includes(query)))
    );
  }

  // Switch filter tab to All if searching
  document.querySelectorAll('.filter-tab').forEach((t) => t.classList.remove('active'));
  document.querySelector('.filter-tab[data-filter="all"]')?.classList.add('active');

  renderFields(filteredFields);
  document.getElementById('detailedFields').scrollIntoView({ behavior: 'smooth' });
};

// Enter key for search
document.querySelector('.field-search .search-input')?.addEventListener('keyup', (e) => {
  if (e.key === 'Enter') window.performFieldSearch();
});

/**
 * Sort fields
 */
window.sortFields = function () {
  const sortValue = document.getElementById('sortDropdown').value;

  let sorted = [...filteredFields];

  switch (sortValue) {
    case 'name':
      sorted.sort((a, b) => a.name.localeCompare(b.name));
      break;
    case 'name-desc':
      sorted.sort((a, b) => b.name.localeCompare(a.name));
      break;
    case 'salary':
      // Simple parsing for "$120k" strings
      sorted.sort((a, b) => parseSalary(b.salary) - parseSalary(a.salary));
      break;
    case 'salary-asc':
      sorted.sort((a, b) => parseSalary(a.salary) - parseSalary(b.salary));
      break;
    case 'growth':
      sorted.sort((a, b) => parseFloat(b.growth_rate) - parseFloat(a.growth_rate));
      break;
    case 'category':
      sorted.sort((a, b) => (a.category || '').localeCompare(b.category || ''));
      break;
  }

  renderFields(sorted);
};

window.resetSort = function () {
  document.getElementById('sortDropdown').value = 'name';
  window.sortFields();
};

function parseSalary(salaryStr) {
  if (!salaryStr) return 0;
  // Extract numbers, remove k/K
  let num = parseFloat(salaryStr.replace(/[^0-9.]/g, ''));
  if (salaryStr.toLowerCase().includes('k')) num *= 1000;
  return num;
}

/**
 * Explore Field - Show detailed field modal
 */
window.exploreField = function (fieldId) {
  const field = allFields.find((f) => f.id === fieldId);

  if (!field) {
    // Fallback to redirect
    window.location.href = `/pages/scholarships.html?field=${fieldId}`;
    return;
  }

  // Create or update modal
  let modal = document.getElementById('fieldDetailModal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'fieldDetailModal';
    modal.className = 'modal';
    modal.innerHTML = `
      <div class="modal-content" style="max-width: 700px;">
        <button class="close-modal" onclick="closeFieldModal()">&times;</button>
        <div id="fieldDetailContent"></div>
      </div>
    `;
    document.body.appendChild(modal);

    // Close on backdrop click
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeFieldModal();
    });
  }

  const content = document.getElementById('fieldDetailContent');
  content.innerHTML = `
    <div style="text-align: center; margin-bottom: 1.5rem;">
      <div style="font-size: 3rem; margin-bottom: 0.5rem;">${field.icon || '🎓'}</div>
      <h2 style="margin: 0; color: var(--text-primary);">${escapeHtml(field.name)}</h2>
      <span style="display: inline-block; margin-top: 0.5rem; padding: 0.25rem 0.75rem; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border-radius: 20px; font-size: 0.875rem;">${escapeHtml(field.category || 'General')}</span>
    </div>
    
    <p style="font-size: 1.1rem; color: var(--text-secondary); text-align: center; margin-bottom: 1.5rem;">
      ${escapeHtml(field.description || 'Explore opportunities in this field.')}
    </p>
    
    <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem; margin-bottom: 1.5rem;">
      <div style="text-align: center; padding: 1rem; background: var(--bg-secondary, #f3f4f6); border-radius: 8px;">
        <span style="display: block; font-size: 1.25rem; font-weight: 700; color: var(--primary-color, #667eea);">${escapeHtml(field.salary || 'Competitive')}</span>
        <span style="font-size: 0.875rem; color: var(--text-secondary);">Avg. Salary</span>
      </div>
      <div style="text-align: center; padding: 1rem; background: var(--bg-secondary, #f3f4f6); border-radius: 8px;">
        <span style="display: block; font-size: 1.25rem; font-weight: 700; color: #10b981;">${escapeHtml(field.growth_rate || 'Growing')}</span>
        <span style="font-size: 0.875rem; color: var(--text-secondary);">Growth Rate</span>
      </div>
    </div>
    
    ${
      field.tags && field.tags.length > 0
        ? `
      <div style="margin-bottom: 1.5rem;">
        <h4 style="margin-bottom: 0.75rem; color: var(--text-primary);">Related Topics</h4>
        <div style="display: flex; flex-wrap: wrap; gap: 0.5rem;">
          ${field.tags.map((tag) => `<span style="padding: 0.25rem 0.75rem; background: var(--bg-secondary, #f3f4f6); color: var(--text-primary); border-radius: 20px; font-size: 0.875rem; border: 1px solid var(--border-color, #e5e7eb);">${escapeHtml(tag)}</span>`).join('')}
        </div>
      </div>
    `
        : ''
    }
    
    <div style="display: flex; gap: 1rem; margin-top: 2rem;">
      <a href="/pages/scholarships.html?field=${fieldId}" class="btn btn-primary" style="flex: 1; text-align: center; padding: 0.75rem 1.5rem; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border-radius: 8px; text-decoration: none; font-weight: 600;">
        🎓 Find Scholarships
      </a>
      <a href="/pages/roadmaps.html?field=${fieldId}" class="btn btn-secondary" style="flex: 1; text-align: center; padding: 0.75rem 1.5rem; background: var(--bg-secondary, #f3f4f6); color: var(--text-primary); border-radius: 8px; text-decoration: none; font-weight: 600; border: 1px solid var(--border-color, #e5e7eb);">
        🗺️ View Roadmap
      </a>
    </div>
  `;

  modal.style.display = 'flex';
  document.body.style.overflow = 'hidden';
};

window.closeFieldModal = function () {
  const modal = document.getElementById('fieldDetailModal');
  if (modal) {
    modal.style.display = 'none';
    document.body.style.overflow = '';
  }
};

/**
 * Show Pathway Details - Show comprehensive pathway modal
 */
window.showPathwayDetails = function (pathwayName) {
  // Find the field by name
  const field =
    allFields.find((f) => f.name === pathwayName) ||
    allFields.find((f) => f.name.toLowerCase().includes(pathwayName.toLowerCase()));

  // Pathway data (enriched)
  const pathwayData = {
    'Computer Science': {
      steps: [
        'Foundation in Math & Logic',
        'Learn Programming Basics',
        'Data Structures & Algorithms',
        'Specialize (AI/Web/Systems)',
        'Build Portfolio Projects',
      ],
      duration: '2-4 years',
      skills: ['Programming', 'Problem Solving', 'System Design'],
      opportunities: 120,
    },
    Biology: {
      steps: [
        'Core Biology Courses',
        'Lab Experience',
        'Research Projects',
        'Choose Specialization',
        'Graduate Study or Industry',
      ],
      duration: '4-6 years',
      skills: ['Research Methods', 'Lab Techniques', 'Scientific Writing'],
      opportunities: 85,
    },
    'Business Administration': {
      steps: [
        'Core Business Courses',
        'Internships',
        'Leadership Roles',
        'Specialization (Finance/Marketing)',
        'MBA (Optional)',
      ],
      duration: '3-5 years',
      skills: ['Leadership', 'Financial Analysis', 'Strategic Planning'],
      opportunities: 150,
    },
    default: {
      steps: [
        'Explore Foundation Courses',
        'Gain Practical Experience',
        'Find Your Specialization',
        'Build Your Network',
        'Launch Your Career',
      ],
      duration: '3-5 years',
      skills: ['Critical Thinking', 'Communication', 'Problem Solving'],
      opportunities: 100,
    },
  };

  const pathway = pathwayData[pathwayName] || pathwayData['default'];
  const fieldInfo = field || { name: pathwayName, icon: '🎯', category: 'General' };

  // Create or update modal
  let modal = document.getElementById('pathwayDetailModal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'pathwayDetailModal';
    modal.className = 'modal';
    modal.innerHTML = `
      <div class="modal-content" style="max-width: 750px;">
        <button class="close-modal" onclick="closePathwayModal()">&times;</button>
        <div id="pathwayDetailContent"></div>
      </div>
    `;
    document.body.appendChild(modal);

    modal.addEventListener('click', (e) => {
      if (e.target === modal) closePathwayModal();
    });
  }

  const content = document.getElementById('pathwayDetailContent');
  content.innerHTML = `
    <div style="text-align: center; margin-bottom: 1.5rem;">
      <div style="font-size: 2.5rem; margin-bottom: 0.5rem;">🛤️</div>
      <h2 style="margin: 0; color: var(--text-primary);">Career Pathway: ${escapeHtml(fieldInfo.name)}</h2>
      <p style="color: var(--text-secondary); margin-top: 0.5rem;">Your step-by-step guide to success</p>
    </div>
    
    <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; margin-bottom: 2rem;">
      <div style="text-align: center; padding: 1rem; background: var(--bg-secondary, #f3f4f6); border-radius: 8px;">
        <span style="display: block; font-size: 1.25rem; font-weight: 700; color: var(--primary-color, #667eea);">${pathway.duration}</span>
        <span style="font-size: 0.875rem; color: var(--text-secondary);">Duration</span>
      </div>
      <div style="text-align: center; padding: 1rem; background: var(--bg-secondary, #f3f4f6); border-radius: 8px;">
        <span style="display: block; font-size: 1.25rem; font-weight: 700; color: #10b981;">${pathway.steps.length}</span>
        <span style="font-size: 0.875rem; color: var(--text-secondary);">Key Steps</span>
      </div>
      <div style="text-align: center; padding: 1rem; background: var(--bg-secondary, #f3f4f6); border-radius: 8px;">
        <span style="display: block; font-size: 1.25rem; font-weight: 700; color: #f59e0b;">${pathway.opportunities}+</span>
        <span style="font-size: 0.875rem; color: var(--text-secondary);">Opportunities</span>
      </div>
    </div>
    
    <div style="margin-bottom: 1.5rem;">
      <h4 style="margin-bottom: 1rem; color: var(--text-primary);">📍 Pathway Steps</h4>
      <div style="position: relative; padding-left: 2rem;">
        ${pathway.steps
          .map(
            (step, index) => `
          <div style="position: relative; padding-bottom: 1rem; ${index < pathway.steps.length - 1 ? 'border-left: 2px solid #667eea; margin-left: 8px;' : ''}">
            <div style="position: absolute; left: -2rem; top: 0; width: 18px; height: 18px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-size: 10px; font-weight: bold;">${index + 1}</div>
            <div style="padding: 0.75rem 1rem; background: var(--bg-secondary, #f3f4f6); border-radius: 8px; margin-left: 1rem;">
              ${escapeHtml(step)}
            </div>
          </div>
        `
          )
          .join('')}
      </div>
    </div>
    
    <div style="margin-bottom: 1.5rem;">
      <h4 style="margin-bottom: 0.75rem; color: var(--text-primary);">💪 Skills You'll Develop</h4>
      <div style="display: flex; flex-wrap: wrap; gap: 0.5rem;">
        ${pathway.skills.map((skill) => `<span style="padding: 0.25rem 0.75rem; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border-radius: 20px; font-size: 0.875rem;">${escapeHtml(skill)}</span>`).join('')}
      </div>
    </div>
    
    <div style="display: flex; gap: 1rem; margin-top: 2rem;">
      <a href="/pages/roadmaps.html?pathway=${encodeURIComponent(pathwayName)}" class="btn btn-primary" style="flex: 1; text-align: center; padding: 0.75rem 1.5rem; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border-radius: 8px; text-decoration: none; font-weight: 600;">
        🚀 Start This Pathway
      </a>
      <button onclick="closePathwayModal()" class="btn btn-secondary" style="flex: 1; padding: 0.75rem 1.5rem; background: var(--bg-secondary, #f3f4f6); color: var(--text-primary); border-radius: 8px; font-weight: 600; border: 1px solid var(--border-color, #e5e7eb); cursor: pointer;">
        Close
      </button>
    </div>
  `;

  modal.style.display = 'flex';
  document.body.style.overflow = 'hidden';
};

window.closePathwayModal = function () {
  const modal = document.getElementById('pathwayDetailModal');
  if (modal) {
    modal.style.display = 'none';
    document.body.style.overflow = '';
  }
};

/**
 * Open Resource Link
 */
window.openResourceLink = function (type) {
  const links = {
    guides: 'https://www.bls.gov/ooh/',
    videos: 'https://www.youtube.com/results?search_query=career+exploration',
    coursera: 'https://www.coursera.org',
    linkedin: 'https://www.linkedin.com/learning',
    communities: 'https://www.reddit.com/r/careeradvice/',
    data: 'https://www.glassdoor.com/Salaries/index.htm',
    indeed: 'https://www.indeed.com/career-advice',
    khan: 'https://www.khanacademy.org',
  };

  if (links[type]) {
    window.open(links[type], '_blank');
  }
};

/**
 * Fallback Data
 */
function getFallbackFields() {
  return [
    {
      id: 'cs',
      name: 'Computer Science',
      description: 'Study of computation, automation, and information.',
      category: 'stem',
      icon: '💻',
      salary: '$110k',
      growth_rate: '15%',
      tags: ['tech', 'coding', 'software'],
    },
    {
      id: 'bio',
      name: 'Biology',
      description: 'The science of life and living organisms.',
      category: 'stem',
      icon: '🧬',
      salary: '$70k',
      growth_rate: '5%',
      tags: ['science', 'life', 'research'],
    },
    {
      id: 'business',
      name: 'Business Administration',
      description: 'Management of business operations and decision making.',
      category: 'business',
      icon: '📊',
      salary: '$85k',
      growth_rate: '8%',
      tags: ['management', 'finance'],
    },
    {
      id: 'psych',
      name: 'Psychology',
      description: 'Scientific study of the mind and behavior.',
      category: 'social',
      icon: '🧠',
      salary: '$60k',
      growth_rate: '6%',
      tags: ['health', 'mind'],
    },
    {
      id: 'design',
      name: 'Graphic Design',
      description: 'Visual communication and problem-solving through typography and imagery.',
      category: 'creative',
      icon: '🎨',
      salary: '$55k',
      growth_rate: '3%',
      tags: ['art', 'media'],
    },
    {
      id: 'eng',
      name: 'Mechanical Engineering',
      description: 'Design, analysis, and manufacturing of mechanical systems.',
      category: 'stem',
      icon: '⚙️',
      salary: '$95k',
      growth_rate: '7%',
      tags: ['engineering', 'machines'],
    },
    {
      id: 'econ',
      name: 'Economics',
      description:
        'Social science conducting research on production, distribution, and consumption.',
      category: 'business',
      icon: '💰',
      salary: '$105k',
      growth_rate: '13%',
      tags: ['finance', 'money'],
    },
    {
      id: 'film',
      name: 'Film Studies',
      description: 'Theoretical, historical, and critical approaches to cinema.',
      category: 'creative',
      icon: '🎬',
      salary: '$50k',
      growth_rate: '4%',
      tags: ['art', 'media'],
    },
  ];
}

function escapeHtml(text) {
  if (!text) return '';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
