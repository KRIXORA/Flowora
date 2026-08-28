/**
 * @module SettingsModule
 * @description User Profile, AI Assistant, and Data Backup Settings
 * @version 3.3.0
 */
class SettingsModule {
    constructor() {
        // Internal storage keys are kept as-is on purpose (other modules like
        // app.js, dashboard.js, ai-hub.js already read/write these same keys).
        // Renaming them would require updating every module that syncs state.
        this.storageKey = 'portfolio_settings';

        this.settings = StorageManager.get(this.storageKey, {
            developerName: 'Guest User',
            contactEmail: '',
            aiApiKey: ''
        });
        this.init();
    }

    init() {
        try {
            this.renderSettingsView();
        } catch (error) {
            console.error('[SettingsModule] Initialization failed:', error);
            ComponentManager.showToast('Failed to load settings.', 'error');
        }
    }

    renderSettingsView() {
        const viewSection = document.getElementById('view-settings');
        if (!viewSection) return;
        
        viewSection.innerHTML = `
            <div class="view-header-actions" style="margin-bottom: 20px; display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 12px; width: 100%; box-sizing: border-box;">
                <div>
                    <h2>Settings</h2>
                    <p class="date-subtitle" style="word-break: break-word;">Manage your profile, AI assistant, and app data</p>
                </div>
            </div>
            
            <div class="settings-grid" style="display: grid; grid-template-columns: 100%; gap: 16px; width: 100%; max-width: 100%; box-sizing: border-box; overflow-x: hidden;">
                <!-- Profile Card -->
                <div class="glass-card settings-card" style="background: var(--bg-main); border-radius: var(--radius-md); padding: 16px; display: flex; flex-direction: column; gap: 14px; width: 100%; box-sizing: border-box; overflow: hidden;">
                    <div class="settings-card-header" style="display: flex; gap: 12px; align-items: center; width: 100%; overflow: hidden;">
                        <div class="settings-icon-box primary-icon" style="background: var(--primary-light); color: var(--primary); width: 38px; height: 38px; border-radius: var(--radius-sm); display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                            <i class="fa-solid fa-user-gear"></i>
                        </div>
                        <div style="min-width: 0; overflow: hidden; flex: 1;">
                            <h3 style="font-size: 0.95rem; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">Your Profile</h3>
                            <p style="font-size: 0.75rem; color: var(--text-secondary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">Update your name and contact info</p>
                        </div>
                    </div>
                    <div class="form-group" style="display: flex; flex-direction: column; gap: 6px; width: 100%;">
                        <label for="portfolioNameInput" style="font-size: 0.85rem; font-weight: 500;">Your Name</label>
                        <input type="text" id="portfolioNameInput" value="${this.sanitizeHTML(this.settings.developerName)}" placeholder="e.g., Username" style="width: 100%; max-width: 100%; box-sizing: border-box; padding: 10px; border-radius: var(--radius-md); border: 1px solid var(--border-glass); background: var(--bg-main); color: var(--text-primary);">
                    </div>
                    <div class="form-group" style="display: flex; flex-direction: column; gap: 6px; width: 100%;">
                        <label for="portfolioEmailInput" style="font-size: 0.85rem; font-weight: 500;">Email (optional)</label>
                        <input type="email" id="portfolioEmailInput" value="${this.sanitizeHTML(this.settings.contactEmail)}" placeholder="name@domain.com" style="width: 100%; max-width: 100%; box-sizing: border-box; padding: 10px; border-radius: var(--radius-md); border: 1px solid var(--border-glass); background: var(--bg-main); color: var(--text-primary);">
                    </div>
                    <button class="btn btn-primary" id="saveProfileBtn" style="margin-top: 4px; width: 100%; box-sizing: border-box;">
                        <i class="fa-solid fa-floppy-disk"></i> Save Profile
                    </button>
                </div>


                <!-- Notifications / Reminders (Phase 3) -->
                <div class="glass-card settings-card" style="background: var(--bg-main); border-radius: var(--radius-md); padding: 16px; display: flex; flex-direction: column; gap: 14px; width: 100%; box-sizing: border-box;">
                    <div class="settings-card-header" style="display: flex; gap: 12px; align-items: center;">
                        <div class="settings-icon-box" style="background: var(--primary-light); color: var(--primary); width: 38px; height: 38px; border-radius: var(--radius-sm); display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                            <i class="fa-solid fa-bell"></i>
                        </div>
                        <div>
                            <h3 style="font-size: 0.95rem; font-weight: 600;">Reminders</h3>
                            <p style="font-size: 0.75rem; color: var(--text-secondary);">Browser notifications for focus & habits</p>
                        </div>
                    </div>
                    <label style="display: flex; align-items: center; gap: 10px; font-size: 0.9rem; cursor: pointer;">
                        <input type="checkbox" id="notifEnabledToggle" ${this.settings.notificationsEnabled !== false ? 'checked' : ''}>
                        Enable browser notifications
                    </label>
                    <label style="display: flex; align-items: center; gap: 10px; font-size: 0.9rem; cursor: pointer;">
                        <input type="checkbox" id="habitRemToggle" ${this.settings.habitReminderEnabled !== false ? 'checked' : ''}>
                        Evening habit reminder
                    </label>
                    <div style="display: flex; flex-wrap: wrap; gap: 10px; align-items: center;">
                        <label for="habitRemTime" style="font-size: 0.85rem;">Habit time</label>
                        <input type="time" id="habitRemTime" value="${this.sanitizeHTML(this.settings.habitReminderTime || '20:00')}" style="padding: 8px 10px; border-radius: var(--radius-md); border: 1px solid var(--border-glass); background: var(--bg-main); color: var(--text-primary);">
                    </div>
                    <label style="display: flex; align-items: center; gap: 10px; font-size: 0.9rem; cursor: pointer;">
                        <input type="checkbox" id="taskRemToggle" ${this.settings.taskReminderEnabled ? 'checked' : ''}>
                        Midday open-tasks reminder
                    </label>
                    <div style="display: flex; flex-wrap: wrap; gap: 10px; align-items: center;">
                        <label for="taskRemTime" style="font-size: 0.85rem;">Tasks time</label>
                        <input type="time" id="taskRemTime" value="${this.sanitizeHTML(this.settings.taskReminderTime || '12:30')}" style="padding: 8px 10px; border-radius: var(--radius-md); border: 1px solid var(--border-glass); background: var(--bg-main); color: var(--text-primary);">
                    </div>
                    <div style="display: flex; flex-wrap: wrap; gap: 8px;">
                        <button type="button" class="btn btn-primary" id="enableNotifBtn" style="flex: 1; min-width: 140px; font-size: 0.85rem;">
                            <i class="fa-solid fa-bell"></i> Allow notifications
                        </button>
                        <button type="button" class="btn btn-secondary" id="saveNotifBtn" style="flex: 1; min-width: 120px; font-size: 0.85rem;">
                            <i class="fa-solid fa-floppy-disk"></i> Save
                        </button>
                        <button type="button" class="btn btn-secondary" id="testNotifBtn" style="flex: 1; min-width: 120px; font-size: 0.85rem;">
                            <i class="fa-solid fa-vial"></i> Test
                        </button>
                    </div>
                    <p style="font-size: 0.72rem; color: var(--text-muted); margin: 0;">Focus Timer already notifies when a session ends (if permission is granted).</p>
                </div>

                <!-- AI Assistant Card -->
                <div class="glass-card settings-card" style="background: var(--bg-main); border-radius: var(--radius-md); padding: 16px; display: flex; flex-direction: column; gap: 14px; width: 100%; box-sizing: border-box; overflow: hidden;">
                    <div class="settings-card-header" style="display: flex; gap: 12px; align-items: center; width: 100%; overflow: hidden;">
                        <div class="settings-icon-box success-icon" style="background: rgba(16, 185, 129, 0.1); color: var(--success); width: 38px; height: 38px; border-radius: var(--radius-sm); display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                            <i class="fa-solid fa-wand-magic-sparkles"></i>
                        </div>
                        <div style="min-width: 0; overflow: hidden; flex: 1;">
                            <h3 style="font-size: 0.95rem; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">AI Assistant</h3>
                            <p style="font-size: 0.75rem; color: var(--text-secondary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">Optional — connect your own Gemini API key</p>
                        </div>
                    </div>
                    <div class="form-group" style="display: flex; flex-direction: column; gap: 6px; width: 100%;">
                        <label for="aiApiKeyInput" style="font-size: 0.85rem; font-weight: 500;">Gemini API Key</label>
                        <input type="password" id="aiApiKeyInput" value="${this.sanitizeHTML(this.settings.aiApiKey || '')}" placeholder="AIzaSy..." style="width: 100%; max-width: 100%; box-sizing: border-box; padding: 10px; border-radius: var(--radius-md); border: 1px solid var(--border-glass); background: var(--bg-main); color: var(--text-primary);">
                        <p style="font-size: 0.75rem; color: var(--text-secondary); margin: 0; display: flex; align-items: flex-start; gap: 6px;">
                            <i class="fa-solid fa-triangle-exclamation" style="margin-top: 2px; flex-shrink: 0; color: #d97706;"></i>
                            <span>Without a key, the AI Hub uses a basic built-in assistant. Add your free Gemini key here for smarter, live AI replies. Stored only in this browser (not encrypted, not sent to us) — don't use this on a shared or public computer.</span>
                        </p>
                    </div>
                    <button class="btn btn-secondary" id="saveNetworksBtn" style="margin-top: 4px; width: 100%; box-sizing: border-box;">
                        <i class="fa-solid fa-link"></i> Save AI Settings
                    </button>
                </div>

                <!-- Data & Backup Card -->
                <div class="glass-card settings-card" style="background: var(--bg-main); border-radius: var(--radius-md); padding: 16px; display: flex; flex-direction: column; gap: 14px; width: 100%; box-sizing: border-box; overflow: hidden;">
                    <div class="settings-card-header" style="display: flex; gap: 12px; align-items: center; width: 100%; overflow: hidden;">
                        <div class="settings-icon-box danger-icon" style="background: rgba(239, 68, 68, 0.1); color: var(--error); width: 38px; height: 38px; border-radius: var(--radius-sm); display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                            <i class="fa-solid fa-server"></i>
                        </div>
                        <div style="min-width: 0; overflow: hidden; flex: 1;">
                            <h3 style="font-size: 0.95rem; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">Data & Backup</h3>
                            <p style="font-size: 0.75rem; color: var(--text-secondary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">Save a copy of your data, or start fresh</p>
                        </div>
                    </div>
                    <div style="display: flex; flex-direction: column; gap: 12px; width: 100%;">
                        <div>
                            <h4 style="font-size: 0.9rem; font-weight: 600;">Backup & Restore</h4>
                            <p style="font-size: 0.75rem; color: var(--text-secondary);">Export all your data as a JSON file, or restore from a previous backup.</p>
                        </div>
                        <div style="display: flex; flex-wrap: wrap; gap: 8px; width: 100%;">
                            <button class="btn btn-secondary" id="exportBackupBtn" style="flex: 1; min-width: 110px; padding: 10px 8px; font-size: 0.85rem;">
                                <i class="fa-solid fa-download"></i> Export
                            </button>
                            <button class="btn btn-secondary" id="importBackupBtn" style="flex: 1; min-width: 110px; padding: 10px 8px; font-size: 0.85rem;">
                                <i class="fa-solid fa-upload"></i> Import
                            </button>
                            <button class="btn btn-secondary btn-outline-danger" id="resetDataBtn" style="flex: 1; min-width: 110px; padding: 10px 8px; font-size: 0.85rem;">
                                <i class="fa-solid fa-triangle-exclamation"></i> Reset
                            </button>
                            <button class="btn btn-secondary" id="replayTutorialBtn" style="flex: 1; min-width: 110px; padding: 10px 8px; font-size: 0.85rem;">
                                <i class="fa-solid fa-circle-play"></i> Replay Tutorial
                            </button>
                        </div>
                        <input type="file" id="importBackupFile" accept=".json,application/json" style="display: none;">
                        <p id="storageHealthHint" style="font-size: 0.72rem; color: var(--text-muted); margin: 0;"></p>
                    </div>
                </div>
            </div>
        `;
        this.bindEvents();
        this.updateStorageHealthHint();
    }

    bindEvents() {
        const saveProfileBtn = document.getElementById('saveProfileBtn');
        if (saveProfileBtn) {
            saveProfileBtn.addEventListener('click', () => this.handleSaveProfile());
        }
        const replayTutorialBtn = document.getElementById('replayTutorialBtn');
        if (replayTutorialBtn) {
            replayTutorialBtn.addEventListener('click', () => {
                if (window.FloworaOnboarding && typeof window.FloworaOnboarding.open === 'function') {
                    window.FloworaOnboarding.open();
                }
            });
        }
        const enableNotifBtn = document.getElementById('enableNotifBtn');
        if (enableNotifBtn) {
            enableNotifBtn.addEventListener('click', async () => {
                if (window.FloworaReminders) await window.FloworaReminders.requestPermission();
            });
        }
        const saveNotifBtn = document.getElementById('saveNotifBtn');
        if (saveNotifBtn) {
            saveNotifBtn.addEventListener('click', () => this.handleSaveNotifications());
        }
        const testNotifBtn = document.getElementById('testNotifBtn');
        if (testNotifBtn) {
            testNotifBtn.addEventListener('click', () => {
                if (window.FloworaReminders) {
                    window.FloworaReminders.requestPermission().then((p) => {
                        if (p === 'granted') {
                            window.FloworaReminders.notify('Flowora test', 'Reminders are working.', 'flowora-test');
                        }
                    });
                }
            });
        }
        const saveNetworksBtn = document.getElementById('saveNetworksBtn');
        if (saveNetworksBtn) {
            saveNetworksBtn.addEventListener('click', () => this.handleSaveNetworks());
        }
        const exportBackupBtn = document.getElementById('exportBackupBtn');
        if (exportBackupBtn) {
            exportBackupBtn.addEventListener('click', () => this.exportWorkspaceBackup());
        }
        const importBackupBtn = document.getElementById('importBackupBtn');
        const importFileInput = document.getElementById('importBackupFile');
        if (importBackupBtn && importFileInput) {
            importBackupBtn.addEventListener('click', () => importFileInput.click());
            importFileInput.addEventListener('change', (e) => this.handleImportBackup(e));
        }
        const resetDataBtn = document.getElementById('resetDataBtn');
        if (resetDataBtn) {
            resetDataBtn.addEventListener('click', () => {
                if (confirm('This will permanently delete all your tasks, goals, habits, and settings from this device. This cannot be undone. Continue?')) {
                    // Clear only Flowora keys for safety
                    const keysToRemove = [];
                    for (let i = 0; i < localStorage.length; i++) {
                        const k = localStorage.key(i);
                        if (k && k.startsWith(StorageManager.PREFIX)) keysToRemove.push(k);
                    }
                    keysToRemove.forEach(k => localStorage.removeItem(k));
                    location.reload();
                }
            });
        }
    }

    updateStorageHealthHint() {
        const hintEl = document.getElementById('storageHealthHint');
        if (!hintEl || typeof StorageManager === 'undefined') return;
        const health = StorageManager.healthCheck();
        const sizeKB = Math.round(health.estimatedBytes / 1024);
        if (health.ok) {
            hintEl.textContent = `Storage healthy · ${health.keys} keys · ~${sizeKB} KB used`;
            hintEl.style.color = 'var(--text-muted)';
        } else {
            hintEl.textContent = health.issues[0] || 'Storage issue detected. Please export a backup.';
            hintEl.style.color = 'var(--error)';
        }
    }


    handleSaveNotifications() {
        const notificationsEnabled = !!(document.getElementById('notifEnabledToggle') && document.getElementById('notifEnabledToggle').checked);
        const habitReminderEnabled = !!(document.getElementById('habitRemToggle') && document.getElementById('habitRemToggle').checked);
        const taskReminderEnabled = !!(document.getElementById('taskRemToggle') && document.getElementById('taskRemToggle').checked);
        const habitReminderTime = (document.getElementById('habitRemTime') && document.getElementById('habitRemTime').value) || '20:00';
        const taskReminderTime = (document.getElementById('taskRemTime') && document.getElementById('taskRemTime').value) || '12:30';
        this.settings = {
            ...this.settings,
            notificationsEnabled,
            habitReminderEnabled,
            taskReminderEnabled,
            habitReminderTime,
            taskReminderTime
        };
        StorageManager.set(this.storageKey, this.settings);
        if (window.FloworaReminders) {
            window.FloworaReminders.saveSettings({
                notificationsEnabled,
                habitReminderEnabled,
                taskReminderEnabled,
                habitReminderTime,
                taskReminderTime
            });
        }
        ComponentManager.showToast('Reminder settings saved.', 'success');
    }

    handleSaveProfile() {
        const nameInput = document.getElementById('portfolioNameInput');
        const emailInput = document.getElementById('portfolioEmailInput');

        if (!nameInput || !emailInput) return;

        const developerName = nameInput.value.trim();
        const contactEmail = emailInput.value.trim();

        if (developerName === '') {
            ComponentManager.showToast('Please enter your name.', 'error');
            return;
        }

        this.settings.developerName = developerName;
        this.settings.contactEmail = contactEmail;

        this.persistState();

        const userNameEl = document.querySelector('.user-profile-card .user-name');
        if (userNameEl) {
            userNameEl.textContent = developerName;
        }

        window.dispatchEvent(new CustomEvent('portfolioProfileUpdated', { detail: this.settings }));
        ComponentManager.showToast('Profile updated!', 'success');
    }

    handleSaveNetworks() {
        const apiKeyInput = document.getElementById('aiApiKeyInput');

        if (!apiKeyInput) return;

        this.settings.aiApiKey = apiKeyInput.value.trim();

        // Ensure fresh state load and merge before persisting to protect schema integrity
        const existingSettings = StorageManager.get(this.storageKey, {});
        this.settings = { ...existingSettings, ...this.settings };

        this.persistState();

        ComponentManager.showToast('AI settings saved!', 'success');
    }

    exportWorkspaceBackup() {
        try {
            const allData = StorageManager.exportAll();
            const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(allData, null, 2));
            const downloadAnchor = document.createElement('a');
            downloadAnchor.setAttribute("href", dataStr);
            downloadAnchor.setAttribute("download", `flowora_backup_${Utils.fileTimestamp()}.json`);
            document.body.appendChild(downloadAnchor);
            downloadAnchor.click();
            downloadAnchor.remove();

            // Record last backup time
            StorageManager.set('last_backup_at', new Date().toISOString());
            ComponentManager.showToast('Backup downloaded successfully!', 'success');
            this.updateStorageHealthHint();
        } catch (err) {
            console.error('[Settings] Export failed:', err);
            ComponentManager.showToast('Failed to create backup.', 'error');
        }
    }

    handleImportBackup(event) {
        const file = event.target.files && event.target.files[0];
        if (!file) return;

        if (!file.name.toLowerCase().endsWith('.json')) {
            ComponentManager.showToast('Please select a valid .json backup file.', 'error');
            event.target.value = '';
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);

                // Basic validation
                if (!data || typeof data !== 'object') {
                    throw new Error('Invalid backup structure');
                }

                const isFloworaBackup = data._meta && data._meta.app === 'Flowora';
                const hasAnyKeys = Object.keys(data).some(k => k !== '_meta');

                if (!hasAnyKeys) {
                    throw new Error('Backup file appears empty');
                }

                const confirmMsg = isFloworaBackup
                    ? `Restore backup from ${data._meta.exportedAt ? new Date(data._meta.exportedAt).toLocaleString() : 'unknown date'}?\n\nThis will overwrite your current data on this device.`
                    : 'This file does not look like a Flowora backup. Import anyway? Current data will be overwritten.';

                if (!confirm(confirmMsg)) {
                    event.target.value = '';
                    return;
                }

                const result = StorageManager.importAll(data, { overwrite: true });

                if (result.success) {
                    ComponentManager.showToast(`Restored ${result.importedCount} data keys successfully. Reloading...`, 'success');
                    setTimeout(() => location.reload(), 1200);
                } else {
                    ComponentManager.showToast('Import failed: ' + (result.errors[0] || 'Unknown error'), 'error');
                }
            } catch (err) {
                console.error('[Settings] Import failed:', err);
                ComponentManager.showToast('Invalid or corrupted backup file.', 'error');
            } finally {
                event.target.value = '';
            }
        };
        reader.onerror = () => {
            ComponentManager.showToast('Could not read the file.', 'error');
            event.target.value = '';
        };
        reader.readAsText(file);
    }

    persistState() {
        StorageManager.set(this.storageKey, this.settings);
    }

    sanitizeHTML(str) {
        return (typeof Utils !== 'undefined' ? Utils.escapeHTML(str) : (str || ''));
    }
}

window.SettingsModule = SettingsModule;
