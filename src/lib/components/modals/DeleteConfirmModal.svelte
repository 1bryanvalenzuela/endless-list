<script lang="ts">
    import { uiStore } from "$lib/stores/ui.svelte";
    import { projectStore } from "$lib/stores/project.svelte";
    import { settingsStore } from "$lib/stores/settings.svelte";
    import { t } from "$lib/utils/i18n";

    import ModalContainer from "$ui/components/modalContainer.svelte";
    import Checkbox from "$ui/components/checkbox.svelte";
    import Button from "$ui/components/button.svelte";

    let dontShowAgain = $state(false);

    $effect(() => {
        if (uiStore.showDeleteConfirmModal) {
            dontShowAgain = false;
        }
    });

    function handleConfirm() {
        if (!projectStore.selectedListId) return;

        if (dontShowAgain) {
            settingsStore.setShowDeleteWarning(false);
        }

        projectStore.deleteList(projectStore.selectedListId);
        uiStore.closeDeleteConfirmModal();
    }

    function handleCancel() {
        uiStore.closeDeleteConfirmModal();
    }

    const childCount = $derived(() => {
        const list = projectStore.selectedList;
        return list ? projectStore.countNestedLists(list) : 0;
    });
    function handleKeydown(e: KeyboardEvent) {
        if (e.key === "Escape") {
            handleCancel();
        }
    }
</script>

{#if uiStore.showDeleteConfirmModal}
    <ModalContainer
        onclick={handleCancel}
        onkeydown={handleKeydown}
        ariaLabelledBy="delete-confirm-title"
    >
        <h2
            id="delete-confirm-title"
            class="pb-4 text-text text-xl font-semibold"
        >
            {t("deleteConfirmation", settingsStore.language)}
        </h2>

        <div class="flex flex-col gap-4 mb-4">
            {#if childCount() > 0}
                <p class="text-text leading-relaxed">
                    {t("deleteWarningWithChildren", settingsStore.language, {
                        count: childCount(),
                    })}
                </p>
            {:else}
                <p class="text-text leading-relaxed">
                    {t("deleteWarning", settingsStore.language)}
                </p>
            {/if}

            <Checkbox
                checked={dontShowAgain}
                onclick={() => {
                    dontShowAgain = !dontShowAgain;
                }}
            >
                <span>{t("dontShowAgain", settingsStore.language)}</span>
            </Checkbox>
        </div>

        <div class="flex gap-2 justify-end">
            <Button onclick={handleCancel}>
                {t("cancel", settingsStore.language)}
            </Button>

            <Button style="confirm" onclick={handleConfirm}>
                {t("confirm", settingsStore.language)}
            </Button>
        </div>
    </ModalContainer>
{/if}
