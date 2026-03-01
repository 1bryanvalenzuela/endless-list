import type { Project, List } from '$lib/types';
import { invoke } from '@tauri-apps/api/core';
import { settingsStore } from './settings.svelte';
import { uiStore } from './ui.svelte';

class ProjectStore {
    private _project = $state<Project | null>(null);
    private _selectedListId = $state<string | null>(null);
    private saveTimeout: number | null = null;

    get project(): Project | null {
        return this._project;
    }

    get selectedListId(): string | null {
        return this._selectedListId;
    }

    get selectedList(): List | null {
        if (!this._selectedListId || !this._project) return null;
        return this.findListById(this._selectedListId, this._project.lists);
    }

    get hasProject(): boolean {
        return this._project !== null;
    }

    // Create a new project
    async createProject(name: string, path: string) {
        const newProject: Project = {
            name,
            version: '1.0.0',
            lists: [],
            createdAt: Date.now(),
            updatedAt: Date.now(),
        };

        try {
            await invoke('save_project', { path, project: newProject });
            this._project = newProject;
            settingsStore.setCurrentProjectPath(path);
            return true;
        } catch (error) {
            console.error('Failed to create project:', error);
            return false;
        }
    }

    // Load an existing project
    async loadProject(path: string) {
        try {
            const project = await invoke<Project>('load_project', { path });
            this._project = project;
            settingsStore.setCurrentProjectPath(path);
            this._selectedListId = null;
            uiStore.resetHistory();
            return true;
        } catch (error) {
            console.error('Failed to load project:', error);
            return false;
        }
    }

    // Save the current project
    async saveProject() {
        if (!this._project || !settingsStore.currentProjectPath) return;

        this._project.updatedAt = Date.now();

        try {
            uiStore.setSaving(true);
            await invoke('save_project', {
                path: settingsStore.currentProjectPath,
                project: this._project,
            });
            uiStore.setSaving(false);
        } catch (error) {
            console.error('Failed to save project:', error);
            uiStore.setSaving(false);
        }
    }

    // Auto-save with debouncing
    autoSave() {
        if (this.saveTimeout !== null) {
            clearTimeout(this.saveTimeout);
        }

        this.saveTimeout = window.setTimeout(() => {
            this.saveProject();
            this.saveTimeout = null;
        }, 3000);
    }

    // Add a new list
    addList(title: string, titleColor: string | null, addToRoot: boolean) {
        if (!this._project) return;

        const newList: List = {
            id: crypto.randomUUID(),
            title,
            titleColor,
            description: '',
            lists: [],
            createdAt: Date.now(),
            updatedAt: Date.now(),
        };

        if (addToRoot || !this._selectedListId) {
            this._project.lists.push(newList);
        } else {
            const parentList = this.findListById(this._selectedListId, this._project.lists);
            if (parentList) {
                parentList.lists.push(newList);
                parentList.updatedAt = Date.now();
            }
        }

        this.saveProject();
    }

    // Delete a list
    deleteList(listId: string) {
        if (!this._project) return;

        this._project.lists = this.removeListById(listId, this._project.lists);

        if (this._selectedListId === listId) {
            this._selectedListId = null;
        }

        this.saveProject();
    }

    // Select a list
    selectList(listId: string | null) {
        this._selectedListId = listId;

        if (listId) {
            const list = this.selectedList;
            if (list) {
                uiStore.resetHistory();
                uiStore.addToHistory(list.description);
            }
        }
    }

    // Update list description
    updateDescription(description: string) {
        const list = this.selectedList;
        if (!list) return;

        list.description = description;
        list.updatedAt = Date.now();
        this.autoSave();
    }

    // Update list title color
    updateTitleColor(color: string | null) {
        const list = this.selectedList;
        if (!list || !this._project) return;

        list.titleColor = color;
        list.updatedAt = Date.now();
        this.saveProject();
    }

    // Update list title
    updateTitle(title: string) {
        const list = this.selectedList;
        if (!list || !this._project) return;

        list.title = title;
        list.updatedAt = Date.now();
        this.saveProject();
    }

    // Helper: Find a list by ID recursively
    private findListById(id: string, lists: List[]): List | null {
        for (const list of lists) {
            if (list.id === id) return list;

            const found = this.findListById(id, list.lists);
            if (found) return found;
        }

        return null;
    }

    // Helper: Remove a list by ID recursively
    private removeListById(id: string, lists: List[]): List[] {
        return lists.filter(list => {
            if (list.id === id) return false;
            list.lists = this.removeListById(id, list.lists);
            return true;
        });
    }

    // Helper: Count nested lists
    countNestedLists(list: List): number {
        let count = list.lists.length;
        for (const child of list.lists) {
            count += this.countNestedLists(child);
        }
        return count;
    }
}

export const projectStore = new ProjectStore();
