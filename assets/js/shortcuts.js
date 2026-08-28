/**
 * Keyboard shortcuts panel — Phase 5
 * Press ? (Shift+/) when not typing in an input
 */
(function () {
  'use strict';

  const SHORTCUTS = [
    { keys: ['Ctrl', 'K'], mac: ['⌘', 'K'], action: 'Open search / command palette' },
    { keys: ['?'], action: 'Show this shortcuts help' },
    { keys: ['Esc'], action: 'Close modals, menu, or help' },
    { keys: ['G', 'H'], action: 'Go to Home' },
    { keys: ['G', 'P'], action: 'Go to Planner' },
    { keys: ['G', 'F'], action: 'Go to Focus Timer' },
    { keys: ['G', 'C'], action: 'Go to Calendar' },
    { keys: ['G', 'O'], action: 'Go to Goals' },
    { keys: ['G', 'B'], action: 'Go to Habits' },
    { keys: ['G', 'R'], action: 'Go to Review' },
    { keys: ['G', 'A'], action: 'Go to Progress' },
    { keys: ['G', 'I'], action: 'Go to AI Coach' },
    { keys: ['G', 'S'], action: 'Go to Settings' },
    { keys: ['N'], action: 'Focus quick-add task (on Home)' },
    { keys: ['T'], action: 'Open day templates' }
  ];

  let goBuffer = null;
  let goTimer = null;

  function isTypingTarget(el) {
    if (!el) return false;
    const tag = (el.tagName || '').toLowerCase();
    if (tag === 'input' || tag === 'textarea' || tag === 'select') return true;
    if (el.isContentEditable) return true;
    return false;
  }

  function kbd(label) {
    return `<kbd class="sc-kbd">${label}</kbd>`;
  }

  function openPanel() {
    if (document.getElementById('shortcutsOverlay')) return;
    const isMac = /Mac|iPhone|iPad/.test(navigator.platform || '');

    const rows = SHORTCUTS.map(s => {
      const keys = (isMac && s.mac) ? s.mac : s.keys;
      return `<div class="sc-row"><span class="sc-keys">${keys.map(kbd).join('<span class="sc-plus">+</span>')}</span><span class="sc-action">${s.action}</span></div>`;
    }).join('');

    const overlay = document.createElement('div');
    overlay.id = 'shortcutsOverlay';
    overlay.className = 'onboarding-overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.innerHTML = `
      <div class="onboarding-card glass-card shortcuts-panel" style="text-align:left; max-width: 480px;">
        <div style="display:flex; justify-content:space-between; align-items:center; gap:12px; margin-bottom: 6px;">
          <h2 style="margin:0; font-size: 1.2rem;"><i class="fa-solid fa-keyboard"></i> Keyboard shortcuts</h2>
          <button type="button" class="icon-btn" id="scCloseBtn" aria-label="Close"><i class="fa-solid fa-xmark"></i></button>
        </div>
        <p style="color: var(--text-secondary); font-size: 0.85rem; margin: 0 0 14px;">
          Tip: after deleting a task, habit, or goal, use <strong>Undo</strong> on the toast (5 seconds).
        </p>
        <div class="sc-list">${rows}</div>
      </div>
    `;
    document.body.appendChild(overlay);
    document.body.classList.add('onboarding-open');

    const close = () => {
      overlay.remove();
      document.body.classList.remove('onboarding-open');
    };
    overlay.querySelector('#scCloseBtn').addEventListener('click', close);
    overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });
  }

  function navigate(target) {
    if (window.router && typeof window.router.navigateTo === 'function') {
      window.router.navigateTo(target);
    } else {
      window.location.hash = target;
    }
  }

  function handleGo(secondKey) {
    const map = {
      h: 'dashboard',
      p: 'planner',
      f: 'pomodoro',
      c: 'calendar',
      o: 'goals',
      b: 'habits',
      r: 'review',
      a: 'analytics',
      i: 'ai-hub',
      s: 'settings'
    };
    const t = map[secondKey];
    if (t) navigate(t);
  }

  function onKeydown(e) {
    if (isTypingTarget(e.target)) return;

    // ? opens help (Shift+/ often)
    if (e.key === '?' || (e.shiftKey && e.key === '/')) {
      e.preventDefault();
      openPanel();
      return;
    }

    if (e.key === 'Escape') {
      const panel = document.getElementById('shortcutsOverlay');
      if (panel) {
        panel.remove();
        document.body.classList.remove('onboarding-open');
      }
      return;
    }

    // Don't steal browser shortcuts with modifiers (except we leave Ctrl+K to app.js)
    if (e.ctrlKey || e.metaKey || e.altKey) return;

    const key = e.key.toLowerCase();

    // G then X navigation
    if (goBuffer === 'g') {
      clearTimeout(goTimer);
      goBuffer = null;
      e.preventDefault();
      handleGo(key);
      return;
    }

    if (key === 'g') {
      goBuffer = 'g';
      goTimer = setTimeout(() => { goBuffer = null; }, 1000);
      return;
    }

    if (key === 'n') {
      const hash = (window.location.hash || '#dashboard').replace('#', '') || 'dashboard';
      if (hash === 'dashboard') {
        e.preventDefault();
        navigate('dashboard');
        setTimeout(() => {
          const input = document.getElementById('quickTaskInput');
          if (input) input.focus();
        }, 50);
      }
      return;
    }

    if (key === 't') {
      e.preventDefault();
      if (window.FloworaTemplates && typeof window.FloworaTemplates.open === 'function') {
        window.FloworaTemplates.open();
      }
    }
  }

  function injectHelpButton() {
    const headerRight = document.querySelector('.header-right') || document.querySelector('.app-header');
    if (!headerRight || document.getElementById('shortcutsHelpBtn')) return;
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'icon-btn';
    btn.id = 'shortcutsHelpBtn';
    btn.title = 'Keyboard shortcuts (?)';
    btn.setAttribute('aria-label', 'Keyboard shortcuts');
    btn.innerHTML = '<i class="fa-solid fa-keyboard" aria-hidden="true"></i>';
    btn.addEventListener('click', openPanel);
    // insert before theme toggle if possible
    const theme = document.getElementById('themeToggleBtn');
    if (theme && theme.parentNode) {
      theme.parentNode.insertBefore(btn, theme);
    } else {
      headerRight.appendChild(btn);
    }
  }

  function boot() {
    window.addEventListener('keydown', onKeydown);
    injectHelpButton();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

  window.FloworaShortcuts = { open: openPanel };
})();
