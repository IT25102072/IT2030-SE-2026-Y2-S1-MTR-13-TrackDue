/**
 * TrackDue - Enterprise Single-Page Web Application Engine
 * Pure Vanilla JS + REST APIs
 */

// Application State
const state = {
  currentUser: {
    id: 1,
    name: 'Administrator',
    role: 'SYSTEM_ADMINISTRATOR',
    email: 'admin@trackdue.com'
  },
  currentTab: 'myday',
  selectedTaskId: null,
  selectedTaskType: 'bill', // 'bill' or 'event'
  bills: [],
  events: [],
  reminders: [],
  notifications: [],
  supportRequests: [],
  feedbackList: [],
  historyLogs: [],
  users: [],
  calendarDate: new Date(),
  calendarMode: 'month'
};

// API Client Helper
async function api(endpoint, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    'X-User-Id': state.currentUser ? state.currentUser.id : 1,
    'X-User-Name': state.currentUser ? state.currentUser.name : 'User',
    ...(options.headers || {})
  };

  const baseUrl = (window.TrackDueAPI && window.TrackDueAPI.BASE_URL) 
    ? window.TrackDueAPI.BASE_URL 
    : (window.location.port === '8080' ? '/api' : 'http://localhost:8080/api');

  let resolvedEndpoint = endpoint;
  if (endpoint.startsWith('/api')) {
    resolvedEndpoint = baseUrl.endsWith('/api') ? baseUrl + endpoint.substring(4) : baseUrl + endpoint;
  } else if (!endpoint.startsWith('http://') && !endpoint.startsWith('https://')) {
    resolvedEndpoint = `${baseUrl}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;
  }

  try {
    const response = await fetch(resolvedEndpoint, { ...options, headers });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      const error = new Error(err.message || `Request failed with status ${response.status}`);
      error.validationErrors = err.validationErrors;
      error.status = response.status;
      throw error;
    }
    if (response.status === 204) return null;
    return await response.json();
  } catch (error) {
    console.error(`API Error on ${endpoint}:`, error);
    showToast(error.message, 'danger');
    throw error;
  }
}

// Toast Notifications
function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;

  let icon = 'fa-info-circle';
  if (type === 'success') icon = 'fa-circle-check';
  if (type === 'danger') icon = 'fa-triangle-exclamation';
  if (type === 'warning') icon = 'fa-bell';

  toast.innerHTML = `<i class="fa-solid ${icon}"></i> <span>${message}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

// Modal Control
function openModal(id) {
  document.getElementById(id).classList.add('active');
}
function closeModal(id) {
  document.getElementById(id).classList.remove('active');
}

// ==========================================================================
// Navigation & Tab Switching
// ==========================================================================
function isAdmin() {
  return state.currentUser && (
    state.currentUser.role === 'SYSTEM_ADMINISTRATOR' ||
    state.currentUser.email === 'admin@trackdue.com'
  );
}

function switchTab(tabName) {
  const isAdm = isAdmin();

  // Redirect admin-only tabs if standard user
  const adminOnlyTabs = ['admin-overview', 'users'];
  if (!isAdm && adminOnlyTabs.includes(tabName)) {
    showToast('This section is only accessible by System Administrators.', 'warning');
    tabName = 'myday';
  }

  // If Admin clicks myday, route to admin-overview
  if (isAdm && tabName === 'myday') {
    tabName = 'admin-overview';
  }

  state.currentTab = tabName;

  // Update Sidebar Active state
  document.querySelectorAll('.any-nav-item').forEach(item => {
    item.classList.toggle('active', item.dataset.tab === tabName);
  });

  // Update Topbar Shortcuts Active state
  document.querySelectorAll('.topbar-shortcut-btn').forEach(btn => {
    const s = btn.dataset.shortcut || btn.dataset.shortcutTab;
    let isActive = false;
    if (s === 'dashboard' || s === 'myday') {
      isActive = (tabName === 'myday' || tabName === 'admin-overview');
    } else {
      isActive = (s === tabName);
    }
    btn.classList.toggle('active', isActive);
  });

  // Update Main View Section
  document.querySelectorAll('.view-section').forEach(sec => {
    sec.classList.toggle('active', sec.id === `view-${tabName}`);
  });

  // Update Topbar View Button Text
  const labels = {
    'admin-overview': 'Overall Dashboard',
    myday: 'Overall Dashboard',
    reminders: 'Upcoming Reminders',
    notifications: 'My Notifications',
    next7days: 'Next 7 days',
    alltasks: 'All my tasks',
    calendar: 'My Calendar',
    users: 'User Accounts Directory',
    bills: 'Bills & Finance',
    events: 'Events & Deadlines',
    reports: 'Reports & History',
    history: 'System Activity History',
    support: isAdm ? 'Help & Support Helpdesk' : 'Help & Support Center',
    feedback: isAdm ? 'Customer Feedback Reviews' : 'Submit Feedback',
    profile: 'My Profile'
  };
  const viewText = document.getElementById('topbar-view-text');
  if (viewText) viewText.innerText = labels[tabName] || tabName;

  // Trigger View Loaders
  if (tabName === 'admin-overview') loadAdminOverview();
  if (tabName === 'myday') renderMyDay();
  if (tabName === 'reminders') loadRemindersTable();
  if (tabName === 'notifications') loadNotificationsView();
  if (tabName === 'next7days') renderNext7Days();
  if (tabName === 'alltasks') renderAllTasksPane();
  if (tabName === 'calendar') renderCalendarView();
  if (tabName === 'bills') loadBillsTable();
  if (tabName === 'events') loadEventsTable();
  if (tabName === 'reports') loadReportsView();
  if (tabName === 'history') loadHistoryView();
  if (tabName === 'support') loadSupportView();
  if (tabName === 'feedback') loadFeedbackView();
  if (tabName === 'users') loadUsersView();
  if (tabName === 'profile') loadProfileView();
}

function handleShortcutClick(key) {
  if (key === 'dashboard') {
    switchTab(isAdmin() ? 'admin-overview' : 'myday');
  } else if (key === 'bills') {
    switchTab('bills');
  } else if (key === 'events') {
    switchTab('events');
  } else if (key === 'reminders') {
    switchTab('reminders');
  } else if (key === 'reports') {
    switchTab('reports');
  } else if (key === 'notifications') {
    switchTab('notifications');
  } else {
    switchTab(key);
  }
}
window.handleShortcutClick = handleShortcutClick;

// User Session Initialization
function initCurrentUser() {
  const raw = localStorage.getItem('trackdue_user');
  if (raw) {
    try {
      const parsed = JSON.parse(raw);
      state.currentUser = {
        id: parsed.userId || parsed.id || 1,
        name: (parsed.firstName ? `${parsed.firstName} ${parsed.lastName || ''}`.trim() : parsed.name) || 'User',
        role: parsed.role || 'GENERAL_EMPLOYEE',
        email: parsed.email || ''
      };
    } catch (e) {
      console.error('Failed to parse user session:', e);
      window.location.replace('index.html');
    }
  } else {
    window.location.replace('index.html');
  }
}

function updateSessionUI() {
  const name = state.currentUser.name || 'User';
  const firstName = name.split(' ')[0] || 'User';
  const initial = firstName.charAt(0).toUpperCase() || 'U';
  const isAdm = isAdmin();

  const sidebarAvatar = document.getElementById('sidebar-user-avatar');
  if (sidebarAvatar) {
    sidebarAvatar.innerHTML = `<span style="font-weight:700; color:#38bdf8; font-size:14px;">${initial}</span>`;
  }
  const topbarAvatar = document.getElementById('topbar-user-avatar');
  if (topbarAvatar) {
    topbarAvatar.innerHTML = `<span style="font-weight:700; color:#ffffff; font-size:13px;">${initial}</span>`;
  }

  const sidebarName = document.getElementById('sidebar-user-name');
  if (sidebarName) sidebarName.innerText = firstName;
  const sidebarSub = document.getElementById('sidebar-user-sub');
  if (sidebarSub) {
    sidebarSub.innerText = isAdm ? 'Administrator' : 'Personal Account';
  }

  const topbarName = document.getElementById('topbar-user-name');
  if (topbarName) {
    topbarName.innerHTML = isAdm
      ? `${escapeHtml(name)} <span style="font-size:10.5px; background:rgba(168,85,247,0.25); color:#c084fc; border:1px solid rgba(168,85,247,0.4); padding:2px 8px; border-radius:10px; margin-left:6px; font-weight:700;">ADMIN</span>`
      : escapeHtml(name);
  }

  // Mutually exclusive sidebar navigation
  const userNavSection = document.getElementById('user-sidebar-section');
  const adminNavSection = document.getElementById('admin-sidebar-section');
  const bottomBar = document.querySelector('.any-bottom-bar');
  const floatingBtn = document.querySelector('.any-floating-btn');

  if (isAdm) {
    if (userNavSection) userNavSection.style.display = 'none';
    if (adminNavSection) adminNavSection.style.display = 'block';
    if (bottomBar) bottomBar.style.display = 'none';
    if (floatingBtn) floatingBtn.style.display = 'flex';
  } else {
    if (userNavSection) userNavSection.style.display = 'block';
    if (adminNavSection) adminNavSection.style.display = 'none';
    if (bottomBar) bottomBar.style.display = 'none';
    if (floatingBtn) floatingBtn.style.display = 'flex';
  }
}

function logout() {
  localStorage.removeItem('trackdue_user');
  sessionStorage.clear();
  window.location.replace('index.html');
}

// App Initialization
document.addEventListener('DOMContentLoaded', async () => {
  initCurrentUser();
  updateSessionUI();
  setupEventListeners();
  updateGreetingDate();
  await refreshAllData();
  if (isAdmin()) {
    switchTab('admin-overview');
  } else {
    switchTab('myday');
  }
});

function updateGreetingDate() {
  const now = new Date();
  const firstName = state.currentUser ? (state.currentUser.name ? state.currentUser.name.split(' ')[0] : 'User') : 'User';
  const hours = now.getHours();
  let greeting = 'Good Morning';
  if (hours >= 12 && hours < 17) greeting = 'Good Afternoon';
  else if (hours >= 17 && hours < 21) greeting = 'Good Evening';
  else if (hours >= 21 || hours < 5) greeting = 'Good Night';

  const greetEl = document.getElementById('myday-greeting-text');
  if (greetEl) greetEl.innerText = `${greeting}, ${firstName}`;

  const days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  const dayEl = document.getElementById('myday-banner-day');
  const numEl = document.getElementById('myday-banner-num');
  const monEl = document.getElementById('myday-banner-month');
  if (dayEl) dayEl.innerText = days[now.getDay()];
  if (numEl) numEl.innerText = now.getDate();
  if (monEl) monEl.innerText = months[now.getMonth()];
}

// ==========================================================================
// Reactive Counters & Badges Engine (+1 on Add, -1 on Complete / Done)
// ==========================================================================
function updateReactiveCounters() {
  const isAdm = isAdmin();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStr = today.toISOString().split('T')[0];
  const next7DaysDate = new Date();
  next7DaysDate.setDate(next7DaysDate.getDate() + 7);
  next7DaysDate.setHours(23, 59, 59, 999);
  const next7DaysStr = next7DaysDate.toISOString().split('T')[0];

  const bills = state.bills || [];
  const events = state.events || [];
  const reminders = state.reminders || [];
  const notifs = state.notifications || [];
  const support = state.supportRequests || [];

  // Active (unpaid) bills vs Overdue bills
  const activeBills = bills.filter(b => b.status === 'PENDING' || b.status === 'OVERDUE');
  const overdueBills = bills.filter(b => {
    if (b.status === 'PAID' || b.status === 'CANCELLED') return false;
    if (b.status === 'OVERDUE') return true;
    if (b.dueDate) {
      const d = new Date(b.dueDate + 'T00:00:00');
      return d < today;
    }
    return false;
  });

  // Active (uncompleted) upcoming events
  const upcomingEvents = events.filter(e => e.status !== 'COMPLETED' && e.status !== 'CANCELLED');

  // Reminders & Unread Notifications
  const remCount = reminders.length;
  const unreadNotifsCount = notifs.filter(n => !n.read && !n.isRead).length;
  const openSupportCount = support.filter(s => s.status !== 'RESOLVED' && s.status !== 'CLOSED').length;

  // Next 7 days commitments
  const next7Bills = activeBills.filter(b => b.dueDate && b.dueDate >= todayStr && b.dueDate <= next7DaysStr);
  const next7Events = upcomingEvents.filter(e => e.eventDate && e.eventDate >= todayStr && e.eventDate <= next7DaysStr);
  const next7DaysCount = next7Bills.length + next7Events.length;

  // All active tasks
  const allTasksCount = activeBills.length + upcomingEvents.length;

  const setEl = (id, val) => {
    const el = document.getElementById(id);
    if (el) el.innerText = val;
  };

  // 1. Dashboard 4 Metric Stat Cards (Accurate to active items)
  setEl('stat-total-bills', activeBills.length);
  setEl('stat-overdue-bills', overdueBills.length);
  setEl('stat-upcoming-events', upcomingEvents.length);
  setEl('stat-total-reminders', remCount);

  // 2. Quick Actions & Integration banner counters
  setEl('myday-overdue-stat', overdueBills.length);
  setEl('myday-events-stat', upcomingEvents.length);
  setEl('myday-support-stat', openSupportCount);

  // 3. User Sidebar Badges
  setEl('badge-bills-sidebar', activeBills.length);
  setEl('badge-overdue-sidebar', activeBills.length);
  setEl('badge-events-sidebar', upcomingEvents.length);
  setEl('badge-notifications-sidebar', unreadNotifsCount);
  setEl('badge-reminders-sidebar', remCount);
  setEl('badge-next7days-count', next7DaysCount);
  setEl('badge-alltasks-count', allTasksCount);
  setEl('badge-support-sidebar', openSupportCount);

  // 4. Admin Sidebar Badges
  setEl('badge-admin-bills-sidebar', activeBills.length);
  setEl('badge-admin-events-sidebar', upcomingEvents.length);
  setEl('badge-admin-notifs-sidebar', unreadNotifsCount);
  setEl('badge-admin-reminders-sidebar', remCount);
  setEl('badge-admin-support-sidebar', openSupportCount);
  if (state.users && state.users.length) {
    setEl('badge-users-sidebar', state.users.length);
  }

  // 5. Highlight overdue in red if any overdue bills exist, otherwise neutral badge
  ['badge-bills-sidebar', 'badge-admin-bills-sidebar', 'badge-overdue-sidebar'].forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      if (overdueBills.length > 0) {
        el.classList.add('red');
      } else {
        el.classList.remove('red');
      }
    }
  });

  // 6. Topbar Notification Count Bubble
  setEl('topbar-notif-count', unreadNotifsCount);
}
window.updateReactiveCounters = updateReactiveCounters;

async function refreshAllData() {
  try {
    const isAdm = isAdmin();
    const userId = state.currentUser ? state.currentUser.id : null;

    const [summary, bills, events, notifs] = await Promise.all([
      (isAdm || !userId) ? api('/api/reports/summary').catch(() => null) : api(`/api/reports/summary/user/${userId}`).catch(() => null),
      (isAdm || !userId) ? api('/api/bills').catch(() => []) : api(`/api/bills/user/${userId}`).catch(() => []),
      (isAdm || !userId) ? api('/api/events').catch(() => []) : api(`/api/events/user/${userId}`).catch(() => []),
      userId ? api(`/api/notifications/user/${userId}`).catch(() => []) : Promise.resolve([])
    ]);

    state.bills = bills || [];
    state.events = events || [];
    state.notifications = notifs || [];

    // Fetch user-appropriate reminders
    try {
      if (isAdm || !userId) {
        state.reminders = await api('/api/reminders');
      } else {
        state.reminders = await api(`/api/reminders/user/${userId}`);
      }
    } catch (e) {
      state.reminders = [];
    }

    // Fetch support requests for badge
    try {
      if (isAdm || !userId) {
        state.supportRequests = await api('/api/support');
      } else {
        state.supportRequests = await api(`/api/support/user/${userId}`);
      }
    } catch (e) {
      state.supportRequests = [];
    }

    // If Admin, also update user directory badge
    if (isAdm) {
      try {
        state.users = await api('/api/users');
      } catch (e) {}
    }

    // Update all badges and metric counters reactively from current active items!
    updateReactiveCounters();
  } catch (err) {
    console.error('Data refresh error:', err);
    updateReactiveCounters();
  }
}

// Setup Event Listeners
function setupEventListeners() {
  // Sidebar Nav Items
  document.querySelectorAll('.any-nav-item').forEach(item => {
    item.addEventListener('click', () => switchTab(item.dataset.tab));
  });

  // Logout Button
  const logoutBtn = document.getElementById('btn-logout-action');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      logout();
    });
  }

  // Topbar Sync (if present)
  const refreshBtn = document.getElementById('btn-topbar-refresh');
  if (refreshBtn) {
    refreshBtn.addEventListener('click', async () => {
      await refreshAllData();
      switchTab(state.currentTab);
      showToast('Workspace synchronized.', 'success');
    });
  }

  // Topbar Notif bell
  const notifsBtn = document.getElementById('btn-topbar-notifs');
  if (notifsBtn) {
    notifsBtn.addEventListener('click', () => {
      switchTab('notifications');
    });
  }

  // Quick Add Bill button in sidebar (if present)
  const quickAddBill = document.getElementById('btn-quick-add-bill');
  if (quickAddBill) {
    quickAddBill.addEventListener('click', openAddBillModal);
  }

  // Forms
  document.getElementById('form-bill').addEventListener('submit', handleBillSubmit);
  document.getElementById('form-event').addEventListener('submit', handleEventSubmit);
  document.getElementById('form-reminder').addEventListener('submit', handleReminderSubmit);
  const formEditRem = document.getElementById('form-edit-reminder');
  if (formEditRem) formEditRem.addEventListener('submit', handleEditReminderSubmit);
  document.getElementById('form-support-submit').addEventListener('submit', handleSupportSubmit);
  document.getElementById('form-support-manage').addEventListener('submit', handleSupportManageSubmit);
  document.getElementById('form-feedback-submit').addEventListener('submit', handleFeedbackSubmit);

  // Reports
  document.getElementById('btn-run-report').addEventListener('click', loadReportsView);
  document.getElementById('btn-export-pdf').addEventListener('click', () => window.print());
  document.getElementById('btn-export-csv').addEventListener('click', () => {
    const from = document.getElementById('rep-from-date').value;
    const to = document.getElementById('rep-to-date').value;
    let url = '/api/reports/export/csv';
    if (from && to) url += `?startDate=${from}&endDate=${to}`;
    window.location.href = url;
    showToast('Exporting CSV dataset...', 'info');
  });

  // Feedback Stars (Submit Modal)
  document.querySelectorAll('#feedback-star-box i').forEach(star => {
    star.addEventListener('click', () => {
      const r = parseInt(star.dataset.r);
      document.getElementById('feedback-rating-val').value = r;
      document.querySelectorAll('#feedback-star-box i').forEach(s => {
        s.style.color = parseInt(s.dataset.r) <= r ? '#fbbf24' : '#475569';
      });
    });
  });

  // Feedback Stars (Edit Modal)
  document.querySelectorAll('#edit-feedback-star-box i').forEach(star => {
    star.addEventListener('click', () => {
      const r = parseInt(star.dataset.r);
      document.getElementById('edit-feedback-rating-val').value = r;
      document.querySelectorAll('#edit-feedback-star-box i').forEach(s => {
        s.style.color = parseInt(s.dataset.r) <= r ? '#fbbf24' : '#475569';
      });
    });
  });

  // History Filter
  document.getElementById('history-search-box').addEventListener('input', filterHistoryTable);
  document.getElementById('history-module-select').addEventListener('change', filterHistoryTable);
  document.getElementById('history-action-select').addEventListener('change', filterHistoryTable);
  document.getElementById('btn-refresh-history').addEventListener('click', loadHistoryView);

  // Bills Full Filter
  document.getElementById('bills-search-box').addEventListener('input', filterBillsFullTable);
  document.getElementById('bills-category-select').addEventListener('change', filterBillsFullTable);
  document.getElementById('bills-status-select').addEventListener('change', filterBillsFullTable);

  // Events Full Filter
  const evSearch = document.getElementById('events-search-box');
  if (evSearch) evSearch.addEventListener('input', filterEventsFullTable);
  const evCat = document.getElementById('events-category-select');
  if (evCat) evCat.addEventListener('change', filterEventsFullTable);
  const evStat = document.getElementById('events-status-select');
  if (evStat) evStat.addEventListener('change', filterEventsFullTable);
}

// ==========================================================================
// VIEW 0: ADMIN OVERVIEW RENDERER
// ==========================================================================
async function loadAdminOverview() {
  try {
    const [users, support, feedback, logs] = await Promise.all([
      api('/api/users').catch(() => []),
      api('/api/support').catch(() => []),
      api('/api/feedback').catch(() => []),
      api('/api/history').catch(() => [])
    ]);

    // Update KPI Counters
    const usersCount = users ? users.length : 0;
    const pendingSupport = support ? support.filter(s => s.status !== 'RESOLVED').length : 0;
    const feedbackCount = feedback ? feedback.length : 0;
    const logsCount = logs ? logs.length : 0;

    const kpiUsers = document.getElementById('admin-kpi-users');
    if (kpiUsers) kpiUsers.innerText = usersCount;
    const kpiSupport = document.getElementById('admin-kpi-support');
    if (kpiSupport) kpiSupport.innerText = pendingSupport;
    const kpiFeedback = document.getElementById('admin-kpi-feedback');
    if (kpiFeedback) kpiFeedback.innerText = feedbackCount;
    const kpiLogs = document.getElementById('admin-kpi-logs');
    if (kpiLogs) kpiLogs.innerText = logsCount;

    // Badges in admin sidebar
    const bUsers = document.getElementById('badge-users-sidebar');
    if (bUsers) bUsers.innerText = usersCount;
    const bSupp = document.getElementById('badge-admin-support-sidebar');
    if (bSupp) bSupp.innerText = pendingSupport;
    const bFb = document.getElementById('badge-admin-feedback-sidebar');
    if (bFb) bFb.innerText = feedbackCount;

    // Recent Users preview
    const usersList = document.getElementById('admin-recent-users-list');
    if (usersList) {
      if (!users || users.length === 0) {
        usersList.innerHTML = `<div style="color:var(--any-text-muted); font-size:13px; text-align:center; padding:20px;">No registered user accounts found.</div>`;
      } else {
        usersList.innerHTML = users.slice(0, 5).map(u => `
          <div style="display:flex; align-items:center; justify-content:space-between; padding:10px 14px; background:var(--any-card); border-radius:8px; border:1px solid var(--any-border);">
            <div>
              <div style="font-weight:600; font-size:13px; color:var(--any-text);">${escapeHtml(u.firstName + ' ' + (u.lastName || ''))}</div>
              <div style="font-size:11.5px; color:var(--any-text-muted);">${escapeHtml(u.email)}</div>
            </div>
            <span class="badge-status ${u.role === 'SYSTEM_ADMINISTRATOR' ? 'paid' : 'pending'}" style="font-size:10px;">${escapeHtml(u.role)}</span>
          </div>
        `).join('');
      }
    }

    // Recent Support preview
    const suppList = document.getElementById('admin-recent-support-list');
    if (suppList) {
      if (!support || support.length === 0) {
        suppList.innerHTML = `<div style="color:var(--any-text-muted); font-size:13px; text-align:center; padding:20px;">No support tickets submitted yet.</div>`;
      } else {
        suppList.innerHTML = support.slice(0, 5).map(s => `
          <div style="display:flex; align-items:center; justify-content:space-between; padding:10px 14px; background:var(--any-card); border-radius:8px; border:1px solid var(--any-border);">
            <div style="max-width:70%;">
              <div style="font-weight:600; font-size:13px; color:var(--any-text); white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${escapeHtml(s.subject)}</div>
              <div style="font-size:11.5px; color:var(--any-text-muted);">${escapeHtml(s.userName || 'User')} • ${escapeHtml(s.category)}</div>
            </div>
            <span class="badge-status ${s.status === 'OPEN' ? 'overdue' : (s.status === 'RESOLVED' ? 'paid' : 'pending')}" style="font-size:10px;">${escapeHtml(s.status)}</span>
          </div>
        `).join('');
      }
    }
  } catch (err) {
    console.error('Error loading admin overview:', err);
  }
}

// ==========================================================================
// VIEW 1: MY DAY RENDERER (Screenshot 1)
// ==========================================================================
function renderMyDay() {
  const container = document.getElementById('myday-task-list');
  container.innerHTML = '';

  const priorityBills = state.bills.filter(b => b.status === 'OVERDUE' || b.status === 'PENDING').slice(0, 5);

  if (priorityBills.length === 0) {
    container.innerHTML = `
      <div class="any-empty-state-card">
        <div class="empty-icon-circle green">
          <i class="fa-solid fa-circle-check"></i>
        </div>
        <h4>All clear! No personal bills or tasks yet.</h4>
        <p>Add your first bill or reminder using the "+ Create" button below or the quick-add bar.</p>
      </div>
    `;
    return;
  }

  priorityBills.forEach(b => {
    const isOverdue = b.status === 'OVERDUE';
    container.innerHTML += `
      <div class="kanban-task-card" onclick="openTaskInspector(${b.id}, 'bill')" style="padding:12px 16px;">
        <div class="card-top-row">
          <div class="circle-checkbox ${b.status === 'PAID' ? 'checked' : ''}" onclick="event.stopPropagation(); toggleBillPaid(${b.id})">
            ${b.status === 'PAID' ? '<i class="fa-solid fa-check"></i>' : ''}
          </div>
          <span class="card-title-text" style="${isOverdue ? 'color:#fca5a5; font-weight:600;' : ''}">${escapeHtml(b.billName)}</span>
          <span class="badge-status ${b.status.toLowerCase()}" style="margin-left:auto;">${b.status}</span>
        </div>
        <div class="card-sub-tag">
          <i class="fa-solid fa-lock" style="font-size:9px;"></i> ${escapeHtml(b.category)} • 
          <strong style="color:var(--any-text);">LKR ${formatCurrency(b.amount)}</strong> • 
          <span style="${isOverdue ? 'color:#ef4444;' : ''}">Due: ${b.dueDate}</span>
        </div>
      </div>
    `;
  });
}

// ==========================================================================
// VIEW 2: NEXT 7 DAYS KANBAN RENDERER (Screenshot 2)
// ==========================================================================
function renderNext7Days() {
  const wrapper = document.getElementById('kanban-columns-wrapper');
  wrapper.innerHTML = '';

  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const today = new Date();

  for (let i = 0; i < 5; i++) {
    const d = new Date();
    d.setDate(today.getDate() + i);
    const dayName = daysOfWeek[d.getDay()];
    const dateStr = d.toISOString().split('T')[0];

    let headerLabel = dayName;
    if (i === 0) headerLabel = 'Today';
    else if (i === 1) headerLabel = 'Tomorrow';

    // Find bills/events for this day
    const dayBills = state.bills.filter(b => b.dueDate === dateStr);
    const dayEvents = state.events.filter(e => e.eventDate === dateStr);

    let cardsHtml = '';
    // If today, also show overdue bills in Today's column!
    if (i === 0) {
      state.bills.filter(b => b.status === 'OVERDUE').forEach(b => {
        cardsHtml += `
          <div class="kanban-task-card" onclick="openTaskInspector(${b.id}, 'bill')">
            <div class="card-top-row">
              <div class="circle-checkbox" onclick="event.stopPropagation(); toggleBillPaid(${b.id})"></div>
              <span class="card-title-text" style="color:#f87171;">${escapeHtml(b.billName)}</span>
            </div>
            <div class="card-sub-tag">
              <i class="fa-solid fa-lock" style="font-size:9px;"></i> ${escapeHtml(b.category)} • LKR ${formatCurrency(b.amount)} (OVERDUE)
            </div>
          </div>
        `;
      });
    }

    dayBills.forEach(b => {
      cardsHtml += `
        <div class="kanban-task-card" onclick="openTaskInspector(${b.id}, 'bill')">
          <div class="card-top-row">
            <div class="circle-checkbox ${b.status === 'PAID' ? 'checked' : ''}" onclick="event.stopPropagation(); toggleBillPaid(${b.id})">
              ${b.status === 'PAID' ? '<i class="fa-solid fa-check"></i>' : ''}
            </div>
            <span class="card-title-text">${escapeHtml(b.billName)}</span>
          </div>
          <div class="card-sub-tag">
            <i class="fa-solid fa-lock" style="font-size:9px;"></i> ${escapeHtml(b.category)} • LKR ${formatCurrency(b.amount)}
          </div>
        </div>
      `;
    });

    dayEvents.forEach(e => {
      cardsHtml += `
        <div class="kanban-task-card" onclick="openTaskInspector(${e.id}, 'event')" style="border-left:3px solid #3b82f6;">
          <div class="card-top-row">
            <i class="fa-solid fa-calendar-check" style="color:#3b82f6; font-size:13px;"></i>
            <span class="card-title-text">${escapeHtml(e.eventName)}</span>
          </div>
          <div class="card-sub-tag">
            ${escapeHtml(e.category)} • ${escapeHtml(e.location || 'Office')}
          </div>
        </div>
      `;
    });

    wrapper.innerHTML += `
      <div class="kanban-column">
        <div class="column-header">
          <span class="day-title">${headerLabel}</span>
          <span class="day-sub">${dayName}</span>
        </div>
        <div class="column-cards-list">
          ${cardsHtml}
        </div>
        <button class="add-task-column-btn" onclick="openAddBillModal()">
          <i class="fa-solid fa-plus"></i> Add Task
        </button>
      </div>
    `;
  }
}

// ==========================================================================
// VIEW 3: ALL TASKS & BILLS 2-PANE INSPECTOR (Screenshot 3 & 5)
// ==========================================================================
function renderAllTasksPane() {
  const todayStr = new Date().toISOString().split('T')[0];
  const tmrw = new Date();
  tmrw.setDate(tmrw.getDate() + 1);
  const tmrwStr = tmrw.toISOString().split('T')[0];

  const todayList = document.getElementById('list-group-today');
  const tmrwList = document.getElementById('list-group-tomorrow');
  const upList = document.getElementById('list-group-upcoming');
  const odList = document.getElementById('list-group-overdue');

  todayList.innerHTML = '';
  tmrwList.innerHTML = '';
  upList.innerHTML = '';
  odList.innerHTML = '';

  let cToday = 0, cTmrw = 0, cUp = 0, cOd = 0;

  state.bills.forEach(b => {
    const isOverdue = b.status === 'OVERDUE';
    const isToday = b.dueDate === todayStr;
    const isTmrw = b.dueDate === tmrwStr;

    const itemHtml = `
      <div class="task-list-item ${state.selectedTaskId === b.id ? 'selected' : ''}" onclick="openTaskInspector(${b.id}, 'bill')">
        <div class="circle-checkbox ${b.status === 'PAID' ? 'checked' : ''}" onclick="event.stopPropagation(); toggleBillPaid(${b.id})">
          ${b.status === 'PAID' ? '<i class="fa-solid fa-check"></i>' : ''}
        </div>
        <div class="task-item-content">
          <div class="task-item-title" style="${isOverdue ? 'color:#f87171;' : ''}">${escapeHtml(b.billName)}</div>
          <div class="task-item-sub">
            <span>${escapeHtml(b.category)}</span>
            <span>• LKR ${formatCurrency(b.amount)}</span>
            <span>• ${b.dueDate}</span>
          </div>
        </div>
      </div>
    `;

    if (isOverdue) {
      odList.innerHTML += itemHtml;
      cOd++;
    } else if (isToday) {
      todayList.innerHTML += itemHtml;
      cToday++;
    } else if (isTmrw) {
      tmrwList.innerHTML += itemHtml;
      cTmrw++;
    } else {
      upList.innerHTML += itemHtml;
      cUp++;
    }
  });

  document.getElementById('group-count-today').innerText = cToday;
  document.getElementById('group-count-tomorrow').innerText = cTmrw;
  document.getElementById('group-count-upcoming').innerText = cUp;
  document.getElementById('group-count-overdue').innerText = cOd;

  // Auto select first bill if none selected
  if (!state.selectedTaskId && state.bills.length > 0) {
    openTaskInspector(state.bills[0].id, 'bill');
  }
}

function openTaskInspector(id, type = 'bill') {
  state.selectedTaskId = id;
  state.selectedTaskType = type;

  // Switch to alltasks if in another view
  if (state.currentTab !== 'alltasks') {
    switchTab('alltasks');
  }

  // Update selected class in left list
  document.querySelectorAll('.task-list-item').forEach(el => el.classList.remove('selected'));

  if (type === 'bill') {
    const b = state.bills.find(item => item.id === id);
    if (!b) return;

    document.getElementById('insp-category-crumb').innerText = `My lists > Bills > ${b.category}`;
    document.getElementById('insp-title').value = b.billName;
    document.getElementById('insp-notes').value = b.description || '';

    // Tag pills
    document.getElementById('insp-tag-reminder-text').innerText = b.dueDate ? `Due ${b.dueDate}` : 'Remind me';
    document.getElementById('insp-tag-category-text').innerText = b.category;
    document.getElementById('insp-tag-status-text').innerText = b.status;
    document.getElementById('insp-tag-amount-text').innerText = `LKR ${formatCurrency(b.amount)}`;

    // Subtasks / payment status
    const isPaid = b.status === 'PAID';
    document.getElementById('insp-subtasks-count').innerText = isPaid ? '1/1' : '0/1';
    document.getElementById('insp-subtasks-progress').style.width = isPaid ? '100%' : '0%';
    document.getElementById('insp-subtask-check').className = `circle-checkbox ${isPaid ? 'checked' : ''}`;
    document.getElementById('insp-subtask-check').innerHTML = isPaid ? '<i class="fa-solid fa-check"></i>' : '';
    document.getElementById('insp-subtask-label').innerText = isPaid ? 'Invoice settled and marked as PAID' : 'Pending payment settlement';

    // Hook delete & complete
    document.getElementById('insp-mark-complete-btn').onclick = () => toggleBillPaid(b.id);
    document.getElementById('insp-delete-btn').onclick = () => deleteBill(b.id);
  }
}

async function toggleBillPaid(id) {
  const b = (state.bills || []).find(x => x.id === id);
  if (!b) return;

  if (b.status !== 'PAID') {
    b.status = 'PAID';
    b.paidDate = new Date().toISOString().split('T')[0];
    updateReactiveCounters();
    if (state.currentTab === 'myday') renderMyDay();
    showToast(`Bill "${b.billName}" marked as PAID!`, 'success');
    try {
      await api(`/api/bills/${id}/pay`, { method: 'PUT' });
    } catch (e) {
      console.error('Failed to persist pay status:', e);
    }
  } else {
    b.status = 'PENDING';
    b.paidDate = null;
    updateReactiveCounters();
    if (state.currentTab === 'myday') renderMyDay();
    showToast(`Bill "${b.billName}" reopened as PENDING!`, 'info');
    try {
      await api(`/api/bills/${id}`, {
        method: 'PUT',
        body: JSON.stringify({
          billName: b.billName,
          vendor: b.vendor,
          referenceNo: b.referenceNo,
          category: b.category,
          amount: b.amount,
          dueDate: b.dueDate,
          recurringPattern: b.recurringPattern,
          status: 'PENDING',
          description: b.description
        })
      });
    } catch (e) {
      console.error('Failed to reset bill status on backend:', e);
    }
  }
  await refreshAllData();
  switchTab(state.currentTab);
  if (state.currentTab === 'alltasks') openTaskInspector(id, 'bill');
}

async function deleteBill(id) {
  if (!confirm('Are you sure you want to delete this bill?')) return;
  state.bills = (state.bills || []).filter(x => x.id !== id);
  updateReactiveCounters();
  if (state.currentTab === 'myday') renderMyDay();
  try {
    await api(`/api/bills/${id}`, { method: 'DELETE' });
    showToast('Bill deleted.', 'info');
  } catch (e) {
    console.error('Delete bill error:', e);
  }
  state.selectedTaskId = null;
  await refreshAllData();
  switchTab(state.currentTab);
}

// ==========================================================================
// VIEW 4: MY CALENDAR DYNAMIC ENGINE (Month & Week Views + Detail Modal)
// ==========================================================================

function formatDateKey(d) {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function setCalendarMode(mode) {
  state.calendarMode = mode;
  const btnMonth = document.getElementById('cal-btn-mode-month');
  const btnWeek = document.getElementById('cal-btn-mode-week');
  const wrapMonth = document.getElementById('cal-month-view-wrapper');
  const wrapWeek = document.getElementById('cal-week-view-wrapper');

  if (mode === 'month') {
    if (btnMonth) btnMonth.classList.add('active');
    if (btnWeek) btnWeek.classList.remove('active');
    if (wrapMonth) { wrapMonth.style.display = 'flex'; wrapMonth.classList.add('active'); }
    if (wrapWeek) { wrapWeek.style.display = 'none'; wrapWeek.classList.remove('active'); }
  } else {
    if (btnMonth) btnMonth.classList.remove('active');
    if (btnWeek) btnWeek.classList.add('active');
    if (wrapMonth) { wrapMonth.style.display = 'none'; wrapMonth.classList.remove('active'); }
    if (wrapWeek) { wrapWeek.style.display = 'flex'; wrapWeek.classList.add('active'); }
  }
  renderCalendarView();
}

function calNext() {
  if (state.calendarMode === 'month') {
    state.calendarDate.setMonth(state.calendarDate.getMonth() + 1);
  } else {
    state.calendarDate.setDate(state.calendarDate.getDate() + 7);
  }
  renderCalendarView();
}

function calPrev() {
  if (state.calendarMode === 'month') {
    state.calendarDate.setMonth(state.calendarDate.getMonth() - 1);
  } else {
    state.calendarDate.setDate(state.calendarDate.getDate() - 7);
  }
  renderCalendarView();
}

function calToday() {
  state.calendarDate = new Date();
  renderCalendarView();
}

async function refreshCalendarData() {
  await refreshAllData();
  renderCalendarView();
}

function renderCalendarView() {
  if (state.calendarMode === 'week') {
    renderCalendarWeek();
  } else {
    renderCalendarMonth();
  }
}

// 1. Full Month Grid Renderer
function renderCalendarMonth() {
  const grid = document.getElementById('cal-month-grid');
  if (!grid) return;
  grid.innerHTML = '';

  const cur = state.calendarDate;
  const year = cur.getFullYear();
  const month = cur.getMonth();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const monthLbl = document.getElementById('cal-month-label');
  if (monthLbl) monthLbl.innerText = `${monthNames[month]} ${year}`;

  const todayStr = formatDateKey(new Date());

  // Calculate first day of month (Monday start: Mon=0 .. Sun=6)
  const firstDay = new Date(year, month, 1);
  let startDay = firstDay.getDay() - 1;
  if (startDay === -1) startDay = 6;

  // Days in current & previous months
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  // 35 or 42 grid slots
  const totalSlots = (startDay + daysInMonth > 35) ? 42 : 35;

  for (let i = 0; i < totalSlots; i++) {
    let cellYear = year;
    let cellMonth = month;
    let cellDayNum;
    let isOtherMonth = false;

    if (i < startDay) {
      isOtherMonth = true;
      cellDayNum = daysInPrevMonth - (startDay - i - 1);
      cellMonth = month - 1;
      if (cellMonth < 0) {
        cellMonth = 11;
        cellYear--;
      }
    } else if (i >= startDay + daysInMonth) {
      isOtherMonth = true;
      cellDayNum = i - (startDay + daysInMonth) + 1;
      cellMonth = month + 1;
      if (cellMonth > 11) {
        cellMonth = 0;
        cellYear++;
      }
    } else {
      cellDayNum = i - startDay + 1;
    }

    const cellDate = new Date(cellYear, cellMonth, cellDayNum);
    const dateKey = formatDateKey(cellDate);
    const isToday = dateKey === todayStr;

    // Fetch items scheduled on this day
    const dayBills = (state.bills || []).filter(b => b.dueDate === dateKey);
    const dayEvents = (state.events || []).filter(e => e.eventDate === dateKey);
    const dayReminders = (state.reminders || []).filter(r => r.reminderDate === dateKey);

    let itemsHtml = '';

    dayBills.forEach(b => {
      const isPaid = b.status === 'PAID';
      const isOd = b.status === 'OVERDUE';
      const cls = `type-bill ${isOd ? 'is-overdue' : (isPaid ? 'is-paid' : '')}`;
      itemsHtml += `
        <div class="cal-item-pill ${cls}" onclick="openCalendarItemDetail('bill', ${b.id})" title="${escapeHtml(b.billName)} - LKR ${formatCurrency(b.amount)}">
          <i class="fa-solid fa-file-invoice-dollar"></i>
          <span>${escapeHtml(b.billName)} • LKR ${formatCurrency(b.amount)}</span>
        </div>
      `;
    });

    dayEvents.forEach(e => {
      const timeStr = e.eventTime ? e.eventTime.substring(0, 5) : '';
      itemsHtml += `
        <div class="cal-item-pill type-event" onclick="openCalendarItemDetail('event', ${e.id})" title="${escapeHtml(e.eventName)} ${timeStr}">
          <i class="fa-regular fa-calendar-check"></i>
          <span>${escapeHtml(e.eventName)} ${timeStr ? `(${timeStr})` : ''}</span>
        </div>
      `;
    });

    dayReminders.forEach(r => {
      const title = r.title || (r.billId ? 'Bill Reminder' : 'Event Reminder');
      const timeStr = r.reminderTime ? r.reminderTime.substring(0, 5) : '';
      itemsHtml += `
        <div class="cal-item-pill type-reminder" onclick="openCalendarItemDetail('reminder', ${r.id})" title="${escapeHtml(title)}">
          <i class="fa-regular fa-bell"></i>
          <span>${escapeHtml(title)} ${timeStr ? `(${timeStr})` : ''}</span>
        </div>
      `;
    });

    const totalCount = dayBills.length + dayEvents.length + dayReminders.length;

    grid.innerHTML += `
      <div class="cal-month-day-cell ${isOtherMonth ? 'other-month' : ''} ${isToday ? 'is-today' : ''}" data-date="${dateKey}">
        <div class="cal-day-cell-top">
          <span class="cal-day-number">${cellDayNum}</span>
          ${totalCount > 0 ? `<span style="font-size:9.5px; color:var(--any-text-muted); font-weight:600;">${totalCount} ${totalCount === 1 ? 'item' : 'items'}</span>` : ''}
        </div>
        <div class="cal-day-items-list">
          ${itemsHtml}
        </div>
      </div>
    `;
  }
}

// 2. 7-Day Week Hourly Schedule Renderer
function renderCalendarWeek() {
  const daysHeader = document.getElementById('cal-days-header');
  const gridBody = document.getElementById('cal-grid-body');
  if (!daysHeader || !gridBody) return;

  const cur = new Date(state.calendarDate);
  let dayOfWeek = cur.getDay() - 1;
  if (dayOfWeek === -1) dayOfWeek = 6;
  cur.setDate(cur.getDate() - dayOfWeek);

  const weekStart = new Date(cur);
  const weekEnd = new Date(cur);
  weekEnd.setDate(weekEnd.getDate() + 6);

  const monthNamesShort = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const monthLbl = document.getElementById('cal-month-label');
  if (monthLbl) {
    monthLbl.innerText = `${monthNamesShort[weekStart.getMonth()]} ${weekStart.getDate()} – ${monthNamesShort[weekEnd.getMonth()]} ${weekEnd.getDate()}, ${weekEnd.getFullYear()}`;
  }

  // Keep first TIME cell
  daysHeader.innerHTML = '<div class="cal-day-cell-head"><span class="cal-day-name">TIME</span></div>';

  const dayNames = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
  const todayStr = formatDateKey(new Date());

  const weekDates = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(weekStart);
    d.setDate(weekStart.getDate() + i);
    const dateKey = formatDateKey(d);
    weekDates.push(dateKey);
    const isToday = dateKey === todayStr;

    daysHeader.innerHTML += `
      <div class="cal-day-cell-head">
        <span class="cal-day-name">${dayNames[i]}</span>
        <div class="cal-day-num ${isToday ? 'active-today' : ''}">${d.getDate()}</div>
      </div>
    `;
  }

  // Working Hours (8:00 AM to 6:00 PM)
  gridBody.innerHTML = '';
  const hours = [
    { label: '8:00 AM', hour: 8 },
    { label: '9:00 AM', hour: 9 },
    { label: '10:00 AM', hour: 10 },
    { label: '11:00 AM', hour: 11 },
    { label: '12:00 PM', hour: 12 },
    { label: '1:00 PM', hour: 13 },
    { label: '2:00 PM', hour: 14 },
    { label: '3:00 PM', hour: 15 },
    { label: '4:00 PM', hour: 16 },
    { label: '5:00 PM', hour: 17 },
    { label: '6:00 PM', hour: 18 }
  ];

  hours.forEach((hObj) => {
    let colsHtml = '';
    for (let c = 0; c < 7; c++) {
      const dateKey = weekDates[c];

      const dayBills = (state.bills || []).filter(b => b.dueDate === dateKey);
      const dayEvents = (state.events || []).filter(e => e.eventDate === dateKey);
      const dayReminders = (state.reminders || []).filter(r => r.reminderDate === dateKey);

      let slotContent = '';

      // Match events around this hour
      dayEvents.forEach(e => {
        let evHour = 10;
        if (e.eventTime) {
          const parts = e.eventTime.split(':');
          evHour = parseInt(parts[0], 10);
        }
        if (evHour === hObj.hour) {
          slotContent += `
            <div class="cal-item-pill type-event" onclick="openCalendarItemDetail('event', ${e.id})" title="${escapeHtml(e.eventName)}">
              <i class="fa-regular fa-calendar-check"></i> <span>${escapeHtml(e.eventName)}</span>
            </div>
          `;
        }
      });

      // Bills placed at 9:00 AM slot
      if (hObj.hour === 9) {
        dayBills.forEach(b => {
          const isPaid = b.status === 'PAID';
          const isOd = b.status === 'OVERDUE';
          const cls = `type-bill ${isOd ? 'is-overdue' : (isPaid ? 'is-paid' : '')}`;
          slotContent += `
            <div class="cal-item-pill ${cls}" onclick="openCalendarItemDetail('bill', ${b.id})" title="${escapeHtml(b.billName)}">
              <i class="fa-solid fa-file-invoice-dollar"></i> <span>${escapeHtml(b.billName)} (LKR ${formatCurrency(b.amount)})</span>
            </div>
          `;
        });
      }

      // Reminders placed at their time or 11:00 AM slot
      dayReminders.forEach(r => {
        let remHour = 11;
        if (r.reminderTime) {
          const parts = r.reminderTime.split(':');
          remHour = parseInt(parts[0], 10);
        }
        if (remHour === hObj.hour) {
          const title = r.title || (r.billId ? 'Bill Reminder' : 'Event Reminder');
          slotContent += `
            <div class="cal-item-pill type-reminder" onclick="openCalendarItemDetail('reminder', ${r.id})" title="${escapeHtml(title)}">
              <i class="fa-regular fa-bell"></i> <span>${escapeHtml(title)}</span>
            </div>
          `;
        }
      });

      colsHtml += `<div class="cal-grid-col-cell">${slotContent}</div>`;
    }

    gridBody.innerHTML += `
      <div class="cal-hour-row">
        <div class="cal-hour-label">${hObj.label}</div>
        ${colsHtml}
      </div>
    `;
  });
}

// 3. Item Detail Modal Handler (Triggered when user clicks on any calendar item)
function openCalendarItemDetail(type, id) {
  const typeBadge = document.getElementById('cal-modal-type-badge');
  const titleEl = document.getElementById('cal-modal-title');
  const dtEl = document.getElementById('cal-modal-datetime');
  const catEl = document.getElementById('cal-modal-category');
  const amtRow = document.getElementById('cal-modal-amount-row');
  const amtEl = document.getElementById('cal-modal-amount');
  const statEl = document.getElementById('cal-modal-status');
  const locRow = document.getElementById('cal-modal-location-row');
  const locEl = document.getElementById('cal-modal-location');
  const descEl = document.getElementById('cal-modal-desc');
  const payBtn = document.getElementById('cal-modal-pay-btn');
  const inspectBtn = document.getElementById('cal-modal-inspect-btn');

  if (type === 'bill') {
    const b = (state.bills || []).find(x => x.id === id);
    if (!b) return;

    typeBadge.className = `badge-status ${b.status.toLowerCase()}`;
    typeBadge.innerText = 'BILL';
    titleEl.innerText = b.billName;
    dtEl.innerText = `Due Date: ${b.dueDate}`;
    catEl.innerText = b.category || 'General';
    amtRow.style.display = 'flex';
    amtEl.innerText = `LKR ${formatCurrency(b.amount)}`;
    statEl.innerHTML = `<span class="badge-status ${b.status.toLowerCase()}">${b.status}</span>`;
    locRow.style.display = 'none';
    descEl.innerText = b.description || 'No specific notes recorded for this bill.';

    if (b.status !== 'PAID') {
      payBtn.style.display = 'inline-flex';
      payBtn.onclick = async () => {
        await toggleBillPaid(b.id);
        closeModal('modal-calendar-item-detail');
        renderCalendarView();
      };
    } else {
      payBtn.style.display = 'none';
    }

    inspectBtn.onclick = () => {
      closeModal('modal-calendar-item-detail');
      switchTab('alltasks');
      openTaskInspector(b.id, 'bill');
    };
  } else if (type === 'event') {
    const e = (state.events || []).find(x => x.id === id);
    if (!e) return;

    typeBadge.className = 'badge-status in_progress';
    typeBadge.innerText = 'EVENT';
    titleEl.innerText = e.eventName;
    dtEl.innerText = `${e.eventDate} ${e.eventTime ? 'at ' + e.eventTime : ''}`;
    catEl.innerText = e.category || 'Corporate Event';
    amtRow.style.display = 'none';
    statEl.innerHTML = `<span class="badge-status open">SCHEDULED</span>`;
    locRow.style.display = 'flex';
    locEl.innerText = e.location || 'Office';
    descEl.innerText = e.description || 'No additional notes recorded for this event.';
    payBtn.style.display = 'none';

    inspectBtn.onclick = () => {
      closeModal('modal-calendar-item-detail');
      switchTab('events');
    };
  } else if (type === 'reminder') {
    const r = (state.reminders || []).find(x => x.id === id);
    if (!r) return;

    typeBadge.className = 'badge-status warning';
    typeBadge.innerText = 'REMINDER';
    titleEl.innerText = r.title || (r.billId ? 'Bill Due Reminder' : 'Event Reminder');
    dtEl.innerText = `${r.reminderDate} ${r.reminderTime ? 'at ' + r.reminderTime : ''}`;
    catEl.innerText = `Recurrence: ${r.recurrenceType || 'ONCE'}`;
    amtRow.style.display = 'none';
    statEl.innerHTML = `<span class="badge-status ${r.status === 'ACTIVE' ? 'open' : 'resolved'}">${r.status || 'ACTIVE'}</span>`;
    locRow.style.display = 'none';
    descEl.innerText = `Scheduled reminder alert for user. Recurrence frequency: ${r.recurrenceType || 'ONCE'}.`;
    payBtn.style.display = 'none';

    inspectBtn.onclick = () => {
      closeModal('modal-calendar-item-detail');
      switchTab('reminders');
    };
  }

  openModal('modal-calendar-item-detail');
}

// Explicit window bindings for calendar
window.setCalendarMode = setCalendarMode;
window.calNext = calNext;
window.calPrev = calPrev;
window.calToday = calToday;
window.refreshCalendarData = refreshCalendarData;
window.openCalendarItemDetail = openCalendarItemDetail;
window.renderCalendarView = renderCalendarView;

// ==========================================================================
// VIEW 5: FULL BILLS TABLE
// ==========================================================================
async function loadBillsTable() {
  const isAdm = isAdmin();
  const userId = state.currentUser ? state.currentUser.id : null;
  state.bills = (isAdm || !userId) ? await api('/api/bills') : await api(`/api/bills/user/${userId}`);
  filterBillsFullTable();
}

function filterBillsFullTable() {
  const q = document.getElementById('bills-search-box').value.toLowerCase().trim();
  const cat = document.getElementById('bills-category-select').value;
  const stat = document.getElementById('bills-status-select').value;

  const filtered = state.bills.filter(b => {
    const mQ = !q || (b.billName && b.billName.toLowerCase().includes(q)) || 
                     (b.vendor && b.vendor.toLowerCase().includes(q)) || 
                     (b.referenceNo && b.referenceNo.toLowerCase().includes(q)) || 
                     (b.description && b.description.toLowerCase().includes(q));
    const mC = cat === 'ALL' || b.category === cat;
    const mS = stat === 'ALL' || b.status === stat;
    return mQ && mC && mS;
  });

  const tbody = document.querySelector('#table-bills-full tbody');
  tbody.innerHTML = '';

  if (filtered.length === 0) {
    tbody.innerHTML = '<tr><td colspan="9" style="text-align:center; color:var(--any-text-muted); padding:24px;">No bills match your search criteria.</td></tr>';
    return;
  }

  filtered.forEach(b => {
    tbody.innerHTML += `
      <tr>
        <td>#${b.id}</td>
        <td>
          <div style="font-weight:600; color:var(--any-text);">${escapeHtml(b.billName)}</div>
          <div style="font-size:11px; color:#94a3b8; margin-top:2px; display:flex; align-items:center; gap:4px;">
            <i class="fa-solid fa-building" style="font-size:10px; color:#38bdf8;"></i> ${escapeHtml(b.vendor || 'N/A')}
          </div>
        </td>
        <td>
          <span style="background:rgba(255,255,255,0.06); padding:2px 7px; border-radius:4px; font-family:monospace; font-size:11.5px; color:#38bdf8; border:1px solid rgba(56,189,248,0.25);">
            ${escapeHtml(b.referenceNo || 'N/A')}
          </span>
        </td>
        <td>${escapeHtml(b.category)}</td>
        <td><strong>LKR ${formatCurrency(b.amount)}</strong></td>
        <td style="${b.status === 'OVERDUE' ? 'color:#f87171;' : ''}">${b.dueDate}</td>
        <td>${b.recurringPattern || 'NONE'}</td>
        <td><span class="badge-status ${b.status.toLowerCase()}">${b.status}</span></td>
        <td>
          <div style="display:flex; gap:6px; align-items:center;">
            <button class="btn-any-subtle" style="padding:4px 8px; font-size:11.5px;" onclick="openEditBillModal(${b.id})" title="Edit Bill">
              <i class="fa-solid fa-pen-to-square" style="color:#60a5fa;"></i> Edit
            </button>
            <button class="btn-any-subtle" style="padding:4px 8px; font-size:11.5px; color:#f87171;" onclick="deleteBill(${b.id})" title="Delete Bill">
              <i class="fa-solid fa-trash"></i>
            </button>
            <button class="btn-any-subtle" style="padding:4px 8px; font-size:11px;" onclick="openTaskInspector(${b.id}, 'bill')" title="Inspect Task">
              <i class="fa-solid fa-eye"></i>
            </button>
          </div>
        </td>
      </tr>
    `;
  });
}

// ==========================================================================
// VIEW 6: EVENTS TABLE
// ==========================================================================
async function loadEventsTable() {
  const isAdm = isAdmin();
  const userId = state.currentUser ? state.currentUser.id : null;
  state.events = (isAdm || !userId) ? await api('/api/events') : await api(`/api/events/user/${userId}`);
  filterEventsFullTable();
}

function filterEventsFullTable() {
  const qEl = document.getElementById('events-search-box');
  const catEl = document.getElementById('events-category-select');
  const statEl = document.getElementById('events-status-select');

  const q = qEl ? qEl.value.toLowerCase().trim() : '';
  const cat = catEl ? catEl.value : 'ALL';
  const stat = statEl ? statEl.value : 'ALL';

  const filtered = (state.events || []).filter(e => {
    const mQ = !q || e.eventName.toLowerCase().includes(q) || 
      (e.location && e.location.toLowerCase().includes(q)) || 
      (e.description && e.description.toLowerCase().includes(q));
    const mC = cat === 'ALL' || e.category === cat;
    const mS = stat === 'ALL' || (e.status && e.status.toUpperCase() === stat);
    return mQ && mC && mS;
  });

  const tbody = document.querySelector('#table-events-full tbody');
  if (!tbody) return;
  tbody.innerHTML = '';

  if (filtered.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7" style="text-align:center; color:var(--any-text-muted); padding:24px;">No events match your search criteria.</td></tr>';
    return;
  }

  filtered.forEach(e => {
    tbody.innerHTML += `
      <tr>
        <td>#${e.id}</td>
        <td><strong>${escapeHtml(e.eventName)}</strong></td>
        <td>${escapeHtml(e.category)}</td>
        <td>${e.eventDate} ${e.eventTime ? e.eventTime.substring(0, 5) : ''}</td>
        <td>${escapeHtml(e.location || 'N/A')}</td>
        <td><span class="badge-status ${e.status ? e.status.toLowerCase() : 'open'}">${e.status || 'UPCOMING'}</span></td>
        <td>
          <div style="display:flex; gap:6px; align-items:center;">
            <button class="btn-any-subtle" style="padding:4px 8px; font-size:11.5px;" onclick="openEditEventModal(${e.id})" title="Edit Event">
              <i class="fa-solid fa-pen-to-square" style="color:#60a5fa;"></i> Edit
            </button>
            <button class="btn-any-subtle" style="padding:4px 8px; font-size:11.5px; color:#f87171;" onclick="deleteEvent(${e.id})" title="Delete Event">
              <i class="fa-solid fa-trash"></i>
            </button>
          </div>
        </td>
      </tr>
    `;
  });
}

async function deleteEvent(id) {
  if (!confirm('Are you sure you want to delete this event?')) return;
  state.events = (state.events || []).filter(x => x.id !== id);
  updateReactiveCounters();
  try {
    await api(`/api/events/${id}`, { method: 'DELETE' });
    showToast('Event deleted successfully.', 'info');
  } catch (e) {
    console.error('Delete event error:', e);
  }
  await refreshAllData();
  switchTab(state.currentTab);
}

// ==========================================================================
// VIEW 7: REMINDERS HUB (SEPARATE BILLS & EVENTS, FULL CRUD)
// ==========================================================================
let reminderFilterType = 'ALL'; // 'ALL', 'BILLS', 'EVENTS'
let reminderFilterStatus = 'ALL'; // 'ALL', 'ACTIVE', 'TRIGGERED', 'DISMISSED', 'CANCELLED'
let reminderSearchQuery = '';

async function loadRemindersTable() {
  try {
    const isAdm = isAdmin();
    const userId = state.currentUser ? state.currentUser.id : null;
    
    // Fetch reminders and ensure bills & events are populated
    const [reminders, bills, events] = await Promise.all([
      (isAdm || !userId) ? api('/api/reminders') : api(`/api/reminders/user/${userId}`),
      (!state.bills || state.bills.length === 0) 
        ? ((isAdm || !userId) ? api('/api/bills') : api(`/api/bills/user/${userId}`)) 
        : Promise.resolve(state.bills),
      (!state.events || state.events.length === 0) 
        ? ((isAdm || !userId) ? api('/api/events') : api(`/api/events/user/${userId}`)) 
        : Promise.resolve(state.events)
    ]);

    state.reminders = reminders || [];
    if (bills && (!state.bills || state.bills.length === 0)) state.bills = bills;
    if (events && (!state.events || state.events.length === 0)) state.events = events;
  } catch (err) {
    console.error('Error loading reminders:', err);
    state.reminders = state.reminders || [];
  }

  const remBadge = document.getElementById('badge-reminders-sidebar');
  if (remBadge) remBadge.innerText = state.reminders.length;

  renderRemindersTables();
}

function filterRemindersByType(type) {
  reminderFilterType = type;
  
  const btnAll = document.getElementById('btn-rem-filter-all');
  const btnBills = document.getElementById('btn-rem-filter-bills');
  const btnEvents = document.getElementById('btn-rem-filter-events');
  
  if (btnAll) btnAll.className = `rem-seg-btn ${type === 'ALL' ? 'active' : ''}`;
  if (btnBills) btnBills.className = `rem-seg-btn ${type === 'BILLS' ? 'active bills' : ''}`;
  if (btnEvents) btnEvents.className = `rem-seg-btn ${type === 'EVENTS' ? 'active events' : ''}`;

  renderRemindersTables();
}

function filterRemindersByStatus(status) {
  reminderFilterStatus = status;
  const select = document.getElementById('select-rem-status');
  if (select) select.value = status;
  renderRemindersTables();
}

function handleReminderSearch(query) {
  reminderSearchQuery = (query || '').toLowerCase().trim();
  renderRemindersTables();
}

function handleReminderStatusFilter(status) {
  reminderFilterStatus = status;
  renderRemindersTables();
}

function calculateUrgency(dateStr) {
  if (!dateStr) return { label: 'Scheduled', className: 'upcoming' };
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const [y, m, d] = dateStr.split('-').map(Number);
  const target = new Date(y, m - 1, d);
  target.setHours(0, 0, 0, 0);

  const diffDays = Math.round((target - today) / (1000 * 60 * 60 * 24));
  if (diffDays < 0) return { label: 'Past Alert', className: 'past' };
  if (diffDays === 0) return { label: 'Today', className: 'today' };
  if (diffDays === 1) return { label: 'Tomorrow', className: 'tomorrow' };
  if (diffDays <= 7) return { label: `In ${diffDays} days`, className: 'upcoming' };
  return { label: `In ${diffDays} days`, className: 'upcoming' };
}

function renderRemindersTables() {
  const allReminders = state.reminders || [];
  
  // Classify reminders into Bills and Events
  const billReminders = allReminders.filter(r => r.billId != null);
  const eventReminders = allReminders.filter(r => r.eventId != null || (!r.billId && !r.eventId));
  const activeReminders = allReminders.filter(r => (r.status || 'ACTIVE') === 'ACTIVE');

  // Update KPI counters
  const elTotal = document.getElementById('kpi-rem-total');
  const elBills = document.getElementById('kpi-rem-bills');
  const elEvents = document.getElementById('kpi-rem-events');
  const elActive = document.getElementById('kpi-rem-active');
  const countAll = document.getElementById('count-tab-all');
  const countBills = document.getElementById('count-tab-bills');
  const countEvents = document.getElementById('count-tab-events');
  const badgeBillCount = document.getElementById('badge-bill-reminders-count');
  const badgeEventCount = document.getElementById('badge-event-reminders-count');

  if (elTotal) elTotal.innerText = allReminders.length;
  if (elBills) elBills.innerText = billReminders.length;
  if (elEvents) elEvents.innerText = eventReminders.length;
  if (elActive) elActive.innerText = activeReminders.length;
  if (countAll) countAll.innerText = allReminders.length;
  if (countBills) countBills.innerText = billReminders.length;
  if (countEvents) countEvents.innerText = eventReminders.length;
  if (badgeBillCount) badgeBillCount.innerText = `${billReminders.length} Bills`;
  if (badgeEventCount) badgeEventCount.innerText = `${eventReminders.length} Events`;

  // Control panel visibility based on active type tab
  const secBills = document.getElementById('section-bill-reminders');
  const secEvents = document.getElementById('section-event-reminders');

  if (secBills) secBills.style.display = (reminderFilterType === 'ALL' || reminderFilterType === 'BILLS') ? 'block' : 'none';
  if (secEvents) secEvents.style.display = (reminderFilterType === 'ALL' || reminderFilterType === 'EVENTS') ? 'block' : 'none';

  // Helper filter function
  const filterList = (list, isBill) => {
    return list.filter(r => {
      // Status filter
      if (reminderFilterStatus !== 'ALL') {
        const remStatus = (r.status || 'ACTIVE').toUpperCase();
        if (remStatus !== reminderFilterStatus) return false;
      }
      // Search filter
      if (reminderSearchQuery) {
        let name = '';
        let cat = '';
        if (isBill) {
          const b = (state.bills || []).find(item => item.id === r.billId);
          name = b ? b.billName : `Bill #${r.billId}`;
          cat = b ? b.category : '';
        } else {
          const e = (state.events || []).find(item => item.id === r.eventId);
          name = e ? e.eventName : (r.eventId ? `Event #${r.eventId}` : 'Personal Task');
          cat = e ? e.category : '';
        }
        const matchesName = name.toLowerCase().includes(reminderSearchQuery);
        const matchesCat = cat.toLowerCase().includes(reminderSearchQuery);
        const matchesDate = (r.reminderDate || '').includes(reminderSearchQuery);
        const matchesStatus = (r.status || '').toLowerCase().includes(reminderSearchQuery);
        if (!matchesName && !matchesCat && !matchesDate && !matchesStatus) return false;
      }
      return true;
    });
  };

  const filteredBills = filterList(billReminders, true);
  const filteredEvents = filterList(eventReminders, false);

  // Render Bill Reminders Table
  const tbodyBills = document.getElementById('tbody-reminders-bills');
  if (tbodyBills) {
    if (filteredBills.length === 0) {
      tbodyBills.innerHTML = `
        <tr>
          <td colspan="7">
            <div class="rem-empty-state">
              <i class="fa-solid fa-file-invoice-dollar rem-empty-icon" style="color: rgba(16, 185, 129, 0.4);"></i>
              <div style="font-size:14px; font-weight:600; color:var(--any-text); margin-bottom:4px;">No Bill Reminders Found</div>
              <div style="font-size:12px; color:var(--any-text-muted);">
                ${allReminders.length === 0 ? 'You have not set any bill reminders yet.' : 'No bill reminders match your filter criteria.'}
              </div>
            </div>
          </td>
        </tr>
      `;
    } else {
      tbodyBills.innerHTML = filteredBills.map(r => {
        const b = (state.bills || []).find(item => item.id === r.billId);
        const billName = b ? escapeHtml(b.billName) : `Bill #${r.billId}`;
        const category = b ? escapeHtml(b.category) : 'General';
        const amountStr = b && b.amount != null ? `LKR ${Number(b.amount).toLocaleString(undefined, {minimumFractionDigits: 2})}` : '-';
        const dueDate = b ? b.dueDate : 'N/A';
        const urgency = calculateUrgency(r.reminderDate);
        const statusClass = (r.status === 'ACTIVE') ? 'resolved' : (r.status === 'TRIGGERED' ? 'pending' : (r.status === 'CANCELLED' ? 'overdue' : 'pending'));
        const toggleIcon = r.status === 'ACTIVE' ? 'fa-check' : 'fa-arrow-rotate-left';
        const toggleTitle = r.status === 'ACTIVE' ? 'Mark as Dismissed' : 'Mark as Active';

        return `
          <tr>
            <td style="color: var(--any-text-sub); font-weight: 600;">#${r.id}</td>
            <td>
              <div class="rem-item-main">
                <span class="rem-item-name" onclick="viewReminder(${r.id})" title="Click to view details">
                  <i class="fa-solid fa-file-invoice" style="color: #10b981;"></i>
                  ${billName}
                </span>
                <div class="rem-item-sub">
                  <span class="rem-cat-tag"><i class="fa-solid fa-tag"></i> ${category}</span>
                  ${b ? `<span style="color: var(--any-text-sub);">Ref #${b.id}</span>` : ''}
                </div>
              </div>
            </td>
            <td>
              <div style="display:flex; flex-direction:column; gap:3px;">
                <span class="rem-amount-tag">${amountStr}</span>
                <span style="font-size:11.5px; color:var(--any-text-muted);"><i class="fa-regular fa-calendar" style="margin-right:3px;"></i> Due: ${dueDate}</span>
              </div>
            </td>
            <td>
              <div class="rem-schedule-badge">
                <span class="rem-schedule-date">
                  <i class="fa-regular fa-clock"></i>
                  ${r.reminderDate} ${r.reminderTime ? `<span style="color:#fde047; font-weight:normal; font-size:12px;">${r.reminderTime}</span>` : ''}
                </span>
                <span class="rem-schedule-urgency ${urgency.className}">${urgency.label}</span>
              </div>
            </td>
            <td>
              <span class="badge-status pending"><i class="fa-solid fa-repeat" style="font-size:9px;"></i> ${r.recurrenceType || 'ONCE'}</span>
            </td>
            <td>
              <span class="badge-status ${statusClass}">${r.status || 'ACTIVE'}</span>
            </td>
            <td style="text-align: right;">
              <div class="rem-actions-cell" style="justify-content: flex-end;">
                <button type="button" class="rem-act-btn view" onclick="viewReminder(${r.id})" title="View Details">
                  <i class="fa-solid fa-eye"></i>
                </button>
                <button type="button" class="rem-act-btn edit" onclick="openEditReminderModal(${r.id})" title="Edit Reminder">
                  <i class="fa-solid fa-pen-to-square"></i>
                </button>
                <button type="button" class="rem-act-btn toggle" onclick="quickToggleReminderStatus(${r.id})" title="${toggleTitle}">
                  <i class="fa-solid ${toggleIcon}"></i>
                </button>
                <button type="button" class="rem-act-btn delete" onclick="deleteReminderItem(${r.id})" title="Delete Reminder">
                  <i class="fa-solid fa-trash"></i>
                </button>
              </div>
            </td>
          </tr>
        `;
      }).join('');
    }
  }

  // Render Event Reminders Table
  const tbodyEvents = document.getElementById('tbody-reminders-events');
  if (tbodyEvents) {
    if (filteredEvents.length === 0) {
      tbodyEvents.innerHTML = `
        <tr>
          <td colspan="7">
            <div class="rem-empty-state">
              <i class="fa-solid fa-calendar-check rem-empty-icon" style="color: rgba(14, 165, 233, 0.4);"></i>
              <div style="font-size:14px; font-weight:600; color:var(--any-text); margin-bottom:4px;">No Event Reminders Found</div>
              <div style="font-size:12px; color:var(--any-text-muted);">
                ${allReminders.length === 0 ? 'You have not set any event reminders yet.' : 'No event reminders match your filter criteria.'}
              </div>
            </div>
          </td>
        </tr>
      `;
    } else {
      tbodyEvents.innerHTML = filteredEvents.map(r => {
        const e = (state.events || []).find(item => item.id === r.eventId);
        const eventName = e ? escapeHtml(e.eventName) : (r.eventId ? `Event #${r.eventId}` : 'Personal Task Reminder');
        const category = e ? escapeHtml(e.category) : 'General';
        const locationStr = e && e.location ? escapeHtml(e.location) : 'Online / General';
        const eventDate = e ? `${e.eventDate} ${e.eventTime || ''}` : 'N/A';
        const urgency = calculateUrgency(r.reminderDate);
        const statusClass = (r.status === 'ACTIVE') ? 'resolved' : (r.status === 'TRIGGERED' ? 'pending' : (r.status === 'CANCELLED' ? 'overdue' : 'pending'));
        const toggleIcon = r.status === 'ACTIVE' ? 'fa-check' : 'fa-arrow-rotate-left';
        const toggleTitle = r.status === 'ACTIVE' ? 'Mark as Dismissed' : 'Mark as Active';

        return `
          <tr>
            <td style="color: var(--any-text-sub); font-weight: 600;">#${r.id}</td>
            <td>
              <div class="rem-item-main">
                <span class="rem-item-name" onclick="viewReminder(${r.id})" title="Click to view details">
                  <i class="fa-solid fa-calendar-day" style="color: #0ea5e9;"></i>
                  ${eventName}
                </span>
                <div class="rem-item-sub">
                  <span class="rem-cat-tag"><i class="fa-solid fa-tag"></i> ${category}</span>
                  ${e ? `<span style="color: var(--any-text-sub);">Ref #${e.id}</span>` : ''}
                </div>
              </div>
            </td>
            <td>
              <div style="display:flex; flex-direction:column; gap:3px;">
                <span style="font-size:12.5px; color:var(--any-text);"><i class="fa-regular fa-calendar-check" style="margin-right:3px; color:#38bdf8;"></i> ${eventDate}</span>
                <span class="rem-location-tag"><i class="fa-solid fa-location-dot" style="margin-right:2px;"></i> ${locationStr}</span>
              </div>
            </td>
            <td>
              <div class="rem-schedule-badge">
                <span class="rem-schedule-date">
                  <i class="fa-regular fa-clock"></i>
                  ${r.reminderDate} ${r.reminderTime ? `<span style="color:#fde047; font-weight:normal; font-size:12px;">${r.reminderTime}</span>` : ''}
                </span>
                <span class="rem-schedule-urgency ${urgency.className}">${urgency.label}</span>
              </div>
            </td>
            <td>
              <span class="badge-status pending"><i class="fa-solid fa-repeat" style="font-size:9px;"></i> ${r.recurrenceType || 'ONCE'}</span>
            </td>
            <td>
              <span class="badge-status ${statusClass}">${r.status || 'ACTIVE'}</span>
            </td>
            <td style="text-align: right;">
              <div class="rem-actions-cell" style="justify-content: flex-end;">
                <button type="button" class="rem-act-btn view" onclick="viewReminder(${r.id})" title="View Details">
                  <i class="fa-solid fa-eye"></i>
                </button>
                <button type="button" class="rem-act-btn edit" onclick="openEditReminderModal(${r.id})" title="Edit Reminder">
                  <i class="fa-solid fa-pen-to-square"></i>
                </button>
                <button type="button" class="rem-act-btn toggle" onclick="quickToggleReminderStatus(${r.id})" title="${toggleTitle}">
                  <i class="fa-solid ${toggleIcon}"></i>
                </button>
                <button type="button" class="rem-act-btn delete" onclick="deleteReminderItem(${r.id})" title="Delete Reminder">
                  <i class="fa-solid fa-trash"></i>
                </button>
              </div>
            </td>
          </tr>
        `;
      }).join('');
    }
  }
}

// --------------------------------------------------------------------------
// REMINDER VIEW MODAL
// --------------------------------------------------------------------------
function viewReminder(id) {
  const r = (state.reminders || []).find(item => item.id === id);
  if (!r) {
    showToast('Reminder not found', 'error');
    return;
  }

  const isBill = !!r.billId;
  const bill = isBill ? (state.bills || []).find(b => b.id === r.billId) : null;
  const event = !isBill ? (state.events || []).find(e => e.id === r.eventId) : null;

  const headerTitle = document.getElementById('view-rem-header-title');
  const typeIcon = document.getElementById('view-rem-type-icon');
  const targetName = document.getElementById('view-rem-target-name');
  const targetSub = document.getElementById('view-rem-target-sub');
  const dateEl = document.getElementById('view-rem-date');
  const timeEl = document.getElementById('view-rem-time');
  const recurEl = document.getElementById('view-rem-recurrence');
  const statusBadge = document.getElementById('view-rem-status-badge');
  const extraContent = document.getElementById('view-rem-extra-content');

  if (headerTitle) headerTitle.innerHTML = `<i class="fa-regular fa-bell"></i> Reminder Details #${r.id}`;

  if (isBill) {
    typeIcon.style.background = 'rgba(16, 185, 129, 0.15)';
    typeIcon.style.color = '#10b981';
    typeIcon.innerHTML = '<i class="fa-solid fa-file-invoice-dollar"></i>';
    targetName.innerText = bill ? bill.billName : `Bill #${r.billId}`;
    targetSub.innerHTML = `Category: <strong>${bill ? bill.category : 'General'}</strong> | Due Date: <strong>${bill ? bill.dueDate : '-'}</strong>`;
    
    if (extraContent) {
      extraContent.innerHTML = bill ? `
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px;">
          <div>Amount: <strong style="color:#34d399;">LKR ${Number(bill.amount).toLocaleString(undefined, {minimumFractionDigits: 2})}</strong></div>
          <div>Bill Status: <span class="badge-status ${bill.status === 'PAID' ? 'resolved' : (bill.status === 'OVERDUE' ? 'overdue' : 'pending')}">${bill.status}</span></div>
          ${bill.description ? `<div style="grid-column:1/-1; margin-top:4px; font-style:italic; color:#9ca3af;">"${escapeHtml(bill.description)}"</div>` : ''}
        </div>
      ` : 'Associated Bill record could not be loaded.';
    }
  } else {
    typeIcon.style.background = 'rgba(14, 165, 233, 0.15)';
    typeIcon.style.color = '#0ea5e9';
    typeIcon.innerHTML = '<i class="fa-solid fa-calendar-check"></i>';
    targetName.innerText = event ? event.eventName : (r.eventId ? `Event #${r.eventId}` : 'Personal Task');
    targetSub.innerHTML = `Category: <strong>${event ? event.category : 'General'}</strong> | Date: <strong>${event ? event.eventDate : '-'}</strong>`;
    
    if (extraContent) {
      extraContent.innerHTML = event ? `
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px;">
          <div>Location: <strong style="color:#38bdf8;">${escapeHtml(event.location || 'Online / Remote')}</strong></div>
          <div>Event Status: <span class="badge-status ${event.status === 'COMPLETED' ? 'resolved' : 'pending'}">${event.status}</span></div>
          ${event.description ? `<div style="grid-column:1/-1; margin-top:4px; font-style:italic; color:#9ca3af;">"${escapeHtml(event.description)}"</div>` : ''}
        </div>
      ` : 'Associated Event record could not be loaded.';
    }
  }

  if (dateEl) dateEl.innerText = r.reminderDate || '-';
  if (timeEl) timeEl.innerText = r.reminderTime || 'Not Specified (09:00 default)';
  if (recurEl) recurEl.innerText = r.recurrenceType || 'ONCE';

  const statusClass = (r.status === 'ACTIVE') ? 'resolved' : (r.status === 'TRIGGERED' ? 'pending' : (r.status === 'CANCELLED' ? 'overdue' : 'pending'));
  if (statusBadge) statusBadge.innerHTML = `<span class="badge-status ${statusClass}">${r.status || 'ACTIVE'}</span>`;

  // Action buttons inside view modal
  const btnEdit = document.getElementById('btn-view-rem-edit');
  const btnDelete = document.getElementById('btn-view-rem-delete');
  if (btnEdit) btnEdit.onclick = () => { closeModal('modal-view-reminder'); openEditReminderModal(r.id); };
  if (btnDelete) btnDelete.onclick = () => deleteReminderItem(r.id);

  openModal('modal-view-reminder');
}

// --------------------------------------------------------------------------
// REMINDER EDIT MODAL & SUBMIT
// --------------------------------------------------------------------------
function openEditReminderModal(id) {
  const r = (state.reminders || []).find(item => item.id === id);
  if (!r) {
    showToast('Reminder not found', 'error');
    return;
  }

  closeModal('modal-view-reminder');

  const isBill = !!r.billId;
  const bill = isBill ? (state.bills || []).find(b => b.id === r.billId) : null;
  const event = !isBill ? (state.events || []).find(e => e.id === r.eventId) : null;

  document.getElementById('edit-rem-id').value = r.id;
  
  const targetDesc = document.getElementById('edit-rem-target-desc');
  if (targetDesc) {
    if (isBill) {
      targetDesc.innerHTML = `<i class="fa-solid fa-file-invoice-dollar" style="color:#10b981;"></i> <span><strong>${bill ? escapeHtml(bill.billName) : `Bill #${r.billId}`}</strong> (Due: ${bill ? bill.dueDate : '-'})</span>`;
    } else {
      targetDesc.innerHTML = `<i class="fa-solid fa-calendar-check" style="color:#0ea5e9;"></i> <span><strong>${event ? escapeHtml(event.eventName) : (r.eventId ? `Event #${r.eventId}` : 'Personal Task')}</strong> (Date: ${event ? event.eventDate : '-'})</span>`;
    }
  }

  document.getElementById('edit-rem-date').value = r.reminderDate || '';
  document.getElementById('edit-rem-time').value = r.reminderTime || '09:00';
  document.getElementById('edit-rem-recurrence').value = r.recurrenceType || 'ONCE';
  document.getElementById('edit-rem-status').value = r.status || 'ACTIVE';

  openModal('modal-edit-reminder');
}

async function handleEditReminderSubmit(e) {
  e.preventDefault();
  const id = parseInt(document.getElementById('edit-rem-id').value);
  const r = (state.reminders || []).find(item => item.id === id);
  
  const payload = {
    billId: r ? r.billId : null,
    eventId: r ? r.eventId : null,
    userId: state.currentUser ? state.currentUser.id : 1,
    reminderDate: document.getElementById('edit-rem-date').value,
    reminderTime: document.getElementById('edit-rem-time').value || null,
    recurrenceType: document.getElementById('edit-rem-recurrence').value,
    status: document.getElementById('edit-rem-status').value
  };

  try {
    await api(`/api/reminders/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload)
    });
    showToast('Reminder updated successfully!', 'success');
    closeModal('modal-edit-reminder');
    await loadRemindersTable();
    refreshAllData();
  } catch (err) {
    showToast('Failed to update reminder: ' + err.message, 'error');
  }
}

// --------------------------------------------------------------------------
// QUICK STATUS TOGGLE & DELETE
// --------------------------------------------------------------------------
async function quickToggleReminderStatus(id) {
  const r = (state.reminders || []).find(item => item.id === id);
  if (!r) return;

  const newStatus = (r.status === 'ACTIVE') ? 'DISMISSED' : 'ACTIVE';
  
  try {
    await api(`/api/reminders/${id}`, {
      method: 'PUT',
      body: JSON.stringify({
        ...r,
        status: newStatus
      })
    });
    showToast(`Reminder marked as ${newStatus}`, 'info');
    await loadRemindersTable();
    refreshAllData();
  } catch (err) {
    showToast('Failed to update status: ' + err.message, 'error');
  }
}

async function deleteReminderItem(id) {
  if (!confirm('Are you sure you want to delete this reminder?')) return;
  
  try {
    await api(`/api/reminders/${id}`, { method: 'DELETE' });
    closeModal('modal-view-reminder');
    showToast('Reminder deleted successfully.', 'info');
    await loadRemindersTable();
    refreshAllData();
  } catch (err) {
    showToast('Failed to delete reminder: ' + err.message, 'error');
  }
}

// ==========================================================================
// VIEW 8: REPORTS, ANALYTICS & HISTORY
// ==========================================================================
let reportsCurrentSubTab = 'BILLS';
let reportsSearchQuery = '';
let reportsStatusFilter = 'ALL';
let reportsFilterFrom = '';
let reportsFilterTo = '';
let currentViewingReceipt = { url: '', billName: '', amount: '', paidDate: '', billId: null };

async function loadReportsView() {
  const userId = state.currentUser ? state.currentUser.id : null;
  const isAdm = isAdmin();

  try {
    // 1. Fetch Summary Analytics
    let summary;
    if (isAdm) {
      summary = await api('/api/reports/summary');
    } else {
      summary = await api(`/api/reports/summary/user/${userId}`);
    }

    // 2. Refresh user-scoped bills and events
    if (isAdm) {
      state.bills = await api('/api/bills');
      state.events = await api('/api/events');
    } else {
      state.bills = await api(`/api/bills/user/${userId}`);
      state.events = await api(`/api/events/user/${userId}`);
    }

    // Update KPI Card Metrics
    const pendingBills = summary ? (summary.pendingBills || 0) : 0;
    const pendingAmount = summary ? (summary.pendingBillAmount || 0) : 0;
    const avgPending = summary ? (summary.avgPendingBillAmount || 0) : 0;
    const paidBills = summary ? (summary.paidBills || 0) : 0;
    const paidAmount = summary ? (summary.paidBillAmount || 0) : 0;
    const billsWithReceipts = summary ? (summary.billsWithReceipts || 0) : 0;
    const upcomingEvents = summary ? (summary.upcomingEvents || 0) : 0;
    const completedEvents = summary ? (summary.completedEvents || 0) : 0;
    const totalEvents = summary ? (summary.totalEvents || 0) : 0;
    const attendanceRate = totalEvents > 0 ? Math.round((completedEvents / totalEvents) * 100) : 0;

    const elPendingBills = document.getElementById('rep-stat-pending-bills');
    if (elPendingBills) elPendingBills.innerText = pendingBills;
    const elPendingAmount = document.getElementById('rep-stat-pending-amount');
    if (elPendingAmount) elPendingAmount.innerText = `LKR ${formatCurrency(pendingAmount)}`;
    const elAvgPending = document.getElementById('rep-stat-avg-pending');
    if (elAvgPending) elAvgPending.innerText = `Avg: LKR ${formatCurrency(avgPending)} / bill`;

    const elPaidBills = document.getElementById('rep-stat-paid-bills');
    if (elPaidBills) elPaidBills.innerText = paidBills;
    const elPaidAmount = document.getElementById('rep-stat-paid-amount');
    if (elPaidAmount) elPaidAmount.innerText = `LKR ${formatCurrency(paidAmount)}`;
    const elReceiptsCount = document.getElementById('rep-stat-receipts-count');
    if (elReceiptsCount) elReceiptsCount.innerHTML = `<i class="fa-solid fa-receipt"></i> ${billsWithReceipts} Receipts Uploaded`;

    const elUpcomingEvents = document.getElementById('rep-stat-upcoming-events');
    if (elUpcomingEvents) elUpcomingEvents.innerText = upcomingEvents;
    const elTotalEvents = document.getElementById('rep-stat-total-events');
    if (elTotalEvents) elTotalEvents.innerText = `${totalEvents} Total Events`;

    const elCompletedEvents = document.getElementById('rep-stat-completed-events');
    if (elCompletedEvents) elCompletedEvents.innerText = completedEvents;
    const elAttendanceRate = document.getElementById('rep-stat-attendance-rate');
    if (elAttendanceRate) elAttendanceRate.innerText = `${attendanceRate}% Attendance Rate`;

    // Update Subtab Badges
    const badgeBills = document.getElementById('badge-rep-bills-count');
    if (badgeBills) badgeBills.innerText = state.bills.length;
    const badgeEvents = document.getElementById('badge-rep-events-count');
    if (badgeEvents) badgeEvents.innerText = state.events.length;

    renderReportsSubPane();
  } catch (err) {
    console.error('Failed to load reports view:', err);
    showToast('Failed to load reports summary', 'danger');
  }
}

function switchReportsSubTab(subTab) {
  reportsCurrentSubTab = subTab;
  const btnBills = document.getElementById('btn-rep-subtab-bills');
  const btnEvents = document.getElementById('btn-rep-subtab-events');
  const btnHistory = document.getElementById('btn-rep-subtab-history');

  if (btnBills) btnBills.className = `rem-seg-btn ${subTab === 'BILLS' ? 'active' : ''}`;
  if (btnEvents) btnEvents.className = `rem-seg-btn ${subTab === 'EVENTS' ? 'active' : ''}`;
  if (btnHistory) btnHistory.className = `rem-seg-btn ${subTab === 'HISTORY' ? 'active' : ''}`;

  const paneBills = document.getElementById('rep-subpane-bills');
  const paneEvents = document.getElementById('rep-subpane-events');
  const paneHistory = document.getElementById('rep-subpane-history');

  if (paneBills) paneBills.style.display = subTab === 'BILLS' ? 'block' : 'none';
  if (paneEvents) paneEvents.style.display = subTab === 'EVENTS' ? 'block' : 'none';
  if (paneHistory) paneHistory.style.display = subTab === 'HISTORY' ? 'block' : 'none';

  renderReportsSubPane();
}

function handleReportsFilter() {
  const qInput = document.getElementById('rep-search-input');
  reportsSearchQuery = qInput ? qInput.value.toLowerCase().trim() : '';
  const statSelect = document.getElementById('rep-status-filter');
  reportsStatusFilter = statSelect ? statSelect.value : 'ALL';
  const fromInput = document.getElementById('rep-filter-from');
  reportsFilterFrom = fromInput ? fromInput.value : '';
  const toInput = document.getElementById('rep-filter-to');
  reportsFilterTo = toInput ? toInput.value : '';

  renderReportsSubPane();
}

function resetReportsFilters() {
  const qInput = document.getElementById('rep-search-input');
  if (qInput) qInput.value = '';
  const statSelect = document.getElementById('rep-status-filter');
  if (statSelect) statSelect.value = 'ALL';
  const fromInput = document.getElementById('rep-filter-from');
  if (fromInput) fromInput.value = '';
  const toInput = document.getElementById('rep-filter-to');
  if (toInput) toInput.value = '';

  reportsSearchQuery = '';
  reportsStatusFilter = 'ALL';
  reportsFilterFrom = '';
  reportsFilterTo = '';

  renderReportsSubPane();
}

function renderReportsSubPane() {
  if (reportsCurrentSubTab === 'BILLS') {
    renderReportsBillsTable();
  } else if (reportsCurrentSubTab === 'EVENTS') {
    renderReportsEventsTable();
  } else if (reportsCurrentSubTab === 'HISTORY') {
    renderReportsHistoryTable();
  }
}

function renderReportsBillsTable() {
  const tbody = document.getElementById('tbody-rep-bills');
  if (!tbody) return;
  tbody.innerHTML = '';

  let list = state.bills || [];

  // Filter
  list = list.filter(b => {
    if (reportsStatusFilter !== 'ALL') {
      const s = (b.status || 'PENDING').toUpperCase();
      if (s !== reportsStatusFilter) return false;
    }
    if (reportsSearchQuery) {
      const matchName = b.billName && b.billName.toLowerCase().includes(reportsSearchQuery);
      const matchCat = b.category && b.category.toLowerCase().includes(reportsSearchQuery);
      const matchStatus = b.status && b.status.toLowerCase().includes(reportsSearchQuery);
      if (!matchName && !matchCat && !matchStatus) return false;
    }
    if (reportsFilterFrom && b.dueDate && b.dueDate < reportsFilterFrom) return false;
    if (reportsFilterTo && b.dueDate && b.dueDate > reportsFilterTo) return false;
    return true;
  });

  if (list.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="8" style="text-align:center; padding:32px; color:var(--any-text-muted);">
          No bills found matching current filters.
        </td>
      </tr>
    `;
    return;
  }

  list.forEach(b => {
    const isPaid = (b.status || '').toUpperCase() === 'PAID';
    const isOverdue = !isPaid && b.dueDate && new Date(b.dueDate) < new Date(new Date().setHours(0,0,0,0));
    const statusClass = isPaid ? 'resolved' : (isOverdue ? 'overdue' : 'pending');
    const displayStatus = isPaid ? 'PAID' : (isOverdue ? 'OVERDUE' : 'PENDING');

    const hasReceipt = b.receiptUrl && b.receiptUrl.trim().length > 0;
    let receiptCellHtml = '';
    if (hasReceipt) {
      receiptCellHtml = `
        <button type="button" class="receipt-pill-view" onclick="openReceiptLightbox(${b.id})" title="View Payment Proof Receipt">
          <i class="fa-solid fa-receipt"></i> View Receipt
        </button>
      `;
    } else if (isPaid) {
      receiptCellHtml = `
        <button type="button" class="receipt-pill-upload" onclick="openUploadReceiptModal(${b.id})" title="Upload Receipt Image">
          <i class="fa-solid fa-cloud-arrow-up"></i> Upload Receipt
        </button>
      `;
    } else {
      receiptCellHtml = `<span class="receipt-pill-none"><i class="fa-regular fa-clock"></i> Unsettled</span>`;
    }

    tbody.innerHTML += `
      <tr>
        <td><strong style="color:#60a5fa;">#${b.id}</strong></td>
        <td>
          <div style="font-weight:700; color:var(--any-text);">${escapeHtml(b.billName)}</div>
          <span class="category-pill ${b.category ? b.category.toLowerCase() : ''}" style="font-size:10.5px; margin-top:3px; display:inline-block;">${escapeHtml(b.category || 'General')}</span>
        </td>
        <td><strong style="font-size:13.5px; color:var(--any-text);">LKR ${formatCurrency(b.amount)}</strong></td>
        <td style="font-size:12.5px; color:var(--any-text-muted);">${b.dueDate || '-'}</td>
        <td><span class="badge-status ${statusClass}">${displayStatus}</span></td>
        <td style="font-size:12px; color:#93c5fd;">${b.paidDate || (isPaid ? 'Settled' : '-')}</td>
        <td>${receiptCellHtml}</td>
        <td style="text-align:right; white-space:nowrap;">
          ${!isPaid ? `
            <button class="btn-any-blue" style="padding:4px 10px; font-size:11px; background:#10b981; margin-right:4px;" onclick="openSettleBillModal(${b.id})" title="Settle bill & attach receipt">
              <i class="fa-solid fa-check"></i> Settle
            </button>
          ` : ''}
          <button class="btn-any-subtle" style="padding:4px 8px; font-size:11px;" onclick="openUploadReceiptModal(${b.id})" title="${hasReceipt ? 'Replace Receipt' : 'Upload Receipt'}">
            <i class="fa-solid fa-paperclip"></i>
          </button>
        </td>
      </tr>
    `;
  });
}

function renderReportsEventsTable() {
  const tbody = document.getElementById('tbody-rep-events');
  if (!tbody) return;
  tbody.innerHTML = '';

  let list = state.events || [];

  list = list.filter(e => {
    if (reportsStatusFilter !== 'ALL') {
      const s = (e.status || 'UPCOMING').toUpperCase();
      if (s !== reportsStatusFilter) return false;
    }
    if (reportsSearchQuery) {
      const matchName = e.eventName && e.eventName.toLowerCase().includes(reportsSearchQuery);
      const matchCat = e.category && e.category.toLowerCase().includes(reportsSearchQuery);
      const matchLoc = e.location && e.location.toLowerCase().includes(reportsSearchQuery);
      if (!matchName && !matchCat && !matchLoc) return false;
    }
    if (reportsFilterFrom && e.eventDate && e.eventDate < reportsFilterFrom) return false;
    if (reportsFilterTo && e.eventDate && e.eventDate > reportsFilterTo) return false;
    return true;
  });

  if (list.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="6" style="text-align:center; padding:32px; color:var(--any-text-muted);">
          No events found matching current filters.
        </td>
      </tr>
    `;
    return;
  }

  list.forEach(e => {
    const isCompleted = (e.status || '').toUpperCase() === 'COMPLETED';
    const statusClass = isCompleted ? 'resolved' : 'pending';
    const displayStatus = isCompleted ? 'ATTENDED (COMPLETED)' : 'UPCOMING';

    tbody.innerHTML += `
      <tr>
        <td><strong style="color:#60a5fa;">#${e.id}</strong></td>
        <td>
          <div style="font-weight:700; color:var(--any-text);">${escapeHtml(e.eventName)}</div>
          <span class="category-pill" style="font-size:10.5px; margin-top:3px; display:inline-block; background:rgba(14,165,233,0.15); color:#38bdf8; border:1px solid rgba(14,165,233,0.3);">${escapeHtml(e.category || 'General')}</span>
        </td>
        <td style="font-size:12.5px; color:#d1d5db;">
          <div><i class="fa-regular fa-calendar"></i> ${e.eventDate || '-'}</div>
          ${e.eventTime ? `<div style="font-size:11px; color:var(--any-text-sub);"><i class="fa-regular fa-clock"></i> ${e.eventTime}</div>` : ''}
        </td>
        <td style="font-size:12px; color:var(--any-text-muted);"><i class="fa-solid fa-location-dot"></i> ${escapeHtml(e.location || 'Online / Workspace')}</td>
        <td><span class="badge-status ${statusClass}">${displayStatus}</span></td>
        <td style="text-align:right; white-space:nowrap;">
          ${isCompleted ? `
            <button class="btn-any-subtle" style="padding:4px 10px; font-size:11.5px; color:#94a3b8;" onclick="toggleEventAttendance(${e.id}, 'UPCOMING')" title="Mark as upcoming (Undo Attendance)">
              <i class="fa-solid fa-rotate-left"></i> Mark Upcoming
            </button>
          ` : `
            <button class="btn-any-blue" style="padding:4px 12px; font-size:11.5px; background:#8b5cf6;" onclick="toggleEventAttendance(${e.id}, 'COMPLETED')" title="Log Attendance as completed">
              <i class="fa-solid fa-check-circle"></i> Mark Attended
            </button>
          `}
        </td>
      </tr>
    `;
  });
}

async function renderReportsHistoryTable() {
  const tbody = document.getElementById('tbody-rep-history');
  if (!tbody) return;
  tbody.innerHTML = '';

  try {
    state.historyLogs = await api('/api/history');
  } catch (err) {
    state.historyLogs = [];
  }

  let list = state.historyLogs || [];
  if (reportsSearchQuery) {
    list = list.filter(h => {
      return (h.description && h.description.toLowerCase().includes(reportsSearchQuery)) ||
             (h.userName && h.userName.toLowerCase().includes(reportsSearchQuery)) ||
             (h.module && h.module.toLowerCase().includes(reportsSearchQuery));
    });
  }

  if (list.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding:28px; color:var(--any-text-muted);">No activity logs recorded yet.</td></tr>`;
    return;
  }

  list.slice(0, 50).forEach(h => {
    tbody.innerHTML += `
      <tr>
        <td>#${h.id}</td>
        <td><strong>${escapeHtml(h.userName || 'System')}</strong></td>
        <td><span class="badge-status pending">${escapeHtml(h.action)}</span></td>
        <td><span style="font-size:11.5px; color:#c084fc; font-weight:600;">${escapeHtml(h.module)}</span></td>
        <td><div style="max-width:320px; font-size:12px; color:#d1d5db;">${escapeHtml(h.description)}</div></td>
        <td style="font-size:11.5px; color:var(--any-text-muted);">${formatDate(h.timestamp)}</td>
      </tr>
    `;
  });
}

// ==========================================================================
// RECEIPT VIEWER, UPLOAD, AND SETTLEMENT HANDLERS
// ==========================================================================
function openReceiptLightbox(billId) {
  const b = (state.bills || []).find(item => item.id == billId);
  if (!b || !b.receiptUrl) {
    showToast('No receipt file attached to this bill.', 'warning');
    return;
  }

  currentViewingReceipt = {
    url: b.receiptUrl,
    billName: b.billName,
    amount: b.amount,
    paidDate: b.paidDate || 'Recorded',
    billId: b.id
  };

  document.getElementById('receipt-view-title').innerText = `Receipt: ${b.billName}`;
  document.getElementById('receipt-view-bill-name').innerText = b.billName;
  document.getElementById('receipt-view-amount').innerText = `LKR ${formatCurrency(b.amount)}`;
  document.getElementById('receipt-view-paid-date').innerText = b.paidDate || 'Paid & Settled';

  const imgEl = document.getElementById('receipt-view-img');
  imgEl.src = b.receiptUrl;

  openModal('modal-receipt-view');
}

function handleReceiptReplaceClick() {
  if (!currentViewingReceipt.billId) return;
  const billId = currentViewingReceipt.billId;
  closeModal('modal-receipt-view');
  openUploadReceiptModal(billId);
}

function downloadReceiptFile() {
  if (!currentViewingReceipt.url) return;
  const a = document.createElement('a');
  a.href = currentViewingReceipt.url;
  a.download = `TrackDue_Receipt_Bill_${currentViewingReceipt.billId || 'Payment'}.png`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  showToast('Receipt download initiated.', 'success');
}

function printReceiptFile() {
  if (!currentViewingReceipt.url) return;
  const w = window.open('');
  w.document.write(`
    <html>
      <head><title>Receipt - ${escapeHtml(currentViewingReceipt.billName)}</title></head>
      <body style="margin:0; padding:20px; text-align:center; font-family:sans-serif;">
        <h2>Payment Receipt - TrackDue</h2>
        <p><strong>Bill:</strong> ${escapeHtml(currentViewingReceipt.billName)} | <strong>Amount:</strong> LKR ${formatCurrency(currentViewingReceipt.amount)} | <strong>Paid Date:</strong> ${currentViewingReceipt.paidDate}</p>
        <img src="${currentViewingReceipt.url}" style="max-width:90%; border:1px solid #ccc; border-radius:8px;" onload="window.print(); window.close();" />
      </body>
    </html>
  `);
  w.document.close();
}

function openUploadReceiptModal(billId) {
  const b = (state.bills || []).find(item => item.id == billId);
  if (!b) return;

  document.getElementById('upload-receipt-bill-id').value = b.id;
  document.getElementById('upload-receipt-data-url').value = '';
  document.getElementById('upload-receipt-bill-name').innerText = b.billName;
  document.getElementById('upload-receipt-bill-amount').innerText = `LKR ${formatCurrency(b.amount)}`;
  document.getElementById('upload-receipt-paid-date').value = b.paidDate || new Date().toISOString().split('T')[0];

  clearReceiptUploadSelection();
  openModal('modal-receipt-upload');
}

function handleReceiptFileSelect(e) {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(evt) {
    const dataUrl = evt.target.result;
    document.getElementById('upload-receipt-data-url').value = dataUrl;
    const previewContainer = document.getElementById('receipt-upload-preview-container');
    const previewImg = document.getElementById('receipt-upload-preview-img');
    if (previewContainer && previewImg) {
      previewImg.src = dataUrl;
      previewContainer.style.display = 'block';
    }
  };
  reader.readAsDataURL(file);
}

function clearReceiptUploadSelection() {
  document.getElementById('upload-receipt-data-url').value = '';
  const fileInput = document.getElementById('receipt-file-input');
  if (fileInput) fileInput.value = '';
  const previewContainer = document.getElementById('receipt-upload-preview-container');
  if (previewContainer) previewContainer.style.display = 'none';
}

async function handleReceiptUploadSubmit(e) {
  e.preventDefault();
  const billId = document.getElementById('upload-receipt-bill-id').value;
  const receiptUrl = document.getElementById('upload-receipt-data-url').value;
  const paidDate = document.getElementById('upload-receipt-paid-date').value;

  if (!receiptUrl) {
    showToast('Please select or browse a receipt file to upload.', 'warning');
    return;
  }

  try {
    await api(`/api/bills/${billId}/receipt`, {
      method: 'PUT',
      body: JSON.stringify({ receiptUrl: receiptUrl, paidDate: paidDate })
    });
    showToast('Payment receipt uploaded and attached successfully!', 'success');
    closeModal('modal-receipt-upload');
    await loadReportsView();
    await refreshAllData();
  } catch (err) {
    console.error('Failed to attach receipt:', err);
    showToast('Failed to attach receipt.', 'danger');
  }
}

// Settlement / Pay Modal
function openSettleBillModal(billId) {
  const b = (state.bills || []).find(item => item.id == billId);
  if (!b) return;

  document.getElementById('pay-bill-id').value = b.id;
  document.getElementById('pay-receipt-data-url').value = '';
  document.getElementById('pay-bill-name').innerText = b.billName;
  document.getElementById('pay-bill-amount').innerText = `LKR ${formatCurrency(b.amount)}`;
  document.getElementById('pay-bill-date').value = new Date().toISOString().split('T')[0];

  clearPayReceiptSelection();
  openModal('modal-bill-pay');
}

function handlePayReceiptFileSelect(e) {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(evt) {
    const dataUrl = evt.target.result;
    document.getElementById('pay-receipt-data-url').value = dataUrl;
    const previewContainer = document.getElementById('pay-receipt-preview-container');
    const previewImg = document.getElementById('pay-receipt-preview-img');
    if (previewContainer && previewImg) {
      previewImg.src = dataUrl;
      previewContainer.style.display = 'block';
    }
  };
  reader.readAsDataURL(file);
}

function clearPayReceiptSelection() {
  document.getElementById('pay-receipt-data-url').value = '';
  const fileInput = document.getElementById('pay-receipt-file-input');
  if (fileInput) fileInput.value = '';
  const previewContainer = document.getElementById('pay-receipt-preview-container');
  if (previewContainer) previewContainer.style.display = 'none';
}

async function handleBillPaySubmit(e) {
  e.preventDefault();
  const billId = document.getElementById('pay-bill-id').value;
  const paidDate = document.getElementById('pay-bill-date').value;
  const receiptUrl = document.getElementById('pay-receipt-data-url').value;

  try {
    await api(`/api/bills/${billId}/pay`, {
      method: 'PUT',
      body: JSON.stringify({ paidDate: paidDate, receiptUrl: receiptUrl })
    });
    showToast('Bill marked as PAID and settled successfully!', 'success');
    closeModal('modal-bill-pay');
    await loadReportsView();
    await refreshAllData();
  } catch (err) {
    console.error('Failed to mark bill as paid:', err);
    showToast('Failed to settle bill.', 'danger');
  }
}

// Event Attendance Toggle
async function toggleEventAttendance(eventId, targetStatus) {
  try {
    const ev = (state.events || []).find(x => x.id == eventId);
    if (ev) {
      ev.status = targetStatus;
      updateReactiveCounters();
    }
    if (targetStatus === 'COMPLETED') {
      await api(`/api/events/${eventId}/complete`, { method: 'PUT' });
      showToast('Event marked as Attended / Completed!', 'success');
    } else {
      if (ev) {
        await api(`/api/events/${eventId}`, {
          method: 'PUT',
          body: JSON.stringify({
            eventName: ev.eventName,
            category: ev.category,
            eventDate: ev.eventDate,
            eventTime: ev.eventTime,
            location: ev.location,
            description: ev.description,
            status: 'UPCOMING'
          })
        });
      }
      showToast('Event reverted to Upcoming.', 'info');
    }
    await loadReportsView();
    await refreshAllData();
    switchTab(state.currentTab);
  } catch (err) {
    console.error('Failed to update event attendance:', err);
    showToast('Failed to update attendance status.', 'danger');
  }
}

// ==========================================================================
// MULTI-FORMAT DATA EXPORT: CSV, EXCEL, AND PRINT / PDF
// ==========================================================================
function exportReportsData(format) {
  if (format === 'print') {
    window.print();
    return;
  }

  const todayStr = new Date().toISOString().split('T')[0];

  if (format === 'csv') {
    let csvContent = '';
    if (reportsCurrentSubTab === 'EVENTS') {
      csvContent = 'Event ID,Event Name,Category,Event Date,Event Time,Location,Attendance Status\n';
      (state.events || []).forEach(e => {
        csvContent += `${e.id},"${(e.eventName || '').replace(/"/g, '""')}","${e.category || ''}",${e.eventDate || ''},${e.eventTime || ''},"${(e.location || '').replace(/"/g, '""')}",${e.status || ''}\n`;
      });
    } else {
      csvContent = 'Bill ID,Bill Name,Category,Amount (LKR),Due Date,Status,Paid Date,Receipt Attached\n';
      (state.bills || []).forEach(b => {
        const hasReceipt = b.receiptUrl ? 'YES' : 'NO';
        csvContent += `${b.id},"${(b.billName || '').replace(/"/g, '""')}","${b.category || ''}",${b.amount || 0},${b.dueDate || ''},${b.status || ''},${b.paidDate || 'N/A'},${hasReceipt}\n`;
      });
    }

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `TrackDue_${reportsCurrentSubTab}_Report_${todayStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(`Exported ${reportsCurrentSubTab} dataset as CSV successfully!`, 'success');

  } else if (format === 'excel') {
    // Generate styled XML / HTML spreadsheet for native Microsoft Excel opening
    let excelTable = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <meta charset="utf-8">
        <style>
          th { background-color: #1e293b; color: #ffffff; font-weight: bold; border: 1px solid #94a3b8; padding: 6px; }
          td { border: 1px solid #cbd5e1; padding: 6px; }
        </style>
      </head>
      <body>
        <h2>TrackDue Portfolio Statement - ${reportsCurrentSubTab}</h2>
        <p>Exported On: ${new Date().toLocaleString()} | User: ${state.currentUser ? escapeHtml(state.currentUser.name) : 'User'}</p>
        <table>
    `;

    if (reportsCurrentSubTab === 'EVENTS') {
      excelTable += `
        <thead>
          <tr>
            <th>Event ID</th><th>Event Name</th><th>Category</th><th>Event Date</th><th>Event Time</th><th>Location</th><th>Attendance Status</th>
          </tr>
        </thead>
        <tbody>
      `;
      (state.events || []).forEach(e => {
        excelTable += `<tr><td>#${e.id}</td><td>${escapeHtml(e.eventName)}</td><td>${escapeHtml(e.category)}</td><td>${e.eventDate || ''}</td><td>${e.eventTime || ''}</td><td>${escapeHtml(e.location || '')}</td><td>${e.status || ''}</td></tr>`;
      });
    } else {
      excelTable += `
        <thead>
          <tr>
            <th>Bill ID</th><th>Bill Name</th><th>Category</th><th>Amount (LKR)</th><th>Due Date</th><th>Status</th><th>Paid Date</th><th>Receipt Attached</th>
          </tr>
        </thead>
        <tbody>
      `;
      (state.bills || []).forEach(b => {
        const hasReceipt = b.receiptUrl ? 'YES' : 'NO';
        excelTable += `<tr><td>#${b.id}</td><td>${escapeHtml(b.billName)}</td><td>${escapeHtml(b.category)}</td><td>${formatCurrency(b.amount)}</td><td>${b.dueDate || ''}</td><td>${b.status || ''}</td><td>${b.paidDate || 'N/A'}</td><td>${hasReceipt}</td></tr>`;
      });
    }

    excelTable += `
        </tbody>
      </table>
      </body>
      </html>
    `;

    const blob = new Blob([excelTable], { type: 'application/vnd.ms-excel' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `TrackDue_Statement_${reportsCurrentSubTab}_${todayStr}.xls`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(`Exported ${reportsCurrentSubTab} Statement as Excel (.xls) file!`, 'success');
  }
}

// ==========================================================================
// VIEW 9: ACTIVITY HISTORY
// ==========================================================================
async function loadHistoryView() {
  state.historyLogs = await api('/api/history');
  filterHistoryTable();
}

function filterHistoryTable() {
  const q = document.getElementById('history-search-box').value.toLowerCase().trim();
  const mod = document.getElementById('history-module-select').value;
  const act = document.getElementById('history-action-select').value;

  const filtered = state.historyLogs.filter(h => {
    const mM = mod === 'ALL' || h.module === mod;
    const mA = act === 'ALL' || h.action === act;
    const mQ = !q || (h.description && h.description.toLowerCase().includes(q)) || (h.userName && h.userName.toLowerCase().includes(q));
    return mM && mA && mQ;
  });

  const tbody = document.querySelector('#table-history-full tbody');
  tbody.innerHTML = '';

  filtered.forEach(h => {
    let actionBadge = 'pending';
    if (h.action === 'CREATE') actionBadge = 'resolved';
    if (h.action === 'DELETE') actionBadge = 'overdue';

    tbody.innerHTML += `
      <tr>
        <td>#${h.id}</td>
        <td><strong>${escapeHtml(h.userName || 'System')}</strong></td>
        <td><span class="badge-status ${actionBadge}">${h.action}</span></td>
        <td><span class="badge-status" style="background:#262626; color:#93c5fd;">${h.module}</span></td>
        <td>${escapeHtml(h.description || '')}</td>
        <td style="color:var(--any-text-muted); font-size:11.5px;">${formatDate(h.createdAt)}</td>
      </tr>
    `;
  });
}

// ==========================================================================
// VIEW 10: SUPPORT REQUESTS
// ==========================================================================
// VIEW 10: SUPPORT REQUEST MANAGEMENT (PIPELINE & FULL CRUD)
// ==========================================================================
let supportViewMode = 'kanban';
let draggedTicketId = null;
let currentViewTicket = null;

function setSupportViewMode(mode) {
  supportViewMode = mode;
  const kanbanBtn = document.getElementById('btn-support-kanban');
  const tableBtn = document.getElementById('btn-support-table');
  const kanbanContainer = document.getElementById('support-pipeline-container');
  const tableContainer = document.getElementById('support-table-container');

  if (mode === 'kanban') {
    if (kanbanBtn) kanbanBtn.classList.add('active');
    if (tableBtn) tableBtn.classList.remove('active');
    if (kanbanContainer) kanbanContainer.style.display = 'block';
    if (tableContainer) tableContainer.style.display = 'none';
  } else {
    if (kanbanBtn) kanbanBtn.classList.remove('active');
    if (tableBtn) tableBtn.classList.add('active');
    if (kanbanContainer) kanbanContainer.style.display = 'none';
    if (tableContainer) tableContainer.style.display = 'block';
  }
}

async function loadSupportView() {
  try {
    if (isAdmin()) {
      state.supportRequests = await api('/api/support');
    } else {
      state.supportRequests = await api(`/api/support/user/${state.currentUser.id}`);
    }
  } catch (e) {
    state.supportRequests = [];
  }

  const list = state.supportRequests || [];

  // Update Support Badges
  const openCount = list.filter(s => s.status === 'OPEN' || s.status === 'IN_PROGRESS').length;
  const badgeUser = document.getElementById('badge-support-sidebar');
  const badgeAdmin = document.getElementById('badge-admin-support-sidebar');
  if (badgeUser) badgeUser.innerText = openCount;
  if (badgeAdmin) badgeAdmin.innerText = openCount;

  // 1. RENDER KANBAN PIPELINE COLUMNS
  const cols = {
    'OPEN': document.getElementById('cards-col-OPEN'),
    'IN_PROGRESS': document.getElementById('cards-col-IN_PROGRESS'),
    'RESOLVED': document.getElementById('cards-col-RESOLVED'),
    'CLOSED': document.getElementById('cards-col-CLOSED')
  };

  const counts = { 'OPEN': 0, 'IN_PROGRESS': 0, 'RESOLVED': 0, 'CLOSED': 0 };

  // Clear column contents
  Object.keys(cols).forEach(k => {
    if (cols[k]) cols[k].innerHTML = '';
  });

  list.forEach(s => {
    const st = s.status || 'OPEN';
    if (counts[st] !== undefined) counts[st]++;
    const targetCol = cols[st] || cols['OPEN'];
    if (!targetCol) return;

    const isMine = state.currentUser && (s.userId == state.currentUser.id);
    const canEdit = isMine || isAdmin();
    const canDelete = isMine || isAdmin();

    const card = document.createElement('div');
    const isUserAdmin = isAdmin();
    card.className = 'pipeline-card' + (isUserAdmin ? ' admin-draggable' : '');
    card.draggable = isUserAdmin;
    card.id = `ticket-card-${s.id}`;

    // Drag handlers attached ONLY for Admin users
    if (isUserAdmin) {
      card.ondragstart = (e) => handleSupportDragStart(e, s.id);
      card.ondragend = (e) => handleSupportDragEnd(e);
    } else {
      card.style.cursor = 'default';
    }

    card.innerHTML = `
      <div class="pipeline-card-top">
        <span class="pipeline-card-ticket-id">#${s.id}</span>
        <span class="pipeline-card-category">${escapeHtml(s.category || 'General')}</span>
      </div>
      <div class="pipeline-card-title">${escapeHtml(s.subject)}</div>
      <div class="pipeline-card-msg">${escapeHtml(s.message)}</div>
      <div class="pipeline-card-user">
        <i class="fa-regular fa-user"></i>
        <span><strong>${escapeHtml(s.userName || 'User')}</strong> ${isMine ? '<span style="color:#fbbf24; font-size:10px; font-weight:700;">(You)</span>' : ''}</span>
      </div>
      ${s.adminResponse ? `
        <div class="pipeline-card-reply-pill">
          <i class="fa-solid fa-reply"></i> ${escapeHtml(s.adminResponse)}
        </div>
      ` : ''}
      <div class="pipeline-card-actions">
        <button class="btn-any-subtle" style="padding:4px 10px; font-size:11px;" onclick="viewSupportTicket(${s.id})" title="View Ticket Details & Progress">
          <i class="fa-solid fa-eye"></i> View
        </button>
        <div style="display:flex; gap:6px;">
          ${isUserAdmin ? `
            <button class="btn-any-subtle" style="padding:4px 8px; font-size:11px; color:#38bdf8;" onclick="openManageSupportModal(${s.id})" title="Reply / Manage">
              <i class="fa-solid fa-reply"></i> Reply
            </button>
          ` : ''}
          ${canEdit ? `
            <button class="btn-any-subtle" style="padding:4px 8px; font-size:11px;" onclick="openEditSupportModal(${s.id})" title="Edit Ticket">
              <i class="fa-solid fa-pen-to-square"></i> Edit
            </button>
          ` : ''}
          ${canDelete ? `
            <button class="btn-any-subtle" style="padding:4px 8px; font-size:11px; color:#ef4444;" onclick="deleteSupportTicket(${s.id})" title="Delete Ticket">
              <i class="fa-solid fa-trash"></i> Delete
            </button>
          ` : ''}
        </div>
      </div>
    `;

    targetCol.appendChild(card);
  });

  // Update column counters & show empty state if column has 0 cards
  Object.keys(cols).forEach(k => {
    const countBadge = document.getElementById(`col-count-${k}`);
    if (countBadge) countBadge.innerText = counts[k];
    if (cols[k] && cols[k].children.length === 0) {
      cols[k].innerHTML = `<div style="text-align:center; padding:28px 10px; color:#475569; font-size:12px;"><i class="fa-regular fa-folder-open" style="margin-bottom:6px; font-size:18px; display:block;"></i>No tickets in this stage</div>`;
    }
  });

  // 2. RENDER TABLE VIEW
  const tbody = document.querySelector('#table-support-full tbody');
  if (tbody) {
    tbody.innerHTML = '';
    if (list.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="8" style="text-align:center; padding:32px; color:var(--any-text-muted);">
            No support requests found. Click <strong>'+ Submit Ticket'</strong> if you need any assistance.
          </td>
        </tr>
      `;
    } else {
      list.forEach(s => {
        const isMine = state.currentUser && (s.userId == state.currentUser.id);
        const canEdit = isMine || isAdmin();
        const canDelete = isMine || isAdmin();

        // Status badge with icon
        let statusBadgeHtml = '';
        if (s.status === 'OPEN') {
          statusBadgeHtml = `<span class="badge-status open"><i class="fa-solid fa-inbox"></i> Received</span>`;
        } else if (s.status === 'IN_PROGRESS') {
          statusBadgeHtml = `<span class="badge-status pending" style="background:rgba(59,130,246,0.15); color:#60a5fa; border:1px solid rgba(59,130,246,0.3);"><i class="fa-solid fa-screwdriver-wrench"></i> Fixing Started</span>`;
        } else if (s.status === 'RESOLVED') {
          statusBadgeHtml = `<span class="badge-status resolved"><i class="fa-solid fa-circle-check"></i> Error Fixed</span>`;
        } else {
          statusBadgeHtml = `<span class="badge-status" style="background:#262626; color:#94a3b8;"><i class="fa-solid fa-box-archive"></i> ${escapeHtml(s.status)}</span>`;
        }

        tbody.innerHTML += `
          <tr>
            <td><strong style="color:#60a5fa;">#${s.id}</strong></td>
            <td><strong>${escapeHtml(s.userName || 'User')}</strong> ${isMine ? '<span style="color:#fbbf24; font-size:10px;">(You)</span>' : ''}</td>
            <td><strong>${escapeHtml(s.subject)}</strong></td>
            <td><span class="pipeline-card-category">${escapeHtml(s.category || 'General')}</span></td>
            <td><div style="max-width:240px; font-size:12.5px; color:var(--any-text-muted);">${escapeHtml(s.message)}</div></td>
            <td>
              ${s.adminResponse ? `<span style="color:#34d399; font-size:12px;"><i class="fa-solid fa-reply"></i> ${escapeHtml(s.adminResponse)}</span>` : '<span style="color:#666; font-size:12px;">Pending Response</span>'}
            </td>
            <td>${statusBadgeHtml}</td>
            <td style="text-align:right; white-space:nowrap;">
              <button class="btn-any-subtle" style="padding:3px 8px; font-size:11px;" onclick="viewSupportTicket(${s.id})" title="View Details">
                <i class="fa-solid fa-eye"></i> View
              </button>
              ${isAdmin() ? `
                <button class="btn-any-subtle" style="padding:3px 8px; font-size:11px; color:#38bdf8;" onclick="openManageSupportModal(${s.id})" title="Reply / Manage">
                  <i class="fa-solid fa-reply"></i> Reply
                </button>
              ` : ''}
              ${canEdit ? `
                <button class="btn-any-subtle" style="padding:3px 8px; font-size:11px;" onclick="openEditSupportModal(${s.id})" title="Edit Ticket">
                  <i class="fa-solid fa-pen-to-square"></i> Edit
                </button>
              ` : ''}
              ${canDelete ? `
                <button class="btn-any-subtle" style="padding:3px 8px; font-size:11px; color:#ef4444;" onclick="deleteSupportTicket(${s.id})" title="Delete Ticket">
                  <i class="fa-solid fa-trash"></i> Delete
                </button>
              ` : ''}
            </td>
          </tr>
        `;
      });
    }
  }

  // Ensure appropriate container is visible based on supportViewMode
  setSupportViewMode(supportViewMode);
}

// Drag and Drop Event Handlers for Support Pipeline (ADMIN ONLY)
function handleSupportDragStart(e, ticketId) {
  if (!isAdmin()) {
    e.preventDefault();
    return;
  }
  draggedTicketId = ticketId;
  e.dataTransfer.setData('text/plain', String(ticketId));
  e.dataTransfer.effectAllowed = 'move';
  e.currentTarget.classList.add('dragging');
}

function handleSupportDragEnd(e) {
  e.currentTarget.classList.remove('dragging');
  document.querySelectorAll('.pipeline-col').forEach(col => col.classList.remove('drag-over'));
}

function handleSupportDragOver(e) {
  if (!isAdmin()) return; // Non-admin cannot drag and drop
  e.preventDefault();
  e.dataTransfer.dropEffect = 'move';
  const col = e.currentTarget;
  if (!col.classList.contains('drag-over')) {
    col.classList.add('drag-over');
  }
}

function handleSupportDragLeave(e) {
  if (!isAdmin()) return;
  e.currentTarget.classList.remove('drag-over');
}

async function handleSupportDrop(e, targetStatus) {
  if (!isAdmin()) return; // Non-admin cannot change status via drag-and-drop
  e.preventDefault();
  e.currentTarget.classList.remove('drag-over');
  const ticketId = draggedTicketId || parseInt(e.dataTransfer.getData('text/plain'));
  draggedTicketId = null;
  if (!ticketId) return;

  const ticket = (state.supportRequests || []).find(t => t.id == ticketId);
  if (!ticket) return;

  if (ticket.status === targetStatus) return; // dropped in same column

  try {
    await api(`/api/support/${ticketId}`, {
      method: 'PUT',
      body: JSON.stringify({ status: targetStatus })
    });
    ticket.status = targetStatus;
    const stageName = targetStatus === 'OPEN' ? 'Request Received' :
                      targetStatus === 'IN_PROGRESS' ? 'Fixing Started' :
                      targetStatus === 'RESOLVED' ? 'Error Fixed' : targetStatus;
    showToast(`Ticket #${ticketId} moved to "${stageName}"!`, 'success');
    await loadSupportView();
    refreshAllData();
  } catch (err) {
    showToast('Failed to update ticket status', 'danger');
    loadSupportView();
  }
}

// Detail View Modal Handler
function viewSupportTicket(id) {
  const ticket = (state.supportRequests || []).find(t => t.id == id);
  if (!ticket) return;
  currentViewTicket = ticket;

  document.getElementById('view-support-modal-title').innerText = `Support Ticket #${ticket.id}`;
  document.getElementById('view-support-user').innerText = ticket.userName || `User #${ticket.userId}`;
  document.getElementById('view-support-category').innerText = ticket.category || 'Technical Issue';
  document.getElementById('view-support-subject').innerText = ticket.subject;
  document.getElementById('view-support-msg').innerText = ticket.message;

  // Status Badge
  const badge = document.getElementById('view-support-status-badge');
  badge.className = `badge-status ${ticket.status === 'RESOLVED' ? 'resolved' : (ticket.status === 'OPEN' ? 'open' : 'pending')}`;
  badge.innerText = ticket.status;

  // Stepper Visual Pipeline
  const stepOpen = document.getElementById('step-open');
  const stepProg = document.getElementById('step-in-progress');
  const stepRes = document.getElementById('step-resolved');
  const line = document.getElementById('view-support-stepper-line');

  stepOpen.className = 'stepper-step';
  stepProg.className = 'stepper-step';
  stepRes.className = 'stepper-step';

  if (ticket.status === 'OPEN') {
    stepOpen.classList.add('active');
    line.style.width = '0%';
  } else if (ticket.status === 'IN_PROGRESS') {
    stepOpen.classList.add('completed');
    stepProg.classList.add('active');
    line.style.width = '50%';
  } else if (ticket.status === 'RESOLVED' || ticket.status === 'CLOSED') {
    stepOpen.classList.add('completed');
    stepProg.classList.add('completed');
    stepRes.classList.add('completed');
    line.style.width = '100%';
  }

  // Admin Response
  const replyBox = document.getElementById('view-support-admin-reply');
  if (ticket.adminResponse && ticket.adminResponse.trim()) {
    replyBox.innerText = ticket.adminResponse;
    replyBox.style.color = '#a7f3d0';
    replyBox.style.background = 'rgba(16, 185, 129, 0.08)';
    replyBox.style.borderColor = 'rgba(16, 185, 129, 0.25)';
  } else {
    replyBox.innerText = 'No response from admin yet. Our support engineering team will examine the issue promptly.';
    replyBox.style.color = '#94a3b8';
    replyBox.style.background = '#181818';
    replyBox.style.borderColor = 'var(--any-border)';
  }

  // Permission checks for buttons
  const isMine = state.currentUser && (ticket.userId == state.currentUser.id);
  const canEdit = isMine || isAdmin();
  const editBtn = document.getElementById('btn-view-support-edit');
  const deleteBtn = document.getElementById('btn-view-support-delete');
  if (editBtn) editBtn.style.display = canEdit ? 'inline-flex' : 'none';
  if (deleteBtn) deleteBtn.style.display = (isMine || isAdmin()) ? 'inline-flex' : 'none';

  openModal('modal-support-view');
}

function handleViewSupportEdit() {
  if (!currentViewTicket) return;
  closeModal('modal-support-view');
  openEditSupportModal(currentViewTicket.id);
}

async function handleViewSupportDelete() {
  if (!currentViewTicket) return;
  const id = currentViewTicket.id;
  closeModal('modal-support-view');
  await deleteSupportTicket(id, true);
}

function openEditSupportModal(id) {
  const ticket = (state.supportRequests || []).find(t => t.id == id);
  if (!ticket) return;

  document.getElementById('edit-support-id').value = ticket.id;
  document.getElementById('edit-support-subject').value = ticket.subject || '';
  document.getElementById('edit-support-category').value = ticket.category || 'Technical Issue';
  document.getElementById('edit-support-message').value = ticket.message || '';

  openModal('modal-support-edit');
}

async function handleSupportEditSubmit(e) {
  e.preventDefault();
  const id = document.getElementById('edit-support-id').value;
  const updateData = {
    subject: document.getElementById('edit-support-subject').value.trim(),
    category: document.getElementById('edit-support-category').value,
    message: document.getElementById('edit-support-message').value.trim()
  };

  try {
    await api(`/api/support/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updateData)
    });
    showToast(`Support ticket #${id} updated successfully!`, 'success');
    closeModal('modal-support-edit');
    await loadSupportView();
    refreshAllData();
  } catch (err) {
    showToast('Failed to update support ticket', 'danger');
  }
}

async function deleteSupportTicket(id, confirmFirst = true) {
  if (confirmFirst && !confirm(`Are you sure you want to delete Support Ticket #${id}?`)) {
    return;
  }
  try {
    await api(`/api/support/${id}`, { method: 'DELETE' });
    showToast(`Support ticket #${id} deleted successfully!`, 'success');
    await loadSupportView();
    refreshAllData();
  } catch (err) {
    showToast('Failed to delete ticket', 'danger');
  }
}

function openManageSupportModal(id) {
  const req = state.supportRequests.find(x => x.id === id);
  if (!req) return;

  document.getElementById('manage-support-id').value = req.id;
  document.getElementById('manage-support-subject').innerText = `#${req.id} - ${req.subject}`;
  document.getElementById('manage-support-msg').innerText = req.message;
  document.getElementById('manage-support-response').value = req.adminResponse || '';
  document.getElementById('manage-support-status').value = req.status;

  openModal('modal-support-manage');
}

// ==========================================================================
// VIEW 11: FEEDBACK & REVIEWS (1 FEEDBACK PER USER LIMIT & EDITING)
// ==========================================================================
async function loadFeedbackView() {
  try {
    state.feedbackList = await api('/api/feedback');
  } catch (e) {
    state.feedbackList = [];
  }

  const currentUser = state.currentUser;
  const myFeedback = currentUser ? (state.feedbackList || []).find(f => f.userId == currentUser.id) : null;

  // Header Action Button & Spotlight
  const actionBtn = document.getElementById('btn-feedback-action');
  const spotlight = document.getElementById('user-feedback-spotlight');

  if (myFeedback) {
    if (actionBtn) {
      actionBtn.innerHTML = '<i class="fa-solid fa-pen-to-square"></i> Edit My Feedback';
    }
    if (spotlight) {
      let userStars = '';
      for (let i = 1; i <= 5; i++) {
        userStars += `<i class="fa-solid fa-star" style="color:${i <= myFeedback.rating ? '#fbbf24' : '#475569'}; font-size:15px;"></i>`;
      }
      spotlight.style.display = 'block';
      spotlight.innerHTML = `
        <div class="feedback-spotlight-card">
          <div style="flex:1;">
            <div style="display:flex; align-items:center; gap:10px; margin-bottom:8px; flex-wrap:wrap;">
              <span class="badge-status" style="background:#fbbf24; color:#000; font-weight:700; font-size:11px;">YOUR SUBMITTED FEEDBACK</span>
              <span class="badge-status pending">${escapeHtml(myFeedback.type || 'SUGGESTION')}</span>
              <div style="display:flex; gap:3px;">${userStars}</div>
              <span class="badge-status ${myFeedback.status === 'REVIEWED' ? 'resolved' : 'open'}" style="font-size:11px;">${myFeedback.status || 'SUBMITTED'}</span>
            </div>
            <div style="font-size:14px; color:var(--any-text); line-height:1.5;">"${escapeHtml(myFeedback.message)}"</div>
          </div>
          <div style="display:flex; gap:8px;">
            <button class="btn-any-blue" onclick="openEditFeedbackModal()" style="padding:7px 14px; font-size:12px;">
              <i class="fa-solid fa-pen-to-square"></i> Edit My Feedback
            </button>
            <button class="btn-any-subtle" onclick="deleteFeedbackItem(${myFeedback.id})" style="color:#ef4444; padding:7px 10px; font-size:12px;" title="Delete">
              <i class="fa-solid fa-trash"></i>
            </button>
          </div>
        </div>
      `;
    }
  } else {
    if (actionBtn) {
      actionBtn.innerHTML = '<i class="fa-solid fa-star"></i> Give Feedback';
    }
    if (spotlight) {
      spotlight.style.display = 'none';
      spotlight.innerHTML = '';
    }
  }

  // Render Table
  const tbody = document.querySelector('#table-feedback-full tbody');
  if (!tbody) return;
  tbody.innerHTML = '';

  if (!state.feedbackList || state.feedbackList.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding:32px; color:var(--any-text-muted);">No feedback records found. Be the first to submit a review!</td></tr>`;
    return;
  }

  state.feedbackList.forEach(f => {
    let stars = '';
    for (let i = 1; i <= 5; i++) {
      stars += `<i class="fa-solid fa-star" style="color:${i <= f.rating ? '#fbbf24' : '#475569'}; font-size:11px;"></i>`;
    }
    const isMine = currentUser && (f.userId == currentUser.id);

    tbody.innerHTML += `
      <tr style="${isMine ? 'background:rgba(251, 191, 36, 0.04);' : ''}">
        <td>#${f.id}</td>
        <td><strong>${escapeHtml(f.userName || 'User')}</strong> ${isMine ? '<span style="font-size:10px; color:#fbbf24; font-weight:700;">(You)</span>' : ''}</td>
        <td><span class="badge-status pending">${escapeHtml(f.type || 'SUGGESTION')}</span></td>
        <td>${stars}</td>
        <td><div style="max-width:280px; font-size:12.5px;">${escapeHtml(f.message)}</div></td>
        <td><span class="badge-status ${f.status === 'REVIEWED' ? 'resolved' : 'open'}">${f.status || 'SUBMITTED'}</span></td>
        <td style="text-align:right; white-space:nowrap;">
          ${isMine ? `
            <button class="btn-any-subtle" style="padding:3px 8px; font-size:11px;" onclick="openEditFeedbackModal()" title="Edit"><i class="fa-solid fa-pen-to-square"></i> Edit</button>
            <button class="btn-any-subtle" style="padding:3px 8px; font-size:11px; color:#ef4444;" onclick="deleteFeedbackItem(${f.id})" title="Delete"><i class="fa-solid fa-trash"></i></button>
          ` : (isAdmin() && f.status !== 'REVIEWED' ? `
            <button class="btn-any-subtle" style="padding:3px 8px; font-size:11px;" onclick="reviewFeedback(${f.id})">Review</button>
          ` : '<i class="fa-solid fa-check" style="color:#10b981;"></i>')}
        </td>
      </tr>
    `;
  });
}

function openFeedbackActionModal() {
  const currentUser = state.currentUser;
  const myFeedback = currentUser ? (state.feedbackList || []).find(f => f.userId == currentUser.id) : null;
  if (myFeedback) {
    openEditFeedbackModal();
  } else {
    openSubmitFeedbackModal();
  }
}

function openEditFeedbackModal() {
  const currentUser = state.currentUser;
  const myFeedback = currentUser ? (state.feedbackList || []).find(f => f.userId == currentUser.id) : null;
  if (!myFeedback) {
    openSubmitFeedbackModal();
    return;
  }

  document.getElementById('edit-feedback-id').value = myFeedback.id;
  document.getElementById('edit-feedback-type').value = myFeedback.type || 'SUGGESTION';
  document.getElementById('edit-feedback-message').value = myFeedback.message || '';
  setEditFeedbackStars(myFeedback.rating || 5);

  openModal('modal-feedback-edit');
}

function setEditFeedbackStars(r) {
  document.getElementById('edit-feedback-rating-val').value = r;
  const stars = document.querySelectorAll('#edit-feedback-star-box i');
  stars.forEach(s => {
    const val = parseInt(s.getAttribute('data-r'));
    s.style.color = val <= r ? '#fbbf24' : '#475569';
  });
}

async function handleFeedbackEditSubmit(e) {
  e.preventDefault();
  const id = document.getElementById('edit-feedback-id').value;
  const updateData = {
    type: document.getElementById('edit-feedback-type').value,
    rating: parseInt(document.getElementById('edit-feedback-rating-val').value),
    message: document.getElementById('edit-feedback-message').value.trim()
  };

  try {
    await api(`/api/feedback/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updateData)
    });
    showToast('Your feedback has been updated successfully!', 'success');
    closeModal('modal-feedback-edit');
    await loadFeedbackView();
  } catch (err) {
    showToast('Failed to update feedback', 'danger');
  }
}

async function deleteFeedbackItem(id) {
  if (!confirm('Are you sure you want to delete your feedback? You can submit new feedback afterwards.')) return;
  try {
    await api(`/api/feedback/${id}`, { method: 'DELETE' });
    showToast('Feedback deleted successfully!', 'success');
    await loadFeedbackView();
  } catch (err) {
    showToast('Failed to delete feedback', 'danger');
  }
}

async function reviewFeedback(id) {
  await api(`/api/feedback/${id}/status`, { method: 'PUT', body: JSON.stringify({ status: 'REVIEWED' }) });
  showToast(`Feedback #${id} marked as REVIEWED.`, 'success');
  loadFeedbackView();
}

// ==========================================================================
// VIEW 12: USER ACCOUNTS (ADMIN ONLY)
// ==========================================================================
async function loadUsersView() {
  if (!isAdmin()) {
    switchTab('myday');
    return;
  }

  try {
    state.users = await api('/api/users');
  } catch (err) {
    state.users = [];
  }

  const totalCount = state.users.length;
  const activeCount = state.users.filter(u => u.status === 'ACTIVE').length;

  const countEl = document.getElementById('admin-user-count');
  if (countEl) countEl.innerText = totalCount;
  const activeEl = document.getElementById('admin-active-count');
  if (activeEl) activeEl.innerText = activeCount;
  const remTotalEl = document.getElementById('admin-reminders-total');
  if (remTotalEl) remTotalEl.innerText = state.reminders ? state.reminders.length : 0;
  const badgeUsers = document.getElementById('badge-users-sidebar');
  if (badgeUsers) badgeUsers.innerText = totalCount;

  const tbody = document.querySelector('#table-users-full tbody');
  tbody.innerHTML = '';

  state.users.forEach(u => {
    const createdDate = u.createdAt ? formatDate(u.createdAt) : 'Active User';
    tbody.innerHTML += `
      <tr>
        <td>#${u.id}</td>
        <td><strong>${escapeHtml(u.firstName + ' ' + u.lastName)}</strong></td>
        <td>${escapeHtml(u.email)}</td>
        <td>${escapeHtml(u.phone || 'N/A')}</td>
        <td><span class="badge-status ${u.status === 'ACTIVE' ? 'resolved' : 'overdue'}">${u.status}</span></td>
        <td style="font-size:12px; color:var(--any-text-muted);">${createdDate}</td>
      </tr>
    `;
  });
}

// ==========================================================================
// Form Submissions (Full CRUD: Create, Edit, Update, Delete with Reminder Integration)
// ==========================================================================

// Reminder Scheduling UI & Calculation Helpers
function toggleReminderSection(type) {
  const checkbox = document.getElementById(`${type}-reminder-enable`);
  const controls = document.getElementById(`${type}-reminder-controls`);
  const tag = document.getElementById(`${type}-reminder-status-tag`);
  const isEnabled = checkbox ? checkbox.checked : false;

  if (controls) controls.style.display = isEnabled ? 'block' : 'none';
  if (tag) {
    tag.innerText = isEnabled ? 'Active' : 'Disabled';
    tag.style.color = isEnabled ? '#10b981' : 'var(--any-text-muted)';
  }
  if (isEnabled) updateReminderPreview(type);
}

function handleReminderOffsetChange(type) {
  const select = document.getElementById(`${type}-reminder-offset`);
  const customGroup = document.getElementById(`${type}-reminder-custom-input-group`);
  const timeGroup = document.getElementById(`${type}-reminder-time-group`);
  const customLabel = document.getElementById(`${type}-reminder-custom-label`);
  const val = select ? select.value : '';

  if (val === 'CUSTOM_DAYS') {
    if (customGroup) customGroup.style.display = 'block';
    if (customLabel) customLabel.innerText = 'Days Before';
    if (timeGroup) timeGroup.style.display = 'block';
  } else if (val === 'CUSTOM_HOURS') {
    if (customGroup) customGroup.style.display = 'block';
    if (customLabel) customLabel.innerText = 'Hours Before';
    if (timeGroup) timeGroup.style.display = 'none';
  } else {
    if (customGroup) customGroup.style.display = 'none';
    if (timeGroup) timeGroup.style.display = 'block';
  }

  updateReminderPreview(type);
}

function calculateReminderDateTime(type) {
  const dateInput = document.getElementById(type === 'bill' ? 'bill-due-date' : 'event-date');
  const targetDateStr = dateInput ? dateInput.value : '';
  if (!targetDateStr) return null;

  const offsetSelect = document.getElementById(`${type}-reminder-offset`);
  const offsetVal = offsetSelect ? offsetSelect.value : (type === 'bill' ? '1_DAY' : '2_HOURS');

  let alertTime = document.getElementById(`${type}-reminder-time`) ? document.getElementById(`${type}-reminder-time`).value : '09:00';
  if (!alertTime) alertTime = '09:00';

  let targetDateTime;
  if (type === 'event') {
    const evTime = document.getElementById('event-time') ? document.getElementById('event-time').value : '09:00';
    targetDateTime = new Date(`${targetDateStr}T${evTime || '09:00'}:00`);
  } else {
    targetDateTime = new Date(`${targetDateStr}T${alertTime}:00`);
  }

  if (isNaN(targetDateTime.getTime())) return null;

  const reminderDateObj = new Date(targetDateTime);

  if (offsetVal === 'SAME_DAY' || offsetVal === 'AT_TIME') {
    if (type === 'bill') {
      const parts = alertTime.split(':');
      reminderDateObj.setHours(parseInt(parts[0]), parseInt(parts[1]), 0, 0);
    }
  } else if (offsetVal === '1_HOUR') {
    reminderDateObj.setHours(reminderDateObj.getHours() - 1);
    alertTime = `${String(reminderDateObj.getHours()).padStart(2, '0')}:${String(reminderDateObj.getMinutes()).padStart(2, '0')}`;
  } else if (offsetVal === '2_HOURS') {
    reminderDateObj.setHours(reminderDateObj.getHours() - 2);
    alertTime = `${String(reminderDateObj.getHours()).padStart(2, '0')}:${String(reminderDateObj.getMinutes()).padStart(2, '0')}`;
  } else if (offsetVal === '3_HOURS') {
    reminderDateObj.setHours(reminderDateObj.getHours() - 3);
    alertTime = `${String(reminderDateObj.getHours()).padStart(2, '0')}:${String(reminderDateObj.getMinutes()).padStart(2, '0')}`;
  } else if (offsetVal === '1_DAY') {
    reminderDateObj.setDate(reminderDateObj.getDate() - 1);
    const parts = alertTime.split(':');
    reminderDateObj.setHours(parseInt(parts[0]), parseInt(parts[1]), 0, 0);
  } else if (offsetVal === '2_DAYS') {
    reminderDateObj.setDate(reminderDateObj.getDate() - 2);
    const parts = alertTime.split(':');
    reminderDateObj.setHours(parseInt(parts[0]), parseInt(parts[1]), 0, 0);
  } else if (offsetVal === '3_DAYS') {
    reminderDateObj.setDate(reminderDateObj.getDate() - 3);
    const parts = alertTime.split(':');
    reminderDateObj.setHours(parseInt(parts[0]), parseInt(parts[1]), 0, 0);
  } else if (offsetVal === '5_DAYS') {
    reminderDateObj.setDate(reminderDateObj.getDate() - 5);
    const parts = alertTime.split(':');
    reminderDateObj.setHours(parseInt(parts[0]), parseInt(parts[1]), 0, 0);
  } else if (offsetVal === '1_WEEK') {
    reminderDateObj.setDate(reminderDateObj.getDate() - 7);
    const parts = alertTime.split(':');
    reminderDateObj.setHours(parseInt(parts[0]), parseInt(parts[1]), 0, 0);
  } else if (offsetVal === 'CUSTOM_DAYS') {
    const customValInput = document.getElementById(`${type}-reminder-custom-value`);
    const days = customValInput ? (parseInt(customValInput.value) || 1) : 1;
    reminderDateObj.setDate(reminderDateObj.getDate() - days);
    const parts = alertTime.split(':');
    reminderDateObj.setHours(parseInt(parts[0]), parseInt(parts[1]), 0, 0);
  } else if (offsetVal === 'CUSTOM_HOURS') {
    const customValInput = document.getElementById(`${type}-reminder-custom-value`);
    const hours = customValInput ? (parseInt(customValInput.value) || 1) : 1;
    reminderDateObj.setHours(reminderDateObj.getHours() - hours);
    alertTime = `${String(reminderDateObj.getHours()).padStart(2, '0')}:${String(reminderDateObj.getMinutes()).padStart(2, '0')}`;
  }

  const yyyy = reminderDateObj.getFullYear();
  const mm = String(reminderDateObj.getMonth() + 1).padStart(2, '0');
  const dd = String(reminderDateObj.getDate()).padStart(2, '0');
  const reminderDate = `${yyyy}-${mm}-${dd}`;

  return { reminderDate, reminderTime: alertTime };
}

function updateReminderPreview(type) {
  const previewText = document.getElementById(`${type}-reminder-preview-text`);
  if (!previewText) return;

  const res = calculateReminderDateTime(type);
  if (!res) {
    previewText.innerText = 'Please select a date first to see scheduled reminder timing.';
    return;
  }

  const dateObj = new Date(`${res.reminderDate}T${res.reminderTime}:00`);
  const formattedDate = dateObj.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
  const formattedTime = dateObj.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

  previewText.innerText = `Reminder alert will notify on: ${formattedDate} at ${formattedTime}`;
}

// --- Dynamic Custom Category Helpers ---
function handleCategoryDropdownChange(type) {
  const sel = document.getElementById(`${type}-category`);
  const grp = document.getElementById(`grp-${type}-category-custom`);
  const input = document.getElementById(`${type}-category-custom`);
  if (!sel || !grp) return;

  if (sel.value === '__CUSTOM__') {
    grp.style.display = 'block';
    if (input) {
      input.focus();
    }
  } else {
    grp.style.display = 'none';
  }
}

function toggleCustomCategoryInput(type) {
  const sel = document.getElementById(`${type}-category`);
  const grp = document.getElementById(`grp-${type}-category-custom`);
  const input = document.getElementById(`${type}-category-custom`);
  if (!grp) return;

  const isHidden = grp.style.display === 'none' || grp.style.display === '';
  if (isHidden) {
    grp.style.display = 'block';
    if (sel) sel.value = '__CUSTOM__';
    if (input) {
      input.focus();
    }
  } else {
    closeCustomCategoryInput(type);
  }
}

function closeCustomCategoryInput(type) {
  const sel = document.getElementById(`${type}-category`);
  const grp = document.getElementById(`grp-${type}-category-custom`);
  const input = document.getElementById(`${type}-category-custom`);
  if (grp) grp.style.display = 'none';
  if (input) input.value = '';
  if (sel && sel.value === '__CUSTOM__') {
    sel.value = type === 'bill' ? 'Electricity' : 'Meeting';
  }
}

function ensureCategoryOptionExists(type, catName) {
  if (!catName || catName === '__CUSTOM__') return;
  const sel = document.getElementById(`${type}-category`);
  if (!sel) return;

  let optionExists = false;
  for (let i = 0; i < sel.options.length; i++) {
    if (sel.options[i].value.toLowerCase() === catName.trim().toLowerCase()) {
      sel.options[i].selected = true;
      optionExists = true;
      break;
    }
  }

  if (!optionExists) {
    const opt = document.createElement('option');
    opt.value = catName.trim();
    opt.textContent = catName.trim();
    const customOpt = sel.querySelector('option[value="__CUSTOM__"]');
    if (customOpt) {
      sel.insertBefore(opt, customOpt);
    } else {
      sel.appendChild(opt);
    }
    opt.selected = true;
  }
}

function getSelectedCategory(type) {
  const sel = document.getElementById(`${type}-category`);
  const grp = document.getElementById(`grp-${type}-category-custom`);
  const input = document.getElementById(`${type}-category-custom`);

  if (grp && (grp.style.display === 'block' || (sel && sel.value === '__CUSTOM__'))) {
    const customVal = input ? input.value.trim() : '';
    if (customVal) {
      ensureCategoryOptionExists(type, customVal);
      return customVal;
    }
  }

  if (sel && sel.value && sel.value !== '__CUSTOM__') {
    return sel.value;
  }

  return type === 'bill' ? 'Other' : 'Meeting';
}

function clearBillFormErrors() {
  const fields = ['bill-name', 'bill-vendor', 'bill-category', 'bill-reference-no', 'bill-amount', 'bill-due-date'];
  fields.forEach(f => {
    const el = document.getElementById(f);
    if (el) el.style.borderColor = '';
    const errEl = document.getElementById(`err-${f}`);
    if (errEl) {
      errEl.style.display = 'none';
      errEl.innerText = '';
    }
  });
}

function setBillFieldError(fieldId, errorMsg) {
  const el = document.getElementById(fieldId);
  if (el) {
    el.style.borderColor = '#f87171';
    el.focus();
  }
  const errEl = document.getElementById(`err-${fieldId}`);
  if (errEl) {
    errEl.innerText = errorMsg;
    errEl.style.display = 'block';
  }
}

function openAddBillModal() {
  document.getElementById('form-bill').reset();
  document.getElementById('bill-id').value = '';
  clearBillFormErrors();
  closeCustomCategoryInput('bill');

  const vendorEl = document.getElementById('bill-vendor');
  if (vendorEl) vendorEl.value = '';
  const refEl = document.getElementById('bill-reference-no');
  if (refEl) refEl.value = '';

  const catSel = document.getElementById('bill-category');
  if (catSel) catSel.value = 'Electricity';
  const titleEl = document.getElementById('modal-bill-title');
  if (titleEl) titleEl.innerText = 'Add New Bill';
  const statEl = document.getElementById('bill-status');
  if (statEl) statEl.value = 'PENDING';

  const todayStr = new Date().toISOString().split('T')[0];
  const dueEl = document.getElementById('bill-due-date');
  if (dueEl) {
    dueEl.min = todayStr;
    dueEl.value = todayStr;
  }

  // Setup default reminder: 1 day before at 09:00
  const remEnable = document.getElementById('bill-reminder-enable');
  if (remEnable) remEnable.checked = true;
  const remOffset = document.getElementById('bill-reminder-offset');
  if (remOffset) remOffset.value = '1_DAY';
  const remTime = document.getElementById('bill-reminder-time');
  if (remTime) remTime.value = '09:00';
  toggleReminderSection('bill');
  handleReminderOffsetChange('bill');

  openModal('modal-bill');
}

function openEditBillModal(id) {
  const b = (state.bills || []).find(x => x.id === id);
  if (!b) return;

  document.getElementById('form-bill').reset();
  document.getElementById('bill-id').value = b.id;
  clearBillFormErrors();
  closeCustomCategoryInput('bill');

  const titleEl = document.getElementById('modal-bill-title');
  if (titleEl) titleEl.innerText = `Edit Bill #${b.id}`;
  document.getElementById('bill-name').value = b.billName || '';

  const vendorEl = document.getElementById('bill-vendor');
  if (vendorEl) vendorEl.value = b.vendor || '';

  const refEl = document.getElementById('bill-reference-no');
  if (refEl) refEl.value = b.referenceNo || '';

  if (b.category) {
    ensureCategoryOptionExists('bill', b.category);
    document.getElementById('bill-category').value = b.category;
  } else {
    document.getElementById('bill-category').value = 'Other';
  }
  document.getElementById('bill-amount').value = b.amount || '';
  const dueEl = document.getElementById('bill-due-date');
  if (dueEl) {
    dueEl.removeAttribute('min');
    dueEl.value = b.dueDate || '';
  }
  document.getElementById('bill-recurring').value = b.recurringPattern || 'NONE';
  const statEl = document.getElementById('bill-status');
  if (statEl) statEl.value = b.status || 'PENDING';
  document.getElementById('bill-description').value = b.description || '';

  // Check if existing reminder is linked to this bill
  const existingRem = (state.reminders || []).find(r => r.billId === b.id);
  const remEnable = document.getElementById('bill-reminder-enable');
  if (existingRem) {
    if (remEnable) remEnable.checked = true;
    if (existingRem.reminderTime) {
      document.getElementById('bill-reminder-time').value = existingRem.reminderTime.substring(0, 5);
    }
  } else {
    if (remEnable) remEnable.checked = false;
  }
  toggleReminderSection('bill');
  handleReminderOffsetChange('bill');

  openModal('modal-bill');
}

async function handleBillSubmit(e) {
  e.preventDefault();
  clearBillFormErrors();

  const id = document.getElementById('bill-id').value;
  const billName = (document.getElementById('bill-name').value || '').trim();
  const vendor = (document.getElementById('bill-vendor').value || '').trim();
  const billCategory = getSelectedCategory('bill');
  const referenceNo = (document.getElementById('bill-reference-no').value || '').trim();
  const amountVal = document.getElementById('bill-amount').value;
  const amount = parseFloat(amountVal);
  const dueDate = document.getElementById('bill-due-date').value;
  const recurringPattern = document.getElementById('bill-recurring').value;
  const status = document.getElementById('bill-status') ? document.getElementById('bill-status').value : 'PENDING';
  const description = document.getElementById('bill-description').value;

  let hasError = false;

  // 1. Bill Name - Required
  if (!billName) {
    setBillFieldError('bill-name', '❌ Bill Name is required');
    hasError = true;
  }

  // 2. Vendor - Required
  if (!vendor) {
    setBillFieldError('bill-vendor', '❌ Vendor is required');
    hasError = true;
  }

  // 3. Category - Required
  if (!billCategory || billCategory.trim() === '' || billCategory === '__CUSTOM__') {
    setBillFieldError('bill-category', '❌ Category is required');
    hasError = true;
  }

  // 4. Reference No - Required & Format Check (3-30 chars alphanumeric, hyphen, hash)
  const refPattern = /^[A-Za-z0-9\-#]{3,30}$/;
  if (!referenceNo) {
    setBillFieldError('bill-reference-no', '❌ Reference number is required');
    hasError = true;
  } else if (!refPattern.test(referenceNo)) {
    setBillFieldError('bill-reference-no', '❌ Reference number must be 3-30 characters (e.g. REF-2024-001)');
    hasError = true;
  }

  // 5. Amount - Required and > 0
  if (!amountVal || isNaN(amount) || amount <= 0) {
    setBillFieldError('bill-amount', '❌ Amount must be greater than 0');
    showToast('❌ Amount must be greater than 0', 'danger');
    hasError = true;
  }

  // 6. Due Date - Valid date and cannot be in past for new bills
  if (!dueDate) {
    setBillFieldError('bill-due-date', '⚠ Due Date is required');
    hasError = true;
  } else {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selectedDate = new Date(dueDate + 'T00:00:00');
    if (!id && selectedDate < today) {
      setBillFieldError('bill-due-date', '⚠ Invalid due date: Due date cannot be in the past');
      showToast('⚠ Invalid due date: Due date cannot be in the past', 'warning');
      hasError = true;
    }
  }

  if (hasError) {
    return;
  }

  const billData = {
    billName,
    vendor,
    referenceNo,
    category: billCategory,
    amount,
    dueDate,
    recurringPattern,
    status,
    description,
    createdBy: state.currentUser ? state.currentUser.id : null
  };

  try {
    let savedBill;
    if (id) {
      savedBill = await api(`/api/bills/${id}`, { method: 'PUT', body: JSON.stringify(billData) });
      const idx = (state.bills || []).findIndex(x => x.id == id);
      if (idx !== -1 && savedBill) state.bills[idx] = savedBill;
      showToast('Bill updated successfully!', 'success');
    } else {
      savedBill = await api('/api/bills', { method: 'POST', body: JSON.stringify(billData) });
      if (savedBill) (state.bills = state.bills || []).push(savedBill);
      showToast('New bill added with reminder!', 'success');
    }
    updateReactiveCounters();

    const targetBillId = id ? parseInt(id) : (savedBill ? savedBill.id : null);
    const isReminderEnabled = document.getElementById('bill-reminder-enable') ? document.getElementById('bill-reminder-enable').checked : false;

    if (targetBillId) {
      try {
        const existingRem = (state.reminders || []).find(r => r.billId === targetBillId);

        if (isReminderEnabled) {
          const remTiming = calculateReminderDateTime('bill');
          if (remTiming) {
            const remPayload = {
              billId: targetBillId,
              userId: state.currentUser ? state.currentUser.id : 1,
              reminderDate: remTiming.reminderDate,
              reminderTime: remTiming.reminderTime,
              status: 'ACTIVE',
              recurrenceType: 'ONCE'
            };

            if (existingRem) {
              await api(`/api/reminders/${existingRem.id}`, { method: 'PUT', body: JSON.stringify(remPayload) });
            } else {
              await api('/api/reminders', { method: 'POST', body: JSON.stringify(remPayload) });
            }
          }
        } else if (existingRem) {
          await api(`/api/reminders/${existingRem.id}`, { method: 'DELETE' });
        }
      } catch (remErr) {
        console.warn('Bill reminder sync note:', remErr);
      }
    }

    closeModal('modal-bill');
    await refreshAllData();
    switchTab(state.currentTab);
  } catch (err) {
    console.error('Bill submission error:', err);
    if (err && err.validationErrors) {
      Object.entries(err.validationErrors).forEach(([k, msg]) => {
        if (k === 'billName') setBillFieldError('bill-name', `❌ ${msg}`);
        if (k === 'vendor') setBillFieldError('bill-vendor', `❌ ${msg}`);
        if (k === 'referenceNo') setBillFieldError('bill-reference-no', `❌ ${msg}`);
        if (k === 'category') setBillFieldError('bill-category', `❌ ${msg}`);
        if (k === 'amount') setBillFieldError('bill-amount', `❌ ${msg}`);
        if (k === 'dueDate') setBillFieldError('bill-due-date', `⚠ ${msg}`);
      });
    }
  }
}

function openAddEventModal() {
  document.getElementById('form-event').reset();
  document.getElementById('event-id').value = '';
  closeCustomCategoryInput('event');
  const catSel = document.getElementById('event-category');
  if (catSel) catSel.value = 'Meeting';
  const titleEl = document.getElementById('modal-event-title');
  if (titleEl) titleEl.innerText = 'Add Organizational Event';
  const statEl = document.getElementById('event-status');
  if (statEl) statEl.value = 'UPCOMING';
  const descEl = document.getElementById('event-description');
  if (descEl) descEl.value = '';

  const todayStr = new Date().toISOString().split('T')[0];
  const dateEl = document.getElementById('event-date');
  if (dateEl) {
    dateEl.value = todayStr;
  }

  // Setup default reminder: 2 hours before
  const remEn = document.getElementById('event-reminder-enable');
  if (remEn) remEn.checked = true;
  const remOffset = document.getElementById('event-reminder-offset');
  if (remOffset) remOffset.value = '2_HOURS';
  const remTime = document.getElementById('event-reminder-time');
  if (remTime) remTime.value = '09:00';
  toggleReminderSection('event');
  handleReminderOffsetChange('event');

  openModal('modal-event');
}

function openEditEventModal(id) {
  const e = (state.events || []).find(x => x.id === id);
  if (!e) return;

  document.getElementById('event-id').value = e.id;
  document.getElementById('event-name').value = e.eventName || '';
  
  if (e.category) {
    ensureCategoryOptionExists('event', e.category);
    document.getElementById('event-category').value = e.category;
  } else {
    document.getElementById('event-category').value = 'Meeting';
  }

  document.getElementById('event-location').value = e.location || '';
  document.getElementById('event-date').value = e.eventDate || '';
  document.getElementById('event-time').value = e.eventTime ? e.eventTime.substring(0, 5) : '';
  const statEl = document.getElementById('event-status');
  if (statEl) statEl.value = e.status || 'UPCOMING';
  const descEl = document.getElementById('event-description');
  if (descEl) descEl.value = e.description || '';

  // Check if existing reminder is linked to this event
  const existingRem = (state.reminders || []).find(r => r.eventId === e.id);
  const remEn = document.getElementById('event-reminder-enable');
  if (existingRem) {
    if (remEn) remEn.checked = true;
    if (existingRem.reminderTime) {
      const remTimeEl = document.getElementById('event-reminder-time');
      if (remTimeEl) remTimeEl.value = existingRem.reminderTime.substring(0, 5);
    }
  } else {
    if (remEn) remEn.checked = false;
  }
  toggleReminderSection('event');
  handleReminderOffsetChange('event');

  const titleEl = document.getElementById('modal-event-title');
  if (titleEl) titleEl.innerText = 'Edit Event / Commitment';

  openModal('modal-event');
}

async function handleEventSubmit(e) {
  e.preventDefault();
  const id = document.getElementById('event-id').value;
  const eventCategory = getSelectedCategory('event');
  const eventName = (document.getElementById('event-name').value || '').trim();
  const eventDate = document.getElementById('event-date').value;
  let eventTime = (document.getElementById('event-time').value || '').trim();

  if (!eventName) {
    showToast('Event name is required', 'warning');
    return;
  }
  if (!eventDate) {
    showToast('Event date is required', 'warning');
    return;
  }

  if (!eventTime) {
    eventTime = null;
  } else if (eventTime.length === 5) {
    eventTime += ':00';
  }

  const eventData = {
    eventName,
    category: eventCategory,
    location: (document.getElementById('event-location').value || '').trim(),
    eventDate,
    eventTime,
    status: document.getElementById('event-status') ? document.getElementById('event-status').value : 'UPCOMING',
    description: document.getElementById('event-description') ? document.getElementById('event-description').value : '',
    createdBy: state.currentUser ? state.currentUser.id : null
  };

  try {
    let savedEvent;
    if (id) {
      savedEvent = await api(`/api/events/${id}`, { method: 'PUT', body: JSON.stringify(eventData) });
      const idx = (state.events || []).findIndex(x => x.id == id);
      if (idx !== -1 && savedEvent) state.events[idx] = savedEvent;
      showToast('Event updated successfully!', 'success');
    } else {
      savedEvent = await api('/api/events', { method: 'POST', body: JSON.stringify(eventData) });
      if (savedEvent) (state.events = state.events || []).push(savedEvent);
      showToast('Event scheduled with reminder!', 'success');
    }
    updateReactiveCounters();

    const targetEventId = id ? parseInt(id) : (savedEvent ? savedEvent.id : null);
    const isReminderEnabled = document.getElementById('event-reminder-enable') ? document.getElementById('event-reminder-enable').checked : false;

    if (targetEventId) {
      try {
        const existingRem = (state.reminders || []).find(r => r.eventId === targetEventId);

        if (isReminderEnabled) {
          const remTiming = calculateReminderDateTime('event');
          if (remTiming) {
            const remPayload = {
              eventId: targetEventId,
              userId: state.currentUser ? state.currentUser.id : 1,
              reminderDate: remTiming.reminderDate,
              reminderTime: remTiming.reminderTime,
              status: 'ACTIVE',
              recurrenceType: 'ONCE'
            };

            if (existingRem) {
              await api(`/api/reminders/${existingRem.id}`, { method: 'PUT', body: JSON.stringify(remPayload) });
            } else {
              await api('/api/reminders', { method: 'POST', body: JSON.stringify(remPayload) });
            }
          }
        } else if (existingRem) {
          await api(`/api/reminders/${existingRem.id}`, { method: 'DELETE' });
        }
      } catch (remErr) {
        console.warn('Event reminder sync note:', remErr);
      }
    }

    closeModal('modal-event');
    await refreshAllData();
    switchTab(state.currentTab);
  } catch (err) {
    console.error('Event submission error:', err);
    showToast(err.message || 'Failed to save event', 'danger');
  }
}

// Choice Modal Trigger & Selection Helpers
function openCreateChoiceModal() {
  openModal('modal-create-choice');
}

function selectCreateChoice(type) {
  closeModal('modal-create-choice');
  if (type === 'bill') {
    openAddBillModal();
  } else if (type === 'event') {
    openAddEventModal();
  } else if (type === 'reminder') {
    openAddReminderModal();
  }
}
window.openCreateChoiceModal = openCreateChoiceModal;
window.selectCreateChoice = selectCreateChoice;

// Global window bindings for CRUD and Reminder operations
window.openAddBillModal = openAddBillModal;
window.openEditBillModal = openEditBillModal;
window.handleBillSubmit = handleBillSubmit;
window.openAddEventModal = openAddEventModal;
window.openEditEventModal = openEditEventModal;
window.handleEventSubmit = handleEventSubmit;
window.deleteBill = deleteBill;
window.deleteEvent = deleteEvent;
window.filterBillsFullTable = filterBillsFullTable;
window.filterEventsFullTable = filterEventsFullTable;
window.toggleReminderSection = toggleReminderSection;
window.handleReminderOffsetChange = handleReminderOffsetChange;
window.updateReminderPreview = updateReminderPreview;
window.loadRemindersTable = loadRemindersTable;
window.renderRemindersTables = renderRemindersTables;
window.filterRemindersByType = filterRemindersByType;
window.filterRemindersByStatus = filterRemindersByStatus;
window.handleReminderSearch = handleReminderSearch;
window.handleReminderStatusFilter = handleReminderStatusFilter;
window.viewReminder = viewReminder;
window.openEditReminderModal = openEditReminderModal;
window.handleEditReminderSubmit = handleEditReminderSubmit;
window.quickToggleReminderStatus = quickToggleReminderStatus;
window.deleteReminderItem = deleteReminderItem;
window.deleteReminder = deleteReminderItem;

async function openAddReminderModal() {
  document.getElementById('form-reminder').reset();
  const isAdm = isAdmin();
  const userId = state.currentUser ? state.currentUser.id : null;
  const bills = (isAdm || !userId) ? await api('/api/bills') : await api(`/api/bills/user/${userId}`);
  const events = (isAdm || !userId) ? await api('/api/events') : await api(`/api/events/user/${userId}`);

  document.getElementById('rem-bill-id').innerHTML = bills.map(b => `<option value="${b.id}">${escapeHtml(b.billName)} (Due: ${b.dueDate})</option>`).join('');
  document.getElementById('rem-event-id').innerHTML = events.map(e => `<option value="${e.id}">${escapeHtml(e.eventName)} (${e.eventDate})</option>`).join('');

  const typeSelect = document.getElementById('reminder-type-select');
  typeSelect.value = 'BILL';
  document.getElementById('grp-rem-bill').style.display = 'block';
  document.getElementById('grp-rem-event').style.display = 'none';
  const customGrp = document.getElementById('grp-rem-custom');
  if (customGrp) customGrp.style.display = 'none';

  typeSelect.onchange = (e) => {
    const val = e.target.value;
    document.getElementById('grp-rem-bill').style.display = val === 'BILL' ? 'block' : 'none';
    document.getElementById('grp-rem-event').style.display = val === 'EVENT' ? 'block' : 'none';
    if (customGrp) customGrp.style.display = val === 'CUSTOM' ? 'block' : 'none';
  };

  openModal('modal-reminder');
}

async function handleReminderSubmit(e) {
  e.preventDefault();
  const type = document.getElementById('reminder-type-select').value;
  let billId = type === 'BILL' ? parseInt(document.getElementById('rem-bill-id').value) : null;
  let eventId = type === 'EVENT' ? parseInt(document.getElementById('rem-event-id').value) : null;

  if (type === 'CUSTOM') {
    const customTitle = document.getElementById('rem-custom-title').value.trim() || 'Personal Reminder';
    const newEvent = await api('/api/events', {
      method: 'POST',
      body: JSON.stringify({
        eventName: customTitle,
        category: 'Personal',
        location: 'Personal Task',
        eventDate: document.getElementById('rem-date').value,
        eventTime: document.getElementById('rem-time').value || null
      })
    });
    eventId = newEvent.id;
  }

  const recurrenceInput = document.getElementById('rem-recurrence');
  const remData = {
    billId: billId,
    eventId: eventId,
    reminderDate: document.getElementById('rem-date').value,
    reminderTime: document.getElementById('rem-time').value || null,
    recurrenceType: recurrenceInput ? recurrenceInput.value : 'ONCE',
    status: 'ACTIVE',
    userId: state.currentUser ? state.currentUser.id : 1
  };

  await api('/api/reminders', { method: 'POST', body: JSON.stringify(remData) });
  showToast('Reminder alert scheduled successfully!', 'success');
  closeModal('modal-reminder');
  await refreshAllData();
  loadRemindersTable();
}

function openSubmitSupportModal() {
  document.getElementById('form-support-submit').reset();
  openModal('modal-support-submit');
}

async function handleSupportSubmit(e) {
  e.preventDefault();
  const reqData = {
    subject: document.getElementById('support-subject').value.trim(),
    category: document.getElementById('support-category').value,
    message: document.getElementById('support-message').value.trim(),
    userId: state.currentUser ? state.currentUser.id : 1,
    userName: state.currentUser ? state.currentUser.name : 'User'
  };

  try {
    const res = await api('/api/support', { method: 'POST', body: JSON.stringify(reqData) });
    showToast(`Support ticket #${res.id} submitted successfully!`, 'success');
    closeModal('modal-support-submit');
    await loadSupportView();
    refreshAllData();
  } catch (err) {
    showToast('Failed to submit support ticket: ' + (err.message || ''), 'danger');
  }
}

async function handleSupportManageSubmit(e) {
  e.preventDefault();
  const id = document.getElementById('manage-support-id').value;
  const updateData = {
    adminResponse: document.getElementById('manage-support-response').value.trim(),
    status: document.getElementById('manage-support-status').value
  };

  try {
    await api(`/api/support/${id}`, { method: 'PUT', body: JSON.stringify(updateData) });
    showToast(`Ticket #${id} updated!`, 'success');
    closeModal('modal-support-manage');
    await loadSupportView();
    refreshAllData();
  } catch (err) {
    showToast('Failed to update ticket: ' + (err.message || ''), 'danger');
  }
}

function openSubmitFeedbackModal() {
  document.getElementById('form-feedback-submit').reset();
  document.getElementById('feedback-rating-val').value = '5';
  document.querySelectorAll('#feedback-star-box i').forEach(s => s.style.color = '#fbbf24');
  openModal('modal-feedback-submit');
}

async function handleFeedbackSubmit(e) {
  e.preventDefault();
  const fbData = {
    type: document.getElementById('feedback-type').value,
    rating: parseInt(document.getElementById('feedback-rating-val').value) || 5,
    message: document.getElementById('feedback-message').value.trim(),
    userId: state.currentUser ? state.currentUser.id : 1,
    userName: state.currentUser ? state.currentUser.name : 'User'
  };

  try {
    await api('/api/feedback', { method: 'POST', body: JSON.stringify(fbData) });
    showToast('Feedback submitted! Thank you.', 'success');
    closeModal('modal-feedback-submit');
    await loadFeedbackView();
  } catch (err) {
    showToast('Failed to submit feedback: ' + (err.message || ''), 'danger');
  }
}

// Helpers
function formatCurrency(val) {
  return parseFloat(val || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatDate(dt) {
  if (!dt) return '';
  return new Date(dt).toLocaleString('en-GB', { dateStyle: 'short', timeStyle: 'short' });
}

function escapeHtml(text) {
  if (!text) return '';
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// ==========================================================================
// VIEW 13: Profile & Account Settings Functions
// ==========================================================================
async function loadProfileView() {
  if (!state.currentUser) return;
  const userId = state.currentUser.id;

  try {
    const user = await api(`/api/users/${userId}`);
    if (user) {
      // Update form fields
      const firstNameInput = document.getElementById('profile-first-name');
      const lastNameInput = document.getElementById('profile-last-name');
      const emailInput = document.getElementById('profile-email-input');
      const phoneInput = document.getElementById('profile-phone-input');

      if (firstNameInput) firstNameInput.value = user.firstName || '';
      if (lastNameInput) lastNameInput.value = user.lastName || '';
      if (emailInput) emailInput.value = user.email || '';
      if (phoneInput) phoneInput.value = user.phone || '';

      // Update hero card
      const heroName = document.getElementById('profile-hero-name');
      const heroEmail = document.getElementById('profile-hero-email');
      const heroRole = document.getElementById('profile-hero-role');
      const heroStatus = document.getElementById('profile-hero-status');
      const heroAvatar = document.getElementById('profile-hero-avatar');

      const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.username || 'User';
      if (heroName) heroName.innerText = fullName;
      if (heroEmail) heroEmail.innerHTML = `<i class="fa-regular fa-envelope"></i> ${escapeHtml(user.email || '-')}`;
      if (heroRole) heroRole.innerText = (user.role === 'SYSTEM_ADMINISTRATOR' || user.role === 'ADMIN') ? 'System Administrator' : 'Standard User';
      if (heroStatus) heroStatus.innerHTML = `<i class="fa-solid fa-circle-check"></i> ${escapeHtml(user.status || 'Active')}`;
        if (heroAvatar) {
        const initial = (user.firstName ? user.firstName.charAt(0) : 'U').toUpperCase();
        heroAvatar.innerText = initial;
      }
      if (window.TrackDueTheme) {
        window.TrackDueTheme.refreshUI();
      }
    }
  } catch (err) {
    console.error('Failed to load user profile:', err);
  }
}

async function handleProfileUpdate(e) {
  e.preventDefault();
  if (!state.currentUser) return;
  const userId = state.currentUser.id;

  const firstName = document.getElementById('profile-first-name').value.trim();
  const lastName = document.getElementById('profile-last-name').value.trim();
  const phone = document.getElementById('profile-phone-input').value.trim();

  if (!firstName) {
    showToast('First name cannot be empty', 'warning');
    return;
  }

  const saveBtn = document.getElementById('btn-save-profile');
  if (saveBtn) {
    saveBtn.disabled = true;
    saveBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Saving...';
  }

  try {
    const updated = await api(`/api/users/${userId}/profile`, {
      method: 'PUT',
      body: JSON.stringify({ firstName, lastName, phone })
    });

    // Update local state and storage
    const newFullName = `${firstName} ${lastName}`.trim();
    state.currentUser.name = newFullName;
    const raw = localStorage.getItem('trackdue_user');
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        parsed.firstName = firstName;
        parsed.lastName = lastName;
        parsed.phone = phone;
        parsed.name = newFullName;
        localStorage.setItem('trackdue_user', JSON.stringify(parsed));
      } catch (ex) {
        console.error('Error saving updated session:', ex);
      }
    }

    updateSessionUI();
    loadProfileView();
    showToast('Profile information updated successfully!', 'success');
  } catch (error) {
    console.error('Profile update error:', error);
  } finally {
    if (saveBtn) {
      saveBtn.disabled = false;
      saveBtn.innerHTML = '<i class="fa-solid fa-floppy-disk"></i> Save Profile Details';
    }
  }
}

async function handlePasswordUpdate(e) {
  e.preventDefault();
  if (!state.currentUser) return;
  const userId = state.currentUser.id;

  const currentPassword = document.getElementById('profile-current-password').value;
  const newPassword = document.getElementById('profile-new-password').value;
  const confirmPassword = document.getElementById('profile-confirm-password').value;

  if (newPassword !== confirmPassword) {
    showToast('New password and confirmation do not match.', 'danger');
    return;
  }
  if (newPassword.length < 4) {
    showToast('New password must be at least 4 characters long.', 'warning');
    return;
  }

  const saveBtn = document.getElementById('btn-save-password');
  if (saveBtn) {
    saveBtn.disabled = true;
    saveBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Updating...';
  }

  try {
    await api(`/api/users/${userId}/password`, {
      method: 'PUT',
      body: JSON.stringify({ currentPassword, newPassword })
    });

    document.getElementById('form-profile-password').reset();
    showToast('Password updated successfully!', 'success');
  } catch (err) {
    console.error('Password update error:', err);
  } finally {
    if (saveBtn) {
      saveBtn.disabled = false;
      saveBtn.innerHTML = '<i class="fa-solid fa-key"></i> Update Password';
    }
  }
}

function togglePasswordVisibility(inputId, btn) {
  const input = document.getElementById(inputId);
  if (!input) return;
  const icon = btn.querySelector('i');
  if (input.type === 'password') {
    input.type = 'text';
    if (icon) {
      icon.classList.remove('fa-eye');
      icon.classList.add('fa-eye-slash');
    }
  } else {
    input.type = 'password';
    if (icon) {
      icon.classList.remove('fa-eye-slash');
      icon.classList.add('fa-eye');
    }
  }
}

function openDeleteAccountModal() {
  const input = document.getElementById('input-confirm-delete-keyword');
  if (input) input.value = '';
  const btn = document.getElementById('btn-confirm-delete-account');
  if (btn) btn.disabled = true;
  openModal('modal-delete-account');
}

function checkDeleteConfirmationInput() {
  const input = document.getElementById('input-confirm-delete-keyword');
  const btn = document.getElementById('btn-confirm-delete-account');
  if (!input || !btn) return;
  btn.disabled = input.value.trim().toUpperCase() !== 'DELETE';
}

async function executeAccountDeletion() {
  if (!state.currentUser) return;
  const userId = state.currentUser.id;

  const btn = document.getElementById('btn-confirm-delete-account');
  if (btn) {
    btn.disabled = true;
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Deleting Account...';
  }

  try {
    await api(`/api/users/${userId}`, { method: 'DELETE' });
    showToast('Your account and all associated data have been permanently deleted.', 'success');
    closeModal('modal-delete-account');

    localStorage.removeItem('trackdue_user');
    setTimeout(() => {
      window.location.replace('index.html');
    }, 1200);
  } catch (err) {
    console.error('Account deletion error:', err);
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = '<i class="fa-solid fa-trash-can"></i> Permanently Delete Account';
    }
  }
}

// ==========================================================================
// VIEW: NOTIFICATION MANAGEMENT CENTER & AUTOMATED TEMPLATES
// ==========================================================================
let notifFilterStatus = 'ALL';
let notifSearchQuery = '';

async function loadNotificationsView() {
  const userId = state.currentUser ? state.currentUser.id : null;
  if (!userId) return;

  try {
    // Automatically trigger check for any due reminders
    await api('/api/reminders/trigger-check', { method: 'POST' }).catch(() => {});

    state.notifications = await api(`/api/notifications/user/${userId}`);
  } catch (err) {
    console.error('Failed to load notifications:', err);
    state.notifications = [];
  }

  // Calculate statistics
  const total = state.notifications.length;
  const unread = state.notifications.filter(n => n.status === 'SENT' || n.status === 'UNREAD').length;
  const read = state.notifications.filter(n => n.status === 'READ').length;

  const totalEl = document.getElementById('notif-stat-total');
  if (totalEl) totalEl.innerText = total;

  const unreadEl = document.getElementById('notif-stat-unread');
  if (unreadEl) unreadEl.innerText = unread;

  const readEl = document.getElementById('notif-stat-read');
  if (readEl) readEl.innerText = read;

  // Sidebar and topbar unread badges
  const notifSidebarBadge = document.getElementById('badge-notifications-sidebar');
  if (notifSidebarBadge) notifSidebarBadge.innerText = unread;
  const topbarNotifBadge = document.getElementById('topbar-notif-count');
  if (topbarNotifBadge) topbarNotifBadge.innerText = unread;

  renderNotificationsList();
}

function renderNotificationsList() {
  const container = document.getElementById('notifications-inbox-list');
  if (!container) return;

  const q = (notifSearchQuery || '').toLowerCase().trim();
  const list = (state.notifications || []).filter(n => {
    // Status filter
    if (notifFilterStatus === 'UNREAD' && n.status === 'READ') return false;
    if (notifFilterStatus === 'READ' && (n.status === 'SENT' || n.status === 'UNREAD')) return false;

    // Search query
    if (q) {
      const matchTitle = (n.title || '').toLowerCase().includes(q);
      const matchMsg = (n.message || '').toLowerCase().includes(q);
      return matchTitle || matchMsg;
    }
    return true;
  });

  const summaryText = document.getElementById('notif-count-summary-text');
  if (summaryText) {
    summaryText.innerText = `Showing ${list.length} of ${state.notifications.length} notifications`;
  }

  if (list.length === 0) {
    container.innerHTML = `
      <div class="any-empty-state-card" style="padding:48px 24px;">
        <div class="empty-icon-circle blue">
          <i class="fa-regular fa-bell"></i>
        </div>
        <h4>No Notifications in Inbox</h4>
        <p>
          ${q ? `No notifications match "${escapeHtml(q)}". Try clearing your search query.` : 'When your scheduled bill or event reminders reach their due date & time, automated in-app notifications will appear here.'}
        </p>
        <button class="btn-any-blue" onclick="openUserTemplatesModal()" style="font-size:13px; padding:8px 20px; background:linear-gradient(135deg, #2563eb 0%, #10b981 100%); border-radius:var(--radius-full);">
          <i class="fa-solid fa-sliders"></i> Customize Reminder Message Formats
        </button>
      </div>
    `;
    return;
  }

  container.innerHTML = list.map(n => {
    const isUnread = n.status === 'SENT' || n.status === 'UNREAD';
    const cardBg = isUnread ? 'rgba(37, 99, 235, 0.06)' : 'var(--any-card)';
    const borderCol = isUnread ? 'rgba(37, 99, 235, 0.28)' : 'var(--any-border)';
    const statusBadge = isUnread
      ? `<span class="badge-status pending" style="background:rgba(245,158,11,0.15); color:#f59e0b; border:1px solid rgba(245,158,11,0.3); font-size:11px; padding:3px 8px; border-radius:10px; font-weight:700;"><i class="fa-solid fa-circle-dot" style="font-size:8px;"></i> UNREAD</span>`
      : `<span class="badge-status resolved" style="background:rgba(16,185,129,0.15); color:#10b981; border:1px solid rgba(16,185,129,0.3); font-size:11px; padding:3px 8px; border-radius:10px; font-weight:700;"><i class="fa-solid fa-check" style="font-size:9px;"></i> READ</span>`;

    const iconColor = isUnread ? '#38bdf8' : '#64748b';
    const iconBg = isUnread ? 'rgba(56, 189, 248, 0.15)' : 'rgba(100, 116, 139, 0.12)';
    const timeDisplay = formatDate(n.sentAt || n.createdAt || Date.now());

    return `
      <div class="notification-item-card" style="background:${cardBg}; border:1px solid ${borderCol}; border-radius:12px; padding:18px 20px; transition:all 0.2s ease;">
        <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:14px; margin-bottom:10px;">
          <div style="display:flex; align-items:center; gap:12px;">
            <div style="width:38px; height:38px; border-radius:10px; background:${iconBg}; color:${iconColor}; display:flex; align-items:center; justify-content:center; font-size:16px; flex-shrink:0;">
              <i class="fa-solid fa-bell"></i>
            </div>
            <div>
              <div style="display:flex; align-items:center; gap:8px; flex-wrap:wrap;">
                <h4 style="color:var(--any-text); font-size:15px; font-weight:700; margin:0;">${escapeHtml(n.title)}</h4>
                ${statusBadge}
                <span style="background:rgba(255,255,255,0.06); color:var(--any-text-muted); font-size:11px; padding:2px 8px; border-radius:6px;">In-App Alert</span>
              </div>
              <div style="color:var(--any-text-sub); font-size:12px; margin-top:2px;">
                <i class="fa-regular fa-clock" style="font-size:11px;"></i> ${timeDisplay}
              </div>
            </div>
          </div>
          <div style="display:flex; align-items:center; gap:6px;">
            <button class="btn-any-subtle" onclick="toggleNotificationRead(${n.id})" title="${isUnread ? 'Mark as Read' : 'Mark as Unread'}" style="padding:6px 12px; font-size:12px;">
              ${isUnread ? '<i class="fa-solid fa-check" style="color:#10b981;"></i> Mark Read' : '<i class="fa-regular fa-circle-dot" style="color:#f59e0b;"></i> Mark Unread'}
            </button>
            <button class="btn-any-subtle" onclick="deleteNotificationItem(${n.id})" title="Delete Notification" style="padding:6px 10px; font-size:12px; color:#ef4444;">
              <i class="fa-regular fa-trash-can"></i>
            </button>
          </div>
        </div>

        <!-- Automated Notification Message Content Box -->
        <div style="background:rgba(0, 0, 0, 0.25); border:1px solid rgba(255, 255, 255, 0.05); border-radius:8px; padding:12px 14px; margin-top:10px;">
          <p style="color:#e2e8f0; font-size:13.5px; line-height:1.55; margin:0; word-break:break-word; white-space:pre-wrap;">${escapeHtml(n.message)}</p>
        </div>
      </div>
    `;
  }).join('');
}

function filterNotificationsList() {
  const searchInput = document.getElementById('notif-search-input');
  notifSearchQuery = searchInput ? searchInput.value : '';
  renderNotificationsList();
}

function filterNotifsByStatus(status, btn) {
  notifFilterStatus = status;
  if (btn && btn.parentElement) {
    btn.parentElement.querySelectorAll('.filter-pill').forEach(p => p.classList.remove('active'));
    btn.classList.add('active');
  }
  renderNotificationsList();
}

async function toggleNotificationRead(id) {
  const n = (state.notifications || []).find(x => x.id === id);
  if (!n) return;

  const isUnread = n.status === 'SENT' || n.status === 'UNREAD';
  const newStatus = isUnread ? 'READ' : 'SENT';

  try {
    await api(`/api/notifications/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ status: newStatus })
    });
    showToast(`Notification marked as ${newStatus === 'READ' ? 'Read' : 'Unread'}.`, 'info');
    await loadNotificationsView();
    await refreshAllData();
  } catch (err) {
    console.error('Toggle notification status error:', err);
  }
}

async function markAllNotificationsAsRead() {
  if (!state.currentUser) return;
  try {
    await api(`/api/notifications/user/${state.currentUser.id}/read-all`, { method: 'PUT' });
    showToast('All notifications marked as read.', 'success');
    await loadNotificationsView();
    await refreshAllData();
  } catch (err) {
    console.error('Mark all read error:', err);
  }
}

async function deleteNotificationItem(id) {
  if (!confirm(`Are you sure you want to delete notification #${id}?`)) return;

  try {
    await api(`/api/notifications/${id}`, { method: 'DELETE' });
    showToast(`Notification #${id} deleted successfully.`, 'success');
    await loadNotificationsView();
    await refreshAllData();
  } catch (err) {
    console.error('Delete notification error:', err);
  }
}

// ==========================================================================
// ADMIN: BROADCAST SYSTEM ANNOUNCEMENT
// ==========================================================================
function openAdminBroadcastModal() {
  const form = document.getElementById('form-admin-broadcast');
  if (form) form.reset();
  openModal('modal-admin-broadcast');
}

async function handleAdminBroadcastSubmit(e) {
  e.preventDefault();
  const title = document.getElementById('broadcast-title').value.trim();
  const message = document.getElementById('broadcast-message').value.trim();

  if (!title || !message) {
    showToast('Please enter both title and announcement message.', 'warning');
    return;
  }

  const btn = document.getElementById('btn-submit-broadcast');
  if (btn) {
    btn.disabled = true;
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Broadcasting...';
  }

  try {
    const res = await api('/api/notifications/broadcast', {
      method: 'POST',
      body: JSON.stringify({ title, message })
    });
    closeModal('modal-admin-broadcast');
    showToast(`System announcement broadcasted to ${res.recipientCount || 'all'} registered users!`, 'success');
    await refreshAllData();
  } catch (err) {
    console.error('Broadcast error:', err);
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = '<i class="fa-solid fa-bullhorn"></i> Broadcast to All Users';
    }
  }
}

// ==========================================================================
// ADMIN: GLOBAL NOTIFICATION TEMPLATES
// ==========================================================================
async function openAdminTemplatesModal() {
  try {
    const templates = await api('/api/notification-templates/system');
    const billTpl = (templates || []).find(t => t.type === 'BILL') || {};
    const eventTpl = (templates || []).find(t => t.type === 'EVENT') || {};

    const billTitle = document.getElementById('admin-bill-title-tpl');
    if (billTitle) billTitle.value = billTpl.titleTemplate || 'Bill Due Reminder: {billName}';
    const billMsg = document.getElementById('admin-bill-msg-tpl');
    if (billMsg) billMsg.value = billTpl.messageTemplate || 'Reminder: Your bill "{billName}" of LKR {amount} is due on {dueDate}. Please ensure timely settlement.';

    const eventTitle = document.getElementById('admin-event-title-tpl');
    if (eventTitle) eventTitle.value = eventTpl.titleTemplate || 'Event Reminder: {eventName}';
    const eventMsg = document.getElementById('admin-event-msg-tpl');
    if (eventMsg) eventMsg.value = eventTpl.messageTemplate || 'Reminder: Upcoming event "{eventName}" scheduled on {eventDate} at {location}.';

    switchAdminTemplateTab('BILL');
    openModal('modal-admin-templates');
  } catch (err) {
    console.error('Failed to load admin templates:', err);
    showToast('Failed to load global templates.', 'danger');
  }
}

function switchAdminTemplateTab(type) {
  const btnBill = document.getElementById('btn-admin-tpl-bill');
  const btnEvent = document.getElementById('btn-admin-tpl-event');
  const formBill = document.getElementById('form-admin-tpl-bill');
  const formEvent = document.getElementById('form-admin-tpl-event');

  if (type === 'BILL') {
    if (btnBill) btnBill.classList.add('active');
    if (btnEvent) btnEvent.classList.remove('active');
    if (formBill) formBill.style.display = 'block';
    if (formEvent) formEvent.style.display = 'none';
  } else {
    if (btnBill) btnBill.classList.remove('active');
    if (btnEvent) btnEvent.classList.add('active');
    if (formBill) formBill.style.display = 'none';
    if (formEvent) formEvent.style.display = 'block';
  }
}

async function handleAdminSaveTemplate(e, type) {
  e.preventDefault();
  const isBill = type === 'BILL';
  const title = document.getElementById(isBill ? 'admin-bill-title-tpl' : 'admin-event-title-tpl').value.trim();
  const message = document.getElementById(isBill ? 'admin-bill-msg-tpl' : 'admin-event-msg-tpl').value.trim();

  if (!title || !message) {
    showToast('Title and message format cannot be empty.', 'warning');
    return;
  }

  try {
    await api('/api/notification-templates/system', {
      method: 'PUT',
      body: JSON.stringify({
        type: type,
        titleTemplate: title,
        messageTemplate: message
      })
    });
    showToast(`Global ${type} reminder format updated for all users!`, 'success');
  } catch (err) {
    console.error('Update system template error:', err);
  }
}

// ==========================================================================
// USER: CUSTOMIZE PERSONAL REMINDER TEMPLATES
// ==========================================================================
async function openUserTemplatesModal() {
  if (!state.currentUser) return;
  const userId = state.currentUser.id;

  try {
    const data = await api(`/api/notification-templates/user/${userId}`);
    const billData = data.BILL || {};
    const eventData = data.EVENT || {};

    const billTitle = document.getElementById('user-bill-title-tpl');
    if (billTitle) billTitle.value = billData.titleTemplate || '';
    const billMsg = document.getElementById('user-bill-msg-tpl');
    if (billMsg) billMsg.value = billData.messageTemplate || '';

    const eventTitle = document.getElementById('user-event-title-tpl');
    if (eventTitle) eventTitle.value = eventData.titleTemplate || '';
    const eventMsg = document.getElementById('user-event-msg-tpl');
    if (eventMsg) eventMsg.value = eventData.messageTemplate || '';

    switchUserTemplateTab('BILL');
    openModal('modal-user-notification-templates');
  } catch (err) {
    console.error('Failed to load user templates:', err);
    showToast('Failed to load reminder message formats.', 'danger');
  }
}

function switchUserTemplateTab(type) {
  const btnBill = document.getElementById('btn-user-tpl-bill');
  const btnEvent = document.getElementById('btn-user-tpl-event');
  const formBill = document.getElementById('form-user-tpl-bill');
  const formEvent = document.getElementById('form-user-tpl-event');

  if (type === 'BILL') {
    if (btnBill) btnBill.classList.add('active');
    if (btnEvent) btnEvent.classList.remove('active');
    if (formBill) formBill.style.display = 'block';
    if (formEvent) formEvent.style.display = 'none';
  } else {
    if (btnBill) btnBill.classList.remove('active');
    if (btnEvent) btnEvent.classList.add('active');
    if (formBill) formBill.style.display = 'none';
    if (formEvent) formEvent.style.display = 'block';
  }
}

async function handleUserSaveTemplate(e, type) {
  e.preventDefault();
  if (!state.currentUser) return;
  const userId = state.currentUser.id;

  const isBill = type === 'BILL';
  const title = document.getElementById(isBill ? 'user-bill-title-tpl' : 'user-event-title-tpl').value.trim();
  const message = document.getElementById(isBill ? 'user-bill-msg-tpl' : 'user-event-msg-tpl').value.trim();

  if (!title || !message) {
    showToast('Please fill in both title and message template format.', 'warning');
    return;
  }

  try {
    await api(`/api/notification-templates/user/${userId}`, {
      method: 'POST',
      body: JSON.stringify({
        type: type,
        titleTemplate: title,
        messageTemplate: message
      })
    });
    showToast(`Personal ${type} reminder format saved!`, 'success');
  } catch (err) {
    console.error('Save user template error:', err);
  }
}

async function resetUserTemplateToDefault(type) {
  if (!state.currentUser) return;
  const userId = state.currentUser.id;

  try {
    await api(`/api/notification-templates/user/${userId}/${type}`, { method: 'DELETE' });
    showToast(`Reset ${type} reminder format to system default.`, 'info');
    await openUserTemplatesModal();
  } catch (err) {
    console.error('Reset user template error:', err);
  }
}

// Global window bindings
window.loadNotificationsView = loadNotificationsView;
window.renderNotificationsList = renderNotificationsList;
window.filterNotificationsList = filterNotificationsList;
window.filterNotifsByStatus = filterNotifsByStatus;
window.toggleNotificationRead = toggleNotificationRead;
window.markAllNotificationsAsRead = markAllNotificationsAsRead;
window.deleteNotificationItem = deleteNotificationItem;

// Admin Broadcast & Templates
window.openAdminBroadcastModal = openAdminBroadcastModal;
window.handleAdminBroadcastSubmit = handleAdminBroadcastSubmit;
window.openAdminTemplatesModal = openAdminTemplatesModal;
window.switchAdminTemplateTab = switchAdminTemplateTab;
window.handleAdminSaveTemplate = handleAdminSaveTemplate;

// User Templates
window.openUserTemplatesModal = openUserTemplatesModal;
window.switchUserTemplateTab = switchUserTemplateTab;
window.handleUserSaveTemplate = handleUserSaveTemplate;
window.resetUserTemplateToDefault = resetUserTemplateToDefault;

// Reports, Analytics & Receipts
window.loadReportsView = loadReportsView;
window.switchReportsSubTab = switchReportsSubTab;
window.handleReportsFilter = handleReportsFilter;
window.resetReportsFilters = resetReportsFilters;
window.openReceiptLightbox = openReceiptLightbox;
window.handleReceiptReplaceClick = handleReceiptReplaceClick;
window.downloadReceiptFile = downloadReceiptFile;
window.printReceiptFile = printReceiptFile;
window.openUploadReceiptModal = openUploadReceiptModal;
window.handleReceiptFileSelect = handleReceiptFileSelect;
window.clearReceiptUploadSelection = clearReceiptUploadSelection;
window.handleReceiptUploadSubmit = handleReceiptUploadSubmit;
window.openSettleBillModal = openSettleBillModal;
window.handlePayReceiptFileSelect = handlePayReceiptFileSelect;
window.clearPayReceiptSelection = clearPayReceiptSelection;
window.handleBillPaySubmit = handleBillPaySubmit;
window.toggleEventAttendance = toggleEventAttendance;
window.exportReportsData = exportReportsData;

// Category Custom Input Helpers
window.handleCategoryDropdownChange = handleCategoryDropdownChange;
window.toggleCustomCategoryInput = toggleCustomCategoryInput;
window.closeCustomCategoryInput = closeCustomCategoryInput;
window.ensureCategoryOptionExists = ensureCategoryOptionExists;
window.getSelectedCategory = getSelectedCategory;

