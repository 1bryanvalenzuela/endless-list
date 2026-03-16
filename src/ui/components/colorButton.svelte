<script lang="ts">
    import { t } from "$lib/utils/i18n";
    import { settingsStore } from "$lib/stores/settings.svelte";

    let { id, value = $bindable(), ...props } = $props();
</script>

<div class="relative w-6 h-6">
    <input
        {id}
        type="color"
        bind:value
        {...props}
        class="absolute top-0 left-0 w-6 h-6 border-0 rounded-full cursor-pointer opacity-0 peer z-2"
        title={t("editColor", settingsStore.language)}
        aria-label={t("editColor", settingsStore.language)}
    />
    <label
        for={id}
        class="absolute top-0 left-0 w-6 h-6 rounded-full border outline-2 outline-accent/50 border-primary cursor-pointer pointer-events-none z-1 peer-hover:outline-accent peer-focus:outline-accent"
        style="background-color: {value || 'var(--color-text)'}"
    ></label>
</div>
