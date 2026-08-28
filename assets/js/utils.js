/**
 * Utility Functions - Centralized helpers for the entire app
 * Phase 1: Expanded with sanitize, debounce, safe JSON, etc.
 */
class Utils {
    static formatDate() {
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        return new Date().toLocaleDateString('en-US', options);
    }

    /**
     * Escape HTML to prevent XSS. Use this for any user-generated content
     * before inserting into innerHTML.
     */
    static escapeHTML(str) {
        if (str === null || str === undefined) return '';
        const temp = document.createElement('div');
        temp.textContent = String(str);
        return temp.innerHTML;
    }

    /**
     * Returns a filename-safe, human-readable date like "2Aug2026-1430"
     * for exports/backups.
     */
    static fileTimestamp() {
        const d = new Date();
        const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
        const pad = (n) => String(n).padStart(2, '0');
        return `${d.getDate()}${months[d.getMonth()]}${d.getFullYear()}-${pad(d.getHours())}${pad(d.getMinutes())}`;
    }

    /**
     * Safe JSON parse with fallback
     */
    static safeJSONParse(str, fallback = null) {
        try {
            return JSON.parse(str);
        } catch (e) {
            return fallback;
        }
    }

    /**
     * Debounce helper for search inputs etc.
     */
    static debounce(fn, delay = 250) {
        let timer;
        return function (...args) {
            clearTimeout(timer);
            timer = setTimeout(() => fn.apply(this, args), delay);
        };
    }

    /**
     * Simple deep clone (for plain objects/arrays only)
     */
    static deepClone(obj) {
        try {
            return JSON.parse(JSON.stringify(obj));
        } catch (e) {
            return obj;
        }
    }

    /**
     * Generate a simple unique ID
     */
    static uid(prefix = 'id') {
        return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    }

    /**
     * Format relative time (e.g. "2 hours ago")
     */
    static timeAgo(date) {
        const seconds = Math.floor((new Date() - new Date(date)) / 1000);
        if (seconds < 60) return 'just now';
        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) return `${minutes}m ago`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours}h ago`;
        const days = Math.floor(hours / 24);
        if (days < 7) return `${days}d ago`;
        return new Date(date).toLocaleDateString();
    }
}

window.Utils = Utils;
