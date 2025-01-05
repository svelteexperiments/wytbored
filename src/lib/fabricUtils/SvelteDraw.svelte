<script lang="ts">
  import { initFabric } from "./utils.js";
  import type { Canvas } from "fabric";
  import Toolbar from "./Toolbar.svelte";
  import StyleToolbar from "./StyleToolbar.svelte";
  let canvas: Canvas | null = $state(null);
  $effect(() => {
    canvas = initFabric();
  });
</script>

<canvas id="canvas" class="w-[100dvw] h-[100dvh]"></canvas>
{#if canvas}
  <StyleToolbar />
  <Toolbar {canvas} />
{/if}
