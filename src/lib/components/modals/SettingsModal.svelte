<script lang="ts">
    import { uiStore } from "$lib/stores/ui.svelte";
    import {
        defaultSettings,
        settingsStore,
    } from "$lib/stores/settings.svelte";
    import { t } from "$lib/utils/i18n";

    import ModalContainer from "$ui/components/modalContainer.svelte";
    import Button from "$ui/components/button.svelte";
    import ColorButton from "$ui/components/colorButton.svelte";
    import Checkbox from "$ui/components/checkbox.svelte";

    let language = $state<"es" | "en">(settingsStore.language);
    let theme = $state<"light" | "dark" | "system">(settingsStore.theme);
    let defaultTitleColor = $state<string | null>(
        settingsStore.defaultTitleColor,
    );
    let dontShowAgain = $state<boolean>(settingsStore.showDeleteWarning);

    $effect(() => {
        if (uiStore.showSettingsModal) {
            language = settingsStore.language;
            theme = settingsStore.theme;
            defaultTitleColor = settingsStore.defaultTitleColor;
            dontShowAgain = settingsStore.showDeleteWarning;
        }
    });

    function handleSave() {
        settingsStore.setDefaultTitleColor(defaultTitleColor);
        settingsStore.setLanguage(language);
        settingsStore.setTheme(theme);
        settingsStore.setShowDeleteWarning(dontShowAgain);
        uiStore.closeSettingsModal();
    }

    function handleCancel() {
        uiStore.closeSettingsModal();
    }
    function handleKeydown(e: KeyboardEvent) {
        if (e.key === "Escape") {
            handleCancel();
        }
    }
</script>

{#if uiStore.showSettingsModal}
    <ModalContainer onkeydown={handleKeydown} ariaLabelledBy="settings-title">
        <h2 id="settings-title" class="pb-4 text-text text-xl font-semibold">
            {t("settingsTitle", settingsStore.language)}
        </h2>

        <div class="flex flex-col gap-4 pb-4">
            {#if settingsStore.currentProjectPath}
                <div class="flex flex-col gap-2">
                    <span
                        class="text-text dark:text-text-dark text-sm font-medium"
                        >{t("currentProject", settingsStore.language)}</span
                    >
                    <div
                        class="p-3 bg-tertiary dark:bg-tertiary-dark border border-border dark:border-border-dark rounded-lg text-text-secondary dark:text-text-secondary-dark text-sm break-all"
                    >
                        {settingsStore.currentProjectPath}
                    </div>
                </div>
            {/if}

            <div class="flex flex-row gap-4">
                <div class="flex w-full flex-col gap-2">
                    <label
                        for="language"
                        class="text-text dark:text-text-dark text-sm font-medium"
                        >{t("language", settingsStore.language)}</label
                    >
                    <select
                        id="language"
                        bind:value={language}
                        class="px-2 h-9 bg-tertiary border border-border rounded-lg text-text text-base cursor-pointer focus:outline-none"
                    >
                        <option value="es">Español</option>
                        <option value="en">English</option>
                    </select>
                </div>

                <div class="flex w-full flex-col gap-2">
                    <label
                        for="theme"
                        class="text-text dark:text-text-dark text-sm font-medium"
                        >{t("theme", settingsStore.language)}</label
                    >
                    <select
                        id="theme"
                        bind:value={theme}
                        class="px-2 h-9 bg-tertiary dark:bg-tertiary-dark border border-border dark:border-border-dark rounded-lg text-text dark:text-text-dark text-base cursor-pointer focus:outline-none focus:border-accent"
                    >
                        <option value="light"
                            >{t("light", settingsStore.language)}</option
                        >
                        <option value="dark"
                            >{t("dark", settingsStore.language)}</option
                        >
                        <option value="system"
                            >{t("system", settingsStore.language)}</option
                        >
                    </select>
                </div>
            </div>

            <div class="flex flex-row gap-4">
                <div class="flex w-full flex-col gap-2">
                    <label
                        for="default-title-color"
                        class="text-text dark:text-text-dark text-sm font-medium"
                        >{t("defaultTitleColor", settingsStore.language)}</label
                    >
                    <div class="flex items-center justify-start gap-2 pt-2">
                        <ColorButton
                            id="default-title-color"
                            bind:value={defaultTitleColor}
                        />
                    </div>
                </div>
                <div class="flex w-full items-center">
                    <Button
                        onclick={() => {
                            defaultTitleColor =
                                defaultSettings.defaultTitleColor;
                        }}
                        class="text-xs"
                    >
                        {t("restoreTitleColor", settingsStore.language)}
                    </Button>
                </div>
            </div>

            <div class="flex flex-row gap-4">
                <div class="flex w-full flex-col gap-2">
                    <label
                        for="default-dont-show-again"
                        class="text-text dark:text-text-dark text-sm font-medium"
                        >{t(
                            "defaultDeleteWarning",
                            settingsStore.language,
                        )}</label
                    >
                    <Checkbox
                        id="default-dont-show-again"
                        checked={dontShowAgain}
                        onclick={() => {
                            dontShowAgain = !dontShowAgain;
                        }}
                    >
                        <span
                            >{t(
                                "showDeleteWarning",
                                settingsStore.language,
                            )}</span
                        >
                    </Checkbox>
                </div>
            </div>
        </div>

        <div class="flex gap-2 justify-end">
            <Button onclick={handleCancel}>
                {t("cancel", settingsStore.language)}
            </Button>

            <Button style="confirm" onclick={handleSave}>
                {t("save", settingsStore.language)}
            </Button>
        </div>
    </ModalContainer>
{/if}
