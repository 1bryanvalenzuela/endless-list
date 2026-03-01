<script lang="ts">
    import "$lib/app.css";
    import { settingsStore } from "$lib/stores/settings.svelte";
    import { browser } from "$app/environment";
    import { getCurrentWindow } from "@tauri-apps/api/window";
    import { LogicalSize } from "@tauri-apps/api/dpi";

    // Persist and restore window size
    $effect(() => {
        if (!browser) return;

        const tauriWindow = getCurrentWindow();
        let debounceTimer: ReturnType<typeof setTimeout>;

        // Restore saved size and show window
        (async () => {
            const savedWidth = settingsStore.windowWidth;
            const savedHeight = settingsStore.windowHeight;
            const wasMaximized = settingsStore.isMaximized;

            if (savedWidth && savedHeight) {
                await tauriWindow.setSize(
                    new LogicalSize(savedWidth, savedHeight),
                );
            }

            if (wasMaximized) {
                await tauriWindow.maximize();
            }

            // Show window after size is set (or immediately if no saved size)
            await tauriWindow.show();
        })();

        // Save size and maximized state on resize (debounced 300ms)
        const unlisten = tauriWindow.onResized(({ payload }) => {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(async () => {
                const maximized = await tauriWindow.isMaximized();
                settingsStore.setWindowMaximized(maximized);

                // Only save specific size if not maximized
                // (so we don't overwrite the "normal" size with the desktop size)
                if (!maximized) {
                    settingsStore.setWindowSize(payload.width, payload.height);
                }
            }, 300);
        });

        return () => {
            clearTimeout(debounceTimer);
            unlisten.then((fn) => fn());
        };
    });

    // Update html lang and data-theme attributes when settings change
    $effect(() => {
        if (browser) {
            const html = document.documentElement;

            // Update language attribute
            html.setAttribute("lang", settingsStore.language);

            // Function to update theme
            const updateTheme = () => {
                let actualTheme: "light" | "dark";

                if (settingsStore.theme === "system") {
                    actualTheme = window.matchMedia(
                        "(prefers-color-scheme: dark)",
                    ).matches
                        ? "dark"
                        : "light";
                } else {
                    actualTheme = settingsStore.theme;
                }

                // Apply dark class
                if (actualTheme === "dark") {
                    html.classList.add("dark");
                } else {
                    html.classList.remove("dark");
                }

                // Apply data-theme attribute
                html.setAttribute("data-theme", actualTheme);
            };

            // Initial theme update
            updateTheme();

            // Listen for system theme changes when in 'system' mode
            const mediaQuery = window.matchMedia(
                "(prefers-color-scheme: dark)",
            );
            const handleSystemThemeChange = () => {
                if (settingsStore.theme === "system") {
                    updateTheme();
                }
            };

            mediaQuery.addEventListener("change", handleSystemThemeChange);

            // Cleanup listener on effect cleanup
            return () => {
                mediaQuery.removeEventListener(
                    "change",
                    handleSystemThemeChange,
                );
            };
        }
    });
</script>

<!-- svelte-ignore slot_element_deprecated -->
<slot />
