<script lang="ts">
  interface Props {
    stage: Stage;
  }
  let { stage }: Props = $props();
  import { theme } from "$lib/theme.js";
  import type { Stage } from "konva/lib/Stage.js";
  import Menu from "lucide-svelte/icons/menu";
  let isDropDownOpen = $state(false);
  let dropDownMenu: HTMLDivElement;
  const toggleDropdown = () => {
    if (dropDownMenu) {
      dropDownMenu.classList.toggle("hidden");
      isDropDownOpen = !isDropDownOpen;
    }
  };
  const toggleTheme = () => {
    theme.set($theme === "light" ? "dark" : "light");
    toggleDropdown();
  };
  const exportPNG = () => {
    var dataURL = stage.toDataURL({ pixelRatio: 3 });
    downloadURI(dataURL, "stage.png");
  };

  function downloadURI(uri: string, name: string) {
    var link = document.createElement("a");
    link.download = name;
    link.href = uri;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    // delete link;
  }
</script>

<div class="fixed top-1 left-1">
  <div class="relative">
    <button class="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 dark:text-white rounded" onclick={toggleDropdown}>
      <Menu />
    </button>

    <!-- Dropdown Menu -->
    <div bind:this={dropDownMenu} class="hidden w-48 absolute top-full mb-2 left-0 bg-white dark:bg-slate-800 border border-gray-300 shadow-lg rounded-lg p-2">
      <div class="flex flex-col">
        <button class="rounded p-2 hover:bg-gray-200 dark:hover:bg-slate-700 text-left dark:text-white" onclick={toggleTheme}>Toggle Theme</button>
        <button class="rounded p-2 hover:bg-gray-200 dark:hover:bg-slate-700 text-left dark:text-white" onclick={exportPNG}>Export PNG</button>
      </div>
    </div>
  </div>
</div>
