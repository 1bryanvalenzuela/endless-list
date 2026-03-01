<script lang="ts">
    import { projectStore } from "$lib/stores/project.svelte";
    import { uiStore } from "$lib/stores/ui.svelte";
    import { settingsStore } from "$lib/stores/settings.svelte";
    import { t } from "$lib/utils/i18n";
    import { getContext } from "svelte";
    import {
        DESCRIPTION_CONTEXT_KEY,
        type DescriptionContext,
    } from "$lib/contexts";
    import Pencil from "~icons/lucide/pencil";
    import Check from "~icons/lucide/check";

    let description = $state("");
    let titleColor = $state<string | null>(null);
    let saveTimeout: number | null = null;
    let isSaving = $state(false);

    // Title editing state
    let isEditingTitle = $state(false);
    let editedTitle = $state("");
    let titleInputRef = $state<HTMLInputElement | null>(null);

    // Resizable panel state
    const MIN_WIDTH = 250;
    const REOPEN_WIDTH = MIN_WIDTH + 10;
    const DEFAULT_WIDTH = 350;
    const MAX_WIDTH = 600;

    let panelWidth = $state(DEFAULT_WIDTH);
    let isCollapsed = $state(false);
    let isResizing = $state(false);

    function saveDescription() {
        // Clear existing timeout if we are saving manually
        if (saveTimeout !== null) {
            clearTimeout(saveTimeout);
            saveTimeout = null;
            isSaving = false;
        }

        if (
            projectStore.selectedList &&
            description !== projectStore.selectedList.description
        ) {
            uiStore.addToHistory(description);
            projectStore.updateDescription(description);
        }
    }

    // Register save function in context
    const descriptionCtx = getContext<DescriptionContext>(
        DESCRIPTION_CONTEXT_KEY,
    );
    if (descriptionCtx) {
        descriptionCtx.save = saveDescription;
    }

    // Update local state when selected list changes
    $effect(() => {
        const list = projectStore.selectedList;
        if (list) {
            description = list.description;
            titleColor = list.titleColor;
            editedTitle = list.title;
            isEditingTitle = false;
        }
    });

    function handleDescriptionChange() {
        // Clear existing timeout
        if (saveTimeout !== null) {
            clearTimeout(saveTimeout);
        }
        isSaving = true;

        // Set new timeout for auto-save
        saveTimeout = window.setTimeout(() => {
            saveDescription();
            saveTimeout = null;
            isSaving = false;
        }, 3000);
    }

    function handleColorChange() {
        projectStore.updateTitleColor(titleColor);
    }

    function handleKeydown(e: KeyboardEvent) {
        if (e.ctrlKey && e.key === "z") {
            e.preventDefault();
            const previousValue = uiStore.undo();
            if (previousValue !== null) {
                description = previousValue;
                projectStore.updateDescription(description);
            }
        } else if (e.ctrlKey && e.key === "y") {
            e.preventDefault();
            const nextValue = uiStore.redo();
            if (nextValue !== null) {
                description = nextValue;
                projectStore.updateDescription(description);
            }
        }
    }

    // Title editing functions
    function toggleEditTitle() {
        isEditingTitle = true;
        // Focus the input after it's rendered
        setTimeout(() => {
            if (titleInputRef) {
                titleInputRef.focus();
                titleInputRef.select();
            }
        }, 0);
    }

    function saveTitleEdit() {
        if (
            editedTitle.trim() &&
            editedTitle !== projectStore.selectedList?.title
        ) {
            projectStore.updateTitle(editedTitle.trim());
        } else if (!editedTitle.trim() && projectStore.selectedList) {
            // Restore original title if empty
            editedTitle = projectStore.selectedList.title;
        }
        isEditingTitle = false;
    }

    function handleTitleKeydown(e: KeyboardEvent) {
        if (e.key === "Enter") {
            e.preventDefault();
            saveTitleEdit();
        } else if (e.key === "Escape") {
            // Cancel editing and restore original title
            if (projectStore.selectedList) {
                editedTitle = projectStore.selectedList.title;
            }
            isEditingTitle = false;
        }
    }

    // Resizing handlers
    function startResize(e: MouseEvent) {
        isResizing = true;
        e.preventDefault();

        document.body.classList.add("resizing");
        document.addEventListener("mousemove", handleResize);
        document.addEventListener("mouseup", stopResize);
    }

    function handleResize(e: MouseEvent) {
        if (!isResizing) return;

        const newWidth = window.innerWidth - e.clientX;

        if (newWidth < MIN_WIDTH) {
            // Collapse the panel
            isCollapsed = true;
            isResizing = false;
            panelWidth = REOPEN_WIDTH;
            document.body.classList.remove("resizing");
            document.removeEventListener("mousemove", handleResize);
            document.removeEventListener("mouseup", stopResize);
        } else if (newWidth <= MAX_WIDTH) {
            panelWidth = newWidth;
        } else {
            panelWidth = MAX_WIDTH;
        }
    }

    function stopResize() {
        isResizing = false;
        document.body.classList.remove("resizing");
        document.removeEventListener("mousemove", handleResize);
        document.removeEventListener("mouseup", stopResize);
    }

    function togglePanel() {
        isCollapsed = !isCollapsed;
        if (!isCollapsed && panelWidth < MIN_WIDTH) {
            panelWidth = DEFAULT_WIDTH;
        }
    }

    const isVisible = $derived(projectStore.selectedList !== null);

    // Dynamic horizontal padding: px-6 (24px) at MIN_WIDTH → px-12 (48px) at MAX_WIDTH
    const contentPaddingX = $derived(
        Math.round(
            24 +
                ((panelWidth - MIN_WIDTH) / (MAX_WIDTH - MIN_WIDTH)) *
                    (48 - 24),
        ),
    );
</script>

{#if isVisible}
    <!-- Expand button when collapsed -->
    {#if isCollapsed}
        <button
            class="fixed right-0 top-1/2 -translate-y-1/2 w-6 h-16 bg-primary border border-border border-r-0 rounded-l-lg cursor-pointer flex items-center justify-center text-text z-100 hover:bg-tertiary transition-all hover:w-9"
            onclick={togglePanel}
            title="Expand panel"
        >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path
                    d="M10 4L6 8L10 12"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                />
            </svg>
        </button>
    {/if}

    <!-- Main panel -->
    {#if !isCollapsed}
        <div
            class="relative bg-primary border-l border-border flex flex-row min-w-[150px] max-w-[600px] select-none"
            style="width: {panelWidth}px"
        >
            <!-- Resizer handle -->
            <button
                class="absolute left-0 top-0 bottom-0 w-1.5 bg-transparent cursor-col-resize z-10 border-0 p-0 hover:bg-accent hover:opacity-50 {isResizing
                    ? 'bg-accent opacity-80'
                    : ''}"
                onmousedown={startResize}
                aria-label="Resize panel"
            ></button>

            <div
                class="flex-1 flex flex-col py-6 gap-3 overflow-hidden"
                style="padding-left: {contentPaddingX}px; padding-right: {contentPaddingX}px"
            >
                <div class="flex items-top justify-between gap-3">
                    <div class="flex flex-col gap-3 flex-1 min-w-0">
                        <div class="flex items-center gap-3">
                            <button
                                class="bg-secondary/50 border border-border shadow-sm rounded-lg cursor-pointer leading-none text-sm p-1 peer hover:bg-secondary"
                                onclick={toggleEditTitle}
                                title={t("editTitle", settingsStore.language)}
                                aria-label={t(
                                    "editTitle",
                                    settingsStore.language,
                                )}
                            >
                                <Pencil class="text-accent" />
                            </button>
                            {#if isEditingTitle}
                                <input
                                    bind:this={titleInputRef}
                                    bind:value={editedTitle}
                                    onkeydown={handleTitleKeydown}
                                    onblur={saveTitleEdit}
                                    spellcheck="false"
                                    minlength={1}
                                    maxlength={40}
                                    class="px-2 h-9 w-full rounded-lg bg-tertiary outline-none text-text text-sm font-inherit"
                                    type="text"
                                />
                            {:else}
                                <h3
                                    class="truncate leading-9 h-9 w-full text-sm font-semibold px-2 text-text select-text"
                                >
                                    <span
                                        >{projectStore.selectedList
                                            ?.title}</span
                                    >
                                </h3>
                            {/if}
                        </div>
                    </div>
                    <div class="flex flex-col gap-3 shrink-0">
                        <div class="flex items-center justify-center gap-3">
                            <div class="relative w-6 h-6">
                                <input
                                    id="title-color-panel"
                                    type="color"
                                    bind:value={titleColor}
                                    onchange={handleColorChange}
                                    class="absolute top-0 left-0 w-6 h-6 border-0 rounded-full cursor-pointer opacity-0 peer z-2"
                                    title={t(
                                        "editColor",
                                        settingsStore.language,
                                    )}
                                    aria-label={t(
                                        "editColor",
                                        settingsStore.language,
                                    )}
                                />
                                <label
                                    for="title-color-panel"
                                    class="absolute top-0 left-0 w-6 h-6 rounded-full border outline-2 outline-accent/50 border-primary cursor-pointer pointer-events-none z-1 peer-hover:outline-accent peer-focus:outline-accent"
                                    style="background-color: {titleColor ||
                                        'var(--color-text)'}"
                                ></label>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="flex flex-col gap-3 flex-1">
                    <textarea
                        id="description-textarea"
                        bind:value={description}
                        oninput={handleDescriptionChange}
                        onkeydown={handleKeydown}
                        placeholder={t("description", settingsStore.language)}
                        class="flex-1 p-3 bg-tertiary dark:bg-tertiary-dark border border-border dark:border-border-dark rounded-lg text-text dark:text-text-dark text-sm font-inherit resize-none"
                    ></textarea>
                </div>

                <div
                    class="flex flex-row items-center text-center text-text-secondary dark:text-text-secondary-dark text-xs"
                >
                    <span class="flex-1">Ctrl+Z: Undo | Ctrl+Y: Redo</span>
                    {#if isSaving}
                        <div
                            class="flex justify-end items-center gap-2 text-success dark:text-success-dark text-xs"
                        >
                            <svg
                                class="h-6 w-6 animate-spin"
                                viewBox="0 0 100 100"
                            >
                                <circle
                                    fill="none"
                                    stroke-width="10"
                                    class="stroke-current opacity-0"
                                    cx="50"
                                    cy="50"
                                    r="40"
                                />
                                <circle
                                    fill="none"
                                    stroke-width="10"
                                    class="stroke-current"
                                    stroke-dasharray="250"
                                    stroke-dashoffset="75"
                                    cx="50"
                                    cy="50"
                                    r="40"
                                />
                            </svg>
                        </div>
                    {:else}
                        <div
                            class="flex justify-end items-center gap-2 text-success dark:text-success-dark text-xs"
                        >
                            <Check class="h-6 w-6" />
                        </div>
                    {/if}
                </div>
            </div>
        </div>
    {/if}
{/if}

<style>
    /* Prevent text selection during resize */
    :global(body.resizing) {
        user-select: none;
        cursor: col-resize !important;
    }
</style>
