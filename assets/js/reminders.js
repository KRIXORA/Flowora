/**
 * Browser reminders — Phase 3
 * - Focus/Pomodoro already calls FloworaApp.triggerLocalNotification
 * - Evening habit nudge + optional open-tasks nudge
 * Settings key inside portfolio_settings:
 *   notificationsEnabled, habitReminderEnabled, habitReminderTime ("20:00"),
 *   taskReminderEnabled, taskReminderTime ("12:30")
 */
(function () {
  'use strict';

  const DEFAULTS = {
    notificationsEnabled: true,
    habitReminderEnabled: true,
    habitReminderTime: '20:00',
    taskReminderEnabled: false,
    taskReminderTime: '12:30'
  };

  function getSettings() {
    const s = (typeof StorageManager !== 'undefined')
      ? StorageManager.get('portfolio_settings', {})
      : {};
    return { ...DEFAULTS, ...s };
  }

  function saveSettings(partial) {
    if (typeof StorageManager === 'undefined') return;
    const cur = StorageManager.get('portfolio_settings', {});
    const next = { ...cur, ...partial };
    StorageManager.set('portfolio_settings', next);
  }

  function canNotify() {
    const s = getSettings();
    if (!s.notificationsEnabled) return false;
    if (!('Notification' in window)) return false;
    return Notification.permission === 'granted';
  }

  function notify(title, body, tag) {
    if (!canNotify()) return;
    const opts = {
      body: body || '',
      icon: 'assets/icons/icon-192.webp',
      badge: 'assets/icons/icon-192.webp',
      tag: tag || 'flowora-reminder',
      renotify: true,
      vibrate: [160, 80, 160]
    };
    if (navigator.serviceWorker && navigator.serviceWorker.ready) {
      navigator.serviceWorker.ready
        .then((reg) => reg.showNotification(title, opts))
        .catch(() => {
          try { new Notification(title, opts); } catch (_) {}
        });
    } else {
      try { new Notification(title, opts); } catch (_) {}
    }
    if (typeof ComponentManager !== 'undefined' && ComponentManager.addNotification) {
      ComponentManager.addNotification(title, body || '');
    }
  }

  async function requestPermission() {
    if (!('Notification' in window)) {
      if (typeof ComponentManager !== 'undefined') {
        ComponentManager.showToast('This browser does not support notifications.', 'error');
      }
      return 'denied';
    }
    if (Notification.permission === 'granted') return 'granted';
    if (Notification.permission === 'denied') {
      if (typeof ComponentManager !== 'undefined') {
        ComponentManager.showToast('Notifications blocked. Enable them in browser settings.', 'info');
      }
      return 'denied';
    }
    const result = await Notification.requestPermission();
    if (result === 'granted' && typeof ComponentManager !== 'undefined') {
      ComponentManager.showToast('Notifications enabled.', 'success');
      notify('Flowora', 'Reminders are on. We will nudge you about habits and focus.', 'flowora-welcome');
    }
    return result;
  }

  function todayKey(prefix) {
    const d = new Date();
    const base = `${prefix}-${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
    return (typeof StorageManager !== 'undefined') ? StorageManager.PREFIX + base : base;
  }

  function alreadySent(key) {
    try {
      return localStorage.getItem(key) === '1';
    } catch {
      return false;
    }
  }

  function markSent(key) {
    try {
      localStorage.setItem(key, '1');
    } catch (_) {}
  }

  function matchesTime(timeStr) {
    if (!timeStr || !/^\d{1,2}:\d{2}$/.test(timeStr)) return false;
    const [h, m] = timeStr.split(':').map(Number);
    const now = new Date();
    return now.getHours() === h && now.getMinutes() === m;
  }

  function checkHabitReminder() {
    const s = getSettings();
    if (!s.habitReminderEnabled || !matchesTime(s.habitReminderTime)) return;
    const key = todayKey('habit-reminder-sent');
    if (alreadySent(key)) return;

    const habits = (typeof StorageManager !== 'undefined')
      ? (StorageManager.get('user_habits', []) || [])
      : [];
    const left = habits.filter(h => !h.completedToday);
    if (!left.length) {
      markSent(key);
      return;
    }
    const names = left.slice(0, 3).map(h => h.name || h.title || 'Habit').join(', ');
    const extra = left.length > 3 ? ` +${left.length - 3} more` : '';
    notify(
      'Habits remaining',
      `${left.length} habit(s) left today: ${names}${extra}`,
      'flowora-habits'
    );
    markSent(key);
  }

  function checkTaskReminder() {
    const s = getSettings();
    if (!s.taskReminderEnabled || !matchesTime(s.taskReminderTime)) return;
    const key = todayKey('task-reminder-sent');
    if (alreadySent(key)) return;

    const tasks = (typeof StorageManager !== 'undefined')
      ? (StorageManager.get('dashboard_tasks', []) || [])
      : [];
    const open = tasks.filter(t => !t.completed);
    if (!open.length) {
      markSent(key);
      return;
    }
    notify(
      'Open tasks',
      `You still have ${open.length} open task(s). Open Home to continue.`,
      'flowora-tasks'
    );
    markSent(key);
  }

  function tick() {
    if (!canNotify()) return;
    try {
      checkHabitReminder();
      checkTaskReminder();
    } catch (err) {
      console.warn('[Reminders]', err);
    }
  }

  function startScheduler() {
    // Align roughly to minute boundary
    const now = new Date();
    const ms = (60 - now.getSeconds()) * 1000 - now.getMilliseconds();
    setTimeout(() => {
      tick();
      setInterval(tick, 60 * 1000);
    }, Math.max(ms, 1000));
  }

  // Improve global helper used by Pomodoro
  function patchTrigger() {
    if (typeof FloworaApp === 'undefined') return;
    FloworaApp.triggerLocalNotification = function (title, body) {
      const s = getSettings();
      if (!s.notificationsEnabled) return;
      if (!('Notification' in window) || Notification.permission !== 'granted') return;
      notify(title, body, 'flowora-focus');
    };
  }

  function boot() {
    patchTrigger();
    startScheduler();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

  window.FloworaReminders = {
    requestPermission,
    notify,
    getSettings,
    saveSettings,
    tick
  };
})();
