<script lang="ts">
  import "konva/lib/Core";
  import { Layer } from "konva/lib/Layer.js";
  import { Stage } from "konva/lib/Stage.js";
  import StyleToolbar from "./StyleToolbar.svelte";
  import Toolbar from "./Toolbar.svelte";
  import { initKonva } from "./utils.js";
  import HelpModal from "./HelpModal.svelte";
  import { theme } from "$lib/theme.js";
  import Menu from "./Menu.svelte";

  let containerDiv: HTMLDivElement;
  let stageWidth = window.innerWidth;
  let stageHeight = window.innerHeight;
  let stage: Stage | null = $state(null);
  let layer: Layer | null = $state(null);

  $effect(() => {
    theme.set("light");
    const storedTheme = localStorage.getItem("theme") || "light";
    document.documentElement.classList.toggle("dark", storedTheme === "dark");
    // Initialize stage
    ({ stage, layer } = initKonva(containerDiv, stageWidth, stageHeight));

    // Handle window resize
    const handleResize = () => {
      stageWidth = window.innerWidth;
      stageHeight = window.innerHeight;
      if (!stage) return;
      stage.width(stageWidth);
      stage.height(stageHeight);
      stage.batchDraw();
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      if (stage) stage.destroy();
    };
  });
</script>

<div bind:this={containerDiv} class="w-full h-full touch-none dark:bg-slate-900"></div>
{#if stage && layer}
  <StyleToolbar />
  <Toolbar {stage} {layer} />
{/if}
<HelpModal />
<Menu />
