document.addEventListener('DOMContentLoaded', function () {
  initializeMentorsPage();
});

let allMentors = [];
let filteredMentors = [];

function initializeMentorsPage() {
  loadMentorsData();
  setupMentorFilters();
  setupMentorActions();
}

async function loadMentorsData() {
  try {
    const response = await fetch('/api/mentors');
    if (!response.ok) throw new Error('Failed to fetch mentors');

    const result = await response.json();

    if (result.success && Array.isArray(result.data)) {
      allMentors = result.data.map((m) => ({
        ...m,
        id: m.id || m._id,
        image:
          m.image ||
          (m.name
            ? m.name
                .split(' ')
                .map((n) => n[0])
                .join('')
            : '?'),
        tags: m.tags || m.expertise || [],
      }));
    } else {
      console.warn('Invalid mentors data, using fallback');
      allMentors = getFallbackMentors();
    }
  } catch (error) {
    console.error('Error loading mentors:', error);
    allMentors = getFallbackMentors();
  }

  filteredMentors = [...allMentors];
  renderMentors(filteredMentors);
}

function getFallbackMentors() {
  return [
    {
      id: 1,
      name: 'Dr. Sarah Johnson',
      role: 'AI Research Director',
      company: 'Google DeepMind',
      image: 'SJ',
      field: 'technology',
      experience: '15+ years',
      location: 'usa',
      mentees: 200,
      rating: 5.0,
      price: 150,
      bio: 'Leading AI researcher helping students get into top PhD programs and tech companies.',
      tags: ['Machine Learning', 'PhD Applications', 'Research'],
    },
    {
      id: 2,
      name: 'Michael Chen',
      role: 'Investment Banking VP',
      company: 'Goldman Sachs',
      image: 'MC',
      field: 'business',
      experience: '10+ years',
      location: 'usa',
      mentees: 150,
      rating: 4.9,
      price: 120,
      bio: 'Finance expert specializing in IB recruiting and MBA admissions.',
      tags: ['Investment Banking', 'Finance', 'MBA'],
    },
    {
      id: 3,
      name: 'Dr. Aisha Patel',
      role: 'Medical Researcher',
      company: 'Johns Hopkins',
      image: 'AP',
      field: 'medicine',
      experience: '12+ years',
      location: 'usa',
      mentees: 120,
      rating: 5.0,
      price: 140,
      bio: 'Expert in medical school admissions and healthcare career paths.',
      tags: ['Medical School', 'Healthcare', 'Research'],
    },
    {
      id: 4,
      name: 'James Wilson',
      role: 'Senior Software Engineer',
      company: 'Meta',
      image: 'JW',
      field: 'technology',
      experience: '8 years',
      location: 'uk',
      mentees: 85,
      rating: 4.8,
      price: 90,
      bio: 'Full stack developer passionate about mentoring junior engineers.',
      tags: ['Web Development', 'System Design', 'Career Growth'],
    },
    {
      id: 5,
      name: 'Emily Wong',
      role: 'Product Design Lead',
      company: 'Airbnb',
      image: 'EW',
      field: 'arts',
      experience: '7 years',
      location: 'canada',
      mentees: 60,
      rating: 4.9,
      price: 100,
      bio: 'Design leader helping students build portfolios and land design roles.',
      tags: ['UX/UI Design', 'Portfolio Review', 'Product Design'],
    },
    {
      id: 6,
      name: 'David Mueller',
      role: 'Corporate Lawyer',
      company: 'Clifford Chance',
      image: 'DM',
      field: 'law',
      experience: '15+ years',
      location: 'germany',
      mentees: 40,
      rating: 4.7,
      price: 180,
      bio: 'International law expert guiding law students and graduates.',
      tags: ['Corporate Law', 'Law School', 'Legal Career'],
    },
  ];
}

function renderMentors(mentors) {
  const grid = document.getElementById('mentorsGrid');
  if (!grid) return;

  if (mentors.length === 0) {
    grid.innerHTML = '<div class="no-results">No mentors found matching your criteria.</div>';
    return;
  }

  grid.innerHTML = mentors
    .map(
      (mentor) => `
        <div class="mentor-card">
            <div class="mentor-header">
                <div class="mentor-avatar-small">${mentor.image}</div>
                <div>
                    <h3>${mentor.name}</h3>
                    <p class="mentor-role">${mentor.role}</p>
                    <p class="mentor-company">🏢 ${mentor.company}</p>
                </div>
            </div>
            
            <p class="mentor-bio">${mentor.bio}</p>
            
            <div class="mentor-tags">
                ${mentor.tags.map((tag) => `<span class="tag">${tag}</span>`).join('')}
            </div>
            
            <div class="mentor-details">
                <div class="detail-item">
                    <span>⭐ ${mentor.rating}</span>
                </div>
                <div class="detail-item">
                    <span>👥 ${mentor.mentees} mentees</span>
                </div>
                <div class="detail-item">
                    <span>💰 $${mentor.price}/hr</span>
                </div>
            </div>
            
            <button class="btn-connect" data-id="${mentor.id}">Connect</button>
        </div>
    `
    )
    .join('');
}

function setupMentorFilters() {
  const fieldFilter = document.getElementById('fieldFilter');
  const experienceFilter = document.getElementById('experienceFilter');
  const locationFilter = document.getElementById('locationFilter');
  const sortSelect = document.querySelector('.sort-select');
  const searchBtn = document.querySelector('.btn-search-mentors');

  // Search Button
  if (searchBtn) {
    searchBtn.addEventListener('click', applyFilters);
  }

  // Direct changes
  [fieldFilter, experienceFilter, locationFilter, sortSelect].forEach((el) => {
    if (el) el.addEventListener('change', applyFilters);
  });

  // View Toggle
  const viewBtns = document.querySelectorAll('.view-btn');
  viewBtns.forEach((btn) => {
    btn.addEventListener('click', function () {
      viewBtns.forEach((b) => b.classList.remove('active'));
      this.classList.add('active');
      const view = this.dataset.view;
      const grid = document.getElementById('mentorsGrid');
      if (grid) {
        if (view === 'list') grid.classList.add('list-view');
        else grid.classList.remove('list-view');
      }
    });
  });
}

function setupMentorActions() {
  // Featured buttons
  document.querySelectorAll('.btn-connect-featured').forEach((btn) => {
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      const card = this.closest('.mentor-featured-card');
      const name = card.querySelector('h3').innerText;
      if (window.BraineX && BraineX.showNotification) {
        BraineX.showNotification(`Request sent to ${name}!`, 'success');
      } else {
        alert(`Request sent to ${name}!`);
      }
    });
  });

  // Become a Mentor Modal
  const becomeBtn = document.querySelector('.btn-become-mentor');
  const modal = document.getElementById('becomeMentorModal');
  const closeBtn = modal?.querySelector('.close-modal');
  const form = document.getElementById('becomeMentorForm');

  if (becomeBtn && modal) {
    becomeBtn.addEventListener('click', () => {
      modal.style.display = 'block';
      modal.classList.add('show');
    });
  }

  if (closeBtn && modal) {
    closeBtn.addEventListener('click', () => {
      modal.style.display = 'none';
      modal.classList.remove('show');
    });
  }

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      if (window.BraineX && BraineX.showNotification) {
        BraineX.showNotification('Application submitted successfully!', 'success');
      } else {
        alert('Application submitted successfully!');
      }
      if (modal) {
        modal.style.display = 'none';
        modal.classList.remove('show');
      }
      form.reset();
    });
  }

  // Connect delegation
  const grid = document.getElementById('mentorsGrid');
  if (grid) {
    grid.addEventListener('click', (e) => {
      if (e.target.classList.contains('btn-connect')) {
        const id = e.target.getAttribute('data-id');
        window.connectWithMentor(parseInt(id));
      }
    });
  }
}

function applyFilters() {
  const field = document.getElementById('fieldFilter')?.value;
  const experience = document.getElementById('experienceFilter')?.value; // entry, mid, senior
  const location = document.getElementById('locationFilter')?.value;
  const sortBy = document.querySelector('.sort-select')?.value;

  filteredMentors = allMentors.filter((mentor) => {
    if (field && mentor.field !== field) return false;
    if (location && mentor.location !== location) return false;

    if (experience) {
      const expYears = parseInt(mentor.experience);
      if (experience === 'entry' && expYears > 5) return false;
      if (experience === 'mid' && (expYears <= 5 || expYears > 10)) return false;
      if (experience === 'senior' && expYears <= 10) return false;
    }

    return true;
  });

  // Sorting
  if (sortBy) {
    filteredMentors.sort((a, b) => {
      if (sortBy === 'rating') return b.rating - a.rating;
      if (sortBy === 'price') return a.price - b.price; // Low to high?
      if (sortBy === 'reviews') return b.mentees - a.mentees; // Use mentees count as proxy
      if (sortBy === 'experience') return parseInt(b.experience) - parseInt(a.experience);
      return 0;
    });
  }

  renderMentors(filteredMentors);
}

// Global Actions
window.connectWithMentor = function (id) {
  const mentor = allMentors.find((m) => m.id === id);
  if (mentor) {
    if (window.BraineX && BraineX.showNotification) {
      BraineX.showNotification(`Request sent to ${mentor.name}!`, 'success');
    } else {
      alert(`Request sent to ${mentor.name}!`);
    }
  }
};
