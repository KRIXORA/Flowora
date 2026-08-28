/**
 * Daily & Weekly Review — Phase 2
 * Aggregates tasks, habits, goals from StorageManager
 */
class ReviewModule {
    constructor() {
        this.root = document.getElementById('reviewRoot');
        this.init();
    }

    init() {
        if (!this.root) return;
        this.render();
        // Re-render when user opens this view
        window.addEventListener('hashchange', () => {
            if ((window.location.hash || '').replace('#', '') === 'review') {
                this.render();
            }
        });
        window.addEventListener('floworaStateChange', () => {
            if ((window.location.hash || '').replace('#', '') === 'review') {
                this.render();
            }
        });
    }

    getTasks() {
        return StorageManager.get('dashboard_tasks', []) || [];
    }

    getHabits() {
        return StorageManager.get('user_habits', []) || [];
    }

    getGoals() {
        return StorageManager.get('user_goals', []) || [];
    }

    getPomodoroHint() {
        return StorageManager.get('pomodoro_state', null);
    }

    escape(s) {
        return (window.Utils && Utils.escapeHTML)
            ? Utils.escapeHTML(String(s))
            : String(s)
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;');
    }

    render() {
        if (!this.root) return;

        const tasks = this.getTasks();
        const habits = this.getHabits();
        const goals = this.getGoals();

        const doneTasks = tasks.filter(t => t.completed);
        const openTasks = tasks.filter(t => !t.completed);
        const highPriority = openTasks.filter(t => t.priority === 'high' || t.priority === 'High');

        const habitsDone = habits.filter(h => h.completedToday);
        const habitsLeft = habits.filter(h => !h.completedToday);
        const avgStreak = habits.length
            ? Math.round(habits.reduce((a, h) => a + (Number(h.streak) || 0), 0) / habits.length)
            : 0;

        const goalsOnTrack = goals.filter(g => (Number(g.progress) || 0) >= 50);
        const goalsBehind = goals.filter(g => (Number(g.progress) || 0) < 50);

        const taskRate = tasks.length ? Math.round((doneTasks.length / tasks.length) * 100) : 0;
        const habitRate = habits.length ? Math.round((habitsDone.length / habits.length) * 100) : 0;

        const dayName = new Date().toLocaleDateString(undefined, { weekday: 'long' });
        const dateStr = new Date().toLocaleDateString(undefined, {
            month: 'short', day: 'numeric', year: 'numeric'
        });

        // Weekly-ish: simple reflection from current snapshot (local-only, no history DB)
        const weeklyNote = this.buildWeeklyInsight({
            taskRate, habitRate, openCount: openTasks.length, avgStreak, goalsOnTrack: goalsOnTrack.length, goalsTotal: goals.length
        });

        this.root.innerHTML = `
            <div class="review-header glass-card">
                <div>
                    <span class="badge soft-badge"><i class="fa-solid fa-clipboard-check"></i> ${this.escape(dayName)}</span>
                    <h2 id="reviewHeading" style="margin: 10px 0 4px;">Daily & weekly review</h2>
                    <p class="review-sub">${this.escape(dateStr)} · Look back, then plan the next step</p>
                </div>
                <div class="review-header-actions">
                    <button type="button" class="btn btn-secondary" id="reviewRefreshBtn"><i class="fa-solid fa-rotate"></i> Refresh</button>
                    <button type="button" class="btn btn-primary" onclick="router.navigateTo('dashboard')"><i class="fa-solid fa-house"></i> Back to Home</button>
                </div>
            </div>

            <div class="review-metrics">
                <div class="glass-card review-metric">
                    <span class="rm-label">Tasks done</span>
                    <strong class="rm-value">${doneTasks.length}<span class="rm-of">/${tasks.length || 0}</span></strong>
                    <div class="mini-progress-bar"><div class="fill" style="width:${taskRate}%"></div></div>
                </div>
                <div class="glass-card review-metric">
                    <span class="rm-label">Habits today</span>
                    <strong class="rm-value">${habitsDone.length}<span class="rm-of">/${habits.length || 0}</span></strong>
                    <div class="mini-progress-bar"><div class="fill" style="width:${habitRate}%"></div></div>
                </div>
                <div class="glass-card review-metric">
                    <span class="rm-label">Open tasks</span>
                    <strong class="rm-value">${openTasks.length}</strong>
                    <span class="rm-hint">${highPriority.length} high priority</span>
                </div>
                <div class="glass-card review-metric">
                    <span class="rm-label">Avg habit streak</span>
                    <strong class="rm-value">${avgStreak}<span class="rm-of"> days</span></strong>
                    <span class="rm-hint">${goalsOnTrack.length}/${goals.length || 0} goals ≥50%</span>
                </div>
            </div>

            <div class="review-columns">
                <div class="glass-card review-panel">
                    <h3><i class="fa-solid fa-check-double"></i> Completed today</h3>
                    ${this.listBlock(doneTasks.map(t => t.text || t.title || 'Task'), 'Nothing checked off yet — small wins count.')}
                </div>
                <div class="glass-card review-panel">
                    <h3><i class="fa-solid fa-hourglass-half"></i> Still open</h3>
                    ${this.listBlock(openTasks.slice(0, 8).map(t => t.text || t.title || 'Task'), 'Inbox zero — nice work.')}
                    ${openTasks.length > 8 ? `<p class="review-more">+${openTasks.length - 8} more on Home / Planner</p>` : ''}
                </div>
                <div class="glass-card review-panel">
                    <h3><i class="fa-solid fa-fire"></i> Habits left today</h3>
                    ${this.listBlock(habitsLeft.map(h => h.name || h.title || 'Habit'), 'All habits done for today.')}
                </div>
                <div class="glass-card review-panel">
                    <h3><i class="fa-solid fa-bullseye"></i> Goals needing attention</h3>
                    ${this.listBlock(goalsBehind.slice(0, 6).map(g => `${g.title || 'Goal'} (${Number(g.progress) || 0}%)`), 'All tracked goals are at 50%+.')}
                </div>
            </div>

            <div class="glass-card review-insight">
                <h3><i class="fa-solid fa-lightbulb"></i> Weekly-style insight</h3>
                <p>${this.escape(weeklyNote)}</p>
                ${this.pomodoroHintBlock()}
                <div class="review-cta-row">
                    <button type="button" class="btn btn-primary" onclick="router.navigateTo('pomodoro')"><i class="fa-solid fa-play"></i> Start focus</button>
                    <button type="button" class="btn btn-secondary" onclick="router.navigateTo('planner')"><i class="fa-solid fa-list-check"></i> Plan remaining</button>
                    <button type="button" class="btn btn-secondary" onclick="router.navigateTo('habits')"><i class="fa-solid fa-fire"></i> Habits</button>
                </div>
            </div>
        `;

        const refresh = this.root.querySelector('#reviewRefreshBtn');
        if (refresh) refresh.addEventListener('click', () => this.render());
    }

    /**
     * Small "pick up where you left off" hint built from the Pomodoro
     * module's saved state (currentTask + sessionCount), so Review isn't
     * just tasks/habits/goals but also nudges toward the last focus task.
     */
    pomodoroHintBlock() {
        const hint = this.getPomodoroHint();
        if (!hint || !hint.currentTask) return '';
        const sessions = Number(hint.sessionCount) || 0;
        return `<p class="review-sub" style="margin-top: 6px;"><i class="fa-solid fa-clock-rotate-left"></i> Last focus task: "${this.escape(hint.currentTask)}"${sessions > 0 ? ` · ${sessions} session${sessions === 1 ? '' : 's'} logged` : ''}</p>`;
    }

    listBlock(items, emptyText) {
        if (!items || !items.length) {
            return `<div class="empty-state-box review-empty"><p>${this.escape(emptyText)}</p></div>`;
        }
        return `<ul class="review-list">${items.map(i => `<li>${this.escape(i)}</li>`).join('')}</ul>`;
    }

    buildWeeklyInsight({ taskRate, habitRate, openCount, avgStreak, goalsOnTrack, goalsTotal }) {
        const parts = [];
        if (taskRate >= 70) parts.push('Task completion looks strong.');
        else if (taskRate >= 40) parts.push('You are mid-way on tasks — finish 1–2 high-priority items next.');
        else parts.push('Task completion is low today — pick one small task and finish it.');

        if (habitRate >= 80) parts.push('Habits are mostly done.');
        else if (habitsHint(habitRate)) parts.push('Close the day by completing remaining habits.');

        if (avgStreak >= 5) parts.push(`Average streak is ${avgStreak} days — protect it.`);
        if (goalsTotal && goalsOnTrack / goalsTotal < 0.5) {
            parts.push('Several goals are under 50% — schedule one focused block this week.');
        }
        if (openCount > 10) parts.push('Open list is long — move some items to Planner time blocks.');
        if (!parts.length) parts.push('Keep logging tasks and habits so reviews become richer over time.');
        return parts.join(' ');

        function habitsHint(r) { return r < 80; }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    try {
        window.reviewModule = new ReviewModule();
    } catch (err) {
        console.error('[ReviewModule]', err);
    }
});
