// Change this to a default color from the store
export const themes = {
    light: {
        defaultTitleColor: '#6366f1',
    },
    dark: {
        defaultTitleColor: '#818181ff',
    }
};

// Apply the theme to the document
export function applyTheme(theme: 'light' | 'dark') {
    const root = document.documentElement;

    if (theme === 'dark') {
        root.classList.add('dark');
    } else {
        root.classList.remove('dark');
    }

    root.setAttribute('data-theme', theme);
}

// Get the default title color for a theme (this will change to the same title color for all themes using store)
export function getDefaultTitleColor(theme: 'light' | 'dark' | 'system'): string {
    if (theme === 'system') {
        const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        return themes[systemTheme].defaultTitleColor;
    }
    return themes[theme].defaultTitleColor;
}

