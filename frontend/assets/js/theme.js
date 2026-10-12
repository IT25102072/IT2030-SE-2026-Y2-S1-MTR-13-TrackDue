/**
 * TrackDue Centralized Theme Management System
 * Supports: 'dark', 'light', and 'system' (OS auto-detection)
 * Features zero-flicker, persistent localStorage, and real-time OS preference syncing.
 */

const TrackDueTheme = (() => {
  const STORAGE_KEY = 'trackdue_theme_mode'; // 'dark' | 'light' | 'system'
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

  function getSavedMode() {
    return localStorage.getItem(STORAGE_KEY) || 'system';
  }

  function getSystemTheme() {
    return mediaQuery.matches ? 'dark' : 'light';
  }

  function resolveEffectiveTheme(mode) {
    if (mode === 'system') {
      return getSystemTheme();
    }
    return mode === 'light' ? 'light' : 'dark';
  }

  function applyTheme(mode, notify = true) {
    const effectiveTheme = resolveEffectiveTheme(mode);
    const root = document.documentElement;

    root.setAttribute('data-theme', effectiveTheme);
    root.setAttribute('data-theme-mode', mode);
    root.style.colorScheme = effectiveTheme;

    // Update any UI indicators across pages
    updateThemeUI(mode, effectiveTheme);

    if (notify) {
      window.dispatchEvent(new CustomEvent('trackdue-theme-changed', {
        detail: { mode, effectiveTheme }
      }));
    }
  }

  function updateThemeUI(mode, effectiveTheme) {
    // 1. Update topbar quick toggle icon & text if present
    const topbarBtn = document.getElementById('theme-toggle-btn');
    const topbarIcon = document.getElementById('theme-toggle-icon');
    const topbarText = document.getElementById('theme-toggle-text');

    if (topbarIcon) {
      if (mode === 'system') {
        topbarIcon.className = 'fa-solid fa-circle-half-stroke';
      } else if (mode === 'light') {
        topbarIcon.className = 'fa-solid fa-sun';
      } else {
        topbarIcon.className = 'fa-solid fa-moon';
      }
    }
    if (topbarText) {
      topbarText.textContent = mode.charAt(0).toUpperCase() + mode.slice(1);
    }
    if (topbarBtn) {
      topbarBtn.setAttribute('title', `Theme: ${mode.toUpperCase()} (Click to change)`);
    }

    // 2. Update radio/card selectors in Settings if present
    document.querySelectorAll('.theme-option-card').forEach(card => {
      const cardMode = card.getAttribute('data-theme-val');
      if (cardMode === mode) {
        card.classList.add('active');
        const checkIcon = card.querySelector('.theme-check-icon');
        if (checkIcon) checkIcon.style.display = 'block';
      } else {
        card.classList.remove('active');
        const checkIcon = card.querySelector('.theme-check-icon');
        if (checkIcon) checkIcon.style.display = 'none';
      }
    });

    // 3. Update dropdown options if active
    document.querySelectorAll('.theme-dropdown-item').forEach(item => {
      const itemMode = item.getAttribute('data-theme-val');
      if (itemMode === mode) {
        item.classList.add('selected');
      } else {
        item.classList.remove('selected');
      }
    });
  }

  function setMode(mode) {
    if (!['dark', 'light', 'system'].includes(mode)) {
      mode = 'system';
    }
    localStorage.setItem(STORAGE_KEY, mode);
    applyTheme(mode);
  }

  function cycleTheme() {
    const current = getSavedMode();
    let next = 'dark';
    if (current === 'system') {
      next = 'light';
    } else if (current === 'light') {
      next = 'dark';
    } else if (current === 'dark') {
      next = 'system';
    }
    setMode(next);
  }

  function init() {
    const mode = getSavedMode();
    applyTheme(mode, false);

    // Listen for OS scheme changes when in 'system' mode
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', (e) => {
        if (getSavedMode() === 'system') {
          applyTheme('system');
        }
      });
    } else if (mediaQuery.addListener) {
      mediaQuery.addListener((e) => {
        if (getSavedMode() === 'system') {
          applyTheme('system');
        }
      });
    }

    // Update UI elements once DOM is fully ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        updateThemeUI(getSavedMode(), resolveEffectiveTheme(getSavedMode()));
      });
    } else {
      updateThemeUI(getSavedMode(), resolveEffectiveTheme(getSavedMode()));
    }
  }

  // Self-execute initial sync immediately to prevent flash
  init();

  function toggleDropdown(event) {
    if (event) event.stopPropagation();
    const menu = document.getElementById('theme-dropdown-menu');
    if (menu) {
      menu.classList.toggle('show');
    }
  }

  function selectMode(mode, event) {
    if (event) event.stopPropagation();
    setMode(mode);
    const menu = document.getElementById('theme-dropdown-menu');
    if (menu) {
      menu.classList.remove('show');
    }
  }

  // Close dropdown on click outside
  document.addEventListener('click', (e) => {
    const wrap = document.getElementById('theme-switcher-wrapper');
    if (wrap && !wrap.contains(e.target)) {
      const menu = document.getElementById('theme-dropdown-menu');
      if (menu) menu.classList.remove('show');
    }
  });

  return {
    getMode: getSavedMode,
    getEffectiveTheme: () => resolveEffectiveTheme(getSavedMode()),
    setMode,
    cycleTheme,
    toggleDropdown,
    selectMode,
    refreshUI: () => updateThemeUI(getSavedMode(), resolveEffectiveTheme(getSavedMode()))
  };
})();

// Global convenience accessors
window.TrackDueTheme = TrackDueTheme;
window.toggleThemeDropdown = TrackDueTheme.toggleDropdown;
window.selectThemeMode = TrackDueTheme.selectMode;

