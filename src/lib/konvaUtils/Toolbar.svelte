<script lang="ts">
  interface Props {
    stage: Stage;
    layer: Layer;
  }
  let { stage, layer }: Props = $props();
  import MousePointer from "lucide-svelte/icons/mouse-pointer";
  import Hand from "lucide-svelte/icons/hand";
  import Pencil from "lucide-svelte/icons/pencil";
  import Eraser from "lucide-svelte/icons/eraser";
  import MoveUpRight from "lucide-svelte/icons/move-up-right";
  import Type from "lucide-svelte/icons/type";
  import Image from "lucide-svelte/icons/image";
  import ChevronUp from "lucide-svelte/icons/chevron-up";
  import X from "lucide-svelte/icons/x";
  import Square from "lucide-svelte/icons/square";
  import Circle from "lucide-svelte/icons/circle";
  import Triangle from "lucide-svelte/icons/triangle";
  import Diamond from "lucide-svelte/icons/diamond";
  import Hexagon from "lucide-svelte/icons/hexagon";
  import Star from "lucide-svelte/icons/star";
  import Heart from "lucide-svelte/icons/heart";
  import SquareX from "lucide-svelte/icons/square-x";
  import SquareCheck from "lucide-svelte/icons/square-check";
  import ArrowBigUp from "lucide-svelte/icons/arrow-big-up";
  import Slash from "lucide-svelte/icons/slash";
  import PaintRoller from "lucide-svelte/icons/paint-roller";
  import { selectedTool, selectTool } from "./tools.js";
  import type { Stage } from "konva/lib/Stage.js";
  import type { Layer } from "konva/lib/Layer.js";

  let dropDownMenu: HTMLDivElement;
  let isDropDownOpen = $state(false);
  const toggleDropdown = () => {
    if (dropDownMenu) {
      dropDownMenu.classList.toggle("hidden");
      isDropDownOpen = !isDropDownOpen;
    }
  };
</script>

<div class="fixed bottom-5 left-1/2 -translate-x-1/2 flex gap-4 bg-white border border-gray-300 shadow-lg rounded-lg px-4 py-2">
  <button class="p-2 rounded {$selectedTool === 'select' ? 'bg-blue-500 text-white' : 'hover:bg-gray-100'}" onclick={() => selectTool(stage, layer, "select")}>
    <MousePointer strokeWidth={1.5} size={20} />
  </button>
  <button class="p-2 rounded {$selectedTool === 'hand' ? 'bg-blue-500 text-white' : 'hover:bg-gray-100'}" onclick={() => selectTool(stage, layer, "hand")}>
    <Hand strokeWidth={1.5} size={20} />
  </button>
  <button class="p-2 rounded {$selectedTool === 'pen' ? 'bg-blue-500 text-white' : 'hover:bg-gray-100'}" onclick={() => selectTool(stage, layer, "pen")}>
    <Pencil strokeWidth={1.5} size={20} />
  </button>
  <button class="p-2 {$selectedTool === 'eraser' ? 'bg-blue-500 text-white' : 'hover:bg-gray-100'} rounded" onclick={() => selectTool(stage, layer, "eraser")}>
    <Eraser strokeWidth={1.5} size={20} />
  </button>
  <button class="p-2 {$selectedTool === 'arrow' ? 'bg-blue-500 text-white' : 'hover:bg-gray-100'} rounded" onclick={() => selectTool(stage, layer, "arrow")}>
    <MoveUpRight strokeWidth={1.5} size={20} />
  </button>
  <button class="p-2 {$selectedTool === 'text' ? 'bg-blue-500 text-white' : 'hover:bg-gray-100'} rounded" onclick={() => selectTool(stage, layer, "text")}>
    <Type strokeWidth={1.5} size={20} />
  </button>
  <button class="p-2 {$selectedTool === 'image' ? 'bg-blue-500 text-white' : 'hover:bg-gray-100'} rounded">
    <Image strokeWidth={1.5} size={20} />
  </button>
  <button class="p-2 hover:bg-gray-100 rounded" onclick={() => layer.destroyChildren()}>
    <PaintRoller strokeWidth={1.5} size={20} />
  </button>

  <div class="relative">
    <button class="p-2 hover:bg-gray-100 rounded" onclick={toggleDropdown}>
      {#if !isDropDownOpen}
        <ChevronUp strokeWidth={1.5} size={20} />
      {:else}
        <X strokeWidth={1.5} size={20} />
      {/if}
    </button>

    <!-- Dropdown Menu -->
    <div bind:this={dropDownMenu} class="hidden w-48 absolute bottom-full mb-2 left-0 bg-white border border-gray-300 shadow-lg rounded-lg p-2">
      <div class="grid grid-cols-4 gap-2">
        <button
          class="p-2 {$selectedTool === 'box' ? 'bg-blue-500 text-white' : 'hover:bg-gray-100'} rounded"
          onclick={() => {
            selectTool(stage, layer, "box");
            toggleDropdown();
          }}
        >
          <Square strokeWidth={1.5} size={20} />
        </button>
        <button
          class="p-2 {$selectedTool === 'circle' ? 'bg-blue-500 text-white' : 'hover:bg-gray-100'} rounded"
          onclick={() => {
            selectTool(stage, layer, "circle");
            toggleDropdown();
          }}
        >
          <Circle strokeWidth={1.5} size={20} />
        </button>
        <button
          class="p-2 {$selectedTool === 'triangle' ? 'bg-blue-500 text-white' : 'hover:bg-gray-100'} rounded"
          onclick={() => {
            selectTool(stage, layer, "triangle");
            toggleDropdown();
          }}
        >
          <Triangle strokeWidth={1.5} size={20} />
        </button>
        <button
          class="p-2 {$selectedTool === 'diamond' ? 'bg-blue-500 text-white' : 'hover:bg-gray-100'} rounded"
          onclick={() => {
            selectTool(stage, layer, "diamond");
            toggleDropdown();
          }}
        >
          <Diamond strokeWidth={1.5} size={20} />
        </button>
        <button
          class="p-2 {$selectedTool === 'hexagon' ? 'bg-blue-500 text-white' : 'hover:bg-gray-100'} rounded"
          onclick={() => {
            selectTool(stage, layer, "hexagon");
            toggleDropdown();
          }}
        >
          <Hexagon strokeWidth={1.5} size={20} />
        </button>
        <button
          class="p-2 {$selectedTool === 'star' ? 'bg-blue-500 text-white' : 'hover:bg-gray-100'} rounded"
          onclick={() => {
            selectTool(stage, layer, "star");
            toggleDropdown();
          }}
        >
          <Star strokeWidth={1.5} size={20} />
        </button>
        <button
          class="p-2 {$selectedTool === 'heart' ? 'bg-blue-500 text-white' : 'hover:bg-gray-100'} rounded"
          onclick={() => {
            selectTool(stage, layer, "heart");
            toggleDropdown();
          }}
        >
          <Heart strokeWidth={1.5} size={20} />
        </button>
        <button
          class="p-2 {$selectedTool === 'boxX' ? 'bg-blue-500 text-white' : 'hover:bg-gray-100'} rounded"
          onclick={() => {
            selectTool(stage, layer, "boxX");
            toggleDropdown();
          }}
        >
          <SquareX strokeWidth={1.5} size={20} />
        </button>
        <button
          class="p-2 {$selectedTool === 'boxCheck' ? 'bg-blue-500 text-white' : 'hover:bg-gray-100'} rounded"
          onclick={() => {
            selectTool(stage, layer, "boxCheck");
            toggleDropdown();
          }}
        >
          <SquareCheck strokeWidth={1.5} size={20} />
        </button>
        <button
          class="p-2 {$selectedTool === 'fatArrow' ? 'bg-blue-500 text-white' : 'hover:bg-gray-100'} rounded"
          onclick={() => {
            selectTool(stage, layer, "fatArrow");
            toggleDropdown();
          }}
        >
          <ArrowBigUp strokeWidth={1} size={24} />
        </button>
        <button
          class="p-2 {$selectedTool === 'line' ? 'bg-blue-500 text-white' : 'hover:bg-gray-100'} rounded"
          onclick={() => {
            selectTool(stage, layer, "line");
            toggleDropdown();
          }}
        >
          <Slash strokeWidth={1.5} size={20} />
        </button>
      </div>
    </div>
  </div>
</div>
