<script lang="ts">
    import type { Snippet } from "svelte";

    interface Props {
        onclick?: (e: MouseEvent) => void;
        onkeydown?: (e: KeyboardEvent) => void;
        ariaLabelledBy: string;
        children: Snippet;
    }

    let { onclick, onkeydown, ariaLabelledBy, children }: Props = $props();
</script>

<div
    class="fixed select-none inset-0 bg-black/60 flex items-center justify-center z-50"
    {onclick}
    {onkeydown}
    role="button"
    tabindex="0"
    aria-label="Close modal"
>
    <div
        class="bg-primary border border-border rounded-lg p-8 min-w-[450px] max-w-[500px]"
        onclick={(e) => e.stopPropagation()}
        onkeydown={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby={ariaLabelledBy}
        tabindex="-1"
    >
        {@render children()}
    </div>
</div>
