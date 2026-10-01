<script lang="ts">
  import { setContext } from "svelte";
  import {
    DESCRIPTION_CONTEXT_KEY,
    type DescriptionContext,
  } from "$lib/contexts";
  import { onMount } from "svelte";
  import { projectStore } from "$lib/stores/project.svelte";
  import { settingsStore } from "$lib/stores/settings.svelte";
  import { uiStore } from "$lib/stores/ui.svelte";

  import { t } from "$lib/utils/i18n";
  import TopBar from "$lib/components/TopBar.svelte";
  import ListTable from "$lib/components/ListTable.svelte";
  import DescriptionPanel from "$lib/components/DescriptionPanel.svelte";

  import FirstLaunchModal from "$lib/components/modals/FirstLaunchModal.svelte";
  import AddListModal from "$lib/components/modals/AddListModal.svelte";
  import DeleteConfirmModal from "$lib/components/modals/DeleteConfirmModal.svelte";
  import SettingsModal from "$lib/components/modals/SettingsModal.svelte";
  import ProjectModal from "$lib/components/modals/ProjectModal.svelte";

  // Shared context for description saving
  // So we can save the description when the user changes the list or edit the description
  const descriptionCtx: DescriptionContext = {
    save: () => {},
  };
  setContext(DESCRIPTION_CONTEXT_KEY, descriptionCtx);

  onMount(() => {
    // Check if there's a current project or try to load the last project
    if (!settingsStore.currentProjectPath) {
      uiStore.openFirstLaunchModal();
    } else {
      projectStore.loadProject(settingsStore.currentProjectPath);
    }
  });
</script>

<div class="flex flex-col h-screen w-screen overflow-hidden bg-primary">
  <!-- Main Content -->
  <TopBar />
  <div class="flex flex-1 overflow-hidden relative">
    {#if !uiStore.isListCollapsed}
      <ListTable />
    {/if}
    <DescriptionPanel />

    {#if uiStore.isListCollapsed}
      <button
        class="fixed left-0 top-1/2 -translate-y-1/2 w-6 h-16 bg-primary border border-border border-l-0 rounded-r-lg cursor-pointer flex items-center justify-center text-text z-100 hover:bg-tertiary transition-all hover:w-9 shadow-md"
        onclick={() => uiStore.toggleListCollapse()}
        title={t("expandList", settingsStore.language)}
        aria-label={t("expandList", settingsStore.language)}
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path
            d="M6 4L10 8L6 12"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </button>
    {/if}
  </div>

  <!-- Modals -->
  <FirstLaunchModal />
  <AddListModal />
  <DeleteConfirmModal />
  <SettingsModal />
  <ProjectModal />
</div>
