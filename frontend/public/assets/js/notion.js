// Notion-like Goals and Productivity System

// Global Function Exposure (Define first to prevent ReferenceErrors)
window.switchSection = (id) => { if (typeof switchSection === 'function') switchSection(id); };
window.toggleSidebar = () => { if (typeof toggleSidebar === 'function') toggleSidebar(); };
window.setupNotionListeners = () => { };
window.initializeNotionSection = () => { };
window.showTemplates = () => { if (typeof showTemplates === 'function') showTemplates(); };
window.applyTemplate = (c) => { if (typeof applyTemplate === 'function') applyTemplate(c); };


// Global state
// Global state (now dynamic from API)
let goals = [];
let tasks = [];
let notes = [];
let calendarEvents = [];
let userPages = [];
let myUniversities = [];
let myPrograms = [];
let myProjects = [];
let weeklyFocus = [
  { emoji: '🎓', text: 'Complete scholarship applications' },
  { emoji: '📚', text: 'Prepare for midterm exams' },
];

async function initData() {
  try {
    const response = await BraineX.apiRequest('/goals');
    if (response.success && response.data) {
      goals = response.data.filter(i => i.type === 'goal');
      tasks = response.data.filter(i => i.type === 'task');
      notes = response.data.filter(i => i.type === 'note');

      goals.forEach(g => {
        g.progress = g.progress || 0;
        g.endDate = g.due_date || g.endDate;
      });
      loadDashboard();
    }
  } catch (err) {
    console.warn('Backend unavailable, using localized data:', err);
    // Fallback to localized data if already populated
  }
}

// Pre-populate goals if empty
if (goals.length === 0) {
  goals = [
    {
      id: 1,
      title: 'Complete Web Dev Bootcamp',
      category: 'career',
      priority: 'high',
      progress: 65,
      status: 'active',
      endDate: '2025-06-01',
    },
    {
      id: 2,
      title: 'Read 12 Books',
      category: 'personal',
      priority: 'medium',
      progress: 15,
      status: 'active',
      endDate: '2025-12-31',
    },
  ];
  localStorage.setItem('edugateway_goals', JSON.stringify(goals));
}

// Pre-populate tasks if empty
if (tasks.length === 0) {
  tasks = [
    { id: 1, title: 'Clean up workspace', status: 'todo' },
    { id: 2, title: 'Update resume', status: 'in-progress' },
    { id: 3, title: 'Submit application', status: 'completed' },
  ];
  localStorage.setItem('edugateway_tasks', JSON.stringify(tasks));
}

// Notion API Integration
const NOTION_API_BASE = '/api/notion';
let currentViewDate = new Date();

// Sidebar functionality
function toggleSidebar() {
  const sidebar = document.getElementById('sidebar');
  const mainContent = document.querySelector('.main-content');
  if (sidebar) {
    sidebar.classList.toggle('closed');
    // Save state to keep it consistent
    localStorage.setItem('brainex_sidebar_closed', sidebar.classList.contains('closed'));
  }
  if (mainContent) mainContent.classList.toggle('sidebar-closed');
}

function switchSection(sectionId) {
  // Correctly handle the hash or raw ID
  const cleanId = sectionId.startsWith('#') ? sectionId.substring(1) : sectionId;

  document.querySelectorAll('.content-section').forEach((section) => {
    section.classList.remove('active');
    section.style.display = 'none'; // Force hide to avoid overlaps
  });

  let targetSection = document.getElementById(cleanId);
  if (!targetSection) {
    // Fallback logic
    if (cleanId === 'projects-plan') targetSection = document.getElementById('projects');
    if (!targetSection) targetSection = document.getElementById('overview');
  }

  if (targetSection) {
    targetSection.classList.add('active');
    targetSection.style.display = 'block';
  }

  // Update sidebar links
  document.querySelectorAll('.sidebar-link').forEach((link) => {
    link.classList.remove('active');
    if (link.getAttribute('data-section') === cleanId || link.getAttribute('href') === `#${cleanId}`) {
      link.classList.add('active');
    }
  });

  // Load data for the section
  loadSectionData(cleanId);

  // On mobile, close sidebar after clicking
  if (window.innerWidth <= 768) {
    const sidebar = document.getElementById('sidebar');
    if (sidebar && !sidebar.classList.contains('closed')) {
      toggleSidebar();
    }
  }
}

function loadSectionData(sectionId) {
  switch (sectionId) {
    case 'overview':
      loadDashboard();
      break;
    case 'goals':
      loadGoals();
      break;
    case 'progress':
      loadProgress();
      break;
    case 'notes':
      loadNotes();
      break;
    case 'tasks':
      loadTasks();
      break;
    case 'calendar':
      loadCalendar();
      break;
    case 'projects':
      loadProjects();
      break;
    case 'resources':
      loadResources();
      break;
    case 'courses':
      loadCourses();
      break;
    case 'applications':
      loadApplications();
      break;
    case 'scholarships-tracker':
      loadScholarshipTracker();
      break;
    case 'deadlines':
      loadDeadlines();
      break;
    case 'my-universities':
      loadMyUniversities();
      break;
    case 'my-programs':
      loadMyPrograms();
      break;
  }
}

// My Universities Logic
function loadMyUniversities() {
  const container = document.getElementById('myUniversitiesGrid');
  if (!container) return;

  if (myUniversities.length === 0) {
    container.innerHTML = '<div class="empty-state"><h3>🏛️ University Applications</h3><p>Track your dream schools.</p></div>';
    return;
  }

  container.innerHTML = myUniversities
    .map(
      (uni) => `
      <div class="goal-card">
          <div class="goal-header">
              <h3>${uni.name}</h3>
              <span class="goal-priority ${uni.chance === 'reach' ? 'high' : uni.chance === 'target' ? 'medium' : 'low'}">${uni.chance.toUpperCase()}</span>
          </div>
          <p>📍 ${uni.location}</p>
          <p>Status: <strong>${uni.status}</strong></p>
          <div class="goal-actions" style="margin-top: 1rem;">
              <button class="btn-action text-danger" onclick="deleteUniversity(${uni.id})">🗑️ Remove</button>
          </div>
      </div>
  `
    )
    .join('');
}

window.deleteUniversity = function (id) {
  if (confirm('Remove this university?')) {
    myUniversities = myUniversities.filter((u) => u.id !== id);
    localStorage.setItem('my_universities', JSON.stringify(myUniversities));
    loadMyUniversities();
  }
};

// My Programs Logic
function loadMyPrograms() {
  const container = document.getElementById('myProgramsGrid');
  if (!container) return;

  if (myPrograms.length === 0) {
    container.innerHTML = '<div class="empty-state"><h3>🌟 Summer Programs</h3><p>Manage your extracurriculars.</p></div>';
    return;
  }

  container.innerHTML = myPrograms
    .map(
      (prog) => `
      <div class="goal-card">
          <div class="goal-header">
              <h3>${prog.name}</h3>
              <span class="goal-priority ${prog.status === 'submitted' ? 'low' : 'medium'}">${prog.status.toUpperCase()}</span>
          </div>
          <p>🏢 ${prog.org}</p>
          <p>📅 Deadline: ${prog.deadline || 'N/A'}</p>
          <div class="goal-actions" style="margin-top: 1rem;">
              <button class="btn-action text-danger" onclick="deleteProgram(${prog.id})">🗑️ Remove</button>
          </div>
      </div>
  `
    )
    .join('');
}

window.deleteProgram = function (id) {
  if (confirm('Remove this program?')) {
    myPrograms = myPrograms.filter((p) => p.id !== id);
    localStorage.setItem('my_programs', JSON.stringify(myPrograms));
    loadMyPrograms();
  }
};

// Modal Handlers
// ... [will be added in listeners]

// Dashboard functionality
function loadDashboard() {
  updateDashboardStats();
  loadUpcomingDeadlines();
  loadRecentGoals();
  loadWeeklyFocus();
}

function loadWeeklyFocus() {
  const container = document.getElementById('weeklyFocus');
  if (!container) return;
  container.innerHTML = weeklyFocus
    .map(
      (item, index) => `
        <div class="focus-item">
            <span class="focus-emoji">${item.emoji}</span>
            <span>${item.text}</span>
            <button class="btn-remove-focus" data-index="${index}">×</button>
        </div>
    `
    )
    .join('');
}

window.removeFocusItem = function (index) {
  weeklyFocus.splice(index, 1);
  localStorage.setItem('edugateway_weekly_focus', JSON.stringify(weeklyFocus));
  loadWeeklyFocus();
};

window.editWeeklyFocus = function () {
  const text = prompt('Enter new focus item:');
  if (!text) return;
  const emoji = prompt('Enter an emoji (optional):', '🎯');
  weeklyFocus.push({ emoji: emoji || '🎯', text });
  localStorage.setItem('edugateway_weekly_focus', JSON.stringify(weeklyFocus));
  loadWeeklyFocus();
};

function updateDashboardStats() {
  const activeGoals = goals.filter((goal) => goal.status !== 'completed').length;
  const completedTasksCount = tasks.filter((task) => task.status === 'completed').length;
  const overallProgress =
    goals.length > 0
      ? Math.round(goals.reduce((sum, goal) => sum + goal.progress, 0) / goals.length)
      : 0;

  if (document.getElementById('totalGoals'))
    document.getElementById('totalGoals').textContent = activeGoals;
  if (document.getElementById('completedTasks'))
    document.getElementById('completedTasks').textContent = completedTasksCount; // Dashboard display
  if (document.getElementById('progressPercent'))
    document.getElementById('progressPercent').textContent = overallProgress + '%';
  if (document.getElementById('currentStreak'))
    document.getElementById('currentStreak').textContent = calculateStreak();
}

function calculateStreak() {
  return tasks.filter((t) => t.status === 'completed').length > 0 ? 5 : 0;
}

function loadUpcomingDeadlines() {
  const container = document.getElementById('upcomingDeadlines');
  if (!container) return;
  const upcoming = goals.filter((g) => g.endDate && new Date(g.endDate) >= new Date()).slice(0, 3);
  container.innerHTML =
    upcoming
      .map(
        (g) => `
        <div class="deadline-item">
            <span class="deadline-title">${g.title}</span>
            <span class="deadline-days">${Math.ceil((new Date(g.endDate) - new Date()) / 86400000)}d left</span>
        </div>
    `
      )
      .join('') || '<p class="empty-state">No upcoming deadlines</p>';
}

function loadRecentGoals() {
  const container = document.getElementById('recentGoals');
  if (!container) return;
  const recent = goals.slice(-3);
  container.innerHTML =
    recent
      .map(
        (g) => `
        <div class="goal-preview">
            <div class="goal-preview-title">${g.title}</div>
            <div class="goal-preview-progress">
                <div class="mini-progress-bar"><div class="mini-progress-fill" style="width:${g.progress}%"></div></div>
                <span>${g.progress}%</span>
            </div>
        </div>
    `
      )
      .join('') || '<p class="empty-state">No goals yet</p>';
}

// Goals
function loadGoals() {
  const container = document.getElementById('goalsContainer');
  if (!container) return;
  const filter = document.querySelector('.filter-btn.active')?.dataset.filter || 'all';
  const sort = document.getElementById('goalSort')?.value || 'date';

  let filtered = [...goals];
  if (filter !== 'all') filtered = filtered.filter((g) => g.category === filter);

  filtered.sort((a, b) => {
    if (sort === 'progress') return b.progress - a.progress;
    if (sort === 'priority') {
      const m = { high: 3, medium: 2, low: 1 };
      return m[b.priority] - m[a.priority];
    }
    return b.id - a.id;
  });

  container.innerHTML =
    filtered.map(createGoalCard).join('') || '<p class="empty-state">No goals found.</p>';
}

function createGoalCard(goal) {
  return `
        <div class="goal-card" data-goal-id="${goal.id}">
            <div class="goal-header">
                <h3>${goal.title}</h3>
                <span class="goal-priority ${goal.priority}">${goal.priority.toUpperCase()}</span>
            </div>
            <div class="goal-progress">
                <div class="progress-bar"><div class="progress-fill" style="width:${goal.progress}%"></div></div>
                <div class="progress-text">${goal.progress}% complete</div>
            </div>
            <div class="goal-actions">
                <button class="btn-action edit-goal-btn">✏️</button>
                <div class="progress-control">
                   <input type="range" class="progress-slider" min="0" max="100" value="${goal.progress}">
                </div>
                <button class="btn-action delete-goal-btn">🗑️</button>
            </div>
        </div>
    `;
}

window.updateProgressImmediate = function (id, val) {
  const goal = goals.find((g) => g.id === parseInt(id));
  if (goal) {
    goal.progress = parseInt(val);
    if (goal.progress === 100) goal.status = 'completed';
    localStorage.setItem('edugateway_goals', JSON.stringify(goals));
    updateDashboardStats();
    // UI Polish: Update card directly
    const card = document.querySelector(`.goal-card[data-goal-id="${id}"]`);
    if (card) {
      card.querySelector('.progress-fill').style.width = val + '%';
      card.querySelector('.progress-text').textContent = val + '% complete';
    }
  }
};

window.deleteGoal = async function (id) {
  if (confirm('Delete goal?')) {
    const response = await BraineX.apiRequest(`/goals/${id}`, {
      method: 'DELETE',
    });
    if (response.success) {
      await initData();
      showNotification('Goal deleted', 'success');
    }
  }
};

function openGoalModal(id = null) {
  const modal = document.getElementById('goalModal');
  if (!modal) return;
  if (id) {
    const g = goals.find((goal) => goal.id === parseInt(id));
    document.getElementById('goalTitle').value = g.title;
    document.getElementById('goalCategory').value = g.category;
    document.getElementById('goalPriority').value = g.priority;
    modal.dataset.editingId = id;
  } else {
    document.getElementById('goalForm').reset();
    delete modal.dataset.editingId;
  }
  modal.classList.add('show');
}

window.closeGoalModal = () => {
  const modal = document.getElementById('goalModal');
  if (modal) modal.classList.remove('show');
};

// Notes
function loadNotes() {
  const grid = document.getElementById('notesGrid');
  if (!grid) return;
  grid.innerHTML =
    notes
      .map(
        (n) => `
        <div class="note-card" data-id="${n.id}">
            <h4>${n.title}</h4>
            <p>${n.content.replace(/<[^>]*>/g, '').substring(0, 50)}...</p>
        </div>
    `
      )
      .join('') || '<p class="empty-state">No notes.</p>';
}

function openNoteModal(id = null) {
  const modal = document.getElementById('noteModal');
  if (!modal) return;
  const title = document.getElementById('noteTitle');
  const content = document.getElementById('noteContent');
  if (id) {
    const n = notes.find((note) => note.id === parseInt(id));
    title.value = n.title;
    content.innerHTML = n.content;
    modal.dataset.editingId = id;
  } else {
    title.value = '';
    content.innerHTML = '';
    delete modal.dataset.editingId;
  }
  modal.classList.add('show');
}

window.saveNote = async function () {
  const title = document.getElementById('noteTitle').value || 'Untitled';
  const content = document.getElementById('noteContent').innerHTML;
  const modal = document.getElementById('noteModal');
  const editingId = modal.dataset.editingId;

  const response = await BraineX.apiRequest(editingId ? `/goals/${editingId}` : '/goals', {
    method: editingId ? 'PUT' : 'POST',
    body: JSON.stringify({
      type: 'note',
      title,
      description: content, // Notes use description field in backend
    }),
  });

  if (response.success) {
    modal.classList.remove('show');
    await initData();
    loadNotes();
    showNotification(editingId ? 'Note updated!' : 'Note saved!', 'success');
  }
};

window.closeNoteModal = () => {
  const modal = document.getElementById('noteModal');
  if (modal) modal.classList.remove('show');
};

// Tasks
function loadTasks() {
  const todoList = document.getElementById('todoTasks');
  const inProgressList = document.getElementById('inProgressTasks');
  const completedList = document.getElementById('completedTasks'); // Correct ID from notion.html
  if (!todoList) return;

  const render = (t) => `
        <div class="task-item">
            <span>${t.title}</span>
            <div class="task-btns">
                <button class="task-move-btn" data-id="${t.id}" data-status="todo">⭕</button>
                <button class="task-move-btn" data-id="${t.id}" data-status="in-progress">⏳</button>
                <button class="task-move-btn" data-id="${t.id}" data-status="completed">✅</button>
                <button class="task-delete-btn" data-id="${t.id}">🗑️</button>
            </div>
        </div>
    `;

  todoList.innerHTML = tasks
    .filter((t) => t.status === 'todo')
    .map(render)
    .join('');
  inProgressList.innerHTML = tasks
    .filter((t) => t.status === 'in-progress')
    .map(render)
    .join('');
  if (completedList)
    completedList.innerHTML = tasks
      .filter((t) => t.status === 'completed')
      .map(render)
      .join('');
}

window.moveTask = async (id, s) => {
  const response = await BraineX.apiRequest(`/goals/${id}`, {
    method: 'PUT',
    body: JSON.stringify({ status: s }),
  });
  if (response.success) {
    await initData();
    loadTasks();
    updateDashboardStats();
  }
};

window.deleteTask = async (id) => {
  if (confirm('Delete task?')) {
    const response = await BraineX.apiRequest(`/goals/${id}`, {
      method: 'DELETE',
    });
    if (response.success) {
      await initData();
      loadTasks();
      updateDashboardStats();
    }
  }
};

window.addNewTask = async () => {
  const t = prompt('Task title:');
  if (t) {
    const response = await BraineX.apiRequest('/goals', {
      method: 'POST',
      body: JSON.stringify({
        type: 'task',
        title: t,
        status: 'todo',
      }),
    });
    if (response.success) {
      await initData();
      loadTasks();
      showNotification('Task added!', 'success');
    }
  }
};

// Calendar
function loadCalendar() {
  const grid = document.getElementById('calendarDays');
  if (!grid) return;
  const date = currentViewDate;
  const monthHeader = document.getElementById('currentMonth');
  if (monthHeader)
    monthHeader.textContent = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const first = new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  const days = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();

  let html = '';
  for (let i = 0; i < first; i++) html += '<div class="calendar-day empty"></div>';
  for (let i = 1; i <= days; i++) {
    const dayEvents = calendarEvents.filter((e) => {
      const evDate = new Date(e.date);
      return (
        evDate.getDate() === i &&
        evDate.getMonth() === date.getMonth() &&
        evDate.getFullYear() === date.getFullYear()
      );
    });
    const hasEvents = dayEvents.length > 0;
    const eventTitles = dayEvents.map((e) => e.title).join(', ');
    const isToday =
      new Date().getDate() === i &&
      new Date().getMonth() === date.getMonth() &&
      new Date().getFullYear() === date.getFullYear();
    html += `<div class="calendar-day ${isToday ? 'today' : ''} ${hasEvents ? 'has-event' : ''}" data-day="${i}" title="${hasEvents ? eventTitles : 'Click to add event'}">
            <span class="day-number">${i}</span>
            ${hasEvents ? `<span class="event-indicator">${dayEvents.length}</span>` : ''}
        </div>`;
  }
  grid.innerHTML = html;

  // Load events list
  loadCalendarEventsList();
}

function loadCalendarEventsList() {
  const eventsList = document.getElementById('eventsList');
  if (!eventsList) return;

  const currentMonthEvents = calendarEvents
    .filter((e) => {
      const evDate = new Date(e.date);
      return (
        evDate.getMonth() === currentViewDate.getMonth() &&
        evDate.getFullYear() === currentViewDate.getFullYear()
      );
    })
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  if (currentMonthEvents.length === 0) {
    eventsList.innerHTML =
      '<div class="empty-state"><p>No events this month. Click on a day to add one!</p></div>';
  } else {
    eventsList.innerHTML = currentMonthEvents
      .map((e) => {
        const evDate = new Date(e.date);
        const dayOfWeek = evDate.toLocaleDateString('en-US', { weekday: 'short' });
        const dayNum = evDate.getDate();
        const isPast = evDate < new Date();
        return `
                <div class="event-item ${isPast ? 'past-event' : ''}">
                    <div class="event-date-badge">
                        <span class="event-day">${dayNum}</span>
                        <span class="event-weekday">${dayOfWeek}</span>
                    </div>
                    <div class="event-details">
                        <h4>${e.title}</h4>
                        <p>${evDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                    </div>
                    <button class="btn-delete-event" data-id="${e.id}">🗑️</button>
                </div>
            `;
      })
      .join('');

    // Add delete listeners
    eventsList.querySelectorAll('.btn-delete-event').forEach((btn) => {
      btn.addEventListener('click', () => deleteCalendarEvent(btn.dataset.id));
    });
  }
}

function deleteCalendarEvent(id) {
  if (confirm('Delete this event?')) {
    calendarEvents = calendarEvents.filter((e) => e.id != id);
    localStorage.setItem('edugateway_events', JSON.stringify(calendarEvents));
    loadCalendar();
    showNotification('Event deleted', 'success');
  }
}

window.previousMonth = () => {
  currentViewDate.setMonth(currentViewDate.getMonth() - 1);
  loadCalendar();
};
window.nextMonth = () => {
  currentViewDate.setMonth(currentViewDate.getMonth() + 1);
  loadCalendar();
};

window.addCalendarEvent = (day) => {
  const t = prompt('Event title:');
  if (t) {
    calendarEvents.push({
      id: Date.now(),
      title: t,
      date: new Date(currentViewDate.getFullYear(), currentViewDate.getMonth(), day).toISOString(),
    });
    localStorage.setItem('edugateway_events', JSON.stringify(calendarEvents));
    loadCalendar();
    showNotification(`Event "${t}" added!`, 'success');
  }
};

// Progress Section
function loadProgress() {
  const canvas = document.getElementById('goalsChart');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  const completed = goals.filter((g) => g.status === 'completed').length;
  const inProgress = goals.filter((g) => g.status !== 'completed').length;

  if (window.myGoalsChart) window.myGoalsChart.destroy();

  window.myGoalsChart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['Completed', 'In Progress'],
      datasets: [
        {
          data: [completed, inProgress],
          backgroundColor: ['#48bb78', '#667eea'],
          borderWidth: 0,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { position: 'bottom' } },
    },
  });
}

// Templates & New Page
window.showTemplates = function () {
  const t = prompt('Choose Template: 1. Study Plan 2. Project Manager 3. Blank Notebook');
  if (t === '1') createFromTemplate('study');
  else if (t === '2') createFromTemplate('project');
  else if (t) createFromTemplate('blank');
};

function createFromTemplate(type) {
  const p = { id: Date.now(), title: type.toUpperCase() + ' Page', type };
  userPages.push(p);
  localStorage.setItem('user_pages', JSON.stringify(userPages));
  showNotification('New page created! You can find it in your sidebar soon.', 'success');
}

// Event Delegation & Init (CSP Compatible)
function setupEventListeners() {
  // Sidebar Toggles
  document.querySelectorAll('.js-toggle-sidebar').forEach((btn) => {
    btn.onclick = null; // Remove inline if exists
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      toggleSidebar();
    });
  });

  // Section Switching (Sidebar + Dashboard Buttons)
  document.querySelectorAll('.js-switch-section, .sidebar-link, .btn-card[data-section]').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const section = btn.getAttribute('data-section') || btn.getAttribute('href')?.replace('#', '');
      if (section) switchSection(section);
    });
  });

  // Goal Modal
  const openGoalBtn = document.querySelector('.js-open-goal-modal');
  if (openGoalBtn) openGoalBtn.addEventListener('click', () => openGoalModal());

  document.querySelectorAll('.js-close-goal-modal, .close-modal').forEach((btn) => {
    btn.addEventListener('click', closeGoalModal);
  });

  // Note Modal
  document.querySelectorAll('.js-close-note-modal').forEach((btn) => {
    btn.addEventListener('click', closeNoteModal);
  });

  const closeNoteBtn = document.getElementById('closeNoteModalBtn');
  if (closeNoteBtn) closeNoteBtn.addEventListener('click', closeNoteModal);

  // Milestones
  const addMilestoneBtn = document.querySelector('.js-add-milestone');
  if (addMilestoneBtn) addMilestoneBtn.addEventListener('click', addMilestone);

  const milestonesContainer = document.getElementById('milestonesContainer');
  if (milestonesContainer) {
    milestonesContainer.addEventListener('click', (e) => {
      if (e.target.closest('.js-remove-milestone')) {
        removeMilestone(e.target.closest('.js-remove-milestone'));
      }
    });
  }

  // Quick Actions
  const saveQuickNoteBtn = document.querySelector('.js-save-quick-note');
  if (saveQuickNoteBtn) saveQuickNoteBtn.addEventListener('click', saveQuickNote);

  const editFocusBtn = document.querySelector('.js-edit-focus');
  if (editFocusBtn) editFocusBtn.addEventListener('click', window.editWeeklyFocus);

  // Resource/Course/etc.
  const addResBtn = document.querySelector('.js-add-resource');
  if (addResBtn) addResBtn.addEventListener('click', addResource);

  const addCourseBtn = document.querySelector('.js-add-course');
  if (addCourseBtn) addCourseBtn.addEventListener('click', addCourse);

  const addAppBtn = document.querySelector('.js-add-application');
  if (addAppBtn) addAppBtn.addEventListener('click', addApplication);

  const addScholBtn = document.querySelector('.js-add-scholarship-track');
  if (addScholBtn) addScholBtn.addEventListener('click', addScholarshipTrack);

  const addDeadlineBtn = document.querySelector('.js-add-deadline');
  if (addDeadlineBtn) addDeadlineBtn.addEventListener('click', addDeadline);

  const newItemBtn = document.querySelector('.js-new-item');
  if (newItemBtn) newItemBtn.addEventListener('click', createNewItem);

  // Templates
  const templateBtn = document.querySelector('.js-show-templates');
  if (templateBtn) templateBtn.addEventListener('click', showTemplates);

  // University Modals
  const addUniBtn = document.querySelector('.js-add-university');
  if (addUniBtn)
    addUniBtn.addEventListener('click', () => {
      const form = document.getElementById('universityForm');
      if (form) form.reset();
      const modal = document.getElementById('universityModal');
      if (modal) modal.classList.add('show');
    });

  document
    .querySelectorAll('.js-close-university-modal')
    .forEach((btn) =>
      btn.addEventListener('click', () => {
        const modal = document.getElementById('universityModal');
        if (modal) modal.classList.remove('show');
      })
    );

  const uniForm = document.getElementById('universityForm');
  if (uniForm) {
    uniForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const newUni = {
        id: Date.now(),
        name: document.getElementById('uniName')?.value || 'Unnamed Uni',
        location: document.getElementById('uniLocation')?.value || 'Unknown',
        status: document.getElementById('uniStatus')?.value || 'Interested',
        chance: document.getElementById('uniChance')?.value || 'target',
      };
      myUniversities.push(newUni);
      localStorage.setItem('my_universities', JSON.stringify(myUniversities));
      const modal = document.getElementById('universityModal');
      if (modal) modal.classList.remove('show');
      loadMyUniversities();
      showNotification('University added!', 'success');
    });
  }

  // Program Modals
  const addProgBtn = document.querySelector('.js-add-program');
  if (addProgBtn)
    addProgBtn.addEventListener('click', () => {
      const form = document.getElementById('programForm');
      if (form) form.reset();
      const modal = document.getElementById('programModal');
      if (modal) modal.classList.add('show');
    });

  document
    .querySelectorAll('.js-close-program-modal')
    .forEach((btn) =>
      btn.addEventListener('click', () => {
        const modal = document.getElementById('programModal');
        if (modal) modal.classList.remove('show');
      })
    );

  const progForm = document.getElementById('programForm');
  if (progForm) {
    progForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const newProg = {
        id: Date.now(),
        name: document.getElementById('progName')?.value || 'Unnamed Program',
        org: document.getElementById('progOrg')?.value || 'Unknown',
        deadline: document.getElementById('progDeadline')?.value || '',
        status: document.getElementById('progStatus')?.value || 'planning',
      };
      myPrograms.push(newProg);
      localStorage.setItem('my_programs', JSON.stringify(myPrograms));
      const modal = document.getElementById('programModal');
      if (modal) modal.classList.remove('show');
      loadMyPrograms();
      showNotification('Program added!', 'success');
    });
  }

  // Project Modals
  const addProjBtn = document.getElementById('addNewProjectBtn');
  if (addProjBtn) {
    addProjBtn.addEventListener('click', () => {
      const form = document.getElementById('projectForm');
      if (form) form.reset();
      const modal = document.getElementById('projectModal');
      if (modal) modal.classList.add('show');
    });
  }

  document
    .querySelectorAll('.js-close-project-modal')
    .forEach((btn) =>
      btn.addEventListener('click', () => {
        const modal = document.getElementById('projectModal');
        if (modal) modal.classList.remove('show');
      })
    );

  const projForm = document.getElementById('projectForm');
  if (projForm) {
    projForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const newProj = {
        id: Date.now(),
        name: document.getElementById('projName')?.value || 'Unnamed Project',
        description: document.getElementById('projDesc')?.value || '',
        deadline: document.getElementById('projDeadline')?.value || '',
        status: document.getElementById('projStatus')?.value || 'planning',
      };
      myProjects.push(newProj);
      localStorage.setItem('my_projects', JSON.stringify(myProjects));
      const modal = document.getElementById('projectModal');
      if (modal) modal.classList.remove('show');
      loadProjects();
      showNotification('Project added!', 'success');
    });
  }
  // Ensure we start with a desktop-friendly sidebar state if no preference saved
  const sidebar = document.getElementById('sidebar');
  const savedState = localStorage.getItem('brainex_sidebar_closed');
  if (sidebar && window.innerWidth > 1024) {
    if (savedState === 'true') {
      sidebar.classList.add('closed');
      document.querySelector('.main-content')?.classList.add('sidebar-closed');
    } else {
      sidebar.classList.remove('closed');
      document.querySelector('.main-content')?.classList.remove('sidebar-closed');
    }
  }
  // Fixed: Edit focus button on dashboard
  const editFocusBtnSecondary = document.querySelector('.weekly-focus-card .btn-secondary');
  if (editFocusBtnSecondary) {
    editFocusBtnSecondary.addEventListener('click', () => {
      if (typeof window.editWeeklyFocus === 'function') window.editWeeklyFocus();
    });
  }

  // Goals Section Delegation
  const goalsBox = document.getElementById('goalsContainer');
  if (goalsBox) {
    goalsBox.addEventListener('click', (e) => {
      const card = e.target.closest('.goal-card');
      if (!card) return;
      const id = card.dataset.goalId;
      if (e.target.classList.contains('edit-goal-btn')) openGoalModal(id);
      else if (e.target.classList.contains('delete-goal-btn')) {
        if (typeof window.deleteGoal === 'function') window.deleteGoal(id);
      }
    });

    goalsBox.addEventListener('input', (e) => {
      if (e.target.classList.contains('progress-slider')) {
        const id = e.target.closest('.goal-card').dataset.goalId;
        if (typeof window.updateProgressImmediate === 'function') {
          window.updateProgressImmediate(id, e.target.value);
        }
      }
    });
  }

  const goalForm = document.getElementById('goalForm');
  if (goalForm) {
    goalForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const id = goalForm.closest('.modal').dataset.editingId;
      const data = {
        type: 'goal',
        title: document.getElementById('goalTitle').value,
        category: document.getElementById('goalCategory').value,
        priority: document.getElementById('goalPriority').value,
        dueDate: document.getElementById('goalEndDate').value,
      };

      const btn = goalForm.querySelector('button[type="submit"]');
      if (btn) btn.disabled = true;

      try {
        const response = await BraineX.apiRequest(id ? `/goals/${id}` : '/goals', {
          method: id ? 'PUT' : 'POST',
          body: JSON.stringify(data),
        });

        if (response.success) {
          window.closeGoalModal();
          await initData();
          showNotification(id ? 'Goal updated!' : 'Goal created!', 'success');
        }
      } catch (err) {
        console.error('Goal saving failed:', err);
        showNotification('Failed to save goal', 'error');
      } finally {
        if (btn) btn.disabled = false;
      }
    });
  }
}

// Global exposure
window.switchSection = switchSection;
window.toggleSidebar = toggleSidebar;

document.addEventListener('DOMContentLoaded', () => {
  const sidebar = document.getElementById('sidebar');
  const savedState = localStorage.getItem('brainex_sidebar_closed');
  if (sidebar && window.innerWidth > 1024) {
    if (savedState === 'true') {
      sidebar.classList.add('closed');
      document.querySelector('.main-content')?.classList.add('sidebar-closed');
    } else {
      sidebar.classList.remove('closed');
      document.querySelector('.main-content')?.classList.remove('sidebar-closed');
    }
  }

  setupEventListeners();
  initData().finally(() => {
    if (window.location.hash) {
      switchSection(window.location.hash.substring(1));
    } else {
      switchSection('overview');
    }
  });
});

// Modal close buttons (X and Cancel)
document.querySelectorAll('.close-modal, .modal .btn-secondary').forEach((b) => {
  b.addEventListener('click', () => {
    window.closeGoalModal();
    window.closeNoteModal();
  });
});

// Notes Section Delegation
const notesBox = document.getElementById('notesGrid');
if (notesBox) {
  notesBox.addEventListener('click', (e) => {
    const card = e.target.closest('.note-card');
    if (card) openNoteModal(card.dataset.id);
  });
}
const createNoteBtn = document.getElementById('createNewNoteBtn');
if (createNoteBtn) createNoteBtn.addEventListener('click', () => openNoteModal());

const saveNoteBtn = document.getElementById('saveNoteBtn');
if (saveNoteBtn) saveNoteBtn.addEventListener('click', window.saveNote);

// Note Toolbar
const toolbar = document.querySelector('.note-toolbar');
if (toolbar) {
  toolbar.addEventListener('click', (e) => {
    const btn = e.target.closest('.toolbar-btn');
    if (!btn) return;
    const cmd = btn.dataset.cmd;
    if (cmd === 'bold') document.execCommand('bold', false, null);
    else if (cmd === 'italic') document.execCommand('italic', false, null);
    else if (cmd === 'underline') document.execCommand('underline', false, null);
    else if (cmd === 'list') document.execCommand('insertUnorderedList', false, null);
    else if (cmd === 'link') {
      const url = prompt('Enter URL:');
      if (url) document.execCommand('createLink', false, url);
    }
  });
}

// Tasks Section Delegation
const tasksSection = document.getElementById('tasks');
if (tasksSection) {
  tasksSection.addEventListener('click', (e) => {
    if (e.target.classList.contains('task-move-btn')) {
      window.moveTask(e.target.dataset.id, e.target.dataset.status);
    } else if (e.target.classList.contains('task-delete-btn')) {
      window.deleteTask(e.target.dataset.id);
    }
  });
}
const addNewTaskBtn = document.getElementById('addNewTaskBtn');
if (addNewTaskBtn) addNewTaskBtn.addEventListener('click', window.addNewTask);

// Calendar Section Delegation
const calDays = document.getElementById('calendarDays');
if (calDays) {
  calDays.addEventListener('click', (e) => {
    const day = e.target.closest('.calendar-day');
    if (day && !day.classList.contains('empty')) {
      window.addCalendarEvent(parseInt(day.dataset.day));
    }
  });
}
const addCalBtn = document.getElementById('addCalendarEventBtn');
if (addCalBtn)
  addCalBtn.addEventListener('click', () => {
    const d = prompt('Enter day of month (1-31):');
    if (d) window.addCalendarEvent(d);
  });
const prevM = document.getElementById('prevMonthBtn');
if (prevM) prevM.addEventListener('click', window.previousMonth);
const nextM = document.getElementById('nextMonthBtn');
if (nextM) nextM.addEventListener('click', window.nextMonth);

// Goal Filtering/Sorting
document.querySelectorAll('.filter-btn').forEach((b) => {
  b.addEventListener('click', () => {
    document.querySelectorAll('.filter-btn').forEach((x) => x.classList.remove('active'));
    b.classList.add('active');
    loadGoals();
  });
});
const sortEl = document.getElementById('goalSort');
if (sortEl) sortEl.addEventListener('change', loadGoals);

// Specialized Section Buttons
const addProjBtn = document.getElementById('addNewProjectBtn');
if (addProjBtn) addProjBtn.addEventListener('click', () => window.showTemplates());

// Add Resource Button Handler
document.querySelector('.js-add-resource')?.addEventListener('click', () => {
  const name = prompt('Resource Name:');
  if (!name) return;
  const url = prompt('Resource URL:');
  const resources = JSON.parse(localStorage.getItem('edugateway_resources') || '[]');
  resources.push({ id: Date.now(), name, url: url || '#', type: 'link' });
  localStorage.setItem('edugateway_resources', JSON.stringify(resources));
  loadResources();
  showNotification('Resource added!', 'success');
});

// Add Course Button Handler
document.querySelector('.js-add-course')?.addEventListener('click', () => {
  const name = prompt('Course Name:');
  if (!name) return;
  const grade = prompt('Current Grade (e.g. A, B+):');
  const courses = JSON.parse(localStorage.getItem('edugateway_courses') || '[]');
  courses.push({ id: Date.now(), name, grade: grade || 'N/A', status: 'in-progress' });
  localStorage.setItem('edugateway_courses', JSON.stringify(courses));
  loadCourses();
  showNotification('Course added!', 'success');
});

// Add Application Button Handler
document.querySelector('.js-add-application')?.addEventListener('click', () => {
  const org = prompt('Organization/University:');
  if (!org) return;
  const position = prompt('Position/Program:');
  const deadline = prompt('Deadline (YYYY-MM-DD):');
  const applications = JSON.parse(localStorage.getItem('edugateway_applications') || '[]');
  applications.push({ id: Date.now(), organization: org, position: position || 'Application', deadline: deadline || '', status: 'pending' });
  localStorage.setItem('edugateway_applications', JSON.stringify(applications));
  loadApplications();
  showNotification('Application added!', 'success');
});

// Add Scholarship Tracker Button Handler
document.querySelector('.js-add-scholarship-track')?.addEventListener('click', () => {
  const name = prompt('Scholarship Name:');
  if (!name) return;
  const amount = prompt('Amount (e.g. $5,000):');
  const deadline = prompt('Deadline (YYYY-MM-DD):');
  const scholarships = JSON.parse(localStorage.getItem('edugateway_scholarship_tracker') || '[]');
  scholarships.push({ id: Date.now(), name, amount: amount || 'N/A', deadline: deadline || '', status: 'pending' });
  localStorage.setItem('edugateway_scholarship_tracker', JSON.stringify(scholarships));
  loadScholarshipTracker();
  showNotification('Scholarship added to tracker!', 'success');
});

// Add Deadline Button Handler
document.querySelector('.js-add-deadline')?.addEventListener('click', () => {
  const title = prompt('Deadline Title:');
  if (!title) return;
  const date = prompt('Date (YYYY-MM-DD):');
  if (!date) return;
  const deadlines = JSON.parse(localStorage.getItem('edugateway_deadlines') || '[]');
  deadlines.push({ id: Date.now(), title, date });
  localStorage.setItem('edugateway_deadlines', JSON.stringify(deadlines));
  loadDeadlines();
  showNotification('Deadline added!', 'success');
});

// Initial Load
// initData() is now called inside DOMContentLoaded at the end of the file

function showNotification(msg, type) {
  const n = document.createElement('div');
  n.className = `notification ${type}`;
  n.style.cssText =
    'position:fixed;top:20px;right:20px;background:#667eea;color:white;padding:12px 24px;border-radius:12px;z-index:9999;box-shadow:0 10px 30px rgba(0,0,0,0.3);font-weight:500;animation: slideIn 0.3s ease-out;';
  n.textContent = msg;
  document.body.appendChild(n);
  setTimeout(() => {
    n.style.animation = 'slideOut 0.3s ease-in forwards';
    setTimeout(() => n.remove(), 300);
  }, 3000);
}

// Stubs for specialized loaders - NOW FUNCTIONAL
function loadProjects() {
  const grid = document.getElementById('projectsGrid');
  if (!grid) return;

  // Use new key 'my_projects' to match new modal
  const projects = JSON.parse(localStorage.getItem('my_projects')) || [];

  if (projects.length === 0) {
    grid.innerHTML =
      '<div class="empty-state"><h3>📁 Projects Workspace</h3><p>Click "+ New Project" to start planning your next big project.</p></div>';
  } else {
    grid.innerHTML = projects
      .map(
        (p) => `
            <div class="project-card" data-id="${p.id}">
                <div class="project-header">
                    <h4>${p.name}</h4>
                    <span class="badge ${p.status === 'completed' ? 'badge-success' : 'badge-warning'}">${p.status}</span>
                </div>
                <p>${p.description || 'No description'}</p>
                <div class="project-meta" style="margin-top: 0.5rem; font-size: 0.9rem; color: #666;">
                    <span>📅 Due: ${p.deadline || 'No date'}</span>
                </div>
                <button class="btn-delete-project" data-id="${p.id}" style="margin-top: 1rem;">🗑️ Remove</button>
            </div>
        `
      )
      .join('');

    // Add delete listeners
    grid.querySelectorAll('.btn-delete-project').forEach((btn) => {
      btn.addEventListener('click', () => deleteProject(btn.dataset.id));
    });
  }
}

function deleteProject(id) {
  if (confirm('Delete project?')) {
    let projects = JSON.parse(localStorage.getItem('my_projects')) || [];
    projects = projects.filter((p) => p.id != id);
    localStorage.setItem('my_projects', JSON.stringify(projects));
    loadProjects();
    showNotification('Project deleted', 'success');
  }
}

function loadResources() {
  const grid = document.getElementById('resourcesGrid');
  if (!grid) return;

  const resources = JSON.parse(localStorage.getItem('edugateway_resources')) || [];
  if (resources.length === 0) {
    grid.innerHTML =
      '<div class="empty-state"><h3>🔗 Resource Library</h3><p>Click "+ Add Resource" to save articles, links, and useful materials.</p></div>';
  } else {
    grid.innerHTML = resources
      .map(
        (r) => `
            <div class="resource-card" data-id="${r.id}">
                <h4>🔗 ${r.title}</h4>
                <p>${r.url}</p>
                <p class="resource-note">${r.notes || ''}</p>
                <div class="resource-actions">
                    <a href="${r.url}" target="_blank" class="btn-visit">Visit</a>
                    <button class="btn-delete-resource" data-id="${r.id}">🗑️</button>
                </div>
            </div>
        `
      )
      .join('');

    grid.querySelectorAll('.btn-delete-resource').forEach((btn) => {
      btn.addEventListener('click', () => deleteResource(btn.dataset.id));
    });
  }
}

function deleteResource(id) {
  let resources = JSON.parse(localStorage.getItem('edugateway_resources')) || [];
  resources = resources.filter((r) => r.id != id);
  localStorage.setItem('edugateway_resources', JSON.stringify(resources));
  loadResources();
  showNotification('Resource deleted', 'success');
}

function loadCourses() {
  const grid = document.getElementById('coursesGrid');
  if (!grid) return;

  const courses = JSON.parse(localStorage.getItem('edugateway_courses')) || [];
  if (courses.length === 0) {
    grid.innerHTML =
      '<div class="empty-state"><h3>📚 Course Load</h3><p>Click "+ Add Course" to manage your modules and track grades.</p></div>';
  } else {
    grid.innerHTML = courses
      .map(
        (c) => `
            <div class="course-card" data-id="${c.id}">
                <h4>${c.name}</h4>
                <p>Instructor: ${c.instructor || 'N/A'}</p>
                <p>Credits: ${c.credits || 'N/A'} | Grade: ${c.grade || 'In Progress'}</p>
                <button class="btn-delete-course" data-id="${c.id}">🗑️</button>
            </div>
        `
      )
      .join('');

    grid.querySelectorAll('.btn-delete-course').forEach((btn) => {
      btn.addEventListener('click', () => deleteCourse(btn.dataset.id));
    });
  }
}

function deleteCourse(id) {
  let courses = JSON.parse(localStorage.getItem('edugateway_courses')) || [];
  courses = courses.filter((c) => c.id != id);
  localStorage.setItem('edugateway_courses', JSON.stringify(courses));
  loadCourses();
  showNotification('Course deleted', 'success');
}

function loadApplications() {
  const list = document.getElementById('applicationsList');
  if (!list) return;

  const applications = JSON.parse(localStorage.getItem('edugateway_applications')) || [];
  if (applications.length === 0) {
    list.innerHTML =
      '<div class="empty-state"><h3>📄 Applications</h3><p>Click "+ New Application" to track your university and job applications.</p></div>';
  } else {
    list.innerHTML = applications
      .map(
        (a) => `
            <div class="application-item" data-id="${a.id}">
                <div class="application-header">
                    <h4>${a.position || 'Position'} at ${a.organization || 'Organization'}</h4>
                    <span class="application-status ${a.status}">${a.status || 'pending'}</span>
                </div>
                <p>Deadline: ${a.deadline || 'Not set'}</p>
                <button class="btn-delete-application" data-id="${a.id}">🗑️</button>
            </div>
        `
      )
      .join('');

    list.querySelectorAll('.btn-delete-application').forEach((btn) => {
      btn.addEventListener('click', () => deleteApplication(btn.dataset.id));
    });
  }
}

function deleteApplication(id) {
  let applications = JSON.parse(localStorage.getItem('edugateway_applications')) || [];
  applications = applications.filter((a) => a.id != id);
  localStorage.setItem('edugateway_applications', JSON.stringify(applications));
  loadApplications();
  showNotification('Application deleted', 'success');
}

function loadScholarshipTracker() {
  const list = document.getElementById('scholarshipTrackerList');
  if (!list) return;

  const scholarships = JSON.parse(localStorage.getItem('edugateway_scholarship_tracker')) || [];
  if (scholarships.length === 0) {
    list.innerHTML =
      '<div class="empty-state"><h3>💰 Scholarships</h3><p>Click "+ Add Scholarship" to monitor your funding applications.</p></div>';
  } else {
    list.innerHTML = scholarships
      .map(
        (s) => `
            <div class="scholarship-tracker-item" data-id="${s.id}">
                <div class="scholarship-header">
                    <h4>${s.name || 'Scholarship'}</h4>
                    <span class="badge ${s.status}">${s.status || 'pending'}</span>
                </div>
                <p>Amount: ${s.amount || 'N/A'} | Deadline: ${s.deadline || 'N/A'}</p>
                <button class="btn-delete-scholarship-track" data-id="${s.id}">🗑️</button>
            </div>
        `
      )
      .join('');

    list.querySelectorAll('.btn-delete-scholarship-track').forEach((btn) => {
      btn.addEventListener('click', () => deleteScholarshipTrack(btn.dataset.id));
    });
  }
}

function deleteScholarshipTrack(id) {
  let scholarships = JSON.parse(localStorage.getItem('edugateway_scholarship_tracker')) || [];
  scholarships = scholarships.filter((s) => s.id != id);
  localStorage.setItem('edugateway_scholarship_tracker', JSON.stringify(scholarships));
  loadScholarshipTracker();
  showNotification('Scholarship removed from tracker', 'success');
}

function loadDeadlines() {
  const list = document.getElementById('allDeadlinesList');
  if (!list) return;

  const deadlines = JSON.parse(localStorage.getItem('edugateway_deadlines')) || [];
  const allDeadlines = [
    ...deadlines,
    ...goals
      .filter((g) => g.endDate)
      .map((g) => ({ id: 'goal-' + g.id, title: g.title, date: g.endDate, source: 'Goals' })),
  ];

  if (allDeadlines.length === 0) {
    list.innerHTML =
      '<div class="empty-state"><h3>⏰ Deadlines</h3><p>Click "+ Add Deadline" to track important dates.</p></div>';
  } else {
    const sorted = allDeadlines.sort((a, b) => new Date(a.date) - new Date(b.date));
    list.innerHTML = sorted
      .map((d) => {
        const daysLeft = Math.ceil((new Date(d.date) - new Date()) / 86400000);
        const isPast = daysLeft < 0;
        return `
                <div class="deadline-item ${isPast ? 'past' : ''}" data-id="${d.id}">
                    <div class="deadline-content">
                        <h4>${d.title}</h4>
                        <p>${new Date(d.date).toLocaleDateString()} ${d.source ? `(${d.source})` : ''}</p>
                    </div>
                    <span class="deadline-days ${isPast ? 'past' : daysLeft <= 7 ? 'urgent' : ''}">
                        ${isPast ? 'Past' : `${daysLeft}d left`}
                    </span>
                    ${!d.id.toString().startsWith('goal-') ? `<button class="btn-delete-deadline" data-id="${d.id}">🗑️</button>` : ''}
                </div>
            `;
      })
      .join('');

    list.querySelectorAll('.btn-delete-deadline').forEach((btn) => {
      btn.addEventListener('click', () => deleteDeadline(btn.dataset.id));
    });
  }
}

function deleteDeadline(id) {
  let deadlines = JSON.parse(localStorage.getItem('edugateway_deadlines')) || [];
  deadlines = deadlines.filter((d) => d.id != id);
  localStorage.setItem('edugateway_deadlines', JSON.stringify(deadlines));
  loadDeadlines();
  showNotification('Deadline deleted', 'success');
}

// Add button handlers with Modal Support
let currentAddType = null;

function openAddModal(type, title, fields) {
  currentAddType = type;
  const modal = document.getElementById('universalAddModal');
  const titleEl = document.getElementById('addModalTitle');
  const fieldsContainer = document.getElementById('addModalFields');

  if (!modal || !titleEl || !fieldsContainer) {
    // Fallback to prompt if modal doesn't exist
    return false;
  }

  titleEl.textContent = title;
  fieldsContainer.innerHTML = fields
    .map(
      (f) => `
        <div class="add-form-group">
            <label class="${f.required ? 'required' : ''}">${f.label}</label>
            ${f.type === 'textarea'
          ? `<textarea id="add_${f.name}" placeholder="${f.placeholder || ''}" ${f.required ? 'required' : ''}></textarea>`
          : f.type === 'select'
            ? `<select id="add_${f.name}" ${f.required ? 'required' : ''}>${f.options.map((o) => `<option value="${o.value}">${o.label}</option>`).join('')}</select>`
            : `<input type="${f.type || 'text'}" id="add_${f.name}" placeholder="${f.placeholder || ''}" ${f.required ? 'required' : ''}>`
        }
            ${f.helper ? `<div class="form-helper">${f.helper}</div>` : ''}
        </div>
    `
    )
    .join('');

  modal.classList.add('show');
  return true;
}

window.closeAddModal = function () {
  const modal = document.getElementById('universalAddModal');
  if (modal) modal.classList.remove('show');
  currentAddType = null;
};

// Initialize universal form submission
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('universalAddForm');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      handleAddSubmit();
    });
  }

  // Close modal on backdrop click
  const modal = document.getElementById('universalAddModal');
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeAddModal();
    });
  }
});

function handleAddSubmit() {
  switch (currentAddType) {
    case 'project':
      submitProject();
      break;
    case 'resource':
      submitResource();
      break;
    case 'course':
      submitCourse();
      break;
    case 'application':
      submitApplication();
      break;
    case 'scholarship':
      submitScholarshipTrack();
      break;
    case 'deadline':
      submitDeadline();
      break;
    case 'newpage':
      submitNewPage();
      break;
  }
  closeAddModal();
}

// ---------------------------------------------------------
// SPECIFIC FORM HANDLERS (Universities, Programs, Projects)
// ---------------------------------------------------------

// 1. My Universities
const uniBtn = document.querySelector('.js-add-university');
if (uniBtn) {
  uniBtn.addEventListener('click', () => {
    const m = document.getElementById('universityModal');
    const form = document.getElementById('universityForm');
    if (m && form) {
      form.reset();
      m.classList.add('show');
      const input = m.querySelector('input');
      if (input) setTimeout(() => input.focus(), 100);
    }
  });
}

const uniForm = document.getElementById('universityForm');
// Remove old listeners by cloning if necessary, but cleaner to just ensure single binding
if (uniForm) {
  // Use onsubmit property to prevent multiple listeners accumulation if referenced multiple times
  uniForm.onsubmit = (e) => {
    e.preventDefault();
    const name = document.getElementById('uniName').value;
    const location = document.getElementById('uniLocation').value;
    const status = document.getElementById('uniStatus').value;
    const chance = document.getElementById('uniChance').value;

    const newUni = {
      id: Date.now(),
      name,
      location,
      status,
      chance
    };

    let all = JSON.parse(localStorage.getItem('my_universities')) || [];
    all.push(newUni);
    localStorage.setItem('my_universities', JSON.stringify(all));

    // Update global state
    if (typeof myUniversities !== 'undefined') {
      myUniversities = all;
    }

    showNotification('University added!', 'success');
    document.getElementById('universityModal').classList.remove('show');
    uniForm.reset();
    if (typeof loadMyUniversities === 'function') loadMyUniversities();
  };
}

// 2. My Programs
const progBtn = document.querySelector('.js-add-program');
if (progBtn) {
  progBtn.addEventListener('click', () => {
    const m = document.getElementById('programModal');
    const form = document.getElementById('programForm');
    if (m && form) {
      form.reset();
      m.classList.add('show');
      const input = m.querySelector('input');
      if (input) setTimeout(() => input.focus(), 100);
    }
  });
}

const progForm = document.getElementById('programForm');
if (progForm) {
  progForm.onsubmit = (e) => {
    e.preventDefault();
    const name = document.getElementById('progName').value;
    const org = document.getElementById('progOrg').value;
    const deadline = document.getElementById('progDeadline').value;
    const status = document.getElementById('progStatus').value;

    const newProg = {
      id: Date.now(),
      name,
      org,
      deadline,
      status
    };

    let all = JSON.parse(localStorage.getItem('my_programs')) || [];
    all.push(newProg);
    localStorage.setItem('my_programs', JSON.stringify(all));

    if (typeof myPrograms !== 'undefined') {
      myPrograms = all;
    }

    showNotification('Program added!', 'success');
    document.getElementById('programModal').classList.remove('show');
    progForm.reset();
    if (typeof loadMyPrograms === 'function') loadMyPrograms();
  };
}

// 3. My Projects
const projBtn = document.getElementById('addNewProjectBtn');
if (projBtn) {
  // Replace logic handled in setupEventListeners for general project button, 
  // but here we specifically handle the modal opening for the separate project modal
  const newBtn = projBtn.cloneNode(true);
  projBtn.parentNode.replaceChild(newBtn, projBtn);
  newBtn.addEventListener('click', () => {
    const m = document.getElementById('projectModal');
    const form = document.getElementById('projectForm');
    if (m && form) {
      form.reset();
      m.classList.add('show');
      const input = m.querySelector('input');
      if (input) setTimeout(() => input.focus(), 100);
    }
  });
}

const projForm = document.getElementById('projectForm');
if (projForm) {
  projForm.onsubmit = (e) => {
    e.preventDefault();
    const name = document.getElementById('projName').value;
    const desc = document.getElementById('projDesc').value;
    const deadline = document.getElementById('projDeadline').value;
    const status = document.getElementById('projStatus').value;

    const newProj = {
      id: Date.now(),
      name,
      description: desc,
      deadline,
      status
    };

    let all = JSON.parse(localStorage.getItem('my_projects')) || [];
    all.push(newProj);
    localStorage.setItem('my_projects', JSON.stringify(all));

    showNotification('Project added!', 'success');
    document.getElementById('projectModal').classList.remove('show');
    projForm.reset();
    if (typeof loadProjects === 'function') loadProjects();
  };
}


// Project
function addResource() {
  const opened = openAddModal('resource', '🔗 Add Resource', [
    { name: 'title', label: 'Resource Title', required: true, placeholder: 'Enter resource name' },
    { name: 'url', label: 'URL', type: 'url', required: true, placeholder: 'https://example.com' },
    {
      name: 'notes',
      label: 'Notes',
      type: 'textarea',
      placeholder: 'Optional notes about this resource',
    },
  ]);
  if (!opened) {
    const title = prompt('Resource title:');
    if (!title) return;
    const url = prompt('Resource URL:');
    if (!url) return;
    const notes = prompt('Notes (optional):');
    const resources = JSON.parse(localStorage.getItem('edugateway_resources')) || [];
    resources.push({ id: Date.now(), title, url, notes, addedAt: new Date().toISOString() });
    localStorage.setItem('edugateway_resources', JSON.stringify(resources));
    loadResources();
    showNotification('Resource added!', 'success');
  }
}

function submitResource() {
  const title = document.getElementById('add_title')?.value;
  const url = document.getElementById('add_url')?.value;
  const notes = document.getElementById('add_notes')?.value;
  if (!title || !url) return;
  const resources = JSON.parse(localStorage.getItem('edugateway_resources')) || [];
  resources.push({ id: Date.now(), title, url, notes, addedAt: new Date().toISOString() });
  localStorage.setItem('edugateway_resources', JSON.stringify(resources));
  loadResources();
  showNotification('Resource added!', 'success');
}

function addCourse() {
  const opened = openAddModal('course', '📚 Add Course', [
    {
      name: 'name',
      label: 'Course Name',
      required: true,
      placeholder: 'e.g., Introduction to Computer Science',
    },
    { name: 'instructor', label: 'Instructor', placeholder: 'Professor name' },
    { name: 'credits', label: 'Credits', type: 'number', placeholder: '3' },
  ]);
  if (!opened) {
    const name = prompt('Course name:');
    if (!name) return;
    const instructor = prompt('Instructor name:');
    const credits = prompt('Credits:');
    const courses = JSON.parse(localStorage.getItem('edugateway_courses')) || [];
    courses.push({ id: Date.now(), name, instructor, credits, grade: 'In Progress' });
    localStorage.setItem('edugateway_courses', JSON.stringify(courses));
    loadCourses();
    showNotification('Course added!', 'success');
  }
}

function submitCourse() {
  const name = document.getElementById('add_name')?.value;
  const instructor = document.getElementById('add_instructor')?.value;
  const credits = document.getElementById('add_credits')?.value;
  if (!name) return;
  const courses = JSON.parse(localStorage.getItem('edugateway_courses')) || [];
  courses.push({ id: Date.now(), name, instructor, credits, grade: 'In Progress' });
  localStorage.setItem('edugateway_courses', JSON.stringify(courses));
  loadCourses();
  showNotification('Course added!', 'success');
}

function addApplication() {
  const opened = openAddModal('application', '📄 Add Application', [
    {
      name: 'position',
      label: 'Position/Program',
      required: true,
      placeholder: 'e.g., Software Engineer Intern',
    },
    {
      name: 'organization',
      label: 'Organization/University',
      required: true,
      placeholder: 'Company or school name',
    },
    { name: 'deadline', label: 'Deadline', type: 'date' },
  ]);
  if (!opened) {
    const position = prompt('Position/Program:');
    if (!position) return;
    const organization = prompt('Organization/University:');
    const deadline = prompt('Deadline (YYYY-MM-DD):');
    const applications = JSON.parse(localStorage.getItem('edugateway_applications')) || [];
    applications.push({ id: Date.now(), position, organization, deadline, status: 'pending' });
    localStorage.setItem('edugateway_applications', JSON.stringify(applications));
    loadApplications();
    showNotification('Application added!', 'success');
  }
}

function submitApplication() {
  const position = document.getElementById('add_position')?.value;
  const organization = document.getElementById('add_organization')?.value;
  const deadline = document.getElementById('add_deadline')?.value;
  if (!position) return;
  const applications = JSON.parse(localStorage.getItem('edugateway_applications')) || [];
  applications.push({ id: Date.now(), position, organization, deadline, status: 'pending' });
  localStorage.setItem('edugateway_applications', JSON.stringify(applications));
  loadApplications();
  showNotification('Application added!', 'success');
}

function addScholarshipTrack() {
  const opened = openAddModal('scholarship', '💰 Track Scholarship', [
    {
      name: 'name',
      label: 'Scholarship Name',
      required: true,
      placeholder: 'e.g., Gates Cambridge',
    },
    { name: 'amount', label: 'Amount', placeholder: 'e.g., $50,000' },
    { name: 'deadline', label: 'Application Deadline', type: 'date' },
  ]);
  if (!opened) {
    const name = prompt('Scholarship name:');
    if (!name) return;
    const amount = prompt('Amount:');
    const deadline = prompt('Deadline (YYYY-MM-DD):');
    const scholarships = JSON.parse(localStorage.getItem('edugateway_scholarship_tracker')) || [];
    scholarships.push({ id: Date.now(), name, amount, deadline, status: 'pending' });
    localStorage.setItem('edugateway_scholarship_tracker', JSON.stringify(scholarships));
    loadScholarshipTracker();
    showNotification('Scholarship added to tracker!', 'success');
  }
}

function submitScholarshipTrack() {
  const name = document.getElementById('add_name')?.value;
  const amount = document.getElementById('add_amount')?.value;
  const deadline = document.getElementById('add_deadline')?.value;
  if (!name) return;
  const scholarships = JSON.parse(localStorage.getItem('edugateway_scholarship_tracker')) || [];
  scholarships.push({ id: Date.now(), name, amount, deadline, status: 'pending' });
  localStorage.setItem('edugateway_scholarship_tracker', JSON.stringify(scholarships));
  loadScholarshipTracker();
  showNotification('Scholarship added to tracker!', 'success');
}

function addDeadline() {
  const opened = openAddModal('deadline', '⏰ Add Deadline', [
    { name: 'title', label: 'Deadline Title', required: true, placeholder: 'What is due?' },
    { name: 'date', label: 'Due Date', type: 'date', required: true },
  ]);
  if (!opened) {
    const title = prompt('Deadline title:');
    if (!title) return;
    const date = prompt('Date (YYYY-MM-DD):');
    if (!date) return;
    const deadlines = JSON.parse(localStorage.getItem('edugateway_deadlines')) || [];
    deadlines.push({ id: Date.now(), title, date });
    localStorage.setItem('edugateway_deadlines', JSON.stringify(deadlines));
    loadDeadlines();
    showNotification('Deadline added!', 'success');
  }
}

function submitDeadline() {
  const title = document.getElementById('add_title')?.value;
  const date = document.getElementById('add_date')?.value;
  if (!title || !date) return;
  const deadlines = JSON.parse(localStorage.getItem('edugateway_deadlines')) || [];
  deadlines.push({ id: Date.now(), title, date });
  localStorage.setItem('edugateway_deadlines', JSON.stringify(deadlines));
  loadDeadlines();
  showNotification('Deadline added!', 'success');
}

function saveQuickNote() {
  const noteText = document.getElementById('quickNote')?.value;
  if (!noteText) {
    showNotification('Please enter a note first', 'warning');
    return;
  }
  notes.unshift({
    id: Date.now(),
    title: 'Quick Note',
    content: noteText,
    updatedAt: new Date().toISOString(),
  });
  localStorage.setItem('edugateway_notes', JSON.stringify(notes));
  document.getElementById('quickNote').value = '';
  showNotification('Quick note saved!', 'success');
}

function addMilestone() {
  const container = document.getElementById('milestonesContainer');
  if (!container) return;
  const newMilestone = document.createElement('div');
  newMilestone.className = 'milestone-item';
  newMilestone.innerHTML = `
        <input type="text" placeholder="Add a milestone...">
        <button type="button" class="js-remove-milestone">×</button>
    `;
  container.appendChild(newMilestone);
}

function removeMilestone(btn) {
  btn.closest('.milestone-item').remove();
}

function createNewItem() {
  const opened = openAddModal('newpage', '➕ Create New', [
    {
      name: 'type',
      label: 'What would you like to create?',
      type: 'select',
      required: true,
      options: [
        { value: '1', label: '🎯 Goal' },
        { value: '2', label: '📝 Note' },
        { value: '3', label: '✅ Task' },
        { value: '4', label: '📁 Project' },
      ],
    },
    { name: 'title', label: 'Title (for Project)', placeholder: 'Enter title' },
  ]);
  if (!opened) {
    const choice = prompt('Create: 1. Goal 2. Note 3. Task 4. Project');
    if (choice === '1') openGoalModal();
    else if (choice === '2') openNoteModal();
    else if (choice === '3') window.addNewTask();
    else if (choice === '4') {
      const title = prompt('Project title:');
      if (!title) return;
      const projects = JSON.parse(localStorage.getItem('edugateway_projects')) || [];
      projects.push({ id: Date.now(), title, description: '', progress: 0 });
      localStorage.setItem('edugateway_projects', JSON.stringify(projects));
      switchSection('projects');
      showNotification('Project created!', 'success');
    }
  }
}

function submitNewPage() {
  const type = document.getElementById('add_type')?.value;
  const title = document.getElementById('add_title')?.value;

  if (type === '1') {
    closeAddModal();
    setTimeout(() => openGoalModal(), 100);
  } else if (type === '2') {
    closeAddModal();
    setTimeout(() => openNoteModal(), 100);
  } else if (type === '3') {
    window.addNewTask();
  } else if (type === '4') {
    if (!title) {
      showNotification('Please enter a project title', 'warning');
      return;
    }
    const projects = JSON.parse(localStorage.getItem('edugateway_projects')) || [];
    projects.push({ id: Date.now(), title, description: '', progress: 0 });
    localStorage.setItem('edugateway_projects', JSON.stringify(projects));
    switchSection('projects');
    showNotification('Project created!', 'success');
  }
}

function showTemplates() {
  const opened = openAddModal('template', '📋 Choose Template', [
    {
      name: 'template',
      label: 'Select a Template',
      type: 'select',
      required: true,
      options: [
        { value: 'study', label: '📚 Study Plan - Weekly schedule with subjects' },
        { value: 'project', label: '🚀 Project Manager - Tasks, milestones, timeline' },
        { value: 'blank', label: '📄 Blank Page - Start from scratch' },
      ],
    },
  ]);
  if (!opened) {
    const choice = prompt('Template: 1. Study Plan 2. Project Manager 3. Blank');
    applyTemplate(choice);
  }
}

function applyTemplate(choice) {
  if (choice === '1' || choice === 'study') {
    // Create a study plan goal
    goals.push({
      id: Date.now(),
      title: 'Weekly Study Plan',
      category: 'academic',
      priority: 'medium',
      progress: 0,
      status: 'active',
      milestones: [
        'Monday: Math',
        'Tuesday: Science',
        'Wednesday: English',
        'Thursday: History',
        'Friday: Review',
      ],
    });
    localStorage.setItem('edugateway_goals', JSON.stringify(goals));
    switchSection('goals');
    showNotification('Study Plan template created!', 'success');
  } else if (choice === '2' || choice === 'project') {
    // Create a project
    const projects = JSON.parse(localStorage.getItem('edugateway_projects')) || [];
    projects.push({
      id: Date.now(),
      title: 'New Project',
      description: 'Project created from template',
      progress: 0,
      tasks: ['Planning', 'Development', 'Testing', 'Launch'],
    });
    localStorage.setItem('edugateway_projects', JSON.stringify(projects));
    switchSection('projects');
    showNotification('Project Manager template created!', 'success');
  } else if (choice === '3' || choice === 'blank') {
    // Create a blank note
    notes.push({
      id: Date.now(),
      title: 'Untitled',
      content: '',
      updatedAt: new Date().toISOString(),
    });
    localStorage.setItem('edugateway_notes', JSON.stringify(notes));
    switchSection('notes');
    showNotification('Blank page created!', 'success');
  }
}

// Handle template submission from modal
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('universalAddForm');
  if (form) {
    form.addEventListener('submit', (e) => {
      if (currentAddType === 'template') {
        e.preventDefault();
        const template = document.getElementById('add_template')?.value;
        applyTemplate(template);
        closeAddModal();
      }
    });
  }
});

// Re-bind to actual implementations once defined
window.switchSection = switchSection;
window.toggleSidebar = toggleSidebar;
window.addResource = typeof addResource !== 'undefined' ? addResource : () => { };
window.addCourse = typeof addCourse !== 'undefined' ? addCourse : () => { };
window.addApplication = typeof addApplication !== 'undefined' ? addApplication : () => { };
window.addScholarshipTrack = typeof addScholarshipTrack !== 'undefined' ? addScholarshipTrack : () => { };
window.addDeadline = typeof addDeadline !== 'undefined' ? addDeadline : () => { };
window.createNewItem = typeof createNewItem !== 'undefined' ? createNewItem : () => { };
window.saveQuickNote = typeof saveQuickNote !== 'undefined' ? saveQuickNote : () => { };
window.addMilestone = typeof addMilestone !== 'undefined' ? addMilestone : () => { };
window.removeMilestone = typeof removeMilestone !== 'undefined' ? removeMilestone : () => { };
window.showTemplates = showTemplates;
window.applyTemplate = applyTemplate;
