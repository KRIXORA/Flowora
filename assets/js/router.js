/* Router — simple hash navigation with friendly page titles */
class Router {
    constructor() {
        this.navItems = document.querySelectorAll('.nav-item');
        this.sections = document.querySelectorAll('.view-section');
        this.pageTitle = document.getElementById('pageTitle');
        this.titles = {
            dashboard: 'Home',
            planner: 'Planner',
            calendar: 'Calendar',
            pomodoro: 'Focus Timer',
            goals: 'Goals',
            habits: 'Habits',
            review: 'Review',
            analytics: 'Progress',
            'ai-hub': 'AI Coach',
            settings: 'Settings'
        };
        this.init();
    }

    init() {
        this.navItems.forEach(item => {
            item.addEventListener('click', (e) => {
                const target = item.getAttribute('data-target');
                if (target) {
                    e.preventDefault();
                    this.navigateTo(target);
                }
            });
        });
        window.addEventListener('hashchange', () => {
            const hash = window.location.hash.substring(1) || 'dashboard';
            this.showSection(hash);
        });
        const initialHash = window.location.hash.substring(1) || 'dashboard';
        this.showSection(initialHash);
    }

    navigateTo(target) {
        window.location.hash = target;
        this.showSection(target);
        const sidebar = document.getElementById('appSidebar');
        if (sidebar) sidebar.classList.remove('mobile-open');
        const mobileMenuBtn = document.getElementById('mobileMenuBtn');
        if (mobileMenuBtn) mobileMenuBtn.setAttribute('aria-expanded', 'false');
    }

    showSection(target) {
        if (!this.titles[target]) target = 'dashboard';

        this.sections.forEach(sec => sec.classList.remove('active'));
        this.navItems.forEach(item => {
            item.classList.remove('active');
            item.removeAttribute('aria-current');
        });

        const activeSection = document.getElementById(`view-${target}`);
        const activeNav = document.querySelector(`.nav-item[data-target="${target}"]`);
        if (activeSection) activeSection.classList.add('active');
        if (activeNav) {
            activeNav.classList.add('active');
            activeNav.setAttribute('aria-current', 'page');
        }
        if (this.pageTitle) {
            this.pageTitle.textContent = this.titles[target] || 'Home';
        }

        // Always clear stuck overlays / hidden cards when switching screens
        document.body.classList.remove('sidebar-open', 'onboarding-open');
        const backdrop = document.getElementById('sidebarBackdrop');
        if (backdrop) {
            backdrop.classList.remove('is-visible');
            backdrop.setAttribute('aria-hidden', 'true');
        }
        document.querySelectorAll('.reveal').forEach((el) => {
            el.classList.add('is-visible');
            el.style.opacity = '1';
            el.style.transform = 'none';
        });
        if (activeSection) {
            activeSection.style.opacity = '1';
            activeSection.style.filter = 'none';
        }

        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}


window.Router = Router;
