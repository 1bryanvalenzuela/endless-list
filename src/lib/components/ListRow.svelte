<script lang="ts">
    import type { List } from "$lib/types";
    import { projectStore } from "$lib/stores/project.svelte";
    import { uiStore } from "$lib/stores/ui.svelte";
    import { getContext } from "svelte";
    import {
        DESCRIPTION_CONTEXT_KEY,
        type DescriptionContext,
    } from "$lib/contexts";
    import ListRow from "./ListRow.svelte";

    interface Props {
        list: List;
        level?: number;
    }

    let { list, level = 0 }: Props = $props();

    const isSelected = $derived(projectStore.selectedListId === list.id);
    const isExpanded = $derived(uiStore.isExpanded(list.id));
    const hasChildren = $derived(list.lists.length > 0);

    // Load description context to save description changes when selecting another list
    const descriptionCtx = getContext<DescriptionContext>(
        DESCRIPTION_CONTEXT_KEY,
    );

    function handleClick(e: MouseEvent) {
        e.stopPropagation();
        descriptionCtx?.save();
        projectStore.selectList(list.id);
    }

    function handleDoubleClick() {
        if (hasChildren) {
            uiStore.toggleExpanded(list.id);
        }
    }

    function handleToggleExpand(e: MouseEvent) {
        e.stopPropagation();
        uiStore.toggleExpanded(list.id);
    }

    function handleKeydown(e: KeyboardEvent) {
        if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            handleClick(e as any);
        }
    }
</script>

<div class="w-full">
    <div
        class="flex items-center gap-2 py-2 cursor-pointer border-b border-border select-none {isSelected
            ? 'bg-accent-hover/75 text-white'
            : 'hover:bg-accent-hover/25'}"
        style="padding-left: {level * 1 + 1}rem"
        onclick={(e) => handleClick(e)}
        ondblclick={handleDoubleClick}
        onkeydown={handleKeydown}
        role="button"
        tabindex="0"
    >
        {#if hasChildren}
            <button
                class="w-6 h-6 flex items-center justify-center bg-transparent border-0 text-text cursor-pointer shrink-0 {isExpanded
                    ? ''
                    : '-rotate-90'} {isSelected
                    ? 'text-white'
                    : 'hover:text-accent'}"
                onclick={handleToggleExpand}
                aria-label={isExpanded ? "Collapse" : "Expand"}
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                >
                    <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
            </button>
        {:else}
            <div class="w-6 shrink-0"></div>
        {/if}

        <div class="flex-1 min-w-0">
            <span
                class="text-[0.95rem] font-medium whitespace-nowrap overflow-hidden text-ellipsis {isSelected
                    ? 'text-white font-semibold'
                    : ''}"
                style="color: {isSelected ? 'white' : list.titleColor || ''}"
            >
                {list.title}
            </span>
        </div>
    </div>

    {#if hasChildren && isExpanded}
        <div class="w-full">
            {#each list.lists as childList (childList.id)}
                <ListRow list={childList} level={level + 1} />
            {/each}
        </div>
    {/if}
</div>
