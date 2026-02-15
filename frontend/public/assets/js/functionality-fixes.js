/**
 * Functionality Fixes Module
 * Implements inline expansion, search filtering, and utility fixes.
 */

(function () {
  'use strict';

  const AppFixes = {
    // State
    state: {
      expandedCardId: null,
      universities: [],
    },

    init() {
      console.log('AppFixes initialized');
      this.attachGlobalListeners();
      // Pre-fetch universities for search if on universities page
      if (window.location.pathname.includes('universities')) {
        this.fetchUniversities();
      }
    },

    // --- Data Fetching ---
    async fetchUniversities() {
      try {
        // Try API first, fallback to static if needed (handled by main.js usually, but ensuring local copy)
        const res = await fetch('/data/universities.json'); // Using static for reliability in this demo
        if (res.ok) {
          this.state.universities = await res.json();
          console.log('Universities loaded for search:', this.state.universities.length);
        }
      } catch (e) {
        console.error('Failed to load universities:', e);
      }
    },

    // --- Event Listeners ---
    attachGlobalListeners() {
      document.addEventListener('click', (e) => {
        // Fields Expansion
        if (e.target.closest('.btn-explore-field')) {
          const btn = e.target.closest('.btn-explore-field');
          // Prevent default navigation if we are doing inline expansion
          e.preventDefault();
          this.handleFieldExpansion(btn);
        }

        // Universities Expansion
        if (e.target.closest('.btn-detail')) {
          const btn = e.target.closest('.btn-detail');
          e.preventDefault();
          this.handleUniversityExpansion(btn);
        }

        // Universities Search Button
        if (e.target.id === 'searchBtn' && window.location.pathname.includes('universities')) {
          e.preventDefault(); // Stop form submit/redirect
          this.handleUniversitySearch();
        }
      });

      // Search Input Enter Key
      document.addEventListener('keyup', (e) => {
        if (e.target.id === 'universitySearch' && e.key === 'Enter') {
          e.preventDefault();
          this.handleUniversitySearch();
        }
      });
    },

    // --- Fields Page Logic ---
    async handleFieldExpansion(btn) {
      const card = btn.closest('.field-card') || btn.closest('.explore-card'); // Adjust selector based on actual HTML
      if (!card) return;

      const fieldId = btn.dataset.id;
      const isExpanded = card.classList.contains('expanded');

      // Collapse all others
      document.querySelectorAll('.expanded').forEach((el) => {
        if (el !== card) {
          el.classList.remove('expanded');
          // reset button text if needed
          const b = el.querySelector('.btn-explore-field');
          if (b) b.textContent = 'Explore Field';
        }
      });

      if (isExpanded) {
        card.classList.remove('expanded');
        btn.textContent = 'Explore Field';
      } else {
        card.classList.add('expanded');
        btn.textContent = 'Close Details';
        this.renderFieldDetails(card, fieldId);
      }
    },

    renderFieldDetails(card, fieldId) {
      let panel = card.querySelector('.expansion-panel');
      if (!panel) {
        // Create panel if it doesn't exist
        panel = document.createElement('div');
        panel.className = 'expansion-panel';
        card.appendChild(panel);
      }

      // Show loading
      panel.innerHTML =
        '<div class="expansion-loading"><div class="spinner-small"></div> Loading Details...</div>';

      // Mock Data Fetch (Replace with API call in production)
      setTimeout(() => {
        const mockData = this.getMockFieldData(fieldId);

        panel.innerHTML = `
            <div class="field-details-content">
                <p class="field-full-desc">${mockData.description}</p>
                
                <div class="detail-grid">
                    <div class="detail-item">
                        <span class="detail-label">Top Skills</span>
                        <div class="inline-list">
                            ${mockData.skills.map((s) => `<span class="inline-item-tag">${s}</span>`).join('')}
                        </div>
                    </div>
                     <div class="detail-item">
                        <span class="detail-label">Top Universities</span>
                        <ul style="padding-left: 1rem; margin: 0;">
                            ${mockData.universities.map((u) => `<li>${u}</li>`).join('')}
                        </ul>
                    </div>
                </div>

                <div class="expanded-actions">
                    <a href="/scholarships?field=${fieldId}" class="btn btn-secondary">View Related Scholarships</a>
                </div>
            </div>
        `;
      }, 500);
    },

    getMockFieldData(id) {
      // Simple mock data generator based on ID
      const data = {
        description:
          'A comprehensive discipline involving the study of systems, innovation, and problem-solving.',
        skills: ['Analysis', 'Problem Solving', 'Mathematics'],
        universities: ['MIT', 'Stanford', 'Berkeley', 'CMU', 'ETH Zurich'],
      };

      if (id === 'cs') {
        data.description =
          'Computer Science spans the range from theory through programming to cutting-edge development of computing solutions.';
        data.skills = [
          'Programming (Python, Java)',
          'Algorithms',
          'Data Structures',
          'System Design',
        ];
      } else if (id === 'engineering') {
        data.description =
          'Engineering principles applied to design, build, and maintain complex systems and structures.';
        data.skills = ['Physics', 'CAD', 'Project Management', 'Mathematics'];
      } else if (id === 'business') {
        data.description =
          'Study of organizational management, economics, finance, and marketing strategies.';
        data.skills = ['Leadership', 'Financial Analysis', 'Communication', 'Strategic Planning'];
      }
      return data;
    },

    // --- Universities Page Logic ---
    async handleUniversityExpansion(btn) {
      const card = btn.closest('.university-card');
      if (!card) return;

      const uniId = btn.dataset.id;
      const isExpanded = card.classList.contains('expanded');

      // Check setting: "Only one card can be expanded at a time" logic from Fields applies?
      // User prompt for Universities says "Same expand/collapse pattern as fields page".
      // So yes, collapse others.
      document.querySelectorAll('.university-card.expanded').forEach((el) => {
        if (el !== card) {
          el.classList.remove('expanded');
          const b = el.querySelector('.btn-detail');
          if (b) b.textContent = 'View Detail';
        }
      });

      if (isExpanded) {
        card.classList.remove('expanded');
        btn.textContent = 'View Detail';
      } else {
        card.classList.add('expanded');
        btn.textContent = 'Close';
        this.renderUniversityDetails(card, uniId);
      }
    },

    renderUniversityDetails(card, uniId) {
      let panel = card.querySelector('.expansion-panel');
      if (!panel) {
        panel = document.createElement('div');
        panel.className = 'expansion-panel';
        card.appendChild(panel);
      }

      // Get Uni Data
      const uni = this.state.universities.find((u) => u.id == uniId);

      if (!uni) {
        panel.innerHTML = '<div class="error">University data not found.</div>';
        return;
      }

      panel.innerHTML = `
             <div class="uni-details-content">
                <div class="detail-grid">
                    <div class="detail-item">
                        <span class="detail-label">Ranking</span>
                        <span class="detail-value text-primary">#${uni.ranking}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Acceptance</span>
                        <span class="detail-value text-success">${uni.acceptanceRate}%</span>
                    </div>
                     <div class="detail-item">
                        <span class="detail-label">Tuition</span>
                        <span class="detail-value">${uni.tuition === 0 ? 'Free' : '$' + uni.tuition.toLocaleString()}</span>
                    </div>
                </div>
                
                <div style="margin-bottom: 1rem;">
                    <strong>Top Programs:</strong>
                    <div class="inline-list" style="margin-top: 0.5rem;">
                        ${uni.majors
                          .slice(0, 5)
                          .map((m) => `<span class="inline-item-tag">${m}</span>`)
                          .join('')}
                    </div>
                </div>

                <div class="expanded-actions">
                    <button class="btn btn-outline btn-save" data-id="${uni.id}">🔖 Save</button>
                    <a href="/scholarships?university=${encodeURIComponent(uni.name)}" class="btn btn-secondary">View Scholarships at This University</a>
                </div>
            </div>
        `;

      // Save functionality
      panel.querySelector('.btn-save').addEventListener('click', (e) => {
        alert('University Saved! (Bookmark feature)');
        e.stopPropagation();
      });
    },

    // --- Search Fix ---
    handleUniversitySearch() {
      const searchInput = document.getElementById('universitySearch');
      if (!searchInput) return;

      const query = searchInput.value.toLowerCase();
      const grid = document.getElementById('universitiesGrid');
      if (!grid) return;

      // Filter in-place
      const allCards = grid.querySelectorAll('.university-card');
      let count = 0;

      allCards.forEach((card) => {
        const name = card.querySelector('.university-name').textContent.toLowerCase();
        const loc = card.querySelector('.university-location').textContent.toLowerCase();
        // Expanded search to tags if needed

        if (name.includes(query) || loc.includes(query)) {
          card.style.display = 'flex'; // Assuming flex layout for cards
          count++;
        } else {
          card.style.display = 'none';
        }
      });

      // Update count
      const countSpan = document.getElementById('resultsCount');
      if (countSpan) countSpan.textContent = count;

      const noResults = document.getElementById('noResults');
      if (noResults) noResults.style.display = count === 0 ? 'block' : 'none';
    },
  };

  // Expose to window
  window.AppFixes = AppFixes;

  // Init on load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => AppFixes.init());
  } else {
    AppFixes.init();
  }
})();
