<script lang="ts">
    import { uiStore } from "$lib/stores/ui.svelte";
    import { projectStore } from "$lib/stores/project.svelte";
    import { settingsStore } from "$lib/stores/settings.svelte";
    import { t } from "$lib/utils/i18n";

    import ModalContainer from "$ui/components/modalContainer.svelte";
    import Checkbox from "$ui/components/checkbox.svelte";
    import Button from "$ui/components/button.svelte";
    import ColorButton from "$ui/components/colorButton.svelte";
    import ColorChip from "$ui/components/colorChip.svelte";

    type ColorSource = "default" | "lastUsed" | "selectedList" | "custom";

    let title = $state("");
    let titleColor = $state<string | null>(settingsStore.defaultTitleColor);
    let colorSource = $state<ColorSource>("default");
    let addToRoot = $state(false);
    let isListSelected = $derived(projectStore.selectedList !== null);
    let lastUsedColor = $derived(uiStore.lastUsedColor);
    let selectedListColor = $derived(
        projectStore.selectedList?.titleColor ?? null,
    );

    $effect(() => {
        // Reset form when modal opens
        if (uiStore.showAddListModal) {
            title = "";
            titleColor = settingsStore.defaultTitleColor;
            colorSource = "default";
            addToRoot = !isListSelected;
        }
    });

    $effect(() => {
        if (colorSource === "default") {
            titleColor = settingsStore.defaultTitleColor;
        } else if (colorSource === "lastUsed" && lastUsedColor) {
            titleColor = lastUsedColor;
        } else if (colorSource === "selectedList" && selectedListColor) {
            titleColor = selectedListColor;
        }
    });

    function selectColorSource(source: ColorSource) {
        if (source === colorSource) return;
        colorSource = source;
    }

    function handleColorInput() {
        colorSource = "custom";
    }

    function handleConfirm() {
        if (!title.trim()) return;

        const color = titleColor || settingsStore.defaultTitleColor;
        projectStore.addList(title.trim(), color, addToRoot);
        if (color !== settingsStore.defaultTitleColor) {
            uiStore.setLastUsedColor(color);
        }
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
        className="flex flex-col gap-4"
    >
        <h2 id="add-list-title" class="text-text text-xl font-semibold">
            {t("addNewList", settingsStore.language)}
        </h2>

        <div class="flex flex-col gap-2">
            <span class="text-text text-sm font-medium"
                >{t("colorSource", settingsStore.language)}</span
            >
            <div class="flex flex-wrap justify-center gap-4">
                <ColorChip
                    id="color-source-default"
                    label={t("defaultColor", settingsStore.language)}
                    color={settingsStore.defaultTitleColor}
                    selected={colorSource === "default"}
                    onclick={() => selectColorSource("default")}
                />
                <ColorChip
                    id="color-source-last-used"
                    label={t("lastUsedColor", settingsStore.language)}
                    color={lastUsedColor}
                    selected={colorSource === "lastUsed"}
                    disabled={!lastUsedColor}
                    onclick={() => {
                        if (lastUsedColor) selectColorSource("lastUsed");
                    }}
                />
                <ColorChip
                    id="color-source-selected-list"
                    label={t("selectedListColor", settingsStore.language)}
                    color={selectedListColor}
                    selected={colorSource === "selectedList"}
                    disabled={!selectedListColor}
                    onclick={() => {
                        if (selectedListColor)
                            selectColorSource("selectedList");
                    }}
                />
            </div>
        </div>

        <div class="flex flex-col gap-4">
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
                        <ColorButton
                            id="title-color"
                            bind:value={titleColor}
                            oninput={handleColorInput}
                        />
                    </div>
                </div>
            </div>

            <div class="flex flex-col gap-2">
                <Checkbox
                    id="add-to-root"
                    checked={addToRoot}
                    onclick={() => {
                        if (isListSelected) addToRoot = !addToRoot;
                    }}
                    disabled={!isListSelected}
                    class={isListSelected ? "cursor-pointer" : "opacity-40"}
                >
                    <span class={isListSelected ? "" : "opacity-40"}
                        >{t("addToRoot", settingsStore.language)}</span
                    >
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
