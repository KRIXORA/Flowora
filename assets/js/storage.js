/**
 * Storage Manager - Centralized Redux-like Store & Persistent Storage
 * Phase 1 upgrades:
 *  - Schema validation + versioning
 *  - Better quota / error handling
 *  - Export / Import helpers
 *  - Data integrity check
 *  - In-memory fallback remains for private mode
 */
class StorageManager {
    static inMemoryStorage = {};
    static STORAGE_VERSION = 2;
    static PREFIX = 'flowora_';

    // Default Schemas for Data Validation & Migration
    static SCHEMAS = {
        portfolio_settings: { developerName: 'Guest User', theme: 'light', aiApiKey: '', contactEmail: '' },
        tasks: [],
        habits: [],
        goals: [],
        analytics: { focusTimeMinutes: 0 },
        app_notifications: [],
        dashboard_tasks: [],
        user_goals: [],
        user_habits: [],
        planner_tasks: {},
        calendar_events: {},
        flowora_ai_chat_history: []
    };

    /**
     * Get data with schema validation and migration fallback
     */
    static get(key, defaultValue = null) {
        try {
            const fullKey = StorageManager.PREFIX + key;
            const data = localStorage.getItem(fullKey);
            let parsed = data !== null ? JSON.parse(data) : undefined;

            if (parsed === undefined) {
                if (Object.prototype.hasOwnProperty.call(StorageManager.inMemoryStorage, fullKey)) {
                    parsed = StorageManager.inMemoryStorage[fullKey];
                } else {
                    parsed = defaultValue !== null ? defaultValue : (StorageManager.SCHEMAS[key] !== undefined ? StorageManager.deepClone(StorageManager.SCHEMAS[key]) : null);
                }
            }

            // Validate schema type if defined
            const defaultTemplate = StorageManager.SCHEMAS[key];
            if (defaultTemplate !== undefined && parsed !== null) {
                if (typeof parsed !== typeof defaultTemplate || (Array.isArray(defaultTemplate) && !Array.isArray(parsed))) {
                    console.warn(`[StorageManager] Schema mismatch for "${key}". Migrating to default structure.`);
                    parsed = StorageManager.deepClone(defaultTemplate);
                    StorageManager.set(key, parsed);
                }
            }

            return parsed;
        } catch (e) {
            console.warn('[StorageManager] Get error (corrupt JSON or restricted storage), falling back:', e);
            return StorageManager.SCHEMAS[key] !== undefined
                ? StorageManager.deepClone(StorageManager.SCHEMAS[key])
                : defaultValue;
        }
    }

    /**
     * Set data and dispatch a custom event for Redux-like state synchronization
     */
    static set(key, value) {
        const fullKey = StorageManager.PREFIX + key;
        try {
            localStorage.setItem(fullKey, JSON.stringify(value));
            StorageManager.inMemoryStorage[fullKey] = value;
        } catch (e) {
            console.warn('[StorageManager] Set error (Quota exceeded or private mode). Using in-memory fallback:', e);
            StorageManager.inMemoryStorage[fullKey] = value;

            // Notify user once about storage pressure
            if (e.name === 'QuotaExceededError' || e.code === 22) {
                window.dispatchEvent(new CustomEvent('floworaStorageQuota', {
                    detail: { key, message: 'Storage quota exceeded. Some data may not persist.' }
                }));
            }
        }

        // Dispatch Custom Event for Event-Driven State Synchronization
        window.dispatchEvent(new CustomEvent('floworaStateChange', {
            detail: { key, value }
        }));
    }

    /**
     * Remove a single key
     */
    static remove(key) {
        const fullKey = StorageManager.PREFIX + key;
        try {
            localStorage.removeItem(fullKey);
        } catch (e) { /* ignore */ }
        delete StorageManager.inMemoryStorage[fullKey];
        window.dispatchEvent(new CustomEvent('floworaStateChange', {
            detail: { key, value: null }
        }));
    }

    /**
     * Export ALL flowora_* keys as a clean object (for backup)
     */
    static exportAll() {
        const result = {
            _meta: {
                app: 'Flowora',
                version: StorageManager.STORAGE_VERSION,
                exportedAt: new Date().toISOString()
            }
        };

        // From localStorage
        for (let i = 0; i < localStorage.length; i++) {
            const fullKey = localStorage.key(i);
            if (fullKey && fullKey.startsWith(StorageManager.PREFIX)) {
                const shortKey = fullKey.slice(StorageManager.PREFIX.length);
                try {
                    result[shortKey] = JSON.parse(localStorage.getItem(fullKey));
                } catch (e) {
                    result[shortKey] = localStorage.getItem(fullKey);
                }
            }
        }

        // Merge any pure in-memory keys that never made it to localStorage
        Object.keys(StorageManager.inMemoryStorage).forEach(fullKey => {
            if (fullKey.startsWith(StorageManager.PREFIX)) {
                const shortKey = fullKey.slice(StorageManager.PREFIX.length);
                if (!(shortKey in result)) {
                    result[shortKey] = StorageManager.inMemoryStorage[fullKey];
                }
            }
        });

        return result;
    }

    /**
     * Import a previously exported backup object.
     * Returns { success, importedCount, errors }
     */
    static importAll(backupData, options = { overwrite: true }) {
        const result = { success: false, importedCount: 0, errors: [] };

        if (!backupData || typeof backupData !== 'object') {
            result.errors.push('Invalid backup format');
            return result;
        }

        try {
            Object.keys(backupData).forEach(key => {
                if (key === '_meta') return; // skip metadata

                try {
                    if (options.overwrite || StorageManager.get(key) === null) {
                        StorageManager.set(key, backupData[key]);
                        result.importedCount++;
                    }
                } catch (err) {
                    result.errors.push(`Failed to import key "${key}": ${err.message}`);
                }
            });

            result.success = result.importedCount > 0 || result.errors.length === 0;
        } catch (e) {
            result.errors.push(e.message);
        }

        return result;
    }

    /**
     * Quick integrity / health check
     */
    static healthCheck() {
        const report = {
            ok: true,
            keys: 0,
            estimatedBytes: 0,
            issues: []
        };

        try {
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && key.startsWith(StorageManager.PREFIX)) {
                    report.keys++;
                    const val = localStorage.getItem(key) || '';
                    report.estimatedBytes += key.length + val.length;
                }
            }

            // Rough warning threshold (~4MB used of typical 5-10MB limit)
            if (report.estimatedBytes > 4 * 1024 * 1024) {
                report.issues.push('Storage usage is high. Consider exporting a backup and clearing old data.');
                report.ok = false;
            }
        } catch (e) {
            report.ok = false;
            report.issues.push('Unable to read storage: ' + e.message);
        }

        return report;
    }

    static deepClone(obj) {
        try {
            return JSON.parse(JSON.stringify(obj));
        } catch (e) {
            return obj;
        }
    }
}

window.StorageManager = StorageManager;
