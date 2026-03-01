<script lang="ts">
    import { uiStore } from "$lib/stores/ui.svelte";
    import { projectStore } from "$lib/stores/project.svelte";
    import { settingsStore } from "$lib/stores/settings.svelte";
    import { t } from "$lib/utils/i18n";
    import { getDefaultTitleColor } from "$lib/utils/theme";

    import ModalContainer from "$ui/components/modalContainer.svelte";
    import Checkbox from "$ui/components/checkbox.svelte";
    import Button from "$ui/components/button.svelte";

    let title = $state("");
    let titleColor = $state<string | null>(null);
    let addToRoot = $state(false);
    let isSelected = $derived(projectStore.selectedList !== null);

    $effect(() => {
        // Reset form when modal opens
        if (uiStore.showAddListModal) {
            title = "";
            titleColor = getDefaultTitleColor(settingsStore.theme);
            addToRoot = !isSelected;
        }
    });

    function handleConfirm() {
        if (!title.trim()) return;

        const color = titleColor || getDefaultTitleColor(settingsStore.theme);
        projectStore.addList(title.trim(), color, addToRoot);
        uiStore.closeAddListModal();
    }

    function handleCancel() {
        uiStore.closeAddListModal();
    }

    function handleKeydown(e: KeyboardEvent) {
        if (e.key === "Enter" && title.trim()) {
            handleConfirm();
        } else if (e.key === "Escape") {
            handleCancel();
        }
    }
    function handleOverlayKeydown(e: KeyboardEvent) {
        if (e.key === "Escape") {
            handleCancel();
        }
    }
</script>

{#if uiStore.showAddListModal}
    <ModalContainer
        onkeydown={handleOverlayKeydown}
        ariaLabelledBy="add-list-title"
    >
        <h2 id="add-list-title" class="pb-4 text-text text-xl font-semibold">
            {t("addNewList", settingsStore.language)}
        </h2>

        <div class="flex flex-col gap-4 pb-4">
            <div class="flex flex-row gap-4">
                <div class="flex w-full flex-col gap-2">
                    <label
                        for="list-title"
                        class="text-text text-sm font-medium"
                        >{t("listTitle", settingsStore.language)}</label
                    >
                    <input
                        id="list-title"
                        type="text"
                        bind:value={title}
                        autocomplete="off"
                        onkeydown={handleKeydown}
                        placeholder={t("titleRequired", settingsStore.language)}
                        class="p-3 h-9 bg-tertiary border border-border rounded-lg text-text text-sm focus:outline-none"
                    />
                </div>

                <div class="flex shrink-0 flex-col gap-2">
                    <label
                        for="title-color"
                        class="text-text text-sm font-medium"
                        >{t("titleColor", settingsStore.language)}</label
                    >
                    <div class="flex items-center justify-center gap-2 pt-2">
                        <div class="relative w-6 h-6">
                            <input
                                id="title-color-panel"
                                type="color"
                                bind:value={titleColor}
                                class="absolute top-0 left-0 w-6 h-6 border-0 rounded-full cursor-pointer opacity-0 peer z-2"
                                title={t("editColor", settingsStore.language)}
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

            <div class="flex flex-col gap-2">
                <Checkbox
                    {isSelected}
                    checked={addToRoot}
                    onclick={() => {
                        if (isSelected) addToRoot = !addToRoot;
                    }}
                    disabled={!isSelected}
                    class={isSelected ? "cursor-pointer" : "opacity-40"}
                >
                    <span>{t("addToRoot", settingsStore.language)}</span>
                </Checkbox>
            </div>
        </div>

        <div class="flex gap-2 justify-end">
            <Button onclick={handleCancel}>
                {t("cancel", settingsStore.language)}
            </Button>

            <Button
                style="confirm"
                onclick={handleConfirm}
                disabled={!title.trim()}
            >
                {t("confirm", settingsStore.language)}
            </Button>
        </div>
    </ModalContainer>
{/if}
