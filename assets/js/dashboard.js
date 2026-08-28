/**
 * @module DashboardModule
 * @description Interactive Task List with Search Filter, Dynamic Priority, Inline Editing, Confetti & Sound
 * @version 3.4.0
 */
class DashboardModule {
    constructor() {
        this.storageKey = 'dashboard_tasks';
        this.tasks = [];
        this.currentFilter = 'all';
        this.tagFilter = 'all';
        this.searchQuery = '';
        this.defaultTags = ['Work', 'Personal', 'Health', 'Study', 'Planning', 'Errands'];
        this.init();
    }

    init() {
        try {
            const dateDisplay = document.getElementById('currentDateDisplay');
            if (dateDisplay) {
                dateDisplay.textContent = Utils.formatDate();
            }

            const quickAddBtn = document.getElementById('quickAddBtn');
            const quickTaskInput = document.getElementById('quickTaskInput');

            if (quickAddBtn && quickTaskInput) {
                quickAddBtn.replaceWith(quickAddBtn.cloneNode(true));
                quickTaskInput.replaceWith(quickTaskInput.cloneNode(true));

                const freshAddBtn = document.getElementById('quickAddBtn');
                const freshTaskInput = document.getElementById('quickTaskInput');

                freshAddBtn.addEventListener('click', () => this.handleQuickAdd(freshTaskInput));
                freshTaskInput.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter') {
                        this.handleQuickAdd(freshTaskInput);
                    }
                });
            }

            this.injectProfessionalDashboardControls();
            this.loadTasksWithSkeleton();
            this.updateGreeting();

            // Keep the greeting in sync whenever the user updates their name in Settings
            window.addEventListener('portfolioProfileUpdated', () => this.updateGreeting());
            window.addEventListener('floworaStateChange', (e) => {
                if (e.detail && e.detail.key === 'portfolio_settings') this.updateGreeting();
            });
        } catch (error) {
            console.error('[DashboardModule] Initialization failed:', error);
            ComponentManager.showToast('Failed to initialize dashboard task flow.', 'error');
        }
    }

    /**
     * Shows the user's actual saved name in the dashboard welcome message
     * instead of the hardcoded "Architect" placeholder.
     */
    updateGreeting() {
        const heroHeading = document.querySelector('.welcome-hero-card h2');
        if (!heroHeading) return;

        const settings = StorageManager.get('portfolio_settings', {});
        const name = (settings && settings.developerName && settings.developerName.trim()) || 'there';
        const percentSpan = heroHeading.querySelector('.highlight-gradient');
        const percentText = percentSpan ? percentSpan.outerHTML : '<span class="highlight-gradient">100%</span>';

        heroHeading.innerHTML = `Good day, ${Utils.escapeHTML(name)}. Your focus score is ${percentText}.`;
    }

    loadTasksWithSkeleton() {
        const list = document.getElementById('dashboardTaskList');
        if (list) {
            list.innerHTML = `
                <div style="padding: 12px; display: flex; flex-direction: column; gap: 8px;">
                    <div style="height: 20px; background: var(--border-glass); border-radius: var(--radius-sm); animation: pulse 1.5s infinite;"></div>
                    <div style="height: 20px; background: var(--border-glass); border-radius: var(--radius-sm); animation: pulse 1.5s infinite; width: 80%;"></div>
                </div>
            `;
        }

        setTimeout(() => {
            this.tasks = StorageManager.get(this.storageKey, [
                { id: 'task_d1', text: 'Plan out this week\'s goals', completed: true, tag: 'Planning', priority: 'High', createdAt: '10:00 AM' },
                { id: 'task_d2', text: 'Reply to pending emails', completed: false, tag: 'Personal', priority: 'Medium', createdAt: '10:15 AM' },
                { id: 'task_d3', text: 'Grocery shopping for the week', completed: false, tag: 'Errands', priority: 'Low', createdAt: '11:00 AM' }
            ]);
            this.renderTasks();
            this.updateDashboardMetrics();
        }, 600);
    }

    playCompletionSound() {
        const settings = StorageManager.get('portfolio_settings', { soundEnabled: true });
        if (settings.soundEnabled === false) return;
        try {
            const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(587.33, audioCtx.currentTime);
            osc.frequency.setValueAtTime(880, audioCtx.currentTime + 0.1);
            gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.3);
            osc.connect(gain);
            gain.connect(audioCtx.destination);
            osc.start();
            osc.stop(audioCtx.currentTime + 0.3);
        } catch (e) {
            console.warn('AudioContext not supported or blocked', e);
        }
    }

    triggerConfetti() {
        if (typeof confetti !== 'undefined') {
            confetti({
                particleCount: 80,
                spread: 70,
                origin: { y: 0.6 }
            });
        }
    }

    injectProfessionalDashboardControls() {
        const listContainer = document.getElementById('dashboardTaskList');
        if (!listContainer || document.getElementById('dashboardControlsRow')) return;

        const controlsRow = document.createElement('div');
        controlsRow.id = 'dashboardControlsRow';
        controlsRow.style.cssText = 'display: flex; flex-wrap: wrap; gap: 8px; align-items: center; margin-bottom: 14px; width: 100%;';

        controlsRow.innerHTML = `
            <select id="taskStatusFilter" aria-label="Filter tasks" style="padding: 8px 10px; font-size: 0.8rem; border-radius: var(--radius-md); border: 1px solid var(--border-glass); background: var(--bg-main); color: var(--text-primary);">
                <option value="all">All tasks</option>
                <option value="active">Active only</option>
                <option value="completed">Done only</option>
                <option value="recurring">Repeating only</option>
            </select>
            <select id="taskTagSelect" aria-label="Filter by tag" style="padding: 8px 10px; font-size: 0.8rem; border-radius: var(--radius-md); border: 1px solid var(--border-glass); background: var(--bg-main); color: var(--text-primary);">
                <option value="all">All tags</option>
            </select>
            <input type="search" id="taskSearchInput" placeholder="Search…" aria-label="Search tasks" style="flex: 1; min-width: 120px; padding: 8px 10px; font-size: 0.8rem; border-radius: var(--radius-md); border: 1px solid var(--border-glass); background: var(--bg-main); color: var(--text-primary); outline: none;">
            <button type="button" class="text-btn" id="clearCompletedTasksBtn" style="font-size: 0.75rem; color: var(--danger); background: none; border: none; cursor: pointer; white-space: nowrap;">Clear done</button>
        `;

        listContainer.parentNode.insertBefore(controlsRow, listContainer);

        const statusFilter = controlsRow.querySelector('#taskStatusFilter');
        if (statusFilter) {
            statusFilter.value = this.currentFilter || 'all';
            statusFilter.addEventListener('change', (e) => {
                this.currentFilter = e.target.value;
                this.renderTasks();
            });
        }

        const tagSelect = controlsRow.querySelector('#taskTagSelect');
        if (tagSelect) {
            tagSelect.addEventListener('change', (e) => {
                this.tagFilter = e.target.value;
                this.renderTasks();
            });
        }

        const searchInput = controlsRow.querySelector('#taskSearchInput');
        if (searchInput) {
            searchInput.addEventListener('input', Utils.debounce((e) => {
                this.searchQuery = e.target.value.toLowerCase().trim();
                this.renderTasks();
            }, 250));
        }

        const clearCompletedBtn = controlsRow.querySelector('#clearCompletedTasksBtn');
        if (clearCompletedBtn) {
            clearCompletedBtn.addEventListener('click', () => {
                this.tasks = this.tasks.filter(task => !task.completed);
                this.persistState();
                this.renderTasks();
                this.updateDashboardMetrics();
                this.refreshTagFilters();
                if (typeof ComponentManager !== 'undefined') {
                    ComponentManager.showToast('Completed tasks cleared.', 'info');
                }
            });
        }
        this.refreshTagFilters();
    }

    handleQuickAdd(inputEl) {
        const text = inputEl.value.trim();
        if (text === '') {
            ComponentManager.showToast('Please provide a valid task description.', 'error');
            inputEl.focus();
            return;
        }
        const tagEl = document.getElementById('quickTaskTag');
        const priEl = document.getElementById('quickTaskPriority');
        const recEl = document.getElementById('quickTaskRecurrence');
        const tag = tagEl ? tagEl.value : 'Personal';
        const priority = priEl ? priEl.value : 'Medium';
        const recurrence = recEl ? recEl.value : 'none';
        this.addTask(text, tag, priority, recurrence);
        inputEl.value = '';
    }

    addTask(text, tag = 'Personal', priority = 'Medium', recurrence = 'none') {
        const newTask = {
            id: Utils.uid('task'),
            text,
            completed: false,
            tag,
            priority,
            recurrence: recurrence || 'none',
            createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        this.tasks.unshift(newTask);
        this.persistState();
        this.renderTasks();
        this.updateDashboardMetrics();
        this.refreshTagFilters();
        const recLabel = recurrence && recurrence !== 'none' ? ' (repeats)' : '';
        ComponentManager.showToast('Task added!' + recLabel, 'success');
    }

    refreshTagFilters() {
        const select = document.getElementById('taskTagSelect');
        if (!select) return;
        const tags = this.getUniqueTags();
        const current = this.tagFilter || 'all';
        select.innerHTML = '<option value="all">All tags</option>' +
            tags.map(tag => `<option value="${this.sanitizeHTML(tag)}">${this.sanitizeHTML(tag)}</option>`).join('');
        select.value = tags.includes(current) || current === 'all' ? current : 'all';
        if (select.value !== current) this.tagFilter = select.value;
    }

    persistState() {
        StorageManager.set(this.storageKey, this.tasks);
    }

    updateDashboardMetrics() {
        const total = this.tasks.length;
        const completed = this.tasks.filter(t => t.completed).length;
        const score = total > 0 ? Math.round((completed / total) * 100) : 100;

        const percentageEls = document.querySelectorAll('.ring-text .percentage, .highlight-gradient');
        percentageEls.forEach(el => {
            el.textContent = `${score}%`;
        });

        const ringFill = document.querySelector('.ring-fill');
        if (ringFill) {
            // Must match SVG circle: r=52 → circumference 2*π*52 ≈ 326.73
            const C = 2 * Math.PI * 52;
            const offset = C - (C * Math.min(100, Math.max(0, score)) / 100);
            ringFill.style.strokeDasharray = String(C);
            ringFill.style.strokeDashoffset = String(offset);
        }

        const heroSubtitle = document.querySelector('.welcome-hero-card p');
        if (heroSubtitle) {
            const remainingCount = total - completed;
            heroSubtitle.textContent = remainingCount > 0
                ? `You have ${remainingCount} task${remainingCount === 1 ? '' : 's'} left to finish today. Keep going!`
                : `You're all caught up for today. Nice work!`;
        }

        this.updateFocusTimeWidget();
    }

    /**
     * Reads the pomodoro session history (logged by PomodoroModule but previously
     * never displayed anywhere) and shows today's total focused time + progress bar
     * on the dashboard "Focus Time" stat card.
     */
    updateFocusTimeWidget() {
        const focusTimeEl = document.getElementById('dashFocusTime');
        const focusBarEl = document.getElementById('dashFocusBar');
        if (!focusTimeEl && !focusBarEl) return;

        let todayMinutes = 0;
        try {
            const history = StorageManager.get('pomodoro_history', []);
            const todayKey = new Date().toDateString();
            todayMinutes = history
                .filter(session => session && session.timestamp && new Date(session.timestamp).toDateString() === todayKey)
                .reduce((sum, session) => sum + (Number(session.durationMinutes) || 0), 0);
        } catch (e) {
            console.error('[DashboardModule] Failed to read pomodoro history:', e);
        }

        const hours = Math.floor(todayMinutes / 60);
        const minutes = Math.round(todayMinutes % 60);

        if (focusTimeEl) {
            focusTimeEl.textContent = `${hours}h ${minutes}m`;
        }

        if (focusBarEl) {
            const weeklyTargetHours = StorageManager.get('analytics_target_hours', 40);
            const dailyTargetMinutes = (weeklyTargetHours / 7) * 60;
            const pct = dailyTargetMinutes > 0
                ? Math.min(100, Math.round((todayMinutes / dailyTargetMinutes) * 100))
                : 0;
            focusBarEl.style.width = `${pct}%`;
        }
    }

    renderTasks() {
        const list = document.getElementById('dashboardTaskList');
        if (!list) return;
        
        list.innerHTML = '';

        let filteredTasks = this.tasks;

        if (this.currentFilter === 'active') {
            filteredTasks = filteredTasks.filter(t => !t.completed);
        } else if (this.currentFilter === 'completed') {
            filteredTasks = filteredTasks.filter(t => t.completed);
        } else if (this.currentFilter === 'recurring') {
            filteredTasks = filteredTasks.filter(t => t.recurrence && t.recurrence !== 'none');
        }

        if (this.tagFilter && this.tagFilter !== 'all') {
            filteredTasks = filteredTasks.filter(t => (t.tag || '') === this.tagFilter);
        }

        if (this.searchQuery) {
            filteredTasks = filteredTasks.filter(t => t.text.toLowerCase().includes(this.searchQuery));
        }

        if (!Array.isArray(filteredTasks) || filteredTasks.length === 0) {
            const isTotallyEmpty = this.tasks.length === 0;
            const emptyMsg = isTotallyEmpty
                ? 'No tasks yet. Add your first task below to start your day.'
                : 'No tasks match this filter or search.';
            list.innerHTML = `
                <div class="empty-state-box">
                    <i class="fa-regular fa-clipboard" aria-hidden="true"></i>
                    <p>${emptyMsg}</p>
                    ${isTotallyEmpty ? '<button type="button" class="btn btn-primary btn-sm" id="emptyFocusInputBtn"><i class="fa-solid fa-plus"></i> Add a task</button>' : ''}
                </div>
            `;
            const focusBtn = list.querySelector('#emptyFocusInputBtn');
            if (focusBtn) {
                focusBtn.addEventListener('click', () => {
                    const input = document.getElementById('quickTaskInput');
                    if (input) { input.focus(); input.scrollIntoView({ behavior: 'smooth', block: 'center' }); }
                });
            }
            return;
        }

        filteredTasks.forEach((task) => {
            const originalIndex = this.tasks.findIndex(t => t.id === task.id);

            const row = document.createElement('div');
            row.className = 'task-item-row';
            row.style.cssText = 'display: flex; justify-content: space-between; align-items: center; padding: 12px 16px; background-color: var(--bg-main); border-radius: var(--radius-md); border: 1px solid var(--border-glass); transition: all 0.2s ease; gap: 12px;';

            const priorityColor = task.priority === 'Critical' ? 'var(--danger)' : task.priority === 'High' ? 'var(--warning)' : 'var(--primary)';

            row.innerHTML = `
                <label class="custom-checkbox" style="display: flex; align-items: center; gap: 12px; cursor: pointer; flex: 1; min-width: 0;">
                    <input type="checkbox" class="task-checkbox-input" ${task.completed ? 'checked' : ''} style="position: absolute; opacity: 0; cursor: pointer;">
                    <span class="checkmark"></span>
                    <span class="task-text ${task.completed ? 'completed' : ''}" style="word-break: break-word; font-size: 0.9rem;" title="Double-click to edit">${this.sanitizeHTML(task.text)}</span>
                </label>
                <div style="display: flex; align-items: center; gap: 8px; flex-shrink: 0;">
                    <span class="badge soft-badge" style="border-left: 3px solid ${priorityColor};">${this.sanitizeHTML(task.priority || 'Medium')}</span>
                    <span class="badge soft-badge">${this.sanitizeHTML(task.tag || 'General')}</span>
                    ${task.recurrence && task.recurrence !== 'none' ? `<span class="badge soft-badge" title="Repeats ${this.sanitizeHTML(task.recurrence)}"><i class="fa-solid fa-rotate"></i> ${this.sanitizeHTML(task.recurrence)}</span>` : ''}
                    <button class="icon-btn-delete-task" data-id="${task.id}" title="Delete Task" style="background: none; border: none; color: var(--text-muted); cursor: pointer; padding: 4px; transition: color 0.2s;" onmouseover="this.style.color='var(--danger)'" onmouseout="this.style.color='var(--text-muted)'">
                        <i class="fa-solid fa-xmark" style="font-size: 0.8rem;"></i>
                    </button>
                </div>
            `;

            const checkbox = row.querySelector('.task-checkbox-input');
            const taskText = row.querySelector('.task-text');
            const deleteBtn = row.querySelector('.icon-btn-delete-task');

            checkbox.addEventListener('change', () => {
                if (originalIndex !== -1) {
                    this.tasks[originalIndex].completed = checkbox.checked;
                    if (checkbox.checked) {
                        taskText.classList.add('completed');
                        this.playCompletionSound();
                        this.triggerConfetti();
                        ComponentManager.showToast('Task marked as completed!', 'success');
                        if (typeof ComponentManager.addNotification === 'function') {
                            ComponentManager.addNotification('Task completed', `"${this.tasks[originalIndex].text}" marked as done.`);
                        }
                    } else {
                        taskText.classList.remove('completed');
                    }
                    this.persistState();
                    this.updateDashboardMetrics();
                }
            });

            taskText.addEventListener('dblclick', () => {
                const currentText = this.tasks[originalIndex].text;
                const input = document.createElement('input');
                input.type = 'text';
                input.value = currentText;
                input.style.cssText = 'flex: 1; padding: 4px 8px; font-size: 0.9rem; border: 1px solid var(--primary); border-radius: var(--radius-sm); background: var(--bg-surface); color: var(--text-primary); outline: none;';
                
                taskText.replaceWith(input);
                input.focus();

                const saveEdit = () => {
                    const newText = input.value.trim();
                    if (newText && originalIndex !== -1) {
                        this.tasks[originalIndex].text = newText;
                        this.persistState();
                        this.renderTasks();
                        ComponentManager.showToast('Task updated successfully.', 'success');
                    } else {
                        this.renderTasks();
                    }
                };

                input.addEventListener('blur', saveEdit);
                input.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter') saveEdit();
                });
            });

            deleteBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                if (originalIndex !== -1) {
                    const [removedTask] = this.tasks.splice(originalIndex, 1);
                    this.persistState();
                    this.renderTasks();
                    this.updateDashboardMetrics();
                    ComponentManager.showUndoToast(`"${removedTask.text}" deleted.`, () => {
                        this.tasks.splice(originalIndex, 0, removedTask);
                        this.persistState();
                        this.renderTasks();
                        this.updateDashboardMetrics();
                        ComponentManager.showToast('Task restored.', 'success');
                    });
                }
            });

            list.appendChild(row);
        });
    }


    todayISO() {
        const d = new Date();
        return d.toISOString().slice(0, 10);
    }

    processRecurringTasks() {
        const today = this.todayISO();
        const day = new Date().getDay(); // 0 Sun
        let changed = false;
        this.tasks.forEach(task => {
            const rec = task.recurrence || 'none';
            if (rec === 'none') return;
            if (!task.completed) return;
            const last = task.lastCompletedDate || '';
            if (rec === 'daily') {
                if (last && last < today) {
                    task.completed = false;
                    changed = true;
                }
            } else if (rec === 'weekdays') {
                if (day === 0 || day === 6) return; // don't auto-reset on weekend
                if (last && last < today) {
                    task.completed = false;
                    changed = true;
                }
            } else if (rec === 'weekly') {
                if (!last) return;
                const lastDate = new Date(last + 'T12:00:00');
                const diff = (Date.now() - lastDate.getTime()) / (1000 * 60 * 60 * 24);
                if (diff >= 7) {
                    task.completed = false;
                    changed = true;
                }
            }
        });
        if (changed) this.persistState();
    }

    getUniqueTags() {
        const set = new Set(this.defaultTags);
        this.tasks.forEach(t => {
            if (t.tag) set.add(t.tag);
        });
        return Array.from(set);
    }

    sanitizeHTML(str) {
        return (typeof Utils !== 'undefined' ? Utils.escapeHTML(str) : String(str || ''));
    }
}

window.DashboardModule = DashboardModule;
