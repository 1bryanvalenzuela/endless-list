<script lang="ts">
    import { uiStore } from "$lib/stores/ui.svelte";
    import { projectStore } from "$lib/stores/project.svelte";
    import { settingsStore } from "$lib/stores/settings.svelte";
    import { t } from "$lib/utils/i18n";
    import { open } from "@tauri-apps/plugin-dialog";
    import { save } from "@tauri-apps/plugin-dialog";

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
                filePath.split(/[/\\]/).pop()?.replace(".json", "") ||
                "New Project";
            const success = await projectStore.createProject(
                projectName,
                filePath,
            );

            if (success) {
                uiStore.closeProjectModal();
            }
        }
    }

    async function handleOpenProject() {
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
                uiStore.closeProjectModal();
            }
        }
    }

    function handleCancel() {
        uiStore.closeProjectModal();
    }

    function handleKeydown(e: KeyboardEvent) {
        if (e.key === "Escape") {
            handleCancel();
        }
    }
</script>

{#if uiStore.showProjectModal}
    <ModalContainer
        onclick={handleCancel}
        onkeydown={handleKeydown}
        ariaLabelledBy="project-title"
    >
        <h2 id="project-title" class="pb-4 text-text text-xl font-semibold">
            {t("projectManagement", settingsStore.language)}
        </h2>

        <div class="flex flex-col gap-4">
            <Button onclick={handleCreateProject} class="h-12">
                {t("createNewProject", settingsStore.language)}
            </Button>

            <Button style="confirm" onclick={handleOpenProject} class="h-12">
                {t("openExistingProject", settingsStore.language)}
            </Button>
        </div>
    </ModalContainer>
{/if}
