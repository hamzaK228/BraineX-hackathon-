/**
 * BRAINEX UNIVERSITIES ENGINE
 * Handles searching, filtering, rendering, and comparing universities.
 */
class UniversitiesEngine {
  constructor() {
    this.data = [];
    this.filteredData = [];
    this.filters = {
      search: '',
      country: '',
      maxTuition: 100000,
      type: '',
    };
    this.compareList = new Set();
    this.container = document.getElementById('universitiesGrid');

    // Initialize
    this.init();
  }

  async init() {
    try {
      // Load Data
      const response = await fetch('/data/universities.json');
      this.data = await response.json();
      this.filteredData = [...this.data];

      // Setup Listeners
      this.setupSearch();
      this.setupFilters();
      this.setupComparison();

      // Initial Render
      this.render();
      this.updateFilterOptions();
    } catch (error) {
      console.error('Failed to load university data:', error);
      if (this.container)
        this.container.innerHTML =
          '<div class="error-state">Failed to load data. Please try again later.</div>';
    }
  }

  setupSearch() {
    const searchInput = document.getElementById('uniSearch');
    if (!searchInput) return;

    // Debounce search
    let timeout;
    searchInput.addEventListener('input', (e) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        this.filters.search = e.target.value.toLowerCase();
        this.applyFilters();
      }, 300);
    });
  }

  setupFilters() {
    // Country Filter
    const countrySelect = document.getElementById('filterCountry');
    if (countrySelect) {
      countrySelect.addEventListener('change', (e) => {
        this.filters.country = e.target.value;
        this.applyFilters();
      });
    }

    // Tuition Range
    const tuitionInput = document.getElementById('filterTuition');
    const tuitionDisplay = document.getElementById('tuitionDisplay');
    if (tuitionInput) {
      tuitionInput.addEventListener('input', (e) => {
        this.filters.maxTuition = parseInt(e.target.value);
        if (tuitionDisplay)
          tuitionDisplay.textContent = `$${this.filters.maxTuition.toLocaleString()}`;
        this.applyFilters();
      });
    }

    // Type Filter
    const typeSelect = document.getElementById('filterType');
    if (typeSelect) {
      typeSelect.addEventListener('change', (e) => {
        this.filters.type = e.target.value;
        this.applyFilters();
      });
    }
  }

  updateFilterOptions() {
    const countrySelect = document.getElementById('filterCountry');
    if (!countrySelect) return;

    const countries = [...new Set(this.data.map((u) => u.location.country))].sort();
    countries.forEach((country) => {
      const option = document.createElement('option');
      option.value = country;
      option.textContent = country;
      countrySelect.appendChild(option);
    });
  }

  applyFilters() {
    this.filteredData = this.data.filter((uni) => {
      const matchesSearch =
        uni.name.toLowerCase().includes(this.filters.search) ||
        uni.programs.some((p) => p.toLowerCase().includes(this.filters.search));
      const matchesCountry =
        this.filters.country === '' || uni.location.country === this.filters.country;
      const matchesTuition = uni.tuition <= this.filters.maxTuition;
      const matchesType = this.filters.type === '' || uni.type === this.filters.type;

      return matchesSearch && matchesCountry && matchesTuition && matchesType;
    });

    this.render();
  }

  render() {
    if (!this.container) return;

    if (this.filteredData.length === 0) {
      this.container.innerHTML =
        '<div class="empty-state">No universities found matching your criteria.</div>';
      return;
    }

    this.container.innerHTML = this.filteredData
      .map(
        (uni) => `
            <div class="uni-card animate-fade-in">
                <div class="uni-header">
                    <img src="${uni.logo}" alt="${uni.name}" class="uni-logo" loading="lazy" onerror="this.src='../assets/images/placeholder-uni.png'">
                    <div class="uni-title">
                        <h3>${uni.name}</h3>
                        <span class="uni-location"><i class="fas fa-map-marker-alt"></i> ${uni.location.city}, ${uni.location.country}</span>
                    </div>
                </div>
                <div class="uni-body">
                    <div class="uni-stats">
                        <div class="stat-item">
                            <span class="stat-value">#${uni.ranking}</span>
                            <span class="stat-label">Global Rank</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-value">${uni.acceptance_rate}%</span>
                            <span class="stat-label">Acceptance</span>
                        </div>
                    </div>
                    <p class="uni-desc">${uni.description.substring(0, 100)}...</p>
                    <div class="uni-tags">
                        ${uni.programs
                          .slice(0, 3)
                          .map((p) => `<span class="uni-tag">${p}</span>`)
                          .join('')}
                    </div>
                </div>
                <div class="uni-footer">
                    <span class="uni-tuition">$${uni.tuition.toLocaleString()}/y</span>
                    <div class="uni-actions">
                        <button class="btn btn-sm btn-outline js-compare-toggle" 
                                data-id="${uni.id}"
                                ${this.compareList.has(uni.id) ? 'data-selected="true"' : ''}>
                           ${this.compareList.has(uni.id) ? 'Selected' : 'Compare'}
                        </button>
                        <a href="detail.html?id=${uni.id}" class="btn btn-sm btn-primary">Details</a>
                    </div>
                </div>
            </div>
        `
      )
      .join('');

    this.attachCardListeners();
  }

  setupComparison() {
    const compareBar = document.getElementById('comparisonBar');
    const countSpan = document.getElementById('compareCount');
    const clearBtn = document.getElementById('clearCompare');
    const viewBtn = document.getElementById('viewCompare');

    if (!compareBar) return;

    this.updateCompareUI = () => {
      if (this.compareList.size > 0) {
        compareBar.classList.add('active');
        countSpan.textContent = `${this.compareList.size} selected`;
        // Update avatars preview if needed
      } else {
        compareBar.classList.remove('active');
      }
    };

    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        this.compareList.clear();
        this.updateCompareUI();
        this.render(); // Re-render to reset buttons
      });
    }

    if (viewBtn) {
      viewBtn.addEventListener('click', () => {
        if (this.compareList.size < 2) {
          alert('Please select at least 2 universities to compare');
          return;
        }
        const ids = Array.from(this.compareList).join(',');
        window.location.href = `compare.html?ids=${ids}`;
      });
    }
  }

  attachCardListeners() {
    document.querySelectorAll('.js-compare-toggle').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const id = btn.dataset.id;

        if (this.compareList.has(id)) {
          this.compareList.delete(id);
          btn.textContent = 'Compare';
          btn.removeAttribute('data-selected');
          btn.classList.remove('btn-success');
          btn.classList.add('btn-outline');
        } else {
          if (this.compareList.size >= 4) {
            alert('You can compare max 4 universities');
            return;
          }
          this.compareList.add(id);
          btn.textContent = 'Selected';
          btn.setAttribute('data-selected', 'true');
          btn.classList.remove('btn-outline');
          btn.classList.add('btn-success');
        }
        this.updateCompareUI();
      });
    });
  }
}

// Initialize on DOM Ready
document.addEventListener('DOMContentLoaded', () => {
  window.universitiesEngine = new UniversitiesEngine();
});
