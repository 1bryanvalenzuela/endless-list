<script lang="ts">
    import type { Snippet } from "svelte";
    import LucideCheck from "~icons/lucide/check";

    interface Props {
        isSelected?: boolean;
        checked: boolean;
        onclick: () => void;
        disabled?: boolean;
        children: Snippet;
        class?: string;
        [key: string]: any;
    }

    let {
        isSelected = false,
        checked,
        onclick,
        disabled = false,
        children,
        class: className,
        ...rest
    }: Props = $props();
</script>

<label
    class="flex flex-row items-center gap-2 text-text text-sm font-medium"
    {...rest}
>
    <button
        type="button"
        {onclick}
        {disabled}
        aria-checked={checked}
        role="checkbox"
        class="w-[18px] cursor-pointer h-[18px] flex items-center justify-center rounded border transition-colors shrink-0
        {checked ? 'bg-accent border-accent' : 'bg-tertiary border-border'} 
        {className}"
    >
        {#if checked}
            <LucideCheck class="w-3 h-3 text-primary pointer-events-none" />
        {/if}
    </button>
    <span>{@render children()}</span>
</label>
