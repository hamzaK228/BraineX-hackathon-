// Notion-like Goals and Productivity System - Fixed & Optimized
// Handles all functionality for the "My Goals" dashboard

// Global Function Exposure
let isSwitching = false;
window.switchSection = (id) => internalSwitchSection(id);
window.toggleSidebar = () => toggleSidebar();

// PROGRESS SECTION
window.loadProgress = function loadProgress() {
    console.log('Loading Progress Charts...');
    const goalsCtx = document.getElementById('goalsChart')?.getContext('2d');
    const progressCtx = document.getElementById('progressChart')?.getContext('2d');
    if (!goalsCtx || !progressCtx) return;

    const goals = window.goalsData || [];
    const completed = goals.filter(g => g.status === 'completed' || g.status === 'done').length;
    const active = goals.length - completed;

    if (window.Chart) {
        new Chart(goalsCtx, {
            type: 'doughnut',
            data: {
                labels: ['Completed', 'Active'],
                datasets: [{
                    data: [completed, active],
                    backgroundColor: ['#10b981', '#3b82f6'],
                    borderWidth: 0
                }]
            },
            options: { plugins: { legend: { position: 'bottom' } }, cutout: '70%' }
        });

        new Chart(progressCtx, {
            type: 'line',
            data: {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                datasets: [{
                    label: 'Goals Completed',
                    data: [2, 5, 3, 8, 5, completed],
                    borderColor: '#8b5cf6',
                    tension: 0.4,
                    fill: true,
                    backgroundColor: 'rgba(139, 92, 246, 0.1)'
                }]
            }
        });
    }

    const timeline = document.getElementById('achievementTimeline');
    if (timeline) {
        const completedItems = goals.filter(g => g.status === 'completed' || g.status === 'done');
        timeline.innerHTML = completedItems.map(g => `
            <div class="timeline-item">
                <div class="timeline-dot"></div>
                <div class="timeline-content">
                    <h4>${g.title}</h4>
                    <p>Archived on ${new Date().toLocaleDateString()}</p>
                </div>
            </div>
        `).join('') || '<p class="empty-state">No achievements yet. Keep going!</p>';
    }
};

// Global state using "Data" suffix to avoid DOM conflicts
window.goalsData = [];
window.tasksData = [];
window.notesData = [];
window.calendarEventsData = [];
window.userPages = [];
window.myUniversities = [];
window.myPrograms = [];
window.myProjects = [];
let weeklyFocus = [
    { emoji: '🎓', text: 'Complete scholarship applications' },
    { emoji: '📚', text: 'Prepare for midterm exams' },
];

async function initData() {
    try {
        const api = (window.BraineX && window.BraineX.apiRequest) ? window.BraineX : (window.authAPI && window.authAPI.apiRequest ? window.authAPI : { apiRequest: async () => ({ success: false }) });
        const response = await api.apiRequest('/goals');

        if (response && response.success && Array.isArray(response.data)) {
            window.goalsData = response.data.filter(i => i.type === 'goal');
            window.tasksData = response.data.filter(i => i.type === 'task');
            window.notesData = response.data.filter(i => i.type === 'note');
        } else {
            // Fallback to LocalStorage if API fails or returns invalid data
            console.warn('API unavailable or invalid response, loading from LocalStorage');
            loadFromLocalStorage();
        }
    } catch (err) {
        console.warn('Backend unavailable, using localized data:', err);
        loadFromLocalStorage();
    }

    // Normalize data
    window.goalsData.forEach(g => {
        g.progress = g.progress || 0;
        g.endDate = g.dueDate || g.endDate; // Normalize date field
    });

    // Handle initial routing
    const initialSection = window.location.hash.substring(1) || 'overview';
    internalSwitchSection(initialSection);
}

function loadFromLocalStorage() {
    window.goalsData = JSON.parse(localStorage.getItem('my_goals')) || [];
    window.tasksData = JSON.parse(localStorage.getItem('my_tasks')) || [];
    window.notesData = JSON.parse(localStorage.getItem('my_notes')) || [];
    window.calendarEventsData = JSON.parse(localStorage.getItem('my_deadlines')) || [];
    window.myUniversities = JSON.parse(localStorage.getItem('my_universities')) || [];
    window.myPrograms = JSON.parse(localStorage.getItem('my_programs')) || [];
    window.myProjects = JSON.parse(localStorage.getItem('my_projects')) || [];
    window.myCourses = JSON.parse(localStorage.getItem('my_courses')) || [];
    window.myApplications = JSON.parse(localStorage.getItem('my_applications')) || [];
    window.myScholarships = JSON.parse(localStorage.getItem('my_scholarships')) || [];

    // Populate defaults if empty
    if (window.goalsData.length === 0) {
        window.goalsData = [
            { id: 1, title: 'Complete Web Dev Bootcamp', category: 'career', priority: 'high', progress: 65, status: 'active', endDate: '2025-06-01' },
            { id: 2, title: 'Read 12 Books', category: 'personal', priority: 'medium', progress: 15, status: 'active', endDate: '2025-12-31' },
        ];
        localStorage.setItem('my_goals', JSON.stringify(window.goalsData));
    }
    if (window.tasksData.length === 0) {
        window.tasksData = [
            { id: 1, title: 'Clean up workspace', status: 'todo' },
            { id: 2, title: 'Update resume', status: 'in-progress' },
            { id: 3, title: 'Submit application', status: 'completed' },
        ];
        localStorage.setItem('my_tasks', JSON.stringify(window.tasksData));
    }
}

// Sidebar & Navigation
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const mainContent = document.querySelector('.main-content');
    if (sidebar) {
        sidebar.classList.toggle('closed');
        localStorage.setItem('brainex_sidebar_closed', sidebar.classList.contains('closed'));
    }
    if (mainContent) mainContent.classList.toggle('sidebar-closed');
}

function internalSwitchSection(sectionId) {
    console.log(`Switching to section: ${sectionId}`);
    if (!sectionId || isSwitching) {
        console.warn('Switch rejected: ' + (isSwitching ? 'already switching' : 'no sectionId'));
        return;
    }
    isSwitching = true;

    try {
        const cleanId = sectionId.startsWith('#') ? sectionId.substring(1) : sectionId;

        // Update UI Sections
        const sections = document.querySelectorAll('main > section, .content-section');
        console.log(`Found ${sections.length} sections to update`);
        sections.forEach(s => {
            s.classList.remove('active');
            s.style.display = 'none';
        });

        // Try to find by ID
        let target = document.getElementById(cleanId);
        if (!target && cleanId === 'overview') target = document.getElementById('overview');

        if (target) {
            console.log(`Section found: ${cleanId}`);
            target.classList.add('active');
            target.style.display = 'block';
        } else {
            console.warn(`Section not found: ${cleanId}. Falling back to overview.`);
            const overview = document.getElementById('overview');
            if (overview) {
                overview.style.display = 'block';
                overview.classList.add('active');
            }
        }

        // Update Sidebar Links
        document.querySelectorAll('.sidebar-link').forEach(l => {
            l.classList.remove('active');
            const href = l.getAttribute('href');
            if ((l.dataset.section === cleanId) || (href === `#${cleanId}`) || (href.endsWith(`/${cleanId}`))) {
                l.classList.add('active');
            }
        });

        loadSectionData(cleanId);

        // Mobile Support
        if (window.innerWidth <= 768) {
            const sidebar = document.getElementById('sidebar');
            if (sidebar && !sidebar.classList.contains('closed')) toggleSidebar();
        }
    } catch (e) {
        console.error('Error switching section:', e);
    } finally {
        isSwitching = false;
    }
}

function loadSectionData(id) {
    const loaders = {
        overview: loadDashboard,
        goals: loadGoals,
        progress: loadProgress,
        notes: loadNotes,
        tasks: loadTasks,
        calendar: loadCalendar,
        projects: loadProjects,
        resources: loadResources,
        courses: loadCourses,
        applications: loadApplications,
        'scholarships-tracker': loadScholarshipTracker,
        deadlines: loadDeadlines,
        'my-universities': loadMyUniversities,
        'my-programs': loadMyPrograms
    };
    if (loaders[id]) {
        try {
            loaders[id]();
        } catch (e) {
            console.error(`Error loading section ${id}:`, e);
            // Fallback for missing functions
            if (e instanceof ReferenceError) {
                console.warn(`Loader for ${id} is not yet implemented or missing.`);
            }
        }
    }
}


// DASHBOARD
function loadDashboard() {
    updateDashboardStats();
    loadUpcomingDeadlines();
    loadRecentGoals();
    loadWeeklyFocus();
}

// Update stats and charts
// Combined Dashboard Progress Updates
function updateDashboardStats() {
    console.log('Updating dashboard stats...');
    const goals = window.goalsData || JSON.parse(localStorage.getItem('my_goals')) || [];
    const total = goals.length;
    const completed = goals.filter(g => g.status === 'completed' || g.status === 'done').length;
    const active = total - completed;
    // Overall Progress Calculation (Average of all goals progress)
    const overallProgress = total > 0 ? Math.round(goals.reduce((s, g) => s + (parseInt(g.progress) || 0), 0) / goals.length) : 0;

    // Update Counts using IDs from notion.html
    if (document.getElementById('totalGoals')) document.getElementById('totalGoals').textContent = active;
    if (document.getElementById('progressPercent')) document.getElementById('progressPercent').textContent = overallProgress + '%';

    if (document.getElementById('completedTasks')) {
        const tasks = window.tasksData || JSON.parse(localStorage.getItem('my_tasks')) || [];
        const completedTasksCount = tasks.filter(t => t.status === 'done' || t.status === 'completed').length;
        document.getElementById('completedTasks').textContent = completedTasksCount;
    }

    if (document.getElementById('currentStreak')) {
        document.getElementById('currentStreak').textContent = '5';
    }

    // Force Chart Update
    if (window.loadProgress) window.loadProgress();
}

// VIEW PROJECT DETAILS
window.viewProject = (id) => {
    const project = createCRUD('my_projects', null, '').get(id);
    if (!project) return;

    const modal = document.getElementById('universalAddModal'); // Reusing this modal
    if (!modal) return;

    // Custom content for viewing
    const titleEl = document.getElementById('addModalTitle');
    const fieldsContainer = document.getElementById('addModalFields');

    titleEl.textContent = project.name;
    fieldsContainer.innerHTML = `
        <div class="project-view-details">
            <div class="view-row">
                <strong>Tech Stack:</strong> <span>${project.tech || 'N/A'}</span>
            </div>
            <div class="view-row">
                <strong>Status:</strong> <span class="badge ${project.status === 'Completed' ? 'badge-success' : 'badge-warning'}">${project.status}</span>
            </div>
             <div class="view-row">
                <strong>Link:</strong> <a href="${project.link}" target="_blank">${project.link || '#'}</a>
            </div>
            <hr>
            <div class="view-description" style="white-space: pre-wrap; line-height: 1.6; color: var(--text-color);">
                ${project.desc}
            </div>
        </div>
    `;

    modal.classList.add('show');
};

function calculateStreak() {
    return window.tasksData.some(t => t.status === 'completed') ? 5 : 0;
}

function loadUpcomingDeadlines() {
    const container = document.getElementById('upcomingDeadlines');
    if (!container) return;
    const upcoming = window.goalsData.filter(g => g.endDate && new Date(g.endDate) >= new Date()).slice(0, 3);

    container.innerHTML = upcoming.map(g => `
    <div class="deadline-item">
      <span class="deadline-title">${g.title}</span>
      <span class="deadline-days">${Math.ceil((new Date(g.endDate) - new Date()) / 86400000)}d left</span>
    </div>
  `).join('') || '<p class="empty-state">No upcoming deadlines</p>';
}

function loadRecentGoals() {
    const container = document.getElementById('recentGoals');
    if (!container) return;
    const recent = window.goalsData.slice(-3);
    container.innerHTML = recent.map(g => `
    <div class="goal-preview">
      <div class="goal-preview-title">${g.title}</div>
      <div class="goal-preview-progress">
        <div class="mini-progress-bar"><div class="mini-progress-fill" style="width:${g.progress}%"></div></div>
        <span>${g.progress}%</span>
      </div>
      <button class="btn-card-delete" data-action="delete-goal" data-id="${g.id}" title="Delete Goal">🗑️</button>
    </div>
  `).join('') || '<p class="empty-state">No goals yet</p>';
}

function loadWeeklyFocus() {
    const container = document.getElementById('weeklyFocus');
    if (!container) return;
    container.innerHTML = weeklyFocus.map((item, index) => `
    <div class="focus-item">
      <span class="focus-emoji">${item.emoji}</span>
      <span>${item.text}</span>
      <button class="btn-remove-focus" onclick="removeFocusItem(${index})">×</button>
    </div>
  `).join('');
}

window.removeFocusItem = (index) => {
    weeklyFocus.splice(index, 1);
    localStorage.setItem('edugateway_weekly_focus', JSON.stringify(weeklyFocus));
    loadWeeklyFocus();
};

window.editWeeklyFocus = () => {
    const text = prompt('Enter new focus item:');
    if (!text) return;
    const emoji = prompt('Enter an emoji (optional):', '🎯');
    weeklyFocus.push({ emoji: emoji || '🎯', text });
    localStorage.setItem('edugateway_weekly_focus', JSON.stringify(weeklyFocus));
    loadWeeklyFocus();
};

// GOALS
function loadGoals() {
    const container = document.getElementById('goalsContainer');
    if (!container) return;
    const filter = document.querySelector('.filter-btn.active')?.dataset.filter || 'all';
    const sort = document.getElementById('goalSort')?.value || 'date';

    let filtered = [...window.goalsData];
    if (filter !== 'all') filtered = filtered.filter(g => g.category === filter);

    filtered.sort((a, b) => {
        if (sort === 'progress') return (parseInt(b.progress) || 0) - (parseInt(a.progress) || 0);
        if (sort === 'priority') return ({ high: 3, medium: 2, low: 1 }[b.priority] || 0) - ({ high: 3, medium: 2, low: 1 }[a.priority] || 0);
        if (sort === 'deadline' || sort === 'date') {
            const dateA = new Date(a.endDate || a.date || '9999-12-31');
            const dateB = new Date(b.endDate || b.date || '9999-12-31');
            return dateA - dateB;
        }
        return b.id - a.id;
    });

    container.innerHTML = filtered.map(createGoalCard).join('') || '<p class="empty-state">No goals found.</p>';
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
        <button class="btn-action edit-goal-btn" data-action="edit-goal" data-id="${goal.id}">✏️</button>
        <div class="progress-control">
           <input type="range" class="progress-slider" min="0" max="100" value="${goal.progress}">
        </div>
        <button class="btn-action delete-goal-btn" data-action="delete-goal" data-id="${goal.id}">🗑️</button>
      </div>
    </div>
  `;
}

// Improved openGoalModal to handle editing correctly
function openGoalModal(id = null) {
    const modal = document.getElementById('goalModal');
    if (!modal) return;
    const form = document.getElementById('goalForm');

    if (id) {
        const g = window.goalsData.find(goal => goal.id === parseInt(id));
        if (g) {
            document.getElementById('goalTitle').value = g.title || '';
            // Safe set for selects
            const cat = document.getElementById('goalCategory');
            if (cat) cat.value = (g.category || 'career').toLowerCase();

            const prio = document.getElementById('goalPriority');
            if (prio) prio.value = (g.priority || 'medium').toLowerCase();

            document.getElementById('goalDescription').value = g.description || '';
            document.getElementById('goalStartDate').value = g.startDate || '';
            document.getElementById('goalEndDate').value = g.endDate || '';

            // Populate milestones
            const milestonesContainer = document.getElementById('milestonesContainer');
            milestonesContainer.innerHTML = '';
            if (g.milestones && g.milestones.length) {
                g.milestones.forEach(m => addMilestone(m));
            } else {
                addMilestone(); // Add one empty
            }

            modal.dataset.editingId = id;
        }
    } else {
        form.reset();
        document.getElementById('milestonesContainer').innerHTML = '';
        addMilestone(); // Add initial empty milestone
        delete modal.dataset.editingId;
    }
    modal.classList.add('show');
}

window.closeGoalModal = () => {
    const modal = document.getElementById('goalModal');
    if (modal) modal.classList.remove('show');
};

window.updateProgressImmediate = (id, val) => {
    const goal = window.goalsData.find(g => g.id === parseInt(id));
    if (goal) {
        goal.progress = parseInt(val);
        if (goal.progress === 100) goal.status = 'completed';
        localStorage.setItem('my_goals', JSON.stringify(window.goalsData));
        updateDashboardStats();
        const card = document.querySelector(`.goal-card[data-goal-id="${id}"]`);
        if (card) {
            card.querySelector('.progress-fill').style.width = val + '%';
            card.querySelector('.progress-text').textContent = val + '% complete';
        }
    }
};

window.deleteGoal = async (id) => {
    if (confirm('Delete goal?')) {
        // Local update first for immediate UI feedback
        window.goalsData = (window.goalsData || []).filter(g => String(g.id) !== String(id));
        localStorage.setItem('my_goals', JSON.stringify(window.goalsData));

        loadGoals();
        updateDashboardStats();
        showNotification('Goal deleted', 'success');

        // Background API call
        const api = window.BraineX && window.BraineX.apiRequest ? window.BraineX : null;
        if (api && api.apiRequest) {
            try {
                await api.apiRequest(`/goals/${id}`, { method: 'DELETE' });
            } catch (e) { console.error('API delete failed', e); }
        }
    }
};

// TASKS
function loadTasks() {
    const todoList = document.getElementById('todoTasks');
    const inProgressList = document.getElementById('inProgressTasks');
    const completedList = document.getElementById('completedTasks');
    if (!todoList) return;

    const render = (t) => `
    <div class="task-item">
      <span>${t.title}</span>
      <div class="task-btns">
        <button class="task-move-btn" data-action="move-task" data-id="${t.id}" data-status="todo">⭕</button>
        <button class="task-move-btn" data-action="move-task" data-id="${t.id}" data-status="in-progress">⏳</button>
        <button class="task-move-btn" data-action="move-task" data-id="${t.id}" data-status="completed">✅</button>
        <button class="task-delete-btn" data-action="delete-task" data-id="${t.id}">🗑️</button>
      </div>
    </div>
  `;

    todoList.innerHTML = window.tasksData.filter(t => t.status === 'todo').map(render).join('');
    inProgressList.innerHTML = window.tasksData.filter(t => t.status === 'in-progress').map(render).join('');
    if (completedList) completedList.innerHTML = window.tasksData.filter(t => t.status === 'completed').map(render).join('');
}

// Add Edit Task Feature
window.editTask = (id) => {
    const t = window.tasksData.find(task => task.id === parseInt(id));
    if (t) {
        const newTitle = prompt('Edit task title:', t.title);
        if (newTitle) {
            t.title = newTitle;
            localStorage.setItem('my_tasks', JSON.stringify(window.tasksData));
            loadTasks();
            showNotification('Task updated', 'success');
        }
    }
};

window.moveTask = async (id, s) => {
    // Local Optimistic Update
    const t = window.tasksData.find(task => task.id === parseInt(id));
    if (t) {
        t.status = s;
        localStorage.setItem('my_tasks', JSON.stringify(window.tasksData));
        loadTasks();
        updateDashboardStats();
    }

    const api = window.BraineX && window.BraineX.apiRequest ? window.BraineX : { apiRequest: async () => ({ success: false }) };
    if (api.apiRequest) {
        await api.apiRequest(`/goals/${id}`, { method: 'PUT', body: JSON.stringify({ status: s }) });
    }
};

window.deleteTask = async (id) => {
    if (confirm('Delete task?')) {
        window.tasksData = (window.tasksData || []).filter(t => String(t.id) !== String(id));
        localStorage.setItem('my_tasks', JSON.stringify(window.tasksData));

        loadTasks();
        updateDashboardStats();
        showNotification('Task deleted', 'success');

        const api = window.BraineX && window.BraineX.apiRequest ? window.BraineX : null;
        if (api && api.apiRequest) {
            try {
                await api.apiRequest(`/goals/${id}`, { method: 'DELETE' });
            } catch (e) { console.error('API delete failed', e); }
        }
    }
};

window.addNewTask = async () => {
    const t = prompt('Task title:');
    if (t) {
        const localId = Date.now();
        const newTask = { id: localId, type: 'task', title: t, status: 'todo' };
        window.tasksData.push(newTask);
        localStorage.setItem('my_tasks', JSON.stringify(window.tasksData));
        loadTasks();
        showNotification('Task added', 'success');

        const api = window.BraineX && window.BraineX.apiRequest ? window.BraineX : null;
        if (api && api.apiRequest) {
            try {
                const response = await api.apiRequest('/goals', {
                    method: 'POST',
                    body: JSON.stringify({ type: 'task', title: t, status: 'todo' })
                });
                if (response && response.success && response.data && response.data.id) {
                    const idx = window.tasksData.findIndex(task => task.id === localId);
                    if (idx !== -1) {
                        window.tasksData[idx].id = response.data.id;
                        localStorage.setItem('my_tasks', JSON.stringify(window.tasksData));
                        loadTasks();
                    }
                }
            } catch (e) { console.error('API task add failed', e); }
        }
    }
};

// NOTES
function loadNotes() {
    const grid = document.getElementById('notesGrid');
    if (!grid) return;
    grid.innerHTML = window.notesData.map(n => `
    <div class="note-card" data-id="${n.id}">
      <div data-action="open-note" data-id="${n.id}">
        <h4>${n.title}</h4>
        <p>${n.content ? n.content.replace(/<[^>]*>/g, '').substring(0, 50) : ''}...</p>
      </div>
      <button class="btn-delete-note" data-action="delete-note" data-id="${n.id}" title="Delete Note">×</button>
    </div>
  `).join('') || '<p class="empty-state">No notes.</p>';
}

window.deleteNote = (id) => {
    if (confirm('Delete this note?')) {
        window.notesData = window.notesData.filter(n => String(n.id) !== String(id));
        localStorage.setItem('my_notes', JSON.stringify(window.notesData));
        loadNotes();
        showNotification('Note deleted', 'success');
    }
};

function openNoteModal(id = null) {
    const modal = document.getElementById('noteModal');
    if (!modal) return;
    const title = document.getElementById('noteTitle');
    const content = document.getElementById('noteContent');
    if (id) {
        const n = window.notesData.find(note => note.id === parseInt(id));
        if (n) {
            title.value = n.title;
            content.innerHTML = n.content || '';
            modal.dataset.editingId = id;
        }
    } else {
        title.value = '';
        content.innerHTML = '';
        delete modal.dataset.editingId;
    }
    modal.classList.add('show');
}

window.saveNote = async () => {
    const title = document.getElementById('noteTitle').value || 'Untitled';
    const content = document.getElementById('noteContent').innerHTML;
    const modal = document.getElementById('noteModal');
    const editingId = modal.dataset.editingId;

    // Local Update
    const noteData = { type: 'note', title, content: content };

    if (editingId) {
        const idx = window.notesData.findIndex(n => n.id === parseInt(editingId));
        if (idx !== -1) {
            window.notesData[idx] = { ...window.notesData[idx], ...noteData };
        }
    } else {
        window.notesData.push({ id: Date.now(), ...noteData });
    }

    modal.classList.remove('show');
    loadNotes();
    showNotification('Note saved locally', 'success');

    // API Update
    const api = window.BraineX && window.BraineX.apiRequest ? window.BraineX : { apiRequest: async () => ({ success: false }) };
    if (api.apiRequest) {
        await api.apiRequest(editingId ? `/goals/${editingId}` : '/goals', {
            method: editingId ? 'PUT' : 'POST',
            body: JSON.stringify(noteData),
        });
    }
};

window.closeNoteModal = () => {
    const modal = document.getElementById('noteModal');
    if (modal) modal.classList.remove('show');
};

// CALENDAR (Improved Implementation)
let currentViewDate = new Date();
function loadCalendar() {
    const grid = document.getElementById('calendarDays');
    if (!grid) return;
    const date = currentViewDate;
    const monthHeader = document.getElementById('currentMonth');
    if (monthHeader) monthHeader.textContent = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

    const first = new Date(date.getFullYear(), date.getMonth(), 1).getDay();
    const days = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();

    // Get events for this month
    const allEvents = [...window.goalsData, ...window.myUniversities, ...window.myPrograms, ...window.myProjects, ...JSON.parse(localStorage.getItem('my_deadlines') || '[]')];

    let html = '';
    for (let i = 0; i < first; i++) html += '<div class="calendar-day empty"></div>';
    for (let i = 1; i <= days; i++) {
        // Find events for this day
        const dayDate = new Date(date.getFullYear(), date.getMonth(), i);
        const dayEvents = allEvents.filter(e => {
            const d = e.endDate || e.deadline || e.date;
            if (!d) return false;
            const target = new Date(d);
            return target.getDate() === i && target.getMonth() === date.getMonth() && target.getFullYear() === date.getFullYear();
        });

        html += `
        <div class="calendar-day" data-day="${i}">
            <span class="day-number">${i}</span>
            <div class="day-events">
                ${dayEvents.map(e => `<div class="day-event-dot" title="${e.title || e.name}"></div>`).join('')}
            </div>
        </div>`;
    }
    grid.innerHTML = html;

    // Load list
    const list = document.getElementById('eventsList');
    if (list) {
        // Show upcoming from all sources
        const upcoming = allEvents.filter(e => {
            const d = e.endDate || e.deadline || e.date;
            return d && new Date(d) >= new Date();
        }).sort((a, b) => new Date(a.endDate || a.deadline || a.date) - new Date(b.endDate || b.deadline || b.date)).slice(0, 5);

        list.innerHTML = upcoming.map(e => `
            <div class="event-item">
                <div class="event-date">${new Date(e.endDate || e.deadline || e.date).toLocaleDateString()}</div>
                <div class="event-title">${e.title || e.name}</div>
            </div>
         `).join('') || '<p class="empty-state">No upcoming events</p>';
    }
}

window.previousMonth = () => { currentViewDate.setMonth(currentViewDate.getMonth() - 1); loadCalendar(); };
window.nextMonth = () => { currentViewDate.setMonth(currentViewDate.getMonth() + 1); loadCalendar(); };

// UNIVERSAL ADD MODAL
let currentAddType = null;
let currentEditId = null;

function openAddModal(type, title, fields, editId = null, existingData = null) {
    currentAddType = type;
    currentEditId = editId;
    const modal = document.getElementById('universalAddModal');
    const titleEl = document.getElementById('addModalTitle');
    const fieldsContainer = document.getElementById('addModalFields');
    if (!modal) return false;

    titleEl.textContent = editId ? `Edit ${title.replace('Add ', '')}` : title;

    // Inject fields
    fieldsContainer.innerHTML = fields.map(f => {
        const val = existingData ? existingData[f.name] : '';
        if (f.type === 'textarea') {
            return `
            <div class="add-form-group">
              <label>${f.label}</label>
              <textarea id="add_${f.name}" placeholder="${f.placeholder || ''}" ${f.required ? 'required' : ''} rows="4">${val}</textarea>
            </div>
          `;
        }
        return `
        <div class="add-form-group">
          <label>${f.label}</label>
          <input type="${f.type || 'text'}" id="add_${f.name}" placeholder="${f.placeholder || ''}" value="${val}" ${f.required ? 'required' : ''}>
        </div>
      `;
    }).join('');

    // Show Modal
    modal.classList.add('show');

    // Save Context for Submit
    modal.dataset.type = type;
    modal.dataset.editId = existingData ? existingData.id : '';
};

// Universal Submit Handler moved to setupEventListeners

window.closeAddModal = () => {
    const modal = document.getElementById('universalAddModal');
    if (modal) modal.classList.remove('show');
    currentAddType = null;
    currentEditId = null;
};

// UNIVERSITIES, PROGRAMS, PROJECTS, RESOURCES (CRUD)
const createCRUD = (key, loadFn, itemName) => {
    return {
        add: (item) => {
            let items = JSON.parse(localStorage.getItem(key)) || [];
            if (currentEditId) {
                const idx = items.findIndex(i => i.id == currentEditId);
                if (idx !== -1) items[idx] = { ...items[idx], ...item, id: currentEditId }; // Keep ID
                showNotification(`${itemName} updated!`, 'success');
            } else {
                items.push(item);
                showNotification(`${itemName} added!`, 'success');
            }
            localStorage.setItem(key, JSON.stringify(items));
            loadFn();
            currentEditId = null;
            updateDashboardStats(); // Added this line
        },
        delete: (id) => {
            if (confirm(`Delete ${itemName}?`)) {
                let items = JSON.parse(localStorage.getItem(key)) || [];
                items = items.filter(i => String(i.id) !== String(id));
                localStorage.setItem(key, JSON.stringify(items));
                loadFn();
                showNotification(`${itemName} deleted`, 'success');
                updateDashboardStats(); // Added this line
            }
        },
        get: (id) => {
            let items = JSON.parse(localStorage.getItem(key)) || [];
            return items.find(i => String(i.id) === String(id));
        }
    };
};

function loadMyUniversities() {
    const container = document.getElementById('myUniversitiesGrid');
    if (!container) return;
    const items = JSON.parse(localStorage.getItem('my_universities')) || [];
    myUniversities = items;

    if (items.length === 0) container.innerHTML = '<div class="empty-state"><p>No universities added.</p></div>';
    else container.innerHTML = items.map(u => `
    <div class="goal-card">
      <h3>${u.name}</h3><p>${u.location}</p><p>Status: ${u.status}</p>
      <div class="action-buttons">
          <button class="btn-action" data-action="edit-university" data-id="${u.id}" title="Edit">✏️</button>
          <button class="btn-action text-danger" data-action="delete-university" data-id="${u.id}">Remove</button>
      </div>
    </div>
  `).join('');
}
window.deleteUniversity = (id) => createCRUD('my_universities', loadMyUniversities, 'University').delete(id);
window.editUniversity = (id) => {
    const u = createCRUD('my_universities', null, '').get(id);
    if (u) {
        document.getElementById('uniName').value = u.name;
        document.getElementById('uniLocation').value = u.location;
        document.getElementById('uniStatus').value = u.status;
        document.getElementById('uniChance').value = u.chance;
        currentEditId = id; // Hook for specific modals if needed, though specific modals use own form logic usually
        // For specific modals, we need to populate them manually as they don't use openAddModal
        document.getElementById('universityModal').classList.add('show');
        // Hack: Store editing ID on the form or global
        document.getElementById('universityForm').dataset.editingId = id;
    }
};

function loadMyPrograms() {
    const container = document.getElementById('myProgramsGrid');
    if (!container) return;
    const items = JSON.parse(localStorage.getItem('my_programs')) || [];
    myPrograms = items;

    if (items.length === 0) container.innerHTML = '<div class="empty-state"><p>No programs added.</p></div>';
    else container.innerHTML = items.map(p => `
    <div class="goal-card">
      <h3>${p.name}</h3><p>${p.org}</p><p>Deadline: ${p.deadline}</p>
      <div class="action-buttons">
        <button class="btn-action" data-action="edit-program" data-id="${p.id}" title="Edit">✏️</button>
        <button class="btn-action text-danger" data-action="delete-program" data-id="${p.id}">Remove</button>
      </div>
    </div>
  `).join('');
}
window.deleteProgram = (id) => createCRUD('my_programs', loadMyPrograms, 'Program').delete(id);
window.editProgram = (id) => {
    const p = createCRUD('my_programs', null, '').get(id);
    if (p) {
        document.getElementById('progName').value = p.name;
        document.getElementById('progOrg').value = p.org;
        document.getElementById('progDeadline').value = p.deadline;
        document.getElementById('progStatus').value = p.status;
        currentEditId = id;
        document.getElementById('programModal').classList.add('show');
    }
};

function loadProjects() {
    console.log('Loading Projects...');
    const list = document.getElementById('projectsGrid');
    if (!list) return;
    const items = JSON.parse(localStorage.getItem('my_projects')) || [];

    list.innerHTML = items.map(p => `
    <div class="project-card" style="cursor: pointer;" onclick="if(!event.target.closest('button')) window.viewProject(${p.id})">
        <div class="project-header">
            <h4>${p.name}</h4>
            <span class="badge ${p.status === 'Completed' ? 'badge-success' : 'badge-warning'}">${p.status}</span>
        </div>
        <p>${p.desc}</p>
        <div class="project-footer">
            <span>${p.tech}</span>
            <div class="project-actions">
                <button class="btn-action btn-sm" data-action="edit-project" data-id="${p.id}">✏️</button>
                <button class="btn-action btn-sm text-danger" data-action="delete-project" data-id="${p.id}">🗑️</button>
            </div>
        </div>
    </div>
    `).join('') || '<div class="empty-state"><p>No projects yet.</p></div>';
}

window.deleteProject = (id) => createCRUD('my_projects', loadProjects, 'Project').delete(id);
window.editProject = (id) => {
    console.log('Editing Project', id);
    const p = createCRUD('my_projects', null, '').get(id);
    if (p) {
        openAddModal('project', 'Project Details', [
            { name: 'name', label: 'Project Name', required: true },
            { name: 'desc', label: 'Description', type: 'textarea' },
            { name: 'tech', label: 'Tech Stack' },
            { name: 'status', label: 'Status' },
            { name: 'link', label: 'Project Link' }
        ], id, p);
    }
};


function loadResources() {
    const grid = document.getElementById('resourcesGrid');
    if (!grid) return;
    const items = JSON.parse(localStorage.getItem('my_resources')) || [];

    grid.innerHTML = items.map(r => `
    <div class="resource-card">
      <h4><a href="${r.url}" target="_blank">${r.title}</a></h4><p>${r.notes}</p>
      <div class="action-buttons">
         <button class="btn-delete-resource" data-action="edit-resource" data-id="${r.id}" style="background:none; border:none; cursor:pointer;">✏️</button>
         <button class="btn-delete-resource" data-action="delete-resource" data-id="${r.id}">Remove</button>
      </div>
    </div>
    `).join('') || '<div class="empty-state"><p>No resources.</p></div>';
}
window.deleteResource = (id) => createCRUD('my_resources', loadResources, 'Resource').delete(id);
window.editResource = (id) => {
    const r = createCRUD('my_resources', null, '').get(id);
    if (r) {
        openAddModal('resource', 'Add Resource', [
            { name: 'title', label: 'Resource Title', required: true },
            { name: 'url', label: 'URL', required: true },
            { name: 'notes', label: 'Notes', placeholder: 'Optional description' }
        ], id, r);
    }
};

// --- NEW IMPLEMENTATIONS FOR MISSING SECTIONS ---

function loadCourses() {
    const grid = document.getElementById('coursesGrid');
    if (!grid) return;
    const items = JSON.parse(localStorage.getItem('my_courses')) || [];

    grid.innerHTML = items.map(c => `
    <div class="goal-card">
        <h3>${c.name}</h3><p>${c.code || ''}</p>
        <div class="progress-bar"><div class="progress-fill" style="width:${c.progress || 0}%"></div></div>
        <div class="action-buttons">
            <button class="btn-action" data-action="edit-course" data-id="${c.id}">✏️</button>
            <button class="btn-action text-danger" data-action="delete-course" data-id="${c.id}">Remove</button>
        </div>
    </div>
    `).join('') || '<div class="empty-state"><p>No courses added.</p></div>';
}
window.deleteCourse = (id) => createCRUD('my_courses', loadCourses, 'Course').delete(id);
window.editCourse = (id) => {
    const c = createCRUD('my_courses', null, '').get(id);
    if (c) {
        openAddModal('course', 'Add Course', [
            { name: 'name', label: 'Course Name', required: true },
            { name: 'code', label: 'Course Code (e.g. CS101)' },
            { name: 'progress', label: 'Progress %', type: 'number' },
            { name: 'credits', label: 'Credits', type: 'number' },
            { name: 'semester', label: 'Semester' }
        ], id, c);
    }
};

function loadApplications() {
    const list = document.getElementById('applicationsList');
    if (!list) return;
    const items = JSON.parse(localStorage.getItem('my_applications')) || [];

    list.innerHTML = items.map(a => `
    <div class="task-item">
        <span>${a.position} at ${a.company}</span>
        <span class="goal-priority ${a.status === 'Applied' ? 'medium' : 'low'}">${a.status}</span>
        <div class="task-btns">
             <button class="task-move-btn" data-action="edit-application" data-id="${a.id}">✏️</button>
             <button class="task-delete-btn" data-action="delete-application" data-id="${a.id}">🗑️</button>
        </div>
    </div>
    `).join('') || '<div class="empty-state"><p>No applications tracked.</p></div>';
}
window.deleteApplication = (id) => createCRUD('my_applications', loadApplications, 'Application').delete(id);
window.editApplication = (id) => {
    const a = createCRUD('my_applications', null, '').get(id);
    if (a) {
        openAddModal('application', 'Add Application', [
            { name: 'position', label: 'Position/Role', required: true },
            { name: 'company', label: 'Company/Organization', required: true },
            { name: 'status', label: 'Status' },
            { name: 'dateApplied', label: 'Date Applied', type: 'date' },
            { name: 'link', label: 'Link to Posting/Portal' }
        ], id, a);
    }
};

function loadScholarshipTracker() {
    const list = document.getElementById('scholarshipTrackerList');
    if (!list) return;
    const items = JSON.parse(localStorage.getItem('my_scholarships')) || [];

    list.innerHTML = items.map(s => `
    <div class="task-item">
        <span>${s.name}</span>
        <span class="goal-priority high">${s.amount || 'N/A'}</span>
        <div class="task-btns">
            <button class="task-move-btn" data-action="edit-scholarship" data-id="${s.id}">✏️</button>
            <button class="task-delete-btn" data-action="delete-scholarship" data-id="${s.id}">🗑️</button>
        </div>
    </div>
    `).join('') || '<div class="empty-state"><p>No scholarships tracked.</p></div>';
}
window.deleteScholarshipTrack = (id) => createCRUD('my_scholarships', loadScholarshipTracker, 'Scholarship').delete(id);
window.editScholarshipTrack = (id) => {
    const s = createCRUD('my_scholarships', null, '').get(id);
    if (s) {
        openAddModal('scholarship', 'Track Scholarship', [
            { name: 'name', label: 'Scholarship Name', required: true },
            { name: 'amount', label: 'Amount' },
            { name: 'deadline', label: 'Deadline', type: 'date' },
            { name: 'status', label: 'Status' }
        ], id, s);
    }
};

function loadDeadlines() {
    const grid = document.getElementById('allDeadlinesList');
    if (!grid) return;
    const items = JSON.parse(localStorage.getItem('my_deadlines')) || [];

    grid.innerHTML = items.map(d => {
        const priorityClass = (d.priority || 'medium').toLowerCase();
        return `
        <div class="deadline-card ${priorityClass}">
            <div class="deadline-card-header">
                <span class="deadline-card-category">${d.type || 'General'}</span>
                <span class="goal-priority ${priorityClass}">${d.priority || 'Medium'}</span>
            </div>
            <h3 class="deadline-card-title">${d.title}</h3>
            <div class="deadline-card-footer">
                <div class="deadline-card-date">
                    <span class="emoji">📅</span>
                    <span>${d.date}</span>
                </div>
                <div class="deadline-card-actions">
                    <button class="btn-icon-action" data-action="edit-deadline" data-id="${d.id}" title="Edit">✏️</button>
                    <button class="btn-icon-action delete" data-action="delete-deadline" data-id="${d.id}" title="Delete">×</button>
                </div>
            </div>
        </div>
        `;
    }).join('') || '<div class="empty-state"><p>No upcoming deadlines.</p></div>';
}
window.deleteDeadline = (id) => createCRUD('my_deadlines', loadDeadlines, 'Deadline').delete(id);
window.editDeadline = (id) => {
    const d = createCRUD('my_deadlines', null, '').get(id);
    if (d) {
        openAddModal('deadline', 'Add Deadline', [
            { name: 'title', label: 'Task/Goal', required: true },
            { name: 'date', label: 'Due Date', type: 'date', required: true },
            { name: 'priority', label: 'Priority' },
            { name: 'type', label: 'Category' }
        ], id, d);
    }
};

// EVENT LISTENERS
function setupEventListeners() {
    console.log('Setting up event listeners...');

    // Navigation Hash Listener
    window.addEventListener('hashchange', () => {
        internalSwitchSection(window.location.hash.substring(1));
    });

    // General Switch Section Buttons (e.g. "View All Notes")
    document.querySelectorAll('.js-switch-section').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const section = e.target.getAttribute('data-section');
            if (section) internalSwitchSection(section);
        });
    });

    // Sidebar Toggling
    document.querySelectorAll('.js-toggle-sidebar').forEach(btn => {
        btn.addEventListener('click', toggleSidebar);
    });

    // Goals Filter & Sort
    document.querySelector('.filter-buttons')?.addEventListener('click', (e) => {
        if (e.target.classList.contains('filter-btn')) {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            loadGoals();
        }
    });

    document.getElementById('goalSort')?.addEventListener('change', () => loadGoals());

    // Goals CRUD
    document.querySelector('.js-open-goal-modal')?.addEventListener('click', () => openGoalModal());
    document.querySelectorAll('.js-close-goal-modal').forEach(b => b.addEventListener('click', closeGoalModal));



    document.getElementById('goalsContainer')?.addEventListener('input', (e) => {
        if (e.target.classList.contains('progress-slider')) {
            const id = e.target.closest('.goal-card').dataset.goalId;
            window.updateProgressImmediate(id, e.target.value);
        }
    });

    document.getElementById('goalForm')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = document.getElementById('goalModal').dataset.editingId;
        const milestones = Array.from(document.querySelectorAll('.milestone-item input')).map(i => i.value).filter(v => v.trim() !== '');

        const data = {
            type: 'goal',
            title: document.getElementById('goalTitle').value,
            category: document.getElementById('goalCategory').value,
            priority: document.getElementById('goalPriority').value,
            description: document.getElementById('goalDescription').value,
            startDate: document.getElementById('goalStartDate').value,
            endDate: document.getElementById('goalEndDate').value,
            milestones: milestones,
            progress: 0,
            status: 'active'
        };

        const btn = e.target.querySelector('button[type="submit"]');
        if (btn) btn.disabled = true;

        try {
            let savedGoal;
            if (id) {
                const idx = window.goalsData.findIndex(g => g.id === parseInt(id));
                if (idx !== -1) {
                    window.goalsData[idx] = { ...window.goalsData[idx], ...data };
                    savedGoal = window.goalsData[idx];
                }
            } else {
                const localId = Date.now();
                savedGoal = { id: localId, ...data };
                window.goalsData.push(savedGoal);
            }

            localStorage.setItem('my_goals', JSON.stringify(window.goalsData));
            closeGoalModal();
            loadGoals();
            updateDashboardStats();
            showNotification(id ? 'Goal updated!' : 'Goal created!', 'success');

            // Background API sync
            const api = window.BraineX && window.BraineX.apiRequest ? window.BraineX : null;
            if (api && api.apiRequest) {
                const res = await api.apiRequest(id ? `/goals/${id}` : '/goals', {
                    method: id ? 'PUT' : 'POST',
                    body: JSON.stringify(data)
                });
                if (!id && res && res.success && res.data && res.data.id) {
                    savedGoal.id = res.data.id;
                    localStorage.setItem('my_goals', JSON.stringify(window.goalsData));
                    loadGoals();
                }
            }
        } catch (err) {
            console.error("Error saving goal:", err);
            showNotification('Error saving goal.', 'error');
        } finally {
            if (btn) btn.disabled = false;
        }
    });

    document.querySelector('.js-add-milestone')?.addEventListener('click', () => addMilestone());
    document.getElementById('milestonesContainer')?.addEventListener('click', (e) => {
        if (e.target.closest('.js-remove-milestone')) removeMilestone(e.target.closest('.js-remove-milestone'));
    });

    // Notes CRUD
    document.getElementById('createNewNoteBtn')?.addEventListener('click', () => openNoteModal());
    document.querySelectorAll('.js-close-note-modal').forEach(b => b.addEventListener('click', closeNoteModal));
    document.getElementById('saveNoteBtn')?.addEventListener('click', window.saveNote);
    document.querySelector('.js-save-quick-note')?.addEventListener('click', () => {
        const text = document.getElementById('quickNote').value;
        if (text) {
            window.notesData.push({ id: Date.now(), title: 'Quick Note', content: text, date: new Date().toLocaleDateString() });
            localStorage.setItem('my_notes', JSON.stringify(window.notesData));
            document.getElementById('quickNote').value = '';
            showNotification('Quick note saved!', 'success');
            if (document.getElementById('notes').classList.contains('active')) loadNotes();
        }
    });

    // Universal Add Modal Generic Setup
    document.querySelector('.js-add-resource')?.addEventListener('click', () => {
        openAddModal('resource', 'Add Resource', [
            { name: 'title', label: 'Resource Title', required: true },
            { name: 'url', label: 'URL', required: true },
            { name: 'notes', label: 'Notes', placeholder: 'Optional description' }
        ]);
    });
    document.querySelector('.js-add-course')?.addEventListener('click', () => {
        openAddModal('course', 'Add Course', [
            { name: 'name', label: 'Course Name', required: true },
            { name: 'code', label: 'Course Code' },
            { name: 'progress', label: 'Progress %', type: 'number' },
            { name: 'credits', label: 'Credits', type: 'number' }
        ]);
    });
    document.querySelector('.js-add-application')?.addEventListener('click', () => {
        openAddModal('application', 'Add Application', [
            { name: 'position', label: 'Position', required: true },
            { name: 'company', label: 'Company', required: true },
            { name: 'status', label: 'Status' },
            { name: 'dateApplied', label: 'Date Applied', type: 'date' }
        ]);
    });
    document.querySelector('.js-add-scholarship-track')?.addEventListener('click', () => {
        openAddModal('scholarship', 'Track Scholarship', [
            { name: 'name', label: 'Scholarship Name', required: true },
            { name: 'amount', label: 'Amount' },
            { name: 'deadline', label: 'Deadline', type: 'date' }
        ]);
    });
    document.querySelector('.js-add-deadline')?.addEventListener('click', () => {
        openAddModal('deadline', 'Add Deadline', [
            { name: 'title', label: 'Deadline Title', required: true },
            { name: 'date', label: 'Due Date', type: 'date', required: true },
            { name: 'type', label: 'Category' }
        ]);
    });

    // Tasks & Projects
    document.getElementById('addNewTaskBtn')?.addEventListener('click', () => {
        openAddModal('task', 'New Task', [
            { name: 'title', label: 'Task Title', required: true },
            { name: 'status', label: 'Status (todo, in-progress, done)' },
            { name: 'priority', label: 'Priority' }
        ]);
    });
    document.getElementById('addNewProjectBtn')?.addEventListener('click', () => {
        openAddModal('project', 'New Project', [
            { name: 'name', label: 'Project Name', required: true },
            { name: 'desc', label: 'Description', type: 'textarea' },
            { name: 'tech', label: 'Tech Stack' },
            { name: 'link', label: 'Link' }
        ]);
    });

    // Calendar
    document.getElementById('prevMonthBtn')?.addEventListener('click', window.previousMonth);
    document.getElementById('nextMonthBtn')?.addEventListener('click', window.nextMonth);
    document.getElementById('addCalendarEventBtn')?.addEventListener('click', () => {
        openAddModal('deadline', 'Add Event', [
            { name: 'title', label: 'Event Title', required: true },
            { name: 'date', label: 'Date', type: 'date', required: true }
        ]);
    });

    // delegation for deletion/moves

    document.addEventListener('click', (e) => {
        const target = e.target.closest('[data-action]');
        if (!target) return;

        const action = target.dataset.action;
        const id = target.dataset.id;

        if (action.startsWith('edit-') || action.startsWith('delete-') || action === 'open-note') {
            e.stopPropagation();
        }

        switch (action) {
            case 'move-task': window.moveTask(id, target.dataset.status); break;
            case 'edit-university': window.editUniversity(id); break;
            case 'delete-university': window.deleteUniversity(id); break;
            case 'edit-program': window.editProgram(id); break;
            case 'delete-program': window.deleteProgram(id); break;
            case 'edit-project': window.editProject(id); break;
            case 'delete-project': window.deleteProject(id); break;
            case 'edit-resource': window.editResource(id); break;
            case 'delete-resource': window.deleteResource(id); break;
            case 'edit-course': window.editCourse(id); break;
            case 'delete-course': window.deleteCourse(id); break;
            case 'edit-application': window.editApplication(id); break;
            case 'delete-application': window.deleteApplication(id); break;
            case 'edit-scholarship': window.editScholarshipTrack(id); break;
            case 'delete-scholarship': window.deleteScholarshipTrack(id); break;
            case 'edit-deadline': window.editDeadline(id); break;
            case 'delete-deadline': window.deleteDeadline(id); break;
            case 'delete-note': window.deleteNote(id); break;
            case 'open-note': window.openNoteModal(id); break;
            case 'delete-goal': window.deleteGoal(id); break;
            case 'edit-goal': window.openGoalModal(id); break;
            case 'delete-task': window.deleteTask(id); break;
        }
    });


    // specialized modals
    document.querySelector('.js-add-university')?.addEventListener('click', () => {
        document.getElementById('universityForm')?.reset();
        document.getElementById('universityModal')?.classList.add('show');
    });
    document.querySelector('.js-add-program')?.addEventListener('click', () => {
        document.getElementById('programForm')?.reset();
        document.getElementById('programModal')?.classList.add('show');
    });

    // Universal Add Form Handler
    const universalForm = document.getElementById('universalAddForm');
    const universalModal = document.getElementById('universalAddModal');
    if (universalForm) {
        universalForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const type = universalModal.dataset.type;
            const editId = universalModal.dataset.editId;
            const id = editId ? parseInt(editId) : Date.now();

            const data = { id };
            const inputs = universalForm.querySelectorAll('input, textarea, select');
            inputs.forEach(input => {
                const name = input.id.replace('add_', '');
                data[name] = input.value;
            });

            console.log('Universal Add Submit:', type, data);

            if (type === 'task') {
                const tasks = JSON.parse(localStorage.getItem('my_tasks') || '[]');
                if (editId) {
                    const idx = tasks.findIndex(t => t.id == editId);
                    if (idx !== -1) tasks[idx] = { ...tasks[idx], ...data };
                } else {
                    tasks.push({ ...data, status: data.status || 'todo', completed: false });
                }
                localStorage.setItem('my_tasks', JSON.stringify(tasks));
                window.tasksData = tasks;
                loadTasks();
            } else if (type === 'project') {
                createCRUD('my_projects', loadProjects, 'Project').add(data);
            } else if (type === 'resource') {
                createCRUD('my_resources', loadResources, 'Resource').add(data);
            } else if (type === 'course') {
                createCRUD('my_courses', loadCourses, 'Course').add(data);
            } else if (type === 'application') {
                createCRUD('my_applications', loadApplications, 'Application').add(data);
            } else if (type === 'scholarship') {
                createCRUD('my_scholarships', loadScholarshipTracker, 'Scholarship').add(data);
            } else if (type === 'deadline') {
                const deadlines = JSON.parse(localStorage.getItem('my_deadlines') || '[]');
                if (editId) {
                    const idx = deadlines.findIndex(d => d.id == editId);
                    if (idx !== -1) deadlines[idx] = { ...deadlines[idx], ...data };
                } else {
                    deadlines.push(data);
                }
                localStorage.setItem('my_deadlines', JSON.stringify(deadlines));
                window.calendarEventsData = deadlines;
                loadDeadlines();
                if (window.loadCalendar) window.loadCalendar();
            }

            window.closeAddModal();
            universalForm.reset();
            updateDashboardStats();
        });
    }

    // Explicit binding for close buttons to ensure they work even if onclick fails
    document.querySelectorAll('.add-modal-close, .btn-add-cancel').forEach(btn => {
        btn.addEventListener('click', window.closeAddModal);
    });
}


// Migration & Sync Helper
function syncState() {
    // Migrate old keys if they exist
    const oldKeys = {
        'edugateway_tasks': 'my_tasks',
        'edugateway_resources': 'my_resources',
        'my_scholarships_tracked': 'my_scholarships'
    };

    for (const [oldKey, newKey] of Object.entries(oldKeys)) {
        const val = localStorage.getItem(oldKey);
        if (val && !localStorage.getItem(newKey)) {
            localStorage.setItem(newKey, val);
            localStorage.removeItem(oldKey);
        }
    }

    // Sync global window arrays
    window.tasksData = JSON.parse(localStorage.getItem('my_tasks')) || [];
    window.goalsData = JSON.parse(localStorage.getItem('my_goals')) || [];
    window.notesData = JSON.parse(localStorage.getItem('my_notes')) || [];
    window.calendarEventsData = JSON.parse(localStorage.getItem('my_deadlines')) || [];
}
syncState();


function addMilestone(val = '') {
    const container = document.getElementById('milestonesContainer');
    if (!container) return;
    const div = document.createElement('div');
    div.className = 'milestone-item';
    div.innerHTML = `<input type="text" placeholder="Add a milestone..." value="${val}"> <button type="button" class="js-remove-milestone">×</button>`;
    container.appendChild(div);
}

function removeMilestone(btn) {
    btn.closest('.milestone-item').remove();
}

function showNotification(msg, type) {
    // Basic toast fallback if interaction lib not valid
    if (window.Toast) {
        window.Toast.show(msg, type);
    } else {
        alert(msg);
    }
}

// Initialization
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM Content Loaded. Initializing...');
    loadFromLocalStorage();
    setupEventListeners();
    initData().finally(() => {
        console.log('System initialized.');
        updateDashboardStats();
    });

    // Auth Listeners Fixes
    const loginLink = document.querySelector('a[href="#login"]');
    const signupLink = document.querySelector('a[href="#signup"]');
    if (loginLink) loginLink.addEventListener('click', (e) => { e.preventDefault(); window.location.href = '/pages/main.html?#login'; });
    if (signupLink) signupLink.addEventListener('click', (e) => { e.preventDefault(); window.location.href = '/pages/main.html?#signup'; });

    const homeLink = document.querySelector('nav .nav-menu a[href="/"]');
    if (homeLink) homeLink.href = '/pages/main.html';
});

// Ensure all major loaders are available globally for the Switcher and DOM Events
window.loadDashboard = loadDashboard;
window.loadGoals = loadGoals;
window.loadNotes = loadNotes;
window.loadTasks = loadTasks;
window.loadCalendar = loadCalendar;
window.loadProjects = loadProjects;
window.loadResources = loadResources;
window.loadCourses = loadCourses;
window.loadScholarshipTracker = loadScholarshipTracker;
window.loadApplications = loadApplications;
window.loadDeadlines = loadDeadlines;
window.loadMyUniversities = loadMyUniversities;
window.loadMyPrograms = loadMyPrograms;
window.moveTask = moveTask;

// Also export modal opener functions
window.openGoalModal = openGoalModal;
window.openNoteModal = openNoteModal;
window.openAddModal = openAddModal;
window.closeAddModal = closeAddModal;
window.viewProject = viewProject;
window.editProject = editProject;
window.deleteProject = deleteProject;
window.saveNote = saveNote;
window.closeNoteModal = closeNoteModal;
window.calculateStreak = calculateStreak;
window.updateDashboardStats = updateDashboardStats;
