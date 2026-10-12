/**
 * TrackDue - Landing Page & Authentication Controller
 * Handles user registration, login, session persistence, and UI interactions
 */

document.addEventListener('DOMContentLoaded', () => {
  checkExistingSession();
  setupAuthModalListeners();
});

function getApiUrl(path) {
  const base = (window.TrackDueAPI && window.TrackDueAPI.BASE_URL) ? window.TrackDueAPI.BASE_URL : '/api';
  return base + path;
}

// Check if user already has an active session
function checkExistingSession() {
  const savedUser = localStorage.getItem('trackdue_user');
  if (savedUser) {
    try {
      const user = JSON.parse(savedUser);
      const navActions = document.getElementById('nav-actions');
      if (navActions) {
        navActions.innerHTML = `
          <a href="app.html" class="btn-nav-cta">
            <i class="fa-solid fa-gauge-high"></i>
            <span>Go to Workspace</span>
          </a>
        `;
      }

      const heroBtnContainer = document.getElementById('hero-buttons');
      if (heroBtnContainer) {
        const firstName = user.firstName || (user.name ? user.name.split(' ')[0] : 'User');
        heroBtnContainer.innerHTML = `
          <a href="app.html" class="btn-hero-primary">
            <i class="fa-solid fa-arrow-right-to-bracket"></i>
            <span>Resume Workspace (${firstName})</span>
          </a>
          <button class="btn-hero-secondary" onclick="logoutFromLanding()">
            <i class="fa-solid fa-power-off"></i>
            <span>Sign Out</span>
          </button>
        `;
      }
    } catch (e) {
      localStorage.removeItem('trackdue_user');
    }
  }
}

function logoutFromLanding() {
  localStorage.removeItem('trackdue_user');
  sessionStorage.clear();
  window.location.reload();
}

// ==========================================================================
// Modal & Tab Management
// ==========================================================================
function openAuthModal(defaultTab = 'login') {
  const modal = document.getElementById('auth-modal');
  if (!modal) return;

  switchAuthTab(defaultTab);
  modal.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeAuthModal() {
  const modal = document.getElementById('auth-modal');
  if (!modal) return;

  modal.classList.remove('active');
  document.body.style.overflow = '';
}

function switchAuthTab(tab) {
  const tabLogin = document.getElementById('tab-btn-login');
  const tabRegister = document.getElementById('tab-btn-register');
  const paneLogin = document.getElementById('pane-login');
  const paneRegister = document.getElementById('pane-register');
  const modalTitle = document.getElementById('auth-modal-title');

  if (tab === 'login') {
    tabLogin.classList.add('active');
    tabRegister.classList.remove('active');
    paneLogin.classList.add('active');
    paneRegister.classList.remove('active');
    modalTitle.innerText = 'Sign in to TrackDue';
  } else {
    tabRegister.classList.add('active');
    tabLogin.classList.remove('active');
    paneRegister.classList.add('active');
    paneLogin.classList.remove('active');
    modalTitle.innerText = 'Create your Account';
  }
}

function setupAuthModalListeners() {
  // Close modal when clicking backdrop
  const modal = document.getElementById('auth-modal');
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        closeAuthModal();
      }
    });
  }

  // Handle Login form submit
  const formLogin = document.getElementById('form-login');
  if (formLogin) {
    formLogin.addEventListener('submit', handleLogin);
  }

  // Handle Register form submit
  const formRegister = document.getElementById('form-register');
  if (formRegister) {
    formRegister.addEventListener('submit', handleRegister);
  }
}

// ==========================================================================
// Authentication Handlers
// ==========================================================================
async function handleLogin(e) {
  e.preventDefault();
  const btn = document.getElementById('btn-login-submit');
  const originalText = btn.innerHTML;

  const email = document.getElementById('login-email').value.trim();
  const password = document.getElementById('login-password').value;

  if (!email || !password) {
    showLandingToast('Please enter both email and password.', 'danger');
    return;
  }

  try {
    btn.disabled = true;
    btn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> <span>Authenticating...</span>`;

    const res = await fetch(getApiUrl('/auth/login'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || 'Login failed. Please verify credentials.');
    }

    // Store user session in localStorage
    localStorage.setItem('trackdue_user', JSON.stringify(data));
    showLandingToast(`Welcome back, ${data.firstName || 'User'}! Launching workspace...`, 'success');

    setTimeout(() => {
      window.location.href = 'app.html';
    }, 700);

  } catch (err) {
    console.error('Login error:', err);
    showLandingToast(err.message || 'Invalid email or password.', 'danger');
    btn.disabled = false;
    btn.innerHTML = originalText;
  }
}

async function handleRegister(e) {
  e.preventDefault();
  const btn = document.getElementById('btn-register-submit');
  const originalText = btn.innerHTML;

  const firstName = document.getElementById('reg-firstname').value.trim();
  const lastName = document.getElementById('reg-lastname').value.trim();
  const email = document.getElementById('reg-email').value.trim();
  const phoneInput = document.getElementById('reg-phone');
  const phone = phoneInput ? phoneInput.value.trim() : '';
  const password = document.getElementById('reg-password').value;
  const confirmPassword = document.getElementById('reg-confirm-password').value;

  if (password !== confirmPassword) {
    showLandingToast('Passwords do not match.', 'danger');
    return;
  }

  if (password.length < 5) {
    showLandingToast('Password must be at least 5 characters.', 'danger');
    return;
  }

  const payload = {
    firstName,
    lastName,
    email,
    phone,
    role: 'GENERAL_EMPLOYEE',
    password,
    status: 'ACTIVE'
  };

  try {
    btn.disabled = true;
    btn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> <span>Creating Account...</span>`;

    const res = await fetch(getApiUrl('/auth/register'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || 'Registration failed. Email might already exist.');
    }

    showLandingToast('Account registered successfully! Logging you in...', 'success');

    // Automatically perform login with the newly created credentials
    try {
      const loginRes = await fetch(getApiUrl('/auth/login'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const loginData = await loginRes.json();
      if (loginRes.ok) {
        localStorage.setItem('trackdue_user', JSON.stringify(loginData));
        setTimeout(() => {
          window.location.href = 'app.html';
        }, 700);
        return;
      }
    } catch (loginErr) {
      console.warn('Auto-login failed after registration, switching to login tab', loginErr);
    }

    // Fallback: switch to login tab and prefill email
    switchAuthTab('login');
    document.getElementById('login-email').value = email;
    document.getElementById('login-password').value = '';
    btn.disabled = false;
    btn.innerHTML = originalText;

  } catch (err) {
    console.error('Registration error:', err);
    showLandingToast(err.message || 'Registration failed.', 'danger');
    btn.disabled = false;
    btn.innerHTML = originalText;
  }
}

// Toast notification helper for landing page
function showLandingToast(message, type = 'info') {
  const container = document.getElementById('landing-toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `landing-toast ${type}`;

  let icon = 'fa-info-circle';
  if (type === 'success') icon = 'fa-circle-check';
  if (type === 'danger') icon = 'fa-triangle-exclamation';

  toast.innerHTML = `<i class="fa-solid ${icon}"></i> <span>${message}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 350);
  }, 3500);
}

function toggleAuthPassword(inputId, btn) {
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

// Global window exposure for HTML event handlers
window.openAuthModal = openAuthModal;
window.closeAuthModal = closeAuthModal;
window.switchAuthTab = switchAuthTab;
window.logoutFromLanding = logoutFromLanding;
window.toggleAuthPassword = toggleAuthPassword;



