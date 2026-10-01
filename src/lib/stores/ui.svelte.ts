import { settingsStore } from './settings.svelte';

export interface DescriptionHistoryItem {
    title: string;
    description: string;
}

class UIStore {
    // Modal states
    showFirstLaunchModal = $state(false);
    showAddListModal = $state(false);
    showDeleteConfirmModal = $state(false);
    showSettingsModal = $state(false);
    showProjectModal = $state(false);

    // List table collapse state
    isListCollapsed = $state(settingsStore.isListCollapsed);

    // Expanded lists tracking
    expandedLists = $state<Set<string>>(new Set());

    // Undo/Redo history for title and description
    descriptionHistory = $state<DescriptionHistoryItem[]>([]);
    descriptionHistoryIndex = $state(-1);

    // Saving indicator
    isSaving = $state(false);

    // Last used color for lists
    lastUsedColor = $state<string | null>(null);

    // Methods for list collapse
    toggleListCollapse() {
        this.isListCollapsed = !this.isListCollapsed;
        settingsStore.setIsListCollapsed(this.isListCollapsed);
    }

    setListCollapsed(collapsed: boolean) {
        this.isListCollapsed = collapsed;
        settingsStore.setIsListCollapsed(collapsed);
    }

    // Methods for modals
    openFirstLaunchModal() {
        this.showFirstLaunchModal = true;
    }

    closeFirstLaunchModal() {
        this.showFirstLaunchModal = false;
    }

    openAddListModal() {
        this.showAddListModal = true;
    }

    closeAddListModal() {
        this.showAddListModal = false;
    }

    openDeleteConfirmModal() {
        this.showDeleteConfirmModal = true;
    }

    closeDeleteConfirmModal() {
        this.showDeleteConfirmModal = false;
    }

    openSettingsModal() {
        this.showSettingsModal = true;
    }

    closeSettingsModal() {
        this.showSettingsModal = false;
    }

    openProjectModal() {
        this.showProjectModal = true;
    }

    closeProjectModal() {
        this.showProjectModal = false;
    }

    // Methods for expanded lists
    toggleExpanded(listId: string) {
        if (this.expandedLists.has(listId)) {
            this.expandedLists.delete(listId);
        } else {
            this.expandedLists.add(listId);
        }
        // Trigger reactivity
        this.expandedLists = new Set(this.expandedLists);
    }

    isExpanded(listId: string): boolean {
        return this.expandedLists.has(listId);
    }

    // Methods for undo/redo
    addToHistory(value: DescriptionHistoryItem) {
        // Remove any history after current index
        this.descriptionHistory = this.descriptionHistory.slice(0, this.descriptionHistoryIndex + 1);

        // Add new value
        this.descriptionHistory.push(value);
        this.descriptionHistoryIndex = this.descriptionHistory.length - 1;

        // Limit history to 50 entries
        if (this.descriptionHistory.length > 50) {
            this.descriptionHistory.shift();
            this.descriptionHistoryIndex--;
        }
    }

    undo(): DescriptionHistoryItem | null {
        if (this.descriptionHistoryIndex > 0) {
            this.descriptionHistoryIndex--;
            return this.descriptionHistory[this.descriptionHistoryIndex];
        }
        return null;
    }

    redo(): DescriptionHistoryItem | null {
        if (this.descriptionHistoryIndex < this.descriptionHistory.length - 1) {
            this.descriptionHistoryIndex++;
            return this.descriptionHistory[this.descriptionHistoryIndex];
        }
        return null;
    }

    canUndo(): boolean {
        return this.descriptionHistoryIndex > 0;
    }

    canRedo(): boolean {
        return this.descriptionHistoryIndex < this.descriptionHistory.length - 1;
    }

    resetHistory() {
        this.descriptionHistory = [];
        this.descriptionHistoryIndex = -1;
    }

    // Saving indicator
    setSaving(saving: boolean) {
        this.isSaving = saving;
    }

    // Last used color for lists
    setLastUsedColor(color: string | null) {
        this.lastUsedColor = color;
    }
}

export const uiStore = new UIStore();
