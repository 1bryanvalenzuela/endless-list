type Language = 'es' | 'en';

interface Translations {
    es: {
        [key: string]: string;
    };
    en: {
        [key: string]: string;
    };
}

const translations: Translations = {
    es: {
        // Top Bar
        addList: 'Añadir',
        deleteList: 'Eliminar',
        settings: 'Configuración',
        changeProject: 'Cambiar de Proyecto',

        // First Launch Modal
        welcome: 'Bienvenido a Endless List',
        createNewProject: 'Crear Nuevo Proyecto',
        importProject: 'Importar Proyecto',

        // Add List Modal
        addNewList: 'Agregar Nueva Lista',
        listTitle: 'Título de la Lista',
        titleRequired: 'El título es requerido',
        titleColor: 'Color del Título',
        addToRoot: 'Agregar a la raíz',
        confirm: 'Confirmar',
        cancel: 'Cancelar',
        lastUsedColor: 'Color usado anteriormente',

        // Delete Confirmation Modal
        deleteConfirmation: 'Confirmar Eliminación',
        deleteWarning: '¿Estás seguro de que deseas eliminar esta lista?',
        deleteWarningWithChildren: '¿Estás seguro de que deseas eliminar esta lista? También se eliminarán {count} lista(s) contenida(s).',
        dontShowAgain: 'No mostrar más',

        // Settings Modal
        settingsTitle: 'Configuración',
        language: 'Idioma',
        theme: 'Tema',
        light: 'Claro',
        dark: 'Oscuro',
        system: 'Sistema',
        currentProject: 'Proyecto Actual',
        save: 'Guardar',
        restoreTitleColor: 'Restablecer Color de Título',
        defaultTitleColor: 'Color de Título Predeterminado',
        defaultDeleteWarning: 'Advertencia al eliminar',
        showDeleteWarning: 'Mostrar advertencia',

        // Project Modal
        projectManagement: 'Gestión de Proyectos',
        openExistingProject: 'Abrir Proyecto Existente',

        // Description Panel
        title: 'Título',
        editTitle: 'Editar Título',
        color: 'Color',
        editColor: 'Cambiar Color',
        description: 'Descripción',
        saving: 'Guardando...',
        saved: 'Guardado',

        // General
        noProjectLoaded: 'No hay proyecto cargado',
        emptyProject: 'Añade una lista para comenzar',
        selectList: 'Selecciona una lista para editar'
    },
    en: {
        // Top Bar
        addList: 'Add',
        deleteList: 'Delete',
        settings: 'Settings',
        changeProject: 'Change Project',

        // First Launch Modal
        welcome: 'Welcome to Endless List',
        createNewProject: 'Create New Project',
        importProject: 'Import Project',

        // Add List Modal
        addNewList: 'Add New List',
        listTitle: 'List Title',
        titleRequired: 'Title is required',
        titleColor: 'Title Color',
        addToRoot: 'Add to root',
        confirm: 'Confirm',
        cancel: 'Cancel',
        lastUsedColor: 'Last used color',

        // Delete Confirmation Modal
        deleteConfirmation: 'Confirm Deletion',
        deleteWarning: 'Are you sure you want to delete this list?',
        deleteWarningWithChildren: 'Are you sure you want to delete this list? This will also delete {count} contained list(s).',
        dontShowAgain: "Don't show again",

        // Settings Modal
        settingsTitle: 'Settings',
        language: 'Language',
        theme: 'Theme',
        light: 'Light',
        dark: 'Dark',
        system: 'System',
        currentProject: 'Current Project',
        save: 'Save',
        restoreTitleColor: 'Restore Title Color',
        defaultTitleColor: 'Default Title Color',
        defaultDeleteWarning: 'Delete warning',
        showDeleteWarning: 'Show warning',

        // Project Modal
        projectManagement: 'Project Management',
        openExistingProject: 'Open Existing Project',

        // Description Panel
        title: 'Title',
        editTitle: 'Edit Title',
        color: 'Color',
        editColor: 'Change Color',
        description: 'Description',
        saving: 'Saving...',
        saved: 'Saved',

        // General
        noProjectLoaded: 'No project loaded',
        emptyProject: 'Add a list to start',
        selectList: 'Select a list to edit',
    }
};

export function t(key: string, lang: Language, replacements?: Record<string, string | number>): string {
    let text = translations[lang][key] || key;

    if (replacements) {
        Object.keys(replacements).forEach(replaceKey => {
            text = text.replace(`{${replaceKey}}`, String(replacements[replaceKey]));
        });
    }

    return text;
}

export { translations };
