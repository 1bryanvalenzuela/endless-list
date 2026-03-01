<script lang="ts">
    import type { Snippet } from "svelte";

    interface Props {
        onclick: () => void;
        style?: "default" | "confirm";
        children: Snippet;
        disabled?: boolean;
        class?: string;
    }

    let {
        onclick,
        style = "default",
        children,
        disabled = false,
        class: className = "",
    }: Props = $props();

    let buttonClass = () =>
        style === "confirm"
            ? "flex items-center gap-3 px-3 h-9 bg-secondary/50 rounded-lg text-text cursor-pointer border border-accent/50 hover:border-accent/80 shadow-sm hover:bg-secondary disabled:opacity-40 disabled:cursor-not-allowed"
            : "flex items-center gap-3 px-3 h-9 bg-secondary/50 rounded-lg text-text cursor-pointer border border-border shadow-sm hover:bg-secondary disabled:opacity-40 disabled:cursor-not-allowed";
</script>

<button class={buttonClass() + " " + className} {onclick} {disabled}>
    {@render children()}
</button>
