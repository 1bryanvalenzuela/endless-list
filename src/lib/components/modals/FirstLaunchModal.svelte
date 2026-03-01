<script lang="ts">
  import { uiStore } from "$lib/stores/ui.svelte";
  import { projectStore } from "$lib/stores/project.svelte";
  import { settingsStore } from "$lib/stores/settings.svelte";
  import { t } from "$lib/utils/i18n";
  import { open, save } from "@tauri-apps/plugin-dialog";

  import ModalContainer from "$ui/components/modalContainer.svelte";
  import Button from "$ui/components/button.svelte";

  async function handleCreateProject() {
    const filePath = await save({
      filters: [
        {
          name: "JSON",
          extensions: ["json"],
        },
      ],
    });

    if (filePath) {
      const projectName =
        filePath.split(/[/\\]/).pop()?.replace(".json", "") || "New Project";
      const success = await projectStore.createProject(projectName, filePath);

      if (success) {
        uiStore.closeFirstLaunchModal();
      }
    }
  }

  async function handleImportProject() {
    const selected = await open({
      multiple: false,
      filters: [
        {
          name: "JSON",
          extensions: ["json"],
        },
      ],
    });

    if (selected && typeof selected === "string") {
      const success = await projectStore.loadProject(selected);

      if (success) {
        uiStore.closeFirstLaunchModal();
      }
    }
  }
</script>

{#if uiStore.showFirstLaunchModal}
  <ModalContainer ariaLabelledBy="welcome-title">
    <h2 id="welcome-title" class="pb-4 text-text text-xl font-semibold">
      {t("welcome", settingsStore.language)}
    </h2>

    <div class="flex flex-col gap-4">
      <Button style="confirm" onclick={handleCreateProject} class="w-full h-12">
        {t("createNewProject", settingsStore.language)}
      </Button>

      <Button onclick={handleImportProject} class="w-full h-12">
        {t("importProject", settingsStore.language)}
      </Button>
    </div>
  </ModalContainer>
{/if}
