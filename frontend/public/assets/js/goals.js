// Goals & Productivity Management
// Replaces Notion integration with local/backend storage

const API_BASE_URL = '/api/goals';

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  if (localStorage.getItem('accessToken')) {
    loadDashboardData();
    setupGoalEventListeners();
  } else {
    // Redirect or show login (handled by global.js)
  }
});

function setupGoalEventListeners() {
  // Goals
  const addGoalBtn = document.getElementById('addGoalBtn');
  if (addGoalBtn) addGoalBtn.addEventListener('click', () => showAddModal('goal'));

  // Tasks
  const addTaskBtn = document.getElementById('addTaskBtn');
  if (addTaskBtn) addTaskBtn.addEventListener('click', () => showAddModal('task'));

  // Notes
  const addNoteBtn = document.getElementById('addNoteBtn');
  if (addNoteBtn) addNoteBtn.addEventListener('click', () => showAddModal('note'));

  // Form Submission
  const goalForm = document.getElementById('goalForm');
  if (goalForm) {
    goalForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      await handleGoalSubmit(e);
    });
  }
}

async function loadDashboardData() {
  showLoadingState();
  try {
    const response = await BraineX.apiRequest('/goals'); // Get all items
    if (response.success && response.data) {
      renderGoals(response.data.filter((i) => i.type === 'goal'));
      renderTasks(response.data.filter((i) => i.type === 'task'));
      renderNotes(response.data.filter((i) => i.type === 'note'));
      updateStats(response.data);
    }
  } catch (error) {
    console.error('Failed to load dashboard:', error);
    BraineX.showNotification('Failed to load dashboard data', 'error');
  } finally {
    hideLoadingState();
  }
}

function renderGoals(goals) {
  const container = document.getElementById('goalsList');
  if (!container) return;

  if (goals.length === 0) {
    container.innerHTML = '<div class="empty-state">No goals set yet. strict yourself!</div>';
    return;
  }

  container.innerHTML = goals
    .map(
      (goal) => `
        <div class="goal-card priority-${goal.priority || 'medium'}">
            <div class="card-header">
                <h3>${goal.title}</h3>
                <span class="status-badge ${goal.status}">${goal.status}</span>
            </div>
            <p>${goal.description || ''}</p>
            <div class="card-footer">
                <span>${goal.dueDate ? new Date(goal.dueDate).toLocaleDateString() : ''}</span>
                <button onclick="deleteItem('${goal._id}')" class="btn-icon">🗑️</button>
            </div>
        </div>
    `
    )
    .join('');
}

function renderTasks(tasks) {
  const container = document.getElementById('tasksList');
  if (!container) return;

  if (tasks.length === 0) {
    container.innerHTML = '<div class="empty-state">No pending tasks.</div>';
    return;
  }

  container.innerHTML = tasks
    .map(
      (task) => `
        <div class="task-item ${task.status === 'completed' ? 'done' : ''}">
            <input type="checkbox" onchange="toggleTaskStatus('${task._id}', this.checked)" ${task.status === 'completed' ? 'checked' : ''}>
            <div class="task-content">
                <h4>${task.title}</h4>
                <small>${task.dueDate ? 'Due: ' + new Date(task.dueDate).toLocaleDateString() : ''}</small>
            </div>
            <button onclick="deleteItem('${task._id}')" class="btn-icon delete-btn">×</button>
        </div>
    `
    )
    .join('');
}

function renderNotes(notes) {
  const container = document.querySelector('.notes-grid');
  if (!container) return;

  if (notes.length === 0) {
    container.innerHTML = '<div class="empty-state">No notes created.</div>';
    return;
  }

  container.innerHTML = notes
    .map(
      (note) => `
        <div class="note-card">
            <h4>${note.title}</h4>
            <p>${note.description || ''}</p>
            <div class="note-footer">
                <small>${new Date(note.updatedAt).toLocaleDateString()}</small>
                <div class="actions">
                    <button onclick="deleteItem('${note._id}')">🗑️</button>
                </div>
            </div>
        </div>
    `
    )
    .join('');
}

async function handleGoalSubmit(e) {
  const form = e.target;
  const type = document.getElementById('itemType').value;
  const data = {
    type: type,
    title: form.title.value,
    description: form.description.value,
    priority: form.priority ? form.priority.value : 'medium',
    dueDate: form.dueDate ? form.dueDate.value : null,
  };

  const btn = form.querySelector('button[type="submit"]');
  btn.disabled = true;
  btn.textContent = 'Saving...';

  const response = await BraineX.apiRequest('/goals', {
    method: 'POST',
    body: JSON.stringify(data),
  });

  if (response.success) {
    BraineX.closeModal();
    loadDashboardData();
    BraineX.showNotification(`${type.charAt(0).toUpperCase() + type.slice(1)} added!`, 'success');
  } else {
    BraineX.showNotification(response.error || 'Failed to save', 'error');
  }

  btn.disabled = false;
  btn.textContent = 'Save';
}

async function toggleTaskStatus(id, completed) {
  await BraineX.apiRequest(`/goals/${id}`, {
    method: 'PUT',
    body: JSON.stringify({ status: completed ? 'completed' : 'pending' }),
  });
  loadDashboardData(); // Refresh to update stats
}

async function deleteItem(id) {
  if (!confirm('Are you sure you want to delete this item?')) return;

  const response = await BraineX.apiRequest(`/goals/${id}`, {
    method: 'DELETE',
  });

  if (response.success) {
    loadDashboardData();
    BraineX.showNotification('Item deleted', 'success');
  }
}

// Stats & UI Helpers
function updateStats(items) {
  const goals = items.filter((i) => i.type === 'goal');
  const completedGoals = goals.filter((g) => g.status === 'completed').length;

  const progress = goals.length ? Math.round((completedGoals / goals.length) * 100) : 0;

  // Update progress bar
  const bars = document.querySelectorAll('.progress-fill');
  bars.forEach((bar) => (bar.style.width = `${progress}%`));

  // Update text
  const texts = document.querySelectorAll('.progress-text');
  texts.forEach((text) => (text.textContent = `${progress}% Completed`));
}

function showAddModal(type) {
  const modal = document.getElementById('addItemModal');
  if (modal) {
    document.getElementById('itemType').value = type;
    document.getElementById('modalTitle').textContent =
      `Add New ${type.charAt(0).toUpperCase() + type.slice(1)}`;

    // Adjust form fields based on type
    const priorityField = document.getElementById('priorityGroup');
    if (type === 'note' && priorityField) priorityField.style.display = 'none';
    else if (priorityField) priorityField.style.display = 'block';

    modal.classList.add('show');
  }
}

function showLoadingState() {
  // Add loading visuals if needed
}

function hideLoadingState() {
  // Remove loading visuals
}
