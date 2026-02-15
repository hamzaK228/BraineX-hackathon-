// Roadmaps Page Functionality
document.addEventListener('DOMContentLoaded', function () {
  // 1. Roadmap Data (Sample)
  const roadmaps = [
    {
      title: 'Software Engineering Career',
      category: 'career',
      icon: '💻',
      description: 'From basics to senior engineer in the tech industry',
      duration: '12-24 months',
      milestones: '20 milestones',
      followers: '15.4k',
    },
    {
      title: 'Study Abroad Excellence',
      category: 'academic',
      icon: '🌎',
      description: "Step-by-step guide to securing master's abroad",
      duration: '12 months',
      milestones: '12 milestones',
      followers: '8.2k',
    },
    {
      title: 'Data Science Specialization',
      category: 'skills',
      icon: '📊',
      description: 'Master Python, Math and Machine Learning',
      duration: '9-15 months',
      milestones: '18 milestones',
      followers: '11.1k',
    },
    {
      title: 'Research Publication Pro',
      category: 'research',
      icon: '📝',
      description: 'How to write and publish in top tier journals',
      duration: '6-12 months',
      milestones: '10 milestones',
      followers: '5.7k',
    },
    {
      title: 'E-commerce Startup Guide',
      category: 'business',
      icon: '🚀',
      description: 'Launch your first online business from scratch',
      duration: '3-6 months',
      milestones: '15 milestones',
      followers: '9.3k',
    },
  ];

  // 2. Initialize Filtering
  const filterTabs = document.querySelectorAll('.category-tab');
  const roadmapsList = document.getElementById('roadmapsList');

  if (filterTabs && roadmapsList) {
    filterTabs.forEach((tab) => {
      tab.addEventListener('click', () => {
        // Update active tab
        filterTabs.forEach((t) => t.classList.remove('active'));
        tab.classList.add('active');

        const category = tab.getAttribute('data-category');
        renderRoadmaps(category);
      });
    });

    // Initial render
    renderRoadmaps('all');
  }

  function renderRoadmaps(filter) {
    if (!roadmapsList) return;

    const filtered = roadmaps.filter((r) => filter === 'all' || r.category === filter);

    roadmapsList.innerHTML = filtered
      .map(
        (r) => `
            <div class="roadmap-card" style="opacity: 0; transform: translateY(20px);">
                <div class="roadmap-icon">${r.icon}</div>
                <h3>${r.title}</h3>
                <p>${r.description}</p>
                <div class="roadmap-details">
                    <div class="detail"><span>⏱️</span> ${r.duration}</div>
                    <div class="detail"><span>📊</span> ${r.milestones}</div>
                    <div class="detail"><span>👥</span> ${r.followers} followers</div>
                </div>
                <a href="#" class="btn-roadmap" style="text-decoration: none; text-align: center; display: inline-block;">View Roadmap</a>
            </div>
        `
      )
      .join('');

    // Animate entrance
    const cards = roadmapsList.querySelectorAll('.roadmap-card');
    cards.forEach((card, index) => {
      setTimeout(() => {
        card.style.transition = 'all 0.4s ease';
        card.style.opacity = '1';
        card.style.transform = 'translateY(0)';
      }, index * 100);
    });
  }

  // 3. Roadmap Finder
  const findBtn = document.querySelector('.btn-find-roadmap');
  const goalSelect = document.getElementById('goalSelect');

  if (findBtn && goalSelect) {
    findBtn.addEventListener('click', () => {
      const goal = goalSelect.value;
      if (!goal) {
        if (window.BraineX && window.BraineX.showNotification) {
          BraineX.showNotification('Please select a goal first!', 'info');
        } else {
          alert('Please select a goal first!');
        }
        return;
      }

      // Scroll to list and filter
      const categoryMap = {
        undergraduate: 'academic',
        graduate: 'academic',
        career: 'career',
        research: 'research',
        startup: 'business',
      };

      const targetCategory = categoryMap[goal] || 'all';
      const targetTab = document.querySelector(`.category-tab[data-category="${targetCategory}"]`);

      if (targetTab) {
        targetTab.click();
        roadmapsList.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    });
  }

  // 4. Interactive Steps Animation
  const steps = document.querySelectorAll('.timeline-step');
  steps.forEach((step) => {
    step.addEventListener('click', () => {
      steps.forEach((s) => s.classList.remove('active'));
      step.classList.add('active');
    });
  });

  // 5. Roadmap Details Modal Logic
  document.addEventListener('click', (e) => {
    if (e.target.classList.contains('btn-roadmap')) {
      e.preventDefault();
      const card = e.target.closest('.roadmap-card');
      const title = card.querySelector('h3').textContent;
      openRoadmapModal(title);
    }
  });

  // Modal Close Logic
  const modal = document.getElementById('roadmapModal');
  if (modal) {
    modal
      .querySelector('.close-modal')
      .addEventListener('click', () => (modal.style.display = 'none'));
    window.addEventListener('click', (e) => {
      if (e.target === modal) modal.style.display = 'none';
    });
  }

  function openRoadmapModal(title) {
    const modal = document.getElementById('roadmapModal');
    const content = document.getElementById('roadmapModalContent');
    if (!modal || !content) return;

    // Find data (check both static list and dynamic list logic)
    const roadmap = roadmaps.find((r) => r.title === title) || {
      title: title,
      description: 'A comprehensive guide to achieving your goals in ' + title,
      duration: 'Flexible',
      milestones: 'Multiple Phases',
      icon: '🎯',
    };

    // Check if already tracking
    const myRoadmaps = JSON.parse(localStorage.getItem('my_roadmaps') || '[]');
    const isTracking = myRoadmaps.some((r) => r.title === roadmap.title);

    content.innerHTML = `
        <div class="roadmap-header" style="text-align: center; margin-bottom: 2rem;">
            <div style="font-size: 3rem; margin-bottom: 1rem;">${roadmap.icon || '🎓'}</div>
            <h2>${roadmap.title}</h2>
            <p>${roadmap.description}</p>
        </div>

        <div class="roadmap-phases" style="display: flex; flex-direction: column; gap: 1.5rem;">
            <div class="phase" style="background: #f8fafc; padding: 1.5rem; border-radius: 8px; border-left: 4px solid #667eea;">
                <h3>Phase 1: Foundations</h3>
                <p>Build the essential knowledge and skills required for this path.</p>
                <div style="margin-top: 10px; font-size: 0.9rem; color: #64748b;">⏱️ 1-3 Months</div>
            </div>
            <div class="phase" style="background: #f8fafc; padding: 1.5rem; border-radius: 8px; border-left: 4px solid #764ba2;">
                <h3>Phase 2: Advanced Concepts</h3>
                <p>Deep dive into specialized topics and practical applications.</p>
                <div style="margin-top: 10px; font-size: 0.9rem; color: #64748b;">⏱️ 3-6 Months</div>
            </div>
            <div class="phase" style="background: #f8fafc; padding: 1.5rem; border-radius: 8px; border-left: 4px solid #48bb78;">
                <h3>Phase 3: Mastery & Launch</h3>
                <p>Finalize your portfolio, complete capstone projects, and achieve your goal.</p>
                <div style="margin-top: 10px; font-size: 0.9rem; color: #64748b;">⏱️ 6+ Months</div>
            </div>
        </div>

        <div class="roadmap-actions" style="margin-top: 2rem; text-align: center;">
            <button class="btn-primary js-start-roadmap" data-title="${roadmap.title}" ${isTracking ? 'disabled style="background: #48bb78; cursor: default;"' : ''}>
                ${isTracking ? '✓ Currently Tracking' : 'Start Tracking Now'}
            </button>
        </div>
      `;

    // Add event listener for the start button
    const startBtn = content.querySelector('.js-start-roadmap');
    if (startBtn && !isTracking) {
      startBtn.addEventListener('click', function () {
        startTrackingRoadmap(roadmap);
        this.textContent = '✓ Currently Tracking';
        this.disabled = true;
        this.style.background = '#48bb78';
        this.style.cursor = 'default';
      });
    }

    modal.style.display = 'block';
  }

  // Function to save roadmap to localStorage
  function startTrackingRoadmap(roadmap) {
    const myRoadmaps = JSON.parse(localStorage.getItem('my_roadmaps') || '[]');

    // Check if already exists
    if (myRoadmaps.some((r) => r.title === roadmap.title)) {
      if (window.BraineX && window.BraineX.showNotification) {
        BraineX.showNotification('You are already tracking this roadmap!', 'info');
      }
      return;
    }

    // Add to list
    myRoadmaps.push({
      title: roadmap.title,
      icon: roadmap.icon,
      description: roadmap.description,
      startedAt: new Date().toISOString(),
      progress: 0,
    });

    localStorage.setItem('my_roadmaps', JSON.stringify(myRoadmaps));

    if (window.BraineX && window.BraineX.showNotification) {
      BraineX.showNotification(
        `Started tracking "${roadmap.title}"! Check My Goals for progress.`,
        'success'
      );
    } else {
      alert(`Started tracking "${roadmap.title}"!`);
    }
  }
});
