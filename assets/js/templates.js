/**
 * Day templates — Phase 4
 * One-tap starter packs for Student / Work / Morning routines
 */
(function () {
  'use strict';

  const TEMPLATES = [
    {
      id: 'morning',
      name: 'Morning routine',
      icon: 'fa-sun',
      color: '#F59E0B',
      description: 'Gentle start: body, mind, plan',
      tasks: [
        { text: 'Drink water & stretch (5 min)', tag: 'Health', priority: 'High' },
        { text: 'Write top 3 priorities for today', tag: 'Planning', priority: 'High' },
        { text: 'Check calendar for meetings', tag: 'Work', priority: 'Medium' },
        { text: 'Quick inbox triage (10 min)', tag: 'Work', priority: 'Medium' }
      ],
      habits: [
        { name: 'Morning stretch', category: 'Wellness' },
        { name: 'Drink water on wake', category: 'Wellness' }
      ]
    },
    {
      id: 'work',
      name: 'Work deep-work',
      icon: 'fa-briefcase',
      color: '#2563EB',
      description: 'Focus blocks + communication',
      tasks: [
        { text: 'Deep work block 1 (90 min)', tag: 'Work', priority: 'High' },
        { text: 'Reply to priority messages', tag: 'Work', priority: 'High' },
        { text: 'Deep work block 2 (90 min)', tag: 'Work', priority: 'High' },
        { text: 'Update task status / notes', tag: 'Work', priority: 'Medium' },
        { text: 'Plan tomorrow’s first task', tag: 'Planning', priority: 'Medium' }
      ],
      habits: [
        { name: 'No-meeting focus hour', category: 'Work' }
      ]
    },
    {
      id: 'student',
      name: 'Student day',
      icon: 'fa-graduation-cap',
      color: '#8B5CF6',
      description: 'Study, revise, rest',
      tasks: [
        { text: 'Review lecture notes (30 min)', tag: 'Study', priority: 'High' },
        { text: 'Practice problems / assignment', tag: 'Study', priority: 'High' },
        { text: 'Revise flashcards', tag: 'Study', priority: 'Medium' },
        { text: 'Organize files & deadlines', tag: 'Planning', priority: 'Medium' },
        { text: 'Short walk / break', tag: 'Health', priority: 'Low' }
      ],
      habits: [
        { name: 'Study 25 min (Pomodoro)', category: 'Learning' },
        { name: 'Read 10 pages', category: 'Learning' }
      ]
    }
  ];

  function timeLabel() {
    try {
      return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  }

  function applyTemplate(templateId, options = {}) {
    const tpl = TEMPLATES.find(t => t.id === templateId);
    if (!tpl) return { ok: false, error: 'Template not found' };

    const replaceTasks = !!options.replaceTasks;
    const addHabits = options.addHabits !== false;

    let tasks = (typeof StorageManager !== 'undefined')
      ? (StorageManager.get('dashboard_tasks', []) || [])
      : [];

    const newTasks = tpl.tasks.map(t => ({
      id: Utils.uid('task'),
      text: t.text,
      completed: false,
      tag: t.tag || 'Personal',
      priority: t.priority || 'Medium',
      createdAt: timeLabel(),
      fromTemplate: tpl.id
    }));

    if (replaceTasks) {
      tasks = newTasks;
    } else {
      tasks = [...newTasks, ...tasks];
    }
    if (typeof StorageManager !== 'undefined') {
      StorageManager.set('dashboard_tasks', tasks);
    }

    let habitsAdded = 0;
    if (addHabits && typeof StorageManager !== 'undefined') {
      let habits = StorageManager.get('user_habits', []) || [];
      const existingNames = new Set(habits.map(h => (h.name || '').toLowerCase()));
      tpl.habits.forEach(h => {
        const key = (h.name || '').toLowerCase();
        if (existingNames.has(key)) return;
        habits.push({
          id: Utils.uid('habit'),
          name: h.name,
          streak: 0,
          completedToday: false,
          category: h.category || 'Personal',
          fromTemplate: tpl.id
        });
        existingNames.add(key);
        habitsAdded += 1;
      });
      StorageManager.set('user_habits', habits);
    }

    // Refresh live modules if present
    try {
      if (window.dashboardModule) {
        window.dashboardModule.tasks = tasks;
        if (typeof window.dashboardModule.renderTasks === 'function') {
          window.dashboardModule.renderTasks();
        }
        if (typeof window.dashboardModule.updateDashboardMetrics === 'function') {
          window.dashboardModule.updateDashboardMetrics();
        }
      }
      if (window.habitsModule) {
        window.habitsModule.habits = StorageManager.get('user_habits', []);
        if (typeof window.habitsModule.render === 'function') window.habitsModule.render();
        if (typeof window.habitsModule.renderDashboardWidget === 'function') {
          window.habitsModule.renderDashboardWidget();
        }
      }
    } catch (err) {
      console.warn('[Templates] refresh', err);
    }

    window.dispatchEvent(new CustomEvent('floworaStateChange', {
      detail: { key: 'templates', templateId }
    }));

    return {
      ok: true,
      tasksAdded: newTasks.length,
      habitsAdded,
      name: tpl.name
    };
  }

  function openPicker() {
    if (document.getElementById('templatePickerOverlay')) return;

    const overlay = document.createElement('div');
    overlay.className = 'onboarding-overlay';
    overlay.id = 'templatePickerOverlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');

    overlay.innerHTML = `
      <div class="onboarding-card glass-card template-picker-card" style="text-align: left; max-width: 520px;">
        <div style="display:flex; justify-content:space-between; align-items:center; gap:12px; margin-bottom: 8px;">
          <h2 style="margin:0; font-size: 1.25rem;">Day templates</h2>
          <button type="button" class="icon-btn" id="tplCloseBtn" aria-label="Close"><i class="fa-solid fa-xmark"></i></button>
        </div>
        <p style="color: var(--text-secondary); font-size: 0.9rem; margin: 0 0 14px;">
          Add a ready-made task list (and missing habits). Your existing tasks stay unless you choose Replace.
        </p>
        <div class="template-grid" id="templateGrid"></div>
        <label style="display:flex; align-items:center; gap:8px; margin-top: 14px; font-size: 0.85rem; cursor:pointer;">
          <input type="checkbox" id="tplReplaceTasks"> Replace current tasks (instead of adding)
        </label>
        <label style="display:flex; align-items:center; gap:8px; margin-top: 8px; font-size: 0.85rem; cursor:pointer;">
          <input type="checkbox" id="tplAddHabits" checked> Also add suggested habits (skip duplicates)
        </label>
      </div>
    `;

    document.body.appendChild(overlay);
    document.body.classList.add('onboarding-open');

    const grid = overlay.querySelector('#templateGrid');
    TEMPLATES.forEach(tpl => {
      const card = document.createElement('button');
      card.type = 'button';
      card.className = 'template-card-btn';
      card.innerHTML = `
        <span class="tpl-icon" style="background:${tpl.color}"><i class="fa-solid ${tpl.icon}"></i></span>
        <span class="tpl-meta">
          <strong>${tpl.name}</strong>
          <small>${tpl.description}</small>
          <small class="tpl-count">${tpl.tasks.length} tasks · ${tpl.habits.length} habits</small>
        </span>
      `;
      card.addEventListener('click', () => {
        const replaceTasks = !!overlay.querySelector('#tplReplaceTasks')?.checked;
        const addHabits = !!overlay.querySelector('#tplAddHabits')?.checked;
        const result = applyTemplate(tpl.id, { replaceTasks, addHabits });
        close();
        if (result.ok && typeof ComponentManager !== 'undefined') {
          ComponentManager.showToast(
            `“${result.name}” applied · ${result.tasksAdded} tasks` +
              (result.habitsAdded ? `, ${result.habitsAdded} habits` : ''),
            'success'
          );
        }
        if (window.router) window.router.navigateTo('dashboard');
      });
      grid.appendChild(card);
    });

    const close = () => {
      overlay.remove();
      document.body.classList.remove('onboarding-open');
    };
    overlay.querySelector('#tplCloseBtn').addEventListener('click', close);
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) close();
    });
  }

  function injectHomeButton() {
    const btn = document.getElementById('openTemplatesBtn');
    if (btn && !btn.dataset.bound) {
      btn.dataset.bound = '1';
      btn.addEventListener('click', openPicker);
    }
  }

  function boot() {
    injectHomeButton();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

  window.FloworaTemplates = {
    list: () => TEMPLATES.map(({ id, name, description }) => ({ id, name, description })),
    apply: applyTemplate,
    open: openPicker
  };
})();
