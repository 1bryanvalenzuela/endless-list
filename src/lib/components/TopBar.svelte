<script lang="ts">
    import LucidePlus from "~icons/lucide/plus";
    import LucideMinus from "~icons/lucide/minus";
    import LucideSettings from "~icons/lucide/settings";
    import LucideArrowRightLeft from "~icons/lucide/arrow-right-left";
    import { uiStore } from "$lib/stores/ui.svelte";
    import { projectStore } from "$lib/stores/project.svelte";
    import { settingsStore } from "$lib/stores/settings.svelte";
    import { t } from "$lib/utils/i18n";

    function handleAdd() {
        uiStore.openAddListModal();
    }

    function handleDelete() {
        if (!projectStore.selectedListId) return;

        if (settingsStore.showDeleteWarning) {
            uiStore.openDeleteConfirmModal();
        } else {
            projectStore.deleteList(projectStore.selectedListId);
        }
    }

    function handleSettings() {
        uiStore.openSettingsModal();
    }

    function handleChangeProject() {
        uiStore.openProjectModal();
    }

    const canDelete = $derived(projectStore.selectedListId !== null);

    const buttonClass =
        "flex items-center gap-3 px-3 h-9 bg-secondary/50 rounded-lg text-text cursor-pointer border border-border shadow-sm hover:bg-secondary disabled:opacity-40 disabled:cursor-not-allowed";
</script>

<div
    class="flex items-center gap-3 justify-between p-3 bg-primary border-b border-border"
>
    <div class="flex gap-3">
        <button
            class={buttonClass}
            onclick={handleAdd}
            title={t("addList", settingsStore.language)}
            aria-label={t("addList", settingsStore.language)}
        >
            <LucidePlus class="text-accent" />
            <span>{t("addList", settingsStore.language)}</span>
        </button>

        <button
            class={buttonClass}
            onclick={handleDelete}
            disabled={!canDelete}
            title={t("deleteList", settingsStore.language)}
            aria-label={t("deleteList", settingsStore.language)}
        >
            <LucideMinus class="text-accent" />
            <span>{t("deleteList", settingsStore.language)}</span>
        </button>
    </div>

    <div class="flex gap-3">
        <button
            class={buttonClass}
            onclick={handleSettings}
            title={t("settings", settingsStore.language)}
            aria-label={t("settings", settingsStore.language)}
        >
            <LucideSettings class="text-accent" />
            <span>{t("settings", settingsStore.language)}</span>
        </button>
        <button class={buttonClass} onclick={handleChangeProject}>
            <LucideArrowRightLeft class="text-accent" />
            <span>{t("changeProject", settingsStore.language)}</span>
        </button>
    </div>
</div>
