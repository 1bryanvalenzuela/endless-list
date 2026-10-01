<script lang="ts">
  import { projectStore } from "$lib/stores/project.svelte";
  import { uiStore } from "$lib/stores/ui.svelte";
  import { settingsStore } from "$lib/stores/settings.svelte";
  import { t } from "$lib/utils/i18n";
  import { getContext } from "svelte";
  import {
    DESCRIPTION_CONTEXT_KEY,
    type DescriptionContext,
  } from "$lib/contexts";
  import { renderMarkdown, getLocalImageBlobUrl } from "$lib/utils/markdown";
  import Pencil from "~icons/lucide/pencil";
  import Check from "~icons/lucide/check";
  import Undo2 from "~icons/lucide/undo-2";
  import Redo2 from "~icons/lucide/redo-2";
  import LucideX from "~icons/lucide/x";
  import ColorButton from "$ui/components/colorButton.svelte";

  function resolveLocalImages(node: HTMLElement, _dep?: string) {
    function processImages() {
      const imgs = node.querySelectorAll<HTMLImageElement>(
        "img[data-local-src]",
      );
      imgs.forEach(async (img) => {
        const localPath = img.getAttribute("data-local-src");
        if (!localPath) return;

        try {
          const blobUrl = await getLocalImageBlobUrl(localPath);
          if (img.src !== blobUrl) {
            img.src = blobUrl;
          }
        } catch (e) {
          console.error("Failed to load local image:", localPath, e);
        }
      });
    }

    processImages();

    return {
      update() {
        processImages();
      },
    };
  }

  let description = $state("");
  let titleColor = $state<string | null>(null);
  let saveTimeout: number | null = null;
  let isSaving = $state(false);

  let canRedo = $derived(uiStore.canRedo());
  let canUndo = $derived(uiStore.canUndo());

  // Edit mode state: starts false (read mode) automatically
  let isEditing = $state(false);
  let editedTitle = $state("");
  let titleInputRef = $state<HTMLInputElement | null>(null);
  let descriptionTextareaRef = $state<HTMLTextAreaElement | null>(null);

  // Zoomed image modal state
  let zoomedImageSrc = $state<string | null>(null);
  let zoomedImageAlt = $state("");

  function handleMarkdownClick(e: MouseEvent) {
    const target = e.target as HTMLElement;
    if (target && target.tagName === "IMG") {
      const img = target as HTMLImageElement;
      // Only zoom if NOT wrapped in an anchor link (sin hipervinculo)
      if (!img.closest("a")) {
        e.preventDefault();
        zoomedImageSrc = img.src;
        zoomedImageAlt = img.alt || "";
      }
    }
  }

  function closeZoom() {
    zoomedImageSrc = null;
    zoomedImageAlt = "";
  }

  $effect(() => {
    if (!zoomedImageSrc) return;

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        closeZoom();
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  });

  // Resizable panel state
  const MIN_WIDTH = 250;
  const REOPEN_WIDTH = MIN_WIDTH + 10;
  const MIN_LIST_WIDTH = 250;

  function getTargetPanelWidth(ratio = settingsStore.descriptionRatio): number {
    if (typeof window === "undefined") return 350;
    const computed = Math.round(window.innerWidth * ratio);
    return Math.min(
      window.innerWidth - MIN_LIST_WIDTH,
      Math.max(MIN_WIDTH, computed),
    );
  }

  let isCollapsed = $state(settingsStore.isDescriptionCollapsed);
  let isResizing = $state(false);
  let panelWidth = $state(
    uiStore.isListCollapsed
      ? typeof window !== "undefined"
        ? window.innerWidth
        : 350
      : settingsStore.isDescriptionCollapsed
        ? REOPEN_WIDTH
        : getTargetPanelWidth(),
  );

  function saveChanges() {
    // Clear existing timeout if saving manually
    if (saveTimeout !== null) {
      clearTimeout(saveTimeout);
      saveTimeout = null;
      isSaving = false;
    }

    const list = projectStore.selectedList;
    if (!list) return;

    const trimmedTitle = editedTitle.trim();
    const titleChanged = trimmedTitle !== "" && trimmedTitle !== list.title;
    const descChanged = description !== list.description;

    if (titleChanged || descChanged) {
      if (titleChanged) {
        projectStore.updateTitle(trimmedTitle);
      }
      if (descChanged) {
        projectStore.updateDescription(description);
      }
      uiStore.addToHistory({
        title: trimmedTitle || list.title,
        description: description,
      });
    }
  }

  // Register save function in context so switching lists triggers save
  const descriptionCtx = getContext<DescriptionContext>(
    DESCRIPTION_CONTEXT_KEY,
  );
  if (descriptionCtx) {
    descriptionCtx.save = saveChanges;
  }

  // Update local state when selected list changes
  $effect(() => {
    const list = projectStore.selectedList;
    if (list) {
      description = list.description;
      titleColor = list.titleColor;
      editedTitle = list.title;
      // Notice: isEditing is NOT reset here so edit mode persists across navigation

      // Apply remembered proportion or collapse state
      if (uiStore.isListCollapsed) {
        panelWidth = window.innerWidth;
      } else if (!isCollapsed) {
        panelWidth = getTargetPanelWidth();
      }
    }
  });

  // Keep proportion responsive on window resize
  $effect(() => {
    if (typeof window === "undefined") return;

    function handleWindowResize() {
      if (uiStore.isListCollapsed) {
        panelWidth = window.innerWidth;
      } else if (!isCollapsed) {
        panelWidth = getTargetPanelWidth();
      }
    }

    window.addEventListener("resize", handleWindowResize);
    return () => {
      window.removeEventListener("resize", handleWindowResize);
    };
  });

  // When list is uncollapsed, make list start using its minimum width (250px)
  $effect(() => {
    if (typeof window !== "undefined") {
      if (!uiStore.isListCollapsed && panelWidth >= window.innerWidth - 10) {
        panelWidth = Math.max(MIN_WIDTH, window.innerWidth - MIN_LIST_WIDTH);
      }
    }
  });

  function handleContentChange() {
    if (saveTimeout !== null) {
      clearTimeout(saveTimeout);
    }
    isSaving = true;

    // Auto-save after typing stops
    saveTimeout = window.setTimeout(() => {
      saveChanges();
      saveTimeout = null;
      isSaving = false;
    }, 2000);
  }

  function handleColorChange() {
    projectStore.updateTitleColor(titleColor);
  }

  function handleActions(action: "undo" | "redo") {
    if (action === "undo") {
      const previousValue = uiStore.undo();
      if (previousValue !== null) {
        editedTitle = previousValue.title;
        description = previousValue.description;
        projectStore.updateTitle(previousValue.title);
        projectStore.updateDescription(previousValue.description);
      }
    } else if (action === "redo") {
      const nextValue = uiStore.redo();
      if (nextValue !== null) {
        editedTitle = nextValue.title;
        description = nextValue.description;
        projectStore.updateTitle(nextValue.title);
        projectStore.updateDescription(nextValue.description);
      }
    }
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.ctrlKey && e.key === "z") {
      e.preventDefault();
      handleActions("undo");
    } else if (e.ctrlKey && e.key === "y") {
      e.preventDefault();
      handleActions("redo");
    }
  }

  // Toggle edit mode with pencil button or empty state button
  function toggleEditMode(focusTarget?: "title" | "description" | MouseEvent) {
    const target = focusTarget === "description" ? "description" : "title";
    if (isEditing) {
      // Exiting edit mode: save any pending edits
      saveChanges();
      isEditing = false;
    } else {
      isEditing = true;
      setTimeout(() => {
        if (target === "description" && descriptionTextareaRef) {
          descriptionTextareaRef.focus();
        } else if (titleInputRef) {
          titleInputRef.focus();
          titleInputRef.select();
        }
      }, 0);
    }
  }

  function handleTitleKeydown(e: KeyboardEvent) {
    handleKeydown(e);
    if (e.key === "Enter") {
      saveChanges();
    } else if (e.key === "Escape") {
      if (projectStore.selectedList) {
        editedTitle = projectStore.selectedList.title;
      }
    }
  }

  // Resizing handlers
  function startResize(e: MouseEvent) {
    isResizing = true;
    e.preventDefault();

    document.body.classList.add("resizing");
    document.addEventListener("mousemove", handleResize);
    document.addEventListener("mouseup", stopResize);
  }

  function handleResize(e: MouseEvent) {
    if (!isResizing) return;

    const newWidth = window.innerWidth - e.clientX;

    if (newWidth < MIN_WIDTH) {
      // Collapse description panel to the right
      isCollapsed = true;
      isResizing = false;
      panelWidth = REOPEN_WIDTH;
      uiStore.setListCollapsed(false);
      settingsStore.setIsDescriptionCollapsed(true);
      document.body.classList.remove("resizing");
      document.removeEventListener("mousemove", handleResize);
      document.removeEventListener("mouseup", stopResize);
    } else if (window.innerWidth - newWidth < MIN_LIST_WIDTH) {
      // Invaded list table: collapse list of items!
      uiStore.setListCollapsed(true);
      isCollapsed = false;
      panelWidth = window.innerWidth;
      settingsStore.setIsDescriptionCollapsed(false);
    } else {
      // Both panels are visible
      uiStore.setListCollapsed(false);
      isCollapsed = false;
      panelWidth = newWidth;
      settingsStore.setIsDescriptionCollapsed(false);
      const ratio = newWidth / window.innerWidth;
      settingsStore.setDescriptionRatio(ratio);
    }
  }

  function stopResize() {
    isResizing = false;
    document.body.classList.remove("resizing");
    document.removeEventListener("mousemove", handleResize);
    document.removeEventListener("mouseup", stopResize);
  }

  function togglePanel() {
    isCollapsed = !isCollapsed;
    settingsStore.setIsDescriptionCollapsed(isCollapsed);
    if (!isCollapsed) {
      panelWidth = getTargetPanelWidth();
    }
  }

  const isVisible = $derived(projectStore.selectedList !== null);
  const renderedMarkdown = $derived(renderMarkdown(description));

  // Dynamic horizontal padding: capped cleanly between 24px and 48px
  const contentPaddingX = $derived(
    Math.min(
      48,
      Math.max(
        24,
        Math.round(
          24 + ((panelWidth - MIN_WIDTH) / (600 - MIN_WIDTH)) * (48 - 24),
        ),
      ),
    ),
  );
</script>

{#if isVisible}
  <!-- Expand button when description panel is collapsed -->
  {#if isCollapsed}
    <button
      class="fixed right-0 top-1/2 -translate-y-1/2 w-6 h-16 bg-primary border border-border border-r-0 rounded-l-lg cursor-pointer flex items-center justify-center text-text z-100 hover:bg-tertiary transition-all hover:w-9 shadow-md"
      onclick={togglePanel}
      title={t("expandPanel", settingsStore.language)}
      aria-label={t("expandPanel", settingsStore.language)}
    >
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path
          d="M10 4L6 8L10 12"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
    </button>
  {/if}

  <!-- Main panel -->
  {#if !isCollapsed}
    <div
      class="relative bg-primary border-l border-border flex flex-row min-w-37.5 select-none {uiStore.isListCollapsed
        ? 'flex-1 w-full border-l-0'
        : ''}"
      style={uiStore.isListCollapsed ? "width: 100%" : `width: ${panelWidth}px`}
    >
      <!-- Resizer handle -->
      <button
        class="absolute left-0 top-0 bottom-0 w-1.5 bg-transparent cursor-col-resize z-10 border-0 p-0 hover:bg-accent hover:opacity-50 {isResizing
          ? 'bg-accent opacity-80'
          : ''}"
        onmousedown={startResize}
        aria-label="Resize panel"
      ></button>

      <div
        class="flex-1 flex flex-col py-6 gap-3 overflow-hidden"
        style="padding-left: {contentPaddingX}px; padding-right: {contentPaddingX}px"
      >
        <!-- Header: Title and Color -->
        <div class="flex items-top justify-between gap-3">
          <div class="flex flex-col gap-3 flex-1 min-w-0">
            <div class="flex items-center gap-3">
              <!-- Edit Toggle Button (Pencil) -->
              <button
                class="border shadow-sm rounded-lg cursor-pointer leading-none text-sm p-1.5 transition-all {isEditing
                  ? 'bg-accent text-white border-accent shadow-inner ring-2 ring-accent/30'
                  : 'bg-secondary/50 border-border text-accent hover:bg-secondary'}"
                onclick={toggleEditMode}
                title={isEditing
                  ? t("readMode", settingsStore.language)
                  : t("editMode", settingsStore.language)}
                aria-label={t("editTitle", settingsStore.language)}
                aria-pressed={isEditing}
              >
                <Pencil
                  class="w-4 h-4 {isEditing ? 'text-white' : 'text-accent'}"
                />
              </button>

              {#if isEditing}
                <input
                  bind:this={titleInputRef}
                  bind:value={editedTitle}
                  oninput={handleContentChange}
                  onkeydown={handleTitleKeydown}
                  spellcheck="false"
                  minlength={1}
                  maxlength={40}
                  class="px-2 h-9 w-full rounded-lg bg-tertiary outline-none text-text text-sm font-inherit border border-border focus:border-accent"
                  type="text"
                />
              {:else}
                <h3
                  class="truncate leading-9 h-9 w-full text-base font-semibold px-2 text-text select-text"
                  style={titleColor ? `color: ${titleColor}` : undefined}
                >
                  <span>{projectStore.selectedList?.title}</span>
                </h3>
              {/if}
            </div>
          </div>
          <div class="flex flex-col gap-3 shrink-0">
            <div class="flex items-center justify-center gap-3">
              <ColorButton
                id="title-color"
                bind:value={titleColor}
                onchange={handleColorChange}
              />
            </div>
          </div>
        </div>

        <!-- Description: Markdown in Read Mode, Textarea in Edit Mode -->
        <div class="flex flex-col gap-3 flex-1 min-h-0">
          {#if isEditing}
            <textarea
              id="description-textarea"
              bind:this={descriptionTextareaRef}
              bind:value={description}
              oninput={handleContentChange}
              onkeydown={handleKeydown}
              placeholder={t("description", settingsStore.language)}
              class="flex-1 p-3 bg-tertiary border border-border rounded-lg text-text text-sm font-inherit resize-none outline-none focus:border-accent"
            ></textarea>
          {:else}
            <div
              class="flex-1 p-4 bg-tertiary/40 border border-border/80 rounded-lg overflow-y-auto select-text flex flex-col"
            >
              {#if description && description.trim()}
                <!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
                <div
                  class="markdown-body"
                  use:resolveLocalImages={renderedMarkdown}
                  onclick={handleMarkdownClick}
                >
                  {@html renderedMarkdown}
                </div>
              {:else}
                <button
                  type="button"
                  class="flex-1 w-full flex items-center justify-center text-text-secondary hover:text-accent transition-colors text-sm italic select-none cursor-pointer bg-transparent border-0 group py-8"
                  onclick={() => toggleEditMode("description")}
                >
                  <span class="group-hover:underline">
                    {t("writeSomething", settingsStore.language)}
                  </span>
                </button>
              {/if}
            </div>
          {/if}
        </div>

        <!-- Footer: Undo/Redo & Save Status -->
        <div
          class="flex flex-row items-center text-center text-text-secondary dark:text-text-secondary-dark text-sm shrink-0"
        >
          <div class="flex gap-2 justify-center flex-1">
            <div class="flex items-center gap-2">
              <span>Ctrl+Z:</span>
              <button
                title={t("undo", settingsStore.language)}
                class="text-accent cursor-pointer disabled:cursor-not-allowed disabled:text-text-secondary hover:bg-secondary p-2 rounded-full"
                type="button"
                onclick={() => handleActions("undo")}
                disabled={!canUndo}
              >
                <Undo2 />
              </button>
            </div>
            <div class="flex items-center gap-2">
              <span>Ctrl+Y:</span>
              <button
                title={t("redo", settingsStore.language)}
                class="text-accent cursor-pointer disabled:cursor-not-allowed disabled:text-text-secondary hover:bg-secondary p-2 rounded-full"
                type="button"
                onclick={() => handleActions("redo")}
                disabled={!canRedo}
              >
                <Redo2 />
              </button>
            </div>
          </div>
          {#if isSaving}
            <div
              class="flex justify-end items-center gap-2 text-success dark:text-success-dark text-xs"
            >
              <svg class="h-6 w-6 animate-spin" viewBox="0 0 100 100">
                <circle
                  fill="none"
                  stroke-width="10"
                  class="stroke-current opacity-0"
                  cx="50"
                  cy="50"
                  r="40"
                />
                <circle
                  fill="none"
                  stroke-width="10"
                  class="stroke-current"
                  stroke-dasharray="250"
                  stroke-dashoffset="75"
                  cx="50"
                  cy="50"
                  r="40"
                />
              </svg>
            </div>
          {:else}
            <div
              class="flex justify-end items-center gap-2 text-success dark:text-success-dark text-xs"
            >
              <Check class="h-6 w-6" />
            </div>
          {/if}
        </div>
      </div>
    </div>
  {/if}
{/if}

{#if zoomedImageSrc}
  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <div
    class="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-[2px] cursor-zoom-out select-none"
    onclick={closeZoom}
    role="button"
    tabindex="0"
  >
    <!-- Botón de cerrar ("X") en la esquina superior derecha fuera de la imagen -->
    <button
      type="button"
      class="absolute top-5 right-5 p-2 text-white/80 hover:text-white bg-black/30 hover:bg-black/60 rounded-full transition-colors cursor-pointer flex items-center justify-center z-[101]"
      onclick={closeZoom}
      aria-label="Cerrar vista previa"
      title="Cerrar"
    >
      <LucideX class="w-6 h-6" />
    </button>

    <!-- svelte-ignore a11y_no_noninteractive_element_interactions, a11y_click_events_have_key_events -->
    <img
      src={zoomedImageSrc}
      alt={zoomedImageAlt}
      class="max-w-[80vw] max-h-[80vh] w-auto h-auto object-contain rounded-lg shadow-2xl cursor-default"
      onclick={(e) => e.stopPropagation()}
    />
  </div>
{/if}

<style>
  /* Prevent text selection during resize */
  :global(body.resizing) {
    user-select: none;
    cursor: col-resize !important;
  }

  /* Scoped Markdown Styling */
  :global(.markdown-body) {
    font-size: 0.925rem;
    line-height: 1.65;
    color: inherit;
    word-break: break-word;
  }

  :global(.markdown-body h1) {
    font-size: 1.5rem;
    font-weight: 700;
    margin-top: 1.25rem;
    margin-bottom: 0.75rem;
    padding-bottom: 0.35rem;
    border-bottom: 1px solid var(--border, rgba(128, 128, 128, 0.2));
  }

  :global(.markdown-body h2) {
    font-size: 1.25rem;
    font-weight: 600;
    margin-top: 1.1rem;
    margin-bottom: 0.6rem;
    padding-bottom: 0.25rem;
    border-bottom: 1px solid var(--border, rgba(128, 128, 128, 0.15));
  }

  :global(.markdown-body h3) {
    font-size: 1.1rem;
    font-weight: 600;
    margin-top: 1rem;
    margin-bottom: 0.5rem;
  }

  :global(.markdown-body h4),
  :global(.markdown-body h5),
  :global(.markdown-body h6) {
    font-size: 0.95rem;
    font-weight: 600;
    margin-top: 0.85rem;
    margin-bottom: 0.4rem;
  }

  :global(.markdown-body p) {
    margin-top: 0;
    margin-bottom: 0.85rem;
  }

  :global(.markdown-body ul) {
    list-style-type: disc;
    margin-top: 0.25rem;
    margin-bottom: 0.85rem;
    padding-left: 1.5rem;
  }

  :global(.markdown-body ol) {
    list-style-type: decimal;
    margin-top: 0.25rem;
    margin-bottom: 0.85rem;
    padding-left: 1.5rem;
  }

  :global(.markdown-body li) {
    margin-top: 0.25rem;
    margin-bottom: 0.25rem;
  }

  :global(.markdown-body blockquote) {
    margin: 0.75rem 0;
    padding: 0.5rem 1rem;
    border-left: 4px solid var(--accent, #6366f1);
    background-color: rgba(99, 102, 241, 0.05);
    border-radius: 0 0.375rem 0.375rem 0;
    font-style: italic;
  }

  :global(.markdown-body pre) {
    margin: 0.75rem 0;
    padding: 0.75rem 1rem;
    border-radius: 0.5rem;
    background-color: var(--secondary, rgba(0, 0, 0, 0.05));
    border: 1px solid var(--border, rgba(128, 128, 128, 0.2));
    overflow-x: auto;
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas,
      monospace;
    font-size: 0.85rem;
  }

  :global(.markdown-body code) {
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas,
      monospace;
    font-size: 0.85em;
    padding: 0.15em 0.35em;
    border-radius: 0.25rem;
    background-color: var(--secondary, rgba(0, 0, 0, 0.05));
    border: 1px solid var(--border, rgba(128, 128, 128, 0.15));
  }

  :global(.markdown-body pre code) {
    padding: 0;
    background-color: transparent;
    border: none;
    font-size: inherit;
  }

  :global(.markdown-body a) {
    color: var(--accent, #6366f1);
    text-decoration: none;
  }

  :global(.markdown-body a:hover) {
    text-decoration: underline;
  }

  :global(.markdown-body table) {
    width: 100%;
    margin: 0.75rem 0;
    border-collapse: collapse;
  }

  :global(.markdown-body th),
  :global(.markdown-body td) {
    padding: 0.5rem 0.75rem;
    border: 1px solid var(--border, rgba(128, 128, 128, 0.2));
    text-align: left;
  }

  :global(.markdown-body th) {
    background-color: var(--secondary, rgba(0, 0, 0, 0.05));
    font-weight: 600;
  }

  :global(.markdown-body hr) {
    margin: 1.25rem 0;
    border: 0;
    border-top: 1px solid var(--border, rgba(128, 128, 128, 0.2));
  }

  :global(.markdown-body img) {
    max-width: 60%;
    width: auto;
    height: auto;
    border-radius: 0.375rem;
    margin: 0.75rem 0;
    display: block;
    cursor: zoom-in;
    transition: opacity 0.15s ease-in-out;
  }

  :global(.markdown-body a img) {
    cursor: pointer;
  }

  :global(.markdown-body img:hover) {
    opacity: 0.92;
  }
</style>
