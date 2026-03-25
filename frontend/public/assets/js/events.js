// Events Page Functionality (API Integrated)

const API_BASE_URL = '/api';
let allEvents = [];
let currentEvents = [];

document.addEventListener('DOMContentLoaded', function () {
  if (typeof process !== 'undefined' && process.env.NODE_ENV === 'development') {
    console.log('🚀 Events Page Initializing...');
  }

  // Initialize global state
  initializeEventsPage();

  // Event Listeners
  setupEventFilters();
  setupCalendarNav();
  setupEventActions();
});

async function initializeEventsPage() {
  const grid = document.querySelector('.featured-grid');
  if (grid)
    grid.innerHTML =
      '<div class="loading-state"><div class="spinner"></div><p>Loading events...</p></div>';

  try {
    const response = await fetch(`${API_BASE_URL}/events`);
    if (!response.ok) throw new Error('Failed to fetch events');

    const result = await response.json();

    if (result.success && Array.isArray(result.data)) {
      allEvents = result.data.map((e) => ({ ...e, id: e.id || e._id }));
    } else {
      console.error('Invalid events data:', result);
      allEvents = [];
    }
  } catch (error) {
    console.error('Error loading events:', error);
    // Fallback sample data
    allEvents = [
      {
        id: '1',
        title: 'Tech Career Fair 2025',
        date: new Date(Date.now() + 86400000).toISOString(),
        type: 'Career',
        location: 'San Francisco, CA',
        organizer: 'TechHub',
        description: 'Meet top employers and find your next role.',
        tags: ['Networking', 'Career'],
        status: 'upcoming',
      },
      {
        id: '2',
        title: 'React Summit',
        date: new Date(Date.now() + 172800000).toISOString(),
        type: 'Conference',
        location: 'Online',
        organizer: 'React Community',
        description: 'Global summit for React developers.',
        tags: ['Dev', 'React'],
        status: 'upcoming',
      },
      {
        id: '3',
        title: 'AI in Education',
        date: new Date(Date.now() - 86400000).toISOString(),
        type: 'Webinar',
        location: 'Online',
        organizer: 'BraineX',
        description: 'Exploring the future of AI in classrooms.',
        tags: ['AI', 'Education'],
        status: 'past',
      },
    ];
    if (grid) grid.innerHTML = ''; // Clear loading/error state provided by previous lines
  }

  currentEvents = [...allEvents];
  renderEvents(currentEvents);
  renderCalendar(new Date());
  renderUpcomingEvents(currentEvents);
}

function renderEvents(events) {
  const grid = document.querySelector('.featured-grid');
  if (!grid) return;

  if (events.length === 0) {
    grid.innerHTML = '<div class="no-results"><p>No events found matching your criteria.</p></div>';
    return;
  }

  grid.innerHTML = events.map((event) => createEventCard(event)).join('');
}

function createEventCard(event) {
  const dateStr = new Date(event.date).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
  const isUpcoming = new Date(event.date) > new Date();
  const badgeText = isUpcoming
    ? event.status === 'upcoming'
      ? '🚀 Upcoming'
      : event.status
    : '🏁 Past';

  // Placeholder image logic
  const icon = getEventIcon(event.type);

  return `
        <div class="event-featured-card" data-id="${event.id}">
            <div class="event-badge">${badgeText}</div>
            <div class="event-image">
                <div class="event-placeholder">${icon}</div>
            </div>
            <div class="event-content">
                <h3>${event.title}</h3>
                <p class="event-organizer">by ${event.organizer || 'BraineX'}</p>
                <p class="event-description">${event.description}</p>
                
                <div class="event-details">
                    <div class="detail">
                        <span class="detail-icon">📅</span>
                        <span>${dateStr}</span>
                    </div>
                    <div class="detail">
                         <span class="detail-icon">📍</span>
                         <span>${event.location || 'Online'}</span>
                    </div>
                    ${
                      event.type
                        ? `
                    <div class="detail">
                        <span class="detail-icon">🏷️</span>
                        <span>${event.type}</span>
                    </div>`
                        : ''
                    }
                </div>
                
    <div class="event-tags">
        <span class="tag">${event.type || 'Event'}</span>
        ${(event.tags || []).map((t) => `<span class="tag">${t}</span>`).join('')}
    </div>
    
    <button class="btn-event-primary js-event-action" data-id="${event.id}" data-action="${isUpcoming ? 'register' : 'view'}">
        ${isUpcoming ? 'Register Now' : 'View Details'}
    </button>
</div>
</div>
`;
}

function setupEventActions() {
  document.addEventListener('click', function (e) {
    const btn = e.target.closest('.js-event-action');
    if (btn) {
      const id = btn.getAttribute('data-id');
      const action = btn.getAttribute('data-action');
      if (action === 'register') {
        registerForEvent(id);
      } else {
        viewEventDetails(id);
      }
      return;
    }

    // Fallback for featured cards if any
    const miniCard = e.target.closest('.mini-event-card');
    if (miniCard) {
      // Mini cards usually imply view details
      const id = miniCard.getAttribute('data-id');
      if (id) viewEventDetails(id);
    }
  });
}

function viewEventDetails(eventId) {
  const event = allEvents.find((e) => e.id == eventId);
  if (!event) return;

  const modal = document.createElement('div');
  modal.className = 'modal show';
  modal.innerHTML = `
        <div class="modal-content">
            <button class="close-modal">&times;</button>
            <h2>${event.title}</h2>
            <div class="event-meta" style="margin: 1rem 0; padding: 1rem; background: #f8f9fa; border-radius: 8px;">
                 <p><strong>📅 Date:</strong> ${new Date(event.date).toLocaleDateString()}</p>
                 <p><strong>📍 Location:</strong> ${event.location || 'Online'}</p>
                 <p><strong>🏢 Organizer:</strong> ${event.organizer || 'BraineX'}</p>
            </div>
            <p style="font-size: 1.1rem; line-height: 1.6;">${event.description}</p>
            
            <div class="modal-actions" style="margin-top: 2rem; display: flex; gap: 1rem; justify-content: flex-end;">
                 <button class="btn-secondary close-btn">Close</button>
                 ${
                   new Date(event.date) > new Date()
                     ? `<button class="btn-primary" onclick="registerForEvent('${event.id}')">Register Now</button>`
                     : '<button class="btn-outline" disabled>Event Ended</button>'
                 }
            </div>
        </div>
    `;

  document.body.appendChild(modal);

  // Close handlers
  const close = () => modal.remove();
  modal.querySelector('.close-modal').addEventListener('click', close);
  modal.querySelector('.close-btn').addEventListener('click', close);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) close();
  });
}

function getEventIcon(type) {
  const t = (type || '').toLowerCase();
  if (t.includes('hackathon')) return '💻';
  if (t.includes('conference')) return '🎤';
  if (t.includes('workshop')) return '🛠️';
  if (t.includes('webinar')) return '📹';
  return '📅';
}

function setupEventFilters() {
  const typeSelect = document.getElementById('eventType');
  const fieldSelect = document.getElementById('eventField');
  const searchBtn = document.querySelector('.btn-search-events');

  if (searchBtn) {
    searchBtn.addEventListener('click', () => {
      const type = typeSelect ? typeSelect.value.toLowerCase() : '';
      const field = fieldSelect ? fieldSelect.value.toLowerCase() : '';
      filterEvents(type, field);
    });
  }

  // Auto-filter on change
  [typeSelect, fieldSelect].forEach((select) => {
    if (select) {
      select.addEventListener('change', () => {
        const type = typeSelect ? typeSelect.value.toLowerCase() : '';
        const field = fieldSelect ? fieldSelect.value.toLowerCase() : '';
        filterEvents(type, field);
      });
    }
  });
}

function filterEvents(type, field) {
  currentEvents = allEvents.filter((e) => {
    const typeMatch = !type || type === 'all' || (e.type || '').toLowerCase().includes(type);
    // Field filtering might need tags or description check if field isn't explicit
    const eventTags = (e.tags || []).map((t) => t.toLowerCase());
    const fieldMatch =
      !field ||
      field === 'all' ||
      eventTags.some((t) => t.includes(field)) ||
      (e.description || '').toLowerCase().includes(field);
    return typeMatch && fieldMatch;
  });
  renderEvents(currentEvents);
}

// Global function for category card clicks
window.filterEventsByType = function (type) {
  // Update the dropdown to reflect selection
  const typeSelect = document.getElementById('eventType');
  if (typeSelect) {
    typeSelect.value = type;
  }

  // Scroll to featured events section
  const featuredSection = document.querySelector('.featured-events');
  if (featuredSection) {
    featuredSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  // Filter and show results
  filterEvents(type, '');

  // Show toast notification
  if (window.InteractionHandler) {
    window.InteractionHandler.showToast(`Showing ${type} events`);
  }
};

// Calendar Logic (Simplified)
let currentMonthDate = new Date();

function renderCalendar(date) {
  const grid = document.getElementById('calendarGrid');
  const monthTitle = document.getElementById('currentMonth');
  if (!grid || !monthTitle) return;

  monthTitle.textContent = date.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });

  // Clear grid
  grid.innerHTML = '';

  // Get days in month
  const year = date.getFullYear();
  const month = date.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Empty cells for previous month
  for (let i = 0; i < firstDay; i++) {
    const div = document.createElement('div');
    div.className = 'calendar-day empty';
    grid.appendChild(div);
  }

  // Days
  for (let day = 1; day <= daysInMonth; day++) {
    const div = document.createElement('div');
    div.className = 'calendar-day';
    div.textContent = day;

    // precise check
    const checkDate = new Date(year, month, day).toDateString();
    const hasEvent = allEvents.some((e) => new Date(e.date).toDateString() === checkDate);

    if (hasEvent) {
      div.classList.add('has-event');
      div.innerHTML += '<span class="event-dot"></span>';
    }

    grid.appendChild(div);
  }
}

window.nextMonth = function () {
  currentMonthDate.setMonth(currentMonthDate.getMonth() + 1);
  renderCalendar(currentMonthDate);
};

window.previousMonth = function () {
  currentMonthDate.setMonth(currentMonthDate.getMonth() - 1);
  renderCalendar(currentMonthDate);
};

function setupCalendarNav() {
  const prevBtn = document.querySelector('.js-prev-month');
  const nextBtn = document.querySelector('.js-next-month');

  if (prevBtn) prevBtn.addEventListener('click', () => window.previousMonth());
  if (nextBtn) nextBtn.addEventListener('click', () => window.nextMonth());
}

function renderUpcomingEvents(events) {
  const container = document.getElementById('upcomingEvents');
  if (!container) return;

  const upcoming = events
    .filter((e) => new Date(e.date) >= new Date())
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .slice(0, 5); // Take next 5

  container.innerHTML = upcoming
    .map(
      (e) => `
        <div class="mini-event-card" data-id="${e.id}">
            <div class="mini-date">
                <span class="day">${new Date(e.date).getDate()}</span>
                <span class="month">${new Date(e.date).toLocaleDateString(undefined, { month: 'short' })}</span>
            </div>
            <div class="mini-info">
                <h4>${e.title}</h4>
                <span>${e.type}</span>
            </div>
        </div>
    `
    )
    .join('');
}

window.registerForEvent = function (eventId) {
  const event = allEvents.find((e) => e.id == eventId || e._id == eventId);
  if (!event) return;

  // Check auth
  if (window.authAPI && !window.authAPI.isAuthenticated()) {
    BraineX.showNotification('Please login to register', 'error');
    BraineX.openModal('loginModal');
    return;
  }

  // Show registration modal (using global modal logic re-creation or existing)
  const modal = document.createElement('div');
  modal.className = 'modal show';
  modal.innerHTML = `
        <div class="modal-content">
            <button class="close-modal">&times;</button>
            <h2>${event.title}</h2>
            <p>Date: ${new Date(event.date).toLocaleDateString()}</p>
            <p>Confirm your registration for this event.</p>
            <div class="form-actions" style="margin-top:20px;">
                <button class="btn btn-primary js-confirm-reg" data-id="${event.id}">Confirm Registration</button>
            </div>
        </div>
    `;
  document.body.appendChild(modal);

  // Modal Specific Delegation
  modal.querySelector('.js-confirm-reg').addEventListener('click', function () {
    confirmRegistration(event.id, this);
  });
  modal.querySelector('.close-modal').addEventListener('click', () => modal.remove());
};

window.confirmRegistration = async function (eventId, btn) {
  window.setLoadingState?.(btn, true, 'Registering...');

  const event = allEvents.find((e) => e.id == eventId || e._id == eventId);
  if (!event) {
    window.setLoadingState?.(btn, false);
    return;
  }

  // Try API first if available
  if (window.authAPI && window.authAPI.isAuthenticated()) {
    try {
      const response = await window.authAPI.request('/applications', {
        method: 'POST',
        body: JSON.stringify({
          type: 'event',
          data: { eventId: eventId },
        }),
      });

      const result = await response.json();

      if (result.success) {
        saveEventToLocalStorage(event);
        BraineX.showNotification('Successfully registered!', 'success');
        setTimeout(() => {
          btn.closest('.modal').remove();
        }, 800);
        return;
      } else {
        throw new Error(result.error);
      }
    } catch (e) {
      console.error('API registration failed, using local fallback:', e);
      // Fall through to local storage
    }
  }

  // Local storage fallback (for demo or when API is unavailable)
  saveEventToLocalStorage(event);
  BraineX.showNotification('Successfully registered! (Saved locally)', 'success');
  setTimeout(() => {
    btn.closest('.modal').remove();
  }, 800);

  window.setLoadingState?.(btn, false);
};

function saveEventToLocalStorage(event) {
  const myEvents = JSON.parse(localStorage.getItem('my_events') || '[]');

  // Check if already registered
  if (myEvents.some((e) => e.id === event.id)) {
    return; // Already registered
  }

  myEvents.push({
    id: event.id,
    title: event.title,
    date: event.date,
    location: event.location,
    registeredAt: new Date().toISOString(),
  });

  localStorage.setItem('my_events', JSON.stringify(myEvents));
}
