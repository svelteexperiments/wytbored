<script lang="ts">
  interface Props {
    stage: Stage;
    layer: Layer;
  }
  let { stage, layer }: Props = $props();
  import { theme } from "$lib/theme.js";
  import { Group } from "konva/lib/Group.js";
  import { Layer } from "konva/lib/Layer.js";
  import { Rect } from "konva/lib/shapes/Rect.js";
  import { Stage } from "konva/lib/Stage.js";
  import Menu from "lucide-svelte/icons/menu";
  import { get } from "svelte/store";
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
    const allNodes = layer.find(".shape");
    if (allNodes.length === 0) return;

    const tempGroup = new Group();
    allNodes.forEach((node) => {
      const clone = node.clone();
      tempGroup.add(clone);
    });
    const groupBox = tempGroup.getClientRect();
    const backgroundRect = new Rect({
      x: groupBox.x - 20,
      y: groupBox.y - 20,
      width: groupBox.width + 40,
      height: groupBox.height + 40,
      fill: get(theme) === "dark" ? "#0f172a" : "white",
      listening: false,
    });
    tempGroup.add(backgroundRect);
    backgroundRect.moveToBottom();
    layer.add(tempGroup);
    layer.batchDraw();
    const dataURL = tempGroup.toDataURL({
      mimeType: "image/png",
      pixelRatio: 3,
    });
    tempGroup.destroy();
    downloadURI(dataURL, `SvelteDraw_${Date.now()}.png`);
    toggleDropdown();
  };
  const exportJSON = () => {
    const json = stage.toJSON();
    const dataURL = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(json));
    downloadURI(dataURL, `SvelteDraw_${Date.now()}.json`);
    toggleDropdown();
  };
  const importJSON = () => {
    // Implement Pending
    toggleDropdown();
  };
  function downloadURI(uri: string, name: string) {
    const link = document.createElement("a");
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
        <button class="rounded p-2 hover:bg-gray-200 dark:hover:bg-slate-700 text-left dark:text-white" onclick={exportJSON}>Export JSON</button>
        <button class="rounded p-2 hover:bg-gray-200 dark:hover:bg-slate-700 text-left dark:text-white" onclick={importJSON}>Import JSON</button>
      </div>
    </div>
  </div>
</div>
