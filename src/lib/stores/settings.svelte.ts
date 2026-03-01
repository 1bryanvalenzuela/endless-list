import type { Settings } from '$lib/types';

const SETTINGS_KEY = 'endless-list-settings';

const defaultSettings: Settings = {
    language: 'es',
    theme: 'system',
    currentProjectPath: null,
    showDeleteWarning: true,
    windowWidth: null,
    windowHeight: null,
    isMaximized: false,
};

class SettingsStore {
    private _settings = $state<Settings>(defaultSettings);

    constructor() {
        this.load();
    }

    get settings(): Settings {
        return this._settings;
    }

    get language() {
        return this._settings.language;
    }

    get theme() {
        return this._settings.theme;
    }

    get currentProjectPath() {
        return this._settings.currentProjectPath;
    }

    get showDeleteWarning() {
        return this._settings.showDeleteWarning;
    }

    get windowWidth() {
        return this._settings.windowWidth;
    }

    get windowHeight() {
        return this._settings.windowHeight;
    }

    get isMaximized() {
        return this._settings.isMaximized;
    }

    setLanguage(language: 'es' | 'en') {
        this._settings.language = language;
        this.save();
    }

    setTheme(theme: 'light' | 'dark' | 'system') {
        this._settings.theme = theme;
        this.save();
    }

    setCurrentProjectPath(path: string | null) {
        this._settings.currentProjectPath = path;
        this.save();
    }

    setShowDeleteWarning(show: boolean) {
        this._settings.showDeleteWarning = show;
        this.save();
    }

    setWindowSize(width: number, height: number) {
        this._settings.windowWidth = width;
        this._settings.windowHeight = height;
        this.save();
    }

    setWindowMaximized(maximized: boolean) {
        this._settings.isMaximized = maximized;
        this.save();
    }

    private load() {
        if (typeof window === 'undefined') return;

        const stored = localStorage.getItem(SETTINGS_KEY);
        if (stored) {
            try {
                this._settings = { ...defaultSettings, ...JSON.parse(stored) };
            } catch (e) {
                console.error('Failed to load settings:', e);
            }
        }
    }

    private save() {
        if (typeof window === 'undefined') return;

        localStorage.setItem(SETTINGS_KEY, JSON.stringify(this._settings));
    }
}

export const settingsStore = new SettingsStore();
