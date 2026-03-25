// Projects Page Full Functionality

document.addEventListener('DOMContentLoaded', function () {
  initializeProjectsPage();
  loadProjectsData();
  setupProjectFilters();
  setupProjectModals();
  initializeProjectActions();
  setupCategoryExplore();
});

function initializeProjectsPage() {
  // Load projects from localStorage or create sample data
  let projects = JSON.parse(localStorage.getItem('projects')) || [];

  if (projects.length === 0) {
    projects = getSampleProjects();
    localStorage.setItem('projects', JSON.stringify(projects));
  }

  displayProjects(projects);
  updateProjectStats(projects);
}

// Function to view project details
window.viewProjectDetails = function (id) {
  const projects = JSON.parse(localStorage.getItem('projects')) || getSampleProjects();
  const project = projects.find((p) => p.id === id);
  if (!project) return;

  // Create modal
  const modal = document.createElement('div');
  modal.className = 'modal show';
  modal.id = 'projectDetailModal';

  const progressColor =
    project.progress >= 80 ? '#28a745' : project.progress >= 50 ? '#ffc107' : '#dc3545';

  modal.innerHTML = `
      <div class="modal-content" style="max-width: 800px; padding: 0;">
          <div class="modal-header" style="padding: 24px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border-radius: 12px 12px 0 0; display: flex; justify-content: space-between; align-items: start;">
              <div>
                  <h2 style="margin: 0; font-size: 1.8rem; color: white;">${project.title}</h2>
                  <p style="margin: 8px 0 0; opacity: 0.9;">Led by ${project.team}</p>
              </div>
              <button class="close-modal" onclick="this.closest('.modal').remove()" style="color: white; opacity: 0.8; font-size: 2rem; line-height: 1;">&times;</button>
          </div>
          
          <div class="modal-body" style="padding: 24px; max-height: 70vh; overflow-y: auto;">
              <div style="display: flex; gap: 12px; margin-bottom: 24px; flex-wrap: wrap;">
                  <span class="project-badge ${project.status}" style="padding: 6px 12px; border-radius: 20px; font-weight: 600;">${project.status.toUpperCase()}</span>
                  <span style="background: #ebf4ff; color: #4299e1; padding: 6px 12px; border-radius: 20px; font-weight: 600;">${project.category}</span>
                  <span style="background: #f0fff4; color: #48bb78; padding: 6px 12px; border-radius: 20px; font-weight: 600;">$${project.funding.toLocaleString()} Funded</span>
              </div>

              <div style="margin-bottom: 30px;">
                  <h3 style="border-bottom: 2px solid #edf2f7; padding-bottom: 8px; margin-bottom: 16px;">About the Project</h3>
                  <p style="line-height: 1.7; color: #4a5568; font-size: 1.1rem;">${project.description}</p>
              </div>

              <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 24px; margin-bottom: 30px;">
                  <div style="background: #f7fafc; padding: 20px; border-radius: 12px;">
                      <h4 style="margin-top: 0; color: #2d3748;">⚡ Progress</h4>
                      <div class="progress-bar" style="height: 10px; background: #e2e8f0; border-radius: 5px; margin: 10px 0;">
                          <div style="width: ${project.progress}%; height: 100%; background: ${progressColor}; border-radius: 5px;"></div>
                      </div>
                      <div style="display: flex; justify-content: space-between; font-size: 0.9rem; color: #718096;">
                          <span>${project.progress}% Complete</span>
                          <span>Deadline: ${new Date(project.deadline).toLocaleDateString()}</span>
                      </div>
                  </div>
                  
                  <div style="background: #f7fafc; padding: 20px; border-radius: 12px;">
                       <h4 style="margin-top: 0; color: #2d3748;">🛠️ Tech Stack & Skills</h4>
                       <div class="project-skills" style="display: flex; flex-wrap: wrap; gap: 8px;">
                          ${(project.skills || []).map((s) => `<span class="skill-tag" style="background: white; border: 1px solid #e2e8f0; padding: 4px 10px; border-radius: 15px; font-size: 0.85rem;">${s}</span>`).join('')}
                       </div>
                  </div>
              </div>

              <div style="margin-bottom: 30px;">
                  <h3 style="border-bottom: 2px solid #edf2f7; padding-bottom: 8px; margin-bottom: 16px;">Academic Collaboration</h3>
                  <p><strong>Universities:</strong> ${(project.universities || []).join(', ')}</p>
                  <p><strong>Mentor:</strong> ${project.mentor || 'N/A'}</p>
              </div>

              <div style="background: #ebf8ff; border: 1px solid #bee3f8; border-radius: 8px; padding: 16px;">
                  <h4 style="margin-top: 0; color: #2c5282;">✨ Expected Outcomes</h4>
                  <ul style="margin: 0; padding-left: 20px; color: #2b6cb0;">
                      ${(project.outcomes || []).map((o) => `<li>${o}</li>`).join('')}
                  </ul>
              </div>
          </div>
          
          <div class="modal-footer" style="padding: 20px 24px; border-top: 1px solid #e2e8f0; display: flex; justify-content: flex-end; gap: 12px;">
              <button class="btn-outline" onclick="this.closest('.modal').remove()">Close</button>
              <button class="btn-project-primary" onclick="alert('Applications opening soon!')">Apply to Join Team</button>
          </div>
      </div>
  `;

  document.body.appendChild(modal);
};

function getSampleProjects() {
  return [
    {
      id: 1,
      title: 'AI-Powered Drug Discovery Platform',
      team: 'Sarah Chen, MIT',
      teamSize: 5,
      category: 'research',
      description:
        'Developing machine learning algorithms to accelerate pharmaceutical research and reduce drug discovery timelines from years to months.',
      funding: 50000,
      progress: 85,
      duration: '12 months',
      skills: ['Python', 'TensorFlow', 'Bioinformatics', 'Machine Learning'],
      tags: ['AI', 'Healthcare', 'Research', 'Innovation'],
      status: 'recruiting',
      applications: 23,
      views: 1247,
      created: '2024-01-15',
      deadline: '2024-12-31',
      image: '🧬',
      universities: ['MIT', 'Stanford', 'Harvard Medical'],
      mentor: 'Dr. Lisa Zhang, Harvard Medical School',
      requirements: [
        'Python proficiency',
        'Machine learning experience',
        'Biology background preferred',
      ],
      outcomes: ['Research publication', 'Patent application', 'Industry partnerships'],
      collaboration: 'International team with members from 3 universities',
    },
    {
      id: 2,
      title: 'Smart Agriculture IoT System',
      team: 'Alex Rodriguez, Stanford',
      teamSize: 4,
      category: 'tech',
      description:
        'IoT-based precision agriculture system using sensors, drones, and AI to optimize crop yields while reducing water usage and pesticide application.',
      funding: 30000,
      progress: 92,
      duration: '8 months',
      skills: ['IoT', 'Python', 'Embedded Systems', 'Data Analytics'],
      tags: ['IoT', 'Sustainability', 'Agriculture', 'Innovation'],
      status: 'active',
      applications: 18,
      views: 892,
      created: '2024-02-01',
      deadline: '2024-10-15',
      image: '🌱',
      universities: ['Stanford', 'UC Davis', 'Cornell'],
      mentor: 'Prof. Maria Santos, Stanford Engineering',
      requirements: ['IoT experience', 'Programming skills', 'Interest in sustainability'],
      outcomes: ['Prototype deployment', 'Commercial partnerships', 'Environmental impact study'],
      collaboration: 'Partnership with local farms for real-world testing',
    },
    {
      id: 3,
      title: 'Personalized Learning Platform',
      team: 'Maya Patel, Harvard',
      teamSize: 6,
      category: 'education',
      description:
        'AI-driven educational platform that adapts to individual learning styles, pace, and preferences to maximize student engagement and outcomes.',
      funding: 75000,
      progress: 67,
      duration: '18 months',
      skills: ['React', 'Node.js', 'AI/ML', 'Educational Psychology'],
      tags: ['EdTech', 'AI', 'Personalization', 'Education'],
      status: 'recruiting',
      applications: 41,
      views: 1856,
      created: '2024-01-10',
      deadline: '2024-11-30',
      image: '🎓',
      universities: ['Harvard', 'MIT', 'Carnegie Mellon'],
      mentor: 'Dr. Robert Kim, Harvard Education School',
      requirements: ['Full-stack development', 'AI/ML knowledge', 'Education background helpful'],
      outcomes: ['Platform launch', 'Student pilot program', 'Educational research publication'],
      collaboration: 'Testing with 5 universities and 1000+ students',
    },
    {
      id: 4,
      title: 'Climate Change Visualization Tool',
      team: 'James Wilson, Oxford',
      teamSize: 3,
      category: 'social',
      description:
        'Interactive web platform visualizing climate data to educate the public and policymakers about environmental impacts and solutions.',
      funding: 25000,
      progress: 78,
      duration: '10 months',
      skills: ['D3.js', 'Python', 'Data Science', 'Climate Science'],
      tags: ['Climate', 'Data Visualization', 'Education', 'Policy'],
      status: 'active',
      applications: 15,
      views: 723,
      created: '2024-03-01',
      deadline: '2024-12-15',
      image: '🌍',
      universities: ['Oxford', 'Imperial College', 'LSE'],
      mentor: 'Prof. Emma Thompson, Oxford Environmental Science',
      requirements: ['Data visualization skills', 'Web development', 'Climate science interest'],
      outcomes: ['Public platform launch', 'Policy recommendations', 'Educational outreach'],
      collaboration: 'Partnership with environmental organizations and government agencies',
    },
    {
      id: 5,
      title: 'Blockchain for Supply Chain Transparency',
      team: 'Chen Liu, Singapore NUS',
      teamSize: 4,
      category: 'tech',
      description:
        'Developing blockchain-based solution for supply chain transparency, enabling consumers to track product origins and verify ethical sourcing.',
      funding: 40000,
      progress: 45,
      duration: '14 months',
      skills: ['Blockchain', 'Solidity', 'Web3', 'Supply Chain Management'],
      tags: ['Blockchain', 'Supply Chain', 'Transparency', 'Ethics'],
      status: 'recruiting',
      applications: 29,
      views: 1034,
      created: '2024-02-15',
      deadline: '2025-01-31',
      image: '🔗',
      universities: ['NUS', 'NTU', 'SMU'],
      mentor: 'Dr. Michael Tan, NUS Computer Science',
      requirements: ['Blockchain development', 'Smart contracts', 'Business understanding'],
      outcomes: ['Prototype deployment', 'Industry pilot', 'Research publication'],
      collaboration: 'Working with major retailers and suppliers',
    },
    {
      id: 6,
      title: 'Mental Health Support Chatbot',
      team: 'Emma Watson, Cambridge',
      teamSize: 3,
      category: 'social',
      description:
        'AI-powered mental health support system providing 24/7 crisis intervention and therapeutic conversation for university students.',
      funding: 35000,
      progress: 72,
      duration: '10 months',
      skills: [
        'Natural Language Processing',
        'Psychology',
        'Mobile Development',
        'Crisis Intervention',
      ],
      tags: ['Mental Health', 'AI', 'Student Support', 'Crisis Prevention'],
      status: 'active',
      applications: 19,
      views: 876,
      created: '2024-01-20',
      deadline: '2024-11-30',
      image: '💬',
      universities: ['Cambridge', 'Oxford', "King's College London"],
      mentor: 'Prof. David Miller, Cambridge Psychology Department',
      requirements: ['AI/ML experience', 'Psychology background', 'Empathy and care'],
      outcomes: ['University deployment', 'Mental health research', 'Student wellness impact'],
      collaboration: 'Partnership with university counseling services',
    },
    {
      id: 7,
      title: 'Quantum Computing for Drug Discovery',
      team: 'Raj Patel, MIT',
      teamSize: 6,
      category: 'research',
      description:
        'Leveraging quantum algorithms to simulate molecular interactions and accelerate pharmaceutical research for rare diseases.',
      funding: 120000,
      progress: 38,
      duration: '24 months',
      skills: ['Quantum Computing', 'Chemistry', 'Physics', 'Algorithm Design'],
      tags: ['Quantum', 'Pharmaceuticals', 'Rare Diseases', 'Cutting-edge'],
      status: 'recruiting',
      applications: 45,
      views: 1567,
      created: '2024-03-01',
      deadline: '2025-03-01',
      image: '⚛️',
      universities: ['MIT', 'Harvard', 'IBM Research'],
      mentor: 'Dr. Lisa Chen, MIT Quantum Computing Lab',
      requirements: ['Quantum physics background', 'Programming skills', 'Research mindset'],
      outcomes: ['Quantum algorithm breakthrough', 'Patent applications', 'Industry partnerships'],
      collaboration: 'IBM Quantum Network partnership',
    },
    {
      id: 8,
      title: 'Ocean Plastic Cleanup Drone System',
      team: 'Maria Santos, UC San Diego',
      teamSize: 5,
      category: 'social',
      description:
        'Autonomous drone fleet for ocean plastic collection using computer vision and sustainable materials recycling.',
      funding: 60000,
      progress: 55,
      duration: '16 months',
      skills: ['Robotics', 'Computer Vision', 'Environmental Engineering', 'Marine Biology'],
      tags: ['Environment', 'Drones', 'Ocean Conservation', 'Sustainability'],
      status: 'active',
      applications: 32,
      views: 1243,
      created: '2024-02-10',
      deadline: '2025-01-15',
      image: '🌊',
      universities: ['UC San Diego', 'Stanford', 'MIT'],
      mentor: 'Prof. Sarah Johnson, UCSD Environmental Engineering',
      requirements: ['Robotics experience', 'Environmental passion', 'Team collaboration'],
      outcomes: ['Prototype testing', 'Environmental impact study', 'Commercial viability'],
      collaboration: 'Partnership with Ocean Conservancy and local beach cleanup groups',
    },
    {
      id: 9,
      title: 'VR-Based Autism Therapy Platform',
      team: 'Kevin Chang, Stanford',
      teamSize: 4,
      category: 'tech',
      description:
        'Virtual reality platform designed to help children with autism develop social skills through immersive, safe environments.',
      funding: 45000,
      progress: 68,
      duration: '12 months',
      skills: ['VR Development', 'Unity', 'Psychology', 'User Experience Design'],
      tags: ['VR', 'Autism', 'Therapy', 'Child Development'],
      status: 'recruiting',
      applications: 24,
      views: 945,
      created: '2024-01-25',
      deadline: '2024-12-25',
      image: '🥽',
      universities: ['Stanford', 'USC', 'UCLA'],
      mentor: 'Dr. Jennifer Park, Stanford Child Psychology',
      requirements: ['VR development', 'Psychology interest', 'Patient approach'],
      outcomes: ['Clinical trials', 'Therapy center partnerships', 'Research publication'],
      collaboration: 'Testing with autism centers and therapy clinics',
    },
    {
      id: 10,
      title: 'Smart Renewable Energy Grid',
      team: 'Ahmed Hassan, MIT',
      teamSize: 7,
      category: 'tech',
      description:
        'AI-optimized energy distribution system integrating solar, wind, and battery storage for maximum efficiency.',
      funding: 85000,
      progress: 42,
      duration: '20 months',
      skills: ['Energy Systems', 'Machine Learning', 'Electrical Engineering', 'Grid Management'],
      tags: ['Renewable Energy', 'Smart Grid', 'AI Optimization', 'Sustainability'],
      status: 'recruiting',
      applications: 38,
      views: 1456,
      created: '2024-02-20',
      deadline: '2025-02-20',
      image: '⚡',
      universities: ['MIT', 'Stanford', 'Georgia Tech'],
      mentor: 'Prof. Robert Wilson, MIT Energy Initiative',
      requirements: ['Electrical engineering', 'AI/ML skills', 'Energy systems knowledge'],
      outcomes: ['Grid deployment pilot', 'Energy efficiency improvement', 'Patent filings'],
      collaboration: 'Partnership with local utility companies and government agencies',
    },
    {
      id: 11,
      title: 'Food Security Prediction System',
      team: 'Anna Rodriguez, Cornell',
      teamSize: 5,
      category: 'social',
      description:
        'Machine learning system analyzing climate, economic, and social data to predict and prevent food insecurity crises.',
      funding: 55000,
      progress: 61,
      duration: '15 months',
      skills: ['Data Science', 'Agricultural Economics', 'Climate Analysis', 'Policy Research'],
      tags: ['Food Security', 'Machine Learning', 'Climate Change', 'Global Health'],
      status: 'active',
      applications: 27,
      views: 1034,
      created: '2024-01-30',
      deadline: '2024-12-30',
      image: '🌾',
      universities: ['Cornell', 'UC Davis', 'World Bank Group'],
      mentor: 'Dr. Michael Brown, Cornell Agriculture & Life Sciences',
      requirements: ['Data science skills', 'Agriculture interest', 'Global perspective'],
      outcomes: ['UN partnership', 'Policy recommendations', 'Early warning system'],
      collaboration: 'Working with UN World Food Programme and local NGOs',
    },
    {
      id: 12,
      title: 'Elderly Care Companion Robot',
      team: 'Yuki Tanaka, Tokyo University',
      teamSize: 6,
      category: 'tech',
      description:
        'Social companion robot with AI conversation, health monitoring, and emergency assistance for elderly care facilities.',
      funding: 70000,
      progress: 49,
      duration: '18 months',
      skills: ['Robotics', 'AI Conversation', 'Healthcare Technology', 'Sensor Integration'],
      tags: ['Elderly Care', 'Robotics', 'AI', 'Healthcare'],
      status: 'recruiting',
      applications: 31,
      views: 1178,
      created: '2024-02-05',
      deadline: '2025-02-05',
      image: '🤖',
      universities: ['Tokyo University', 'MIT', 'Carnegie Mellon'],
      mentor: 'Prof. Hiroshi Yamamoto, Tokyo University Robotics',
      requirements: ['Robotics programming', 'Human-computer interaction', 'Care empathy'],
      outcomes: ['Nursing home deployment', 'Senior wellness study', 'Commercial prototype'],
      collaboration: 'Testing in nursing homes and elder care facilities',
    },
    {
      id: 13,
      title: 'Blockchain Voting System',
      team: 'Carlos Mendez, UC Berkeley',
      teamSize: 4,
      category: 'tech',
      description:
        'Secure, transparent, and verifiable digital voting platform using blockchain technology for democratic processes.',
      funding: 50000,
      progress: 35,
      duration: '14 months',
      skills: ['Blockchain', 'Cryptography', 'Security', 'Political Science'],
      tags: ['Democracy', 'Blockchain', 'Voting', 'Security'],
      status: 'recruiting',
      applications: 22,
      views: 897,
      created: '2024-02-28',
      deadline: '2025-02-28',
      image: '🗳️',
      universities: ['UC Berkeley', 'Stanford', 'Georgetown'],
      mentor: 'Dr. Susan Williams, UC Berkeley Political Science',
      requirements: ['Blockchain development', 'Security expertise', 'Democratic values'],
      outcomes: ['Municipal pilot program', 'Security audit certification', 'Open source release'],
      collaboration: 'Partnership with local election offices and democracy organizations',
    },
    {
      id: 14,
      title: '3D-Printed Prosthetics for Children',
      team: 'Sophie Miller, Johns Hopkins',
      teamSize: 5,
      category: 'research',
      description:
        'Low-cost, customizable 3D-printed prosthetic limbs specifically designed for growing children in developing countries.',
      funding: 40000,
      progress: 73,
      duration: '11 months',
      skills: ['3D Printing', 'Biomedical Engineering', 'Product Design', 'Global Health'],
      tags: ['Prosthetics', '3D Printing', 'Children', 'Global Health'],
      status: 'active',
      applications: 26,
      views: 1089,
      created: '2024-01-15',
      deadline: '2024-11-15',
      image: '🦾',
      universities: ['Johns Hopkins', 'MIT', 'Georgia Tech'],
      mentor: 'Dr. Mark Thompson, Johns Hopkins Biomedical Engineering',
      requirements: ['Engineering background', '3D design skills', 'Global health passion'],
      outcomes: [
        'Field testing in developing countries',
        'Medical device approval',
        'NGO partnerships',
      ],
      collaboration: 'Working with international medical missions and prosthetics organizations',
    },
  ];
}

function displayProjects(projects) {
  const projectsGrid = document.getElementById('projectsGrid');
  if (!projectsGrid) return;

  projectsGrid.innerHTML = projects.map((project) => createProjectCard(project)).join('');
}

function createProjectCard(project) {
  const progressColor =
    project.progress >= 80 ? '#28a745' : project.progress >= 50 ? '#ffc107' : '#dc3545';

  return `
        <div class=\"project-card enhanced\" data-project-id=\"${project.id}\" data-category=\"${project.category}\" data-status=\"${project.status}\">
            <div class="project-badge ${project.status}">
                ${
                  project.status === 'recruiting'
                    ? '🔍 Recruiting'
                    : project.status === 'active'
                      ? '⚡ Active'
                      : project.status === 'completed'
                        ? '✅ Completed'
                        : '📋 Planning'
                }
            </div>
            
            <div class="project-header">
                <div class="project-image">
                    <div class="project-placeholder">${project.image}</div>
                </div>
                <div class="project-meta">
                    <div class="project-stats">
                        <span class="stat">👥 ${project.applications} applied</span>
                        <span class="stat">👀 ${project.views} views</span>
                    </div>
                </div>
            </div>
            
            <div class="project-content">
                <h3 class="project-title">${project.title}</h3>
                <p class="project-team">by ${project.team} • ${project.teamSize} members</p>
                <p class="project-description">${project.description}</p>
                
                <div class="project-details">
                    <div class="detail-row">
                        <span class="detail-label">💰 Funding:</span>
                        <span class="detail-value">$${project.funding.toLocaleString()}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">⏱️ Duration:</span>
                        <span class="detail-value">${project.duration}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">📅 Deadline:</span>
                        <span class="detail-value">${new Date(project.deadline).toLocaleDateString()}</span>
                    </div>
                </div>
                
                <div class="project-progress">
                    <div class="progress-header">
                        <span>Progress</span>
                        <span class="progress-percentage">${project.progress}%</span>
                    </div>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${project.progress}%; background: ${progressColor};"></div>
                    </div>
                </div>
                
                <div class="project-skills">
                    ${project.skills
                      .slice(0, 4)
                      .map((skill) => `<span class="skill-tag">${skill}</span>`)
                      .join('')}
                </div>
                
                <div class="project-tags">
                    ${project.tags.map((tag) => `<span class="project-tag">${tag}</span>`).join('')}
                </div>
            </div>
            
            <div class="project-actions">
                <button class="btn-project-primary js-view-details" data-id="${project.id}">
                    View Details
                </button>
                <button class="btn-project-secondary js-apply" data-id="${project.id}">
                    ${project.status === 'recruiting' ? 'Apply Now' : 'Join Project'}
                </button>
                <button class="btn-project-bookmark js-bookmark" data-id="${project.id}" title="Bookmark">
                    🔖
                </button>
            </div>
        </div>
    `;
}

function initializeProjectActions() {
  document.addEventListener('click', function (e) {
    const viewBtn = e.target.closest('.js-view-details');
    if (viewBtn) {
      const id = parseInt(viewBtn.getAttribute('data-id'));
      viewProjectDetails(id);
    }

    const applyBtn = e.target.closest('.js-apply');
    if (applyBtn) {
      const id = parseInt(applyBtn.getAttribute('data-id'));
      applyToProject(id);
    }

    const bookmarkBtn = e.target.closest('.js-bookmark');
    if (bookmarkBtn) {
      const id = parseInt(bookmarkBtn.getAttribute('data-id'));
      bookmarkProject(id);
    }
  });
}

function setupProjectFilters() {
  const categoryBtns = document.querySelectorAll('.category-card');
  const filterSelects = document.querySelectorAll('.filter-select');

  categoryBtns.forEach((btn) => {
    btn.addEventListener('click', function () {
      const category =
        this.getAttribute('data-category') ||
        this.querySelector('h3').textContent.toLowerCase().replace(' ', '');
      filterProjects(category);
    });
  });

  filterSelects.forEach((select) => {
    select.addEventListener('change', applyAllFilters);
  });
}

function filterProjects(category) {
  const projects = JSON.parse(localStorage.getItem('projects')) || getSampleProjects();
  let filtered = projects;

  if (category && category !== 'all') {
    const categoryMap = {
      research: 'research',
      tech: 'tech',
      social: 'social',
      business: 'business',
      innovation: 'tech',
    };

    const filterCategory = categoryMap[category] || category;
    filtered = projects.filter((p) => p.category === filterCategory);
  }

  displayProjects(filtered);

  // Scroll to projects section
  document.getElementById('projectDirectory')?.scrollIntoView({ behavior: 'smooth' });

  BraineX.showNotification(`Found ${filtered.length} projects in ${category} category`, 'success');
}

function applyAllFilters() {
  const categoryFilter = document.getElementById('categoryFilter')?.value;
  const statusFilter = document.getElementById('statusFilter')?.value;
  const sortFilter = document.getElementById('sortFilter')?.value;

  // New filters
  const skillLevelFilter = document.getElementById('skillLevelFilter')?.value;
  const techFilter = document.getElementById('techFilter')?.value;

  const projects = JSON.parse(localStorage.getItem('projects')) || getSampleProjects();
  let filtered = [...projects];

  // Apply category filter
  if (categoryFilter) {
    filtered = filtered.filter((p) => p.category === categoryFilter);
  }

  // Apply status filter
  if (statusFilter) {
    filtered = filtered.filter((p) => p.status === statusFilter);
  }

  // Apply Skill Level filter (Mocking data if missing)
  if (skillLevelFilter) {
    filtered = filtered.filter((p) => {
      const level = p.level || ['beginner', 'intermediate', 'advanced'][p.id % 3]; // Deterministic mock
      return level === skillLevelFilter;
    });
  }

  // Apply Tech Stack filter
  if (techFilter) {
    filtered = filtered.filter(
      (p) =>
        (p.skills || []).some((s) => s.toLowerCase().includes(techFilter.toLowerCase())) ||
        (p.tags || []).some((t) => t.toLowerCase().includes(techFilter.toLowerCase()))
    );
  }

  // Apply sorting
  if (sortFilter) {
    switch (sortFilter) {
      case 'newest':
        filtered.sort((a, b) => new Date(b.created) - new Date(a.created));
        break;
      case 'funding':
        filtered.sort((a, b) => b.funding - a.funding);
        break;
      case 'popular':
        filtered.sort((a, b) => b.views - a.views);
        break;
      case 'deadline':
        filtered.sort((a, b) => new Date(a.deadline) - new Date(b.deadline));
        break;
    }
  }

  displayProjects(filtered);
}

function setupProjectModals() {
  // Hero buttons
  const heroButtons = document.querySelectorAll('.btn-hero-primary, .btn-hero-secondary');
  heroButtons.forEach((btn) => {
    if (btn.textContent.includes('Start New Project')) {
      btn.onclick = openCreateProjectModal;
    } else if (btn.textContent.includes('Browse Projects')) {
      btn.onclick = () =>
        document.getElementById('projectDirectory')?.scrollIntoView({ behavior: 'smooth' });
    }
  });

  // Featured project buttons
  document.querySelectorAll('.btn-project-primary').forEach((btn) => {
    const card = btn.closest('.project-featured-card');
    if (card) {
      const title = card.querySelector('h3').textContent;
      btn.onclick = () => showFeaturedProjectDetails(title);
    }
  });
}

function openCreateProjectModal() {
  // Check if user is logged in
  const user = JSON.parse(localStorage.getItem('BraineX_user') || '{}');
  if (!user.email) {
    BraineX.showNotification('Please log in to create a project', 'error');
    BraineX.openModal('loginModal');
    return;
  }

  const modal = document.createElement('div');
  modal.className = 'modal show';
  modal.innerHTML = `
        <div class="modal-content project-create-modal">
            <button class="close-modal" onclick="this.closest('.modal').remove()">&times;</button>
            
            <div class="create-header">
                <h2>🚀 Start Your Project</h2>
                <p>Turn your innovative idea into reality with global collaboration</p>
            </div>
            
            <form id="createProjectForm" class="create-project-form">
                <div class="form-step active" data-step="1">
                    <h3>Project Basics</h3>
                    
                    <div class="form-group">
                        <label>Project Title *</label>
                        <input type="text" name="title" required placeholder="e.g., AI-Powered Climate Solution">
                    </div>
                    
                    <div class="form-row">
                        <div class="form-group">
                            <label>Category *</label>
                            <select name="category" required>
                                <option value="">Select Category</option>
                                <option value="research">🔬 Research & Science</option>
                                <option value="tech">💻 Technology</option>
                                <option value="social">🌍 Social Impact</option>
                                <option value="business">💼 Business & Entrepreneurship</option>
                                <option value="education">🎓 Education</option>
                                <option value="health">🏥 Healthcare</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label>Duration</label>
                            <select name="duration">
                                <option value="3-6 months">3-6 months</option>
                                <option value="6-12 months">6-12 months</option>
                                <option value="1-2 years">1-2 years</option>
                                <option value="2+ years">2+ years</option>
                            </select>
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label>Project Description *</label>
                        <textarea name="description" required rows="4" placeholder="Describe your project's goals, impact, and methodology..."></textarea>
                    </div>
                    
                    <div class="form-row">
                        <div class="form-group">
                            <label>Team Size</label>
                            <select name="teamSize">
                                <option value="2-3">2-3 members</option>
                                <option value="4-6">4-6 members</option>
                                <option value="7-10">7-10 members</option>
                                <option value="10+">10+ members</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label>Funding Needed</label>
                            <select name="funding">
                                <option value="0">No funding needed</option>
                                <option value="5000">$1K - $5K</option>
                                <option value="15000">$5K - $25K</option>
                                <option value="50000">$25K - $100K</option>
                                <option value="100000">$100K+</option>
                            </select>
                        </div>
                    </div>
                </div>
                
                <div class="form-step" data-step="2">
                    <h3>Skills & Requirements</h3>
                    
                    <div class="form-group">
                        <label>Required Skills</label>
                        <input type="text" name="skills" placeholder="e.g., Python, Machine Learning, Research Methods">
                        <small>Separate skills with commas</small>
                    </div>
                    
                    <div class="form-group">
                        <label>Looking For</label>
                        <div class="checkbox-grid">
                            <label><input type="checkbox" name="roles" value="developers"> Developers</label>
                            <label><input type="checkbox" name="roles" value="designers"> Designers</label>
                            <label><input type="checkbox" name="roles" value="researchers"> Researchers</label>
                            <label><input type="checkbox" name="roles" value="writers"> Writers</label>
                            <label><input type="checkbox" name="roles" value="marketers"> Marketers</label>
                            <label><input type="checkbox" name="roles" value="advisors"> Advisors</label>
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label>Project Tags</label>
                        <input type="text" name="tags" placeholder="e.g., AI, Climate, Innovation, Research">
                        <small>Separate tags with commas</small>
                    </div>
                </div>
                
                <div class="form-navigation">
                    <button type="button" class="btn-prev" onclick="prevStep()" style="display: none;">Previous</button>
                    <button type="button" class="btn-next" onclick="nextStep()">Next</button>
                    <button type="submit" class="btn-create" style="display: none;">Create Project</button>
                </div>
            </form>
        </div>
    `;

  document.body.appendChild(modal);
  setupProjectFormHandlers();
}

// Aliases for HTML accessibility
window.openProjectModal = openCreateProjectModal;
window.closeProjectModal = function () {
  const modal = document.querySelector('.project-create-modal');
  if (modal) {
    modal.closest('.modal').remove();
  }
};

// Ensure login modal fallback
const originalOpenModal = BraineX.openModal;
BraineX.openModal = function (id) {
  const modal = document.getElementById(id);
  if (!modal && id === 'loginModal') {
    // Fallback if login modal is not present in this page
    alert('Please log in to continue (Auth Modal not present in this page)');
    // Ideally redirect to home where modal exists
    // window.location.href = '/main.html#login';
    return;
  }
  if (originalOpenModal) originalOpenModal(id);
};

function setupProjectFormHandlers() {
  let currentStep = 1;

  window.nextStep = function () {
    if (currentStep < 2) {
      document.querySelector(`[data-step="${currentStep}"]`).classList.remove('active');
      currentStep++;
      document.querySelector(`[data-step="${currentStep}"]`).classList.add('active');

      document.querySelector('.btn-prev').style.display = 'block';
      if (currentStep === 2) {
        document.querySelector('.btn-next').style.display = 'none';
        document.querySelector('.btn-create').style.display = 'block';
      }
    }
  };

  window.prevStep = function () {
    if (currentStep > 1) {
      document.querySelector(`[data-step="${currentStep}"]`).classList.remove('active');
      currentStep--;
      document.querySelector(`[data-step="${currentStep}"]`).classList.add('active');

      if (currentStep === 1) {
        document.querySelector('.btn-prev').style.display = 'none';
      }
      document.querySelector('.btn-next').style.display = 'block';
      document.querySelector('.btn-create').style.display = 'none';
    }
  };

  document.getElementById('createProjectForm').addEventListener('submit', function (e) {
    const submitBtn = this.querySelector('.btn-create');
    setLoadingState(submitBtn, true, 'Creating...');
    e.preventDefault();

    const formData = new FormData(this);
    const user = JSON.parse(localStorage.getItem('BraineX_user'));

    const newProject = {
      id: Date.now(),
      title: formData.get('title'),
      team: `${user.firstName} ${user.lastName}, ${user.email}`,
      teamSize: parseInt(formData.get('teamSize').split('-')[0]) || 3,
      category: formData.get('category'),
      description: formData.get('description'),
      funding: parseInt(formData.get('funding')) || 0,
      progress: 5,
      duration: formData.get('duration'),
      skills: formData
        .get('skills')
        .split(',')
        .map((s) => s.trim())
        .filter((s) => s),
      tags: formData
        .get('tags')
        .split(',')
        .map((t) => t.trim())
        .filter((t) => t),
      status: 'recruiting',
      applications: 0,
      views: 1,
      created: new Date().toISOString().split('T')[0],
      deadline: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 1 year from now
      image: getRandomProjectIcon(),
      universities: [user.email.split('@')[1] || 'University'],
      mentor: 'TBD',
      requirements: ['Enthusiasm', 'Collaboration skills'],
      outcomes: ['Project completion', 'Learning experience'],
      collaboration: 'Remote collaboration welcome',
    };

    // Save project
    const projects = JSON.parse(localStorage.getItem('projects')) || [];
    projects.unshift(newProject);
    localStorage.setItem('projects', JSON.stringify(projects));

    // Close modal and refresh
    this.closest('.modal').remove();
    setLoadingState(document.querySelector('.btn-create'), false);
    displayProjects(projects);

    BraineX.showNotification(`Project "${newProject.title}" created successfully!`, 'success');

    // Scroll to the new project
    setTimeout(() => {
      document.getElementById('projectDirectory')?.scrollIntoView({ behavior: 'smooth' });
    }, 500);
  });
}

function getRandomProjectIcon() {
  const icons = ['🚀', '💡', '🔬', '🌟', '⚡', '🎯', '🔥', '💎', '🌍', '🎨'];
  return icons[Math.floor(Math.random() * icons.length)];
}

function viewProjectDetails(projectId) {
  const projects = JSON.parse(localStorage.getItem('projects')) || getSampleProjects();
  const project = projects.find((p) => p.id === projectId);

  if (!project) {
    BraineX.showNotification('Project not found', 'error');
    return;
  }

  const modal = document.createElement('div');
  modal.className = 'modal show';
  modal.innerHTML = `
        <div class="modal-content project-details-modal">
            <button class="close-modal" onclick="this.closest('.modal').remove()">&times;</button>
            
            <div class="project-details-header">
                <div class="project-image-large">${project.image}</div>
                <div class="project-title-section">
                    <h2>${project.title}</h2>
                    <p class="project-team-info">Led by ${project.team}</p>
                    <div class="project-status-badge ${project.status}">${project.status.toUpperCase()}</div>
                </div>
            </div>
            
            <div class="project-details-content">
                <div class="details-overview">
                    <h3>📋 Project Overview</h3>
                    <p>${project.description}</p>
                </div>
                
                <div class="details-grid">
                    <div class="detail-section">
                        <h4>💰 Funding</h4>
                        <p>$${project.funding.toLocaleString()}</p>
                    </div>
                    <div class="detail-section">
                        <h4>⏱️ Duration</h4>
                        <p>${project.duration}</p>
                    </div>
                    <div class="detail-section">
                        <h4>👥 Team Size</h4>
                        <p>${project.teamSize} members</p>
                    </div>
                    <div class="detail-section">
                        <h4>📈 Progress</h4>
                        <p>${project.progress}% complete</p>
                    </div>
                </div>
                
                <div class="skills-section">
                    <h3>🛠️ Required Skills</h3>
                    <div class="skills-list">
                        ${project.skills.map((skill) => `<span class="skill-tag">${skill}</span>`).join('')}
                    </div>
                </div>
                
                <div class="requirements-section">
                    <h3>✅ Requirements</h3>
                    <ul class="requirements-list">
                        ${project.requirements.map((req) => `<li>${req}</li>`).join('')}
                    </ul>
                </div>
                
                <div class="outcomes-section">
                    <h3>🎯 Expected Outcomes</h3>
                    <ul class="outcomes-list">
                        ${project.outcomes.map((outcome) => `<li>${outcome}</li>`).join('')}
                    </ul>
                </div>
                
                <div class="collaboration-section">
                    <h3>🤝 Collaboration Details</h3>
                    <p>${project.collaboration}</p>
                </div>
                
                <div class="mentor-section">
                    <h3>👨‍🏫 Project Mentor</h3>
                    <p>${project.mentor}</p>
                </div>
                
                <div class="universities-section">
                    <h3>🏛️ Partner Universities</h3>
                    <div class="universities-list">
                        ${project.universities.map((uni) => `<span class="university-tag">${uni}</span>`).join('')}
                    </div>
                </div>
            </div>
            
            <div class="project-details-actions">
                <button class="btn-secondary" onclick="this.closest('.modal').remove()">Close</button>
                <button class="btn-primary" onclick="applyToProject(${project.id}); this.closest('.modal').remove();">
                    Apply to Join
                </button>
                <button class="btn-primary" onclick="contactProjectTeam(${project.id})">
                    Contact Team
                </button>
            </div>
        </div>
    `;

  document.body.appendChild(modal);
}

function applyToProject(projectId) {
  const user = JSON.parse(localStorage.getItem('BraineX_user') || '{}');
  if (!user.email) {
    BraineX.showNotification('Please log in to apply to projects', 'error');
    BraineX.openModal('loginModal');
    return;
  }

  const projects = JSON.parse(localStorage.getItem('projects')) || getSampleProjects();
  const project = projects.find((p) => p.id === projectId);

  if (!project) {
    BraineX.showNotification('Project not found', 'error');
    return;
  }

  const modal = document.createElement('div');
  modal.className = 'modal show';
  modal.innerHTML = `
        <div class="modal-content application-modal">
            <button class="close-modal" onclick="this.closest('.modal').remove()">&times;</button>
            
            <div class="application-header">
                <h2>🚀 Apply to ${project.title}</h2>
                <p>Tell the team why you're the perfect fit for this project</p>
            </div>
            
            <form id="projectApplicationForm" class="application-form">
                <div class="form-group">
                    <label>Why do you want to join this project? *</label>
                    <textarea name="motivation" required rows="4" placeholder="Share your passion for this project and how you can contribute..."></textarea>
                </div>
                
                <div class="form-group">
                    <label>Relevant Skills & Experience *</label>
                    <textarea name="experience" required rows="3" placeholder="Describe your relevant skills, projects, or experience..."></textarea>
                </div>
                
                <div class="form-group">
                    <label>Time Commitment</label>
                    <select name="commitment">
                        <option value="5-10 hours/week">5-10 hours/week</option>
                        <option value="10-20 hours/week">10-20 hours/week</option>
                        <option value="20+ hours/week">20+ hours/week</option>
                        <option value="Full-time">Full-time</option>
                    </select>
                </div>
                
                <div class="form-group">
                    <label>Role Interest</label>
                    <select name="role">
                        <option value="Developer">Developer</option>
                        <option value="Researcher">Researcher</option>
                        <option value="Designer">Designer</option>
                        <option value="Project Manager">Project Manager</option>
                        <option value="Data Analyst">Data Analyst</option>
                        <option value="Other">Other</option>
                    </select>
                </div>
                
                <div class="form-group">
                    <label>Portfolio/LinkedIn (optional)</label>
                    <input type="url" name="portfolio" placeholder="https://...">
                </div>
                
                <div class="form-actions">
                    <button type="button" class="btn-secondary" onclick="this.closest('.modal').remove()">Cancel</button>
                    <button type="submit" class="btn-primary">Submit Application</button>
                </div>
            </form>
        </div>
    `;

  document.body.appendChild(modal);

  document.getElementById('projectApplicationForm').addEventListener('submit', function (e) {
    const submitBtn =
      this.querySelector('.btn-primary[type="submit"]') || this.querySelector('.btn-primary');
    setLoadingState(submitBtn, true, 'Submitting...');
    e.preventDefault();

    // Save application
    const applications = JSON.parse(localStorage.getItem('project_applications')) || [];
    const formData = new FormData(this);

    const application = {
      projectId: projectId,
      projectTitle: project.title,
      applicant: `${user.firstName} ${user.lastName}`,
      email: user.email,
      motivation: formData.get('motivation'),
      experience: formData.get('experience'),
      commitment: formData.get('commitment'),
      role: formData.get('role'),
      portfolio: formData.get('portfolio'),
      appliedAt: new Date().toISOString(),
      status: 'pending',
    };

    applications.push(application);
    localStorage.setItem('project_applications', JSON.stringify(applications));

    // Update project application count
    const updatedProjects = projects.map((p) =>
      p.id === projectId ? { ...p, applications: p.applications + 1 } : p
    );
    localStorage.setItem('projects', JSON.stringify(updatedProjects));

    this.closest('.modal').remove();
    setLoadingState(document.querySelector('.application-form .btn-primary[type="submit"]'), false);
    BraineX.showNotification(
      'Application submitted successfully! The team will review and get back to you.',
      'success'
    );

    // Refresh projects display
    displayProjects(updatedProjects);
  });
}

function contactProjectTeam(projectId) {
  const projects = JSON.parse(localStorage.getItem('projects')) || getSampleProjects();
  const project = projects.find((p) => p.id === projectId);

  if (project) {
    const message = `Hi! I'm interested in your project "${project.title}". Could we discuss potential collaboration?`;
    const subject = `Interest in ${project.title}`;
    const mailtoLink = `mailto:contact@BraineX.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(message)}`;

    window.open(mailtoLink, '_blank');
    BraineX.showNotification('Opening email client to contact the team', 'success');
  }
}

function bookmarkProject(projectId) {
  const user = JSON.parse(localStorage.getItem('BraineX_user') || '{}');
  if (!user.email) {
    BraineX.showNotification('Please log in to bookmark projects', 'error');
    BraineX.openModal('loginModal');
    return;
  }

  let bookmarks = JSON.parse(localStorage.getItem('bookmarked_projects')) || [];

  if (bookmarks.includes(projectId)) {
    bookmarks = bookmarks.filter((id) => id !== projectId);
    BraineX.showNotification('Project removed from bookmarks', 'info');
  } else {
    bookmarks.push(projectId);
    BraineX.showNotification('Project bookmarked successfully!', 'success');
  }

  localStorage.setItem('bookmarked_projects', JSON.stringify(bookmarks));
}

function showFeaturedProjectDetails(title) {
  // Real project data based on the featured project titles from HTML
  const featuredData = {
    'AI-Powered Drug Discovery': {
      description: 'Revolutionary machine learning platform accelerating pharmaceutical research',
      team: 'Sarah Chen (MIT), Dr. Lisa Zhang (Harvard Medical), 5 researchers',
      funding: '$50,000 NSF Grant',
      progress: 'Phase 2 Clinical Trials',
      timeline: '18 months',
      achievements: [
        '3 peer-reviewed publications',
        'Patent application filed',
        'Collaboration with Pfizer',
      ],
      nextSteps: ['FDA approval process', 'Commercial partnerships', 'Scale to 10 diseases'],
      technologies: ['TensorFlow', 'BioPython', 'Cloud Computing', 'Drug Databases'],
      impact: 'Potential to reduce drug discovery time from 10-15 years to 3-5 years',
    },
    'Smart Agriculture IoT System': {
      description: 'Precision agriculture using IoT sensors, drones, and AI optimization',
      team: 'Alex Rodriguez (Stanford), Prof. Maria Santos, 4 engineers',
      funding: '$30,000 USDA Grant',
      progress: 'Prototype Testing',
      timeline: '12 months',
      achievements: [
        '25% water usage reduction',
        'Deployed on 5 farms',
        'Environmental impact study',
      ],
      nextSteps: ['Commercial launch', 'Partnership with John Deere', 'International expansion'],
      technologies: ['IoT Sensors', 'Python', 'Drone Technology', 'Machine Learning'],
      impact: 'Helping farmers increase yields by 30% while reducing environmental impact',
    },
    'Personalized Learning Platform': {
      description: 'AI-driven educational platform adapting to individual learning styles',
      team: 'Maya Patel (Harvard), Dr. Robert Kim, 6 developers',
      funding: '$75,000 Gates Foundation',
      progress: 'Beta Testing',
      timeline: '24 months',
      achievements: [
        '500+ student pilot',
        '40% improvement in learning outcomes',
        '5 university partnerships',
      ],
      nextSteps: ['Public launch', 'Teacher training program', 'Global expansion'],
      technologies: ['React', 'Node.js', 'AI/ML', 'Educational Analytics'],
      impact: 'Personalizing education for over 10,000 students across 15 schools',
    },
  };

  const data = featuredData[title];
  if (!data) {
    BraineX.showNotification('Project details not available', 'error');
    return;
  }

  const modal = document.createElement('div');
  modal.className = 'modal show';
  modal.innerHTML = `
        <div class="modal-content featured-project-modal">
            <button class="close-modal" onclick="this.closest('.modal').remove()">&times;</button>
            
            <div class="featured-header">
                <h2>🏆 ${title}</h2>
                <div class="featured-badge">Featured Project</div>
            </div>
            
            <div class="featured-content">
                <div class="overview-section">
                    <h3>📋 Project Overview</h3>
                    <p>${data.description}</p>
                </div>
                
                <div class="featured-details-grid">
                    <div class="detail-box">
                        <h4>👥 Team</h4>
                        <p>${data.team}</p>
                    </div>
                    <div class="detail-box">
                        <h4>💰 Funding</h4>
                        <p>${data.funding}</p>
                    </div>
                    <div class="detail-box">
                        <h4>⏱️ Timeline</h4>
                        <p>${data.timeline}</p>
                    </div>
                    <div class="detail-box">
                        <h4>📈 Current Progress</h4>
                        <p>${data.progress}</p>
                    </div>
                </div>
                
                <div class="achievements-section">
                    <h3>🏆 Key Achievements</h3>
                    <ul class="achievements-list">
                        ${data.achievements.map((achievement) => `<li>${achievement}</li>`).join('')}
                    </ul>
                </div>
                
                <div class="technologies-section">
                    <h3>🛠️ Technologies Used</h3>
                    <div class="tech-tags">
                        ${data.technologies.map((tech) => `<span class="tech-tag">${tech}</span>`).join('')}
                    </div>
                </div>
                
                <div class="impact-section">
                    <h3>🌟 Impact & Results</h3>
                    <p>${data.impact}</p>
                </div>
                
                <div class="next-steps-section">
                    <h3>🚀 Next Steps</h3>
                    <ul class="next-steps-list">
                        ${data.nextSteps.map((step) => `<li>${step}</li>`).join('')}
                    </ul>
                </div>
            </div>
            
            <div class="featured-actions">
                <button class="btn-secondary" onclick="this.closest('.modal').remove()">Close</button>
                <button class="btn-primary" onclick="window.open('mailto:projects@BraineX.com?subject=Interest in ${title}', '_blank')">
                    Contact Project Team
                </button>
                <button class="btn-primary" onclick="window.open('https://scholar.google.com/scholar?q=${encodeURIComponent(title)}', '_blank')">
                    View Research
                </button>
            </div>
        </div>
    `;

  document.body.appendChild(modal);
}

function updateProjectStats(projects) {
  // Update hero statistics
  const statsElements = document.querySelectorAll('.stat-card .stat-number');
  if (statsElements.length >= 4) {
    statsElements[0].textContent = projects.length.toLocaleString();
    statsElements[1].textContent = projects
      .reduce((sum, p) => sum + (p.teamSize || 0), 0)
      .toLocaleString();
    statsElements[2].textContent = projects.filter((p) => p.status === 'completed').length;
    statsElements[3].textContent =
      '$' + (projects.reduce((sum, p) => sum + (p.funding || 0), 0) / 1000000).toFixed(1) + 'M';
  }
}

// Initialize category button handlers
document.addEventListener('DOMContentLoaded', function () {
  // Enhanced category button functionality
  document.querySelectorAll('.btn-category').forEach((btn) => {
    btn.addEventListener('click', function () {
      const card = this.closest('.category-card');
      const categoryText = card.querySelector('h3').textContent;

      let category = 'all';
      if (categoryText.includes('Research')) category = 'research';
      else if (categoryText.includes('Tech')) category = 'tech';
      else if (categoryText.includes('Social')) category = 'social';
      else if (categoryText.includes('Entrepreneurship')) category = 'business';

      filterProjects(category);
    });
  });
});

// Initialize project action buttons
// Duplicate functions removed.
// Logic consolidated in initializeProjectActions (delegation) and openCreateProjectModal (multi-step).

function setupCategoryExplore() {
  document.querySelectorAll('.category-card, .research-category').forEach((card) => {
    const exploreBtn = card.querySelector('.btn-explore-category, .btn-explore, button');
    if (exploreBtn && exploreBtn.textContent.toLowerCase().includes('explore')) {
      exploreBtn.addEventListener('click', function () {
        const categoryName = card.querySelector('h3, h4')?.textContent || 'research';
        const category = categoryName.toLowerCase().includes('research')
          ? 'research'
          : categoryName.toLowerCase().includes('tech')
            ? 'tech'
            : categoryName.toLowerCase().includes('social')
              ? 'social'
              : 'startup';

        const projects = JSON.parse(localStorage.getItem('projects')) || getSampleProjects();
        const filtered = projects.filter((p) => p.category === category);
        displayProjects(filtered);

        document
          .querySelector('#projectsGrid, .projects-grid')
          ?.scrollIntoView({ behavior: 'smooth' });
        BraineX.showNotification(`Found ${filtered.length} ${category} projects`, 'success');
      });
    }
  });
}
