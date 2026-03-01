<script lang="ts">
    import { uiStore } from "$lib/stores/ui.svelte";
    import { settingsStore } from "$lib/stores/settings.svelte";
    import { t } from "$lib/utils/i18n";

    import ModalContainer from "$ui/components/modalContainer.svelte";
    import Button from "$ui/components/button.svelte";

    let language = $state<"es" | "en">(settingsStore.language);
    let theme = $state<"light" | "dark" | "system">(settingsStore.theme);

    $effect(() => {
        if (uiStore.showSettingsModal) {
            language = settingsStore.language;
            theme = settingsStore.theme;
        }
    });

    function handleSave() {
        settingsStore.setLanguage(language);
        settingsStore.setTheme(theme);
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
