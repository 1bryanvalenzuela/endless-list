<script lang="ts">
    interface Props {
        id: string;
        label: string;
        color: string | null;
        selected?: boolean;
        disabled?: boolean;
        onclick: () => void;
    }

    let {
        id,
        label,
        color,
        selected = false,
        disabled = false,
        onclick,
    }: Props = $props();
</script>

<button
    {id}
    type="button"
    {onclick}
    {disabled}
    class="inline-flex items-center gap-1.5 py-1.5 px-2.5 rounded-full border-[1.5px] border-border bg-tertiary text-text text-[0.8rem] font-medium cursor-pointer transition-all duration-200 ease-in-out whitespace-nowrap select-none
        {selected ? 'border-accent bg-accent/14 ring-1 ring-accent' : ''}
        {disabled
        ? 'opacity-40 cursor-not-allowed'
        : 'hover:border-accent hover:bg-accent/8'}"
    aria-pressed={selected}
>
    <span
        class="w-3.5 h-3.5 rounded-full border-[1.5px] border-text/20 shrink-0"
        style="background-color: {color || 'var(--color-text)'}"
    ></span>
    <span class="leading-none">{label}</span>
</button>
