<script lang="ts">
    import { projectStore } from "$lib/stores/project.svelte";
    import { settingsStore } from "$lib/stores/settings.svelte";
    import { t } from "$lib/utils/i18n";
    import ListRow from "./ListRow.svelte";

    const project = $derived(projectStore.project);
    const hasLists = $derived(projectStore.project?.lists.length ?? 0 > 0);
</script>

<div class="flex-1 p-1 overflow-auto bg-primary">
    {#if hasLists}
        {#each projectStore.project?.lists ?? [] as list (list.id)}
            <ListRow {list} level={0} />
        {/each}
    {:else if project}
        <div
            class="flex items-center justify-center h-full text-text-secondary text-base"
        >
            <p class="m-0">{t("emptyProject", settingsStore.language)}</p>
        </div>
    {:else}
        <div
            class="flex items-center justify-center h-full text-text-secondary text-base"
        >
            <p class="m-0">{t("noProjectLoaded", settingsStore.language)}</p>
        </div>
    {/if}
</div>
