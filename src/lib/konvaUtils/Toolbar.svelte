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
  import ImageIcon from "lucide-svelte/icons/image";
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
  import { addImage, selectedTool, selectTool } from "./tools.js";
  import type { Stage } from "konva/lib/Stage.js";
  import type { Layer } from "konva/lib/Layer.js";

  let fileInput: HTMLInputElement;
  let dropDownMenu: HTMLDivElement;
  let isDropDownOpen = $state(false);
  const toggleDropdown = () => {
    if (dropDownMenu) {
      dropDownMenu.classList.toggle("hidden");
      isDropDownOpen = !isDropDownOpen;
    }
  };
  const imageUpload = () => {
    fileInput.click();
  };
  $effect(() => {
    fileInput.addEventListener("change", (event) => {
      if (!fileInput.files) return;
      const file = fileInput.files[0];
      if (file && file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = (e) => {
          if (!e.target) return;
          const imageUrl = e.target.result as string;
          const img = new Image();
          img.src = imageUrl;
          img.onload = () => {
            const pos = stage.getPointerPosition();
            if (!pos) return;
            const transformedPos = stage.getAbsoluteTransform().copy().invert().point(pos);
            addImage(stage, layer, transformedPos, img);
          };
          img.onerror = (error) => {
            console.error("Failed to load image:", error);
          };
        };
        reader.readAsDataURL(file);
      } else {
        console.log("Please select a valid image file.");
      }
    });
  });
</script>

<div class="fixed bottom-5 left-1/2 -translate-x-1/2 flex gap-4 bg-white dark:bg-slate-800 border border-gray-300 shadow-lg rounded-lg px-4 py-2">
  <div class="group relative inline-block">
    <button class="p-2 rounded {$selectedTool === 'select' ? 'bg-blue-500 text-white' : 'hover:bg-gray-100 dark:hover:bg-slate-700 dark:text-white'}" onclick={() => selectTool(stage, layer, "select")}>
      <MousePointer strokeWidth={1.5} size={20} />
    </button>
    <div class="absolute z-10 invisible group-hover:visible bg-gray-800 text-white text-sm px-2 py-1 rounded mb-2 whitespace-nowrap transform -translate-x-1/2 left-1/2 bottom-full">Select</div>
  </div>
  <div class="group relative inline-block">
    <button class="p-2 rounded {$selectedTool === 'hand' ? 'bg-blue-500 text-white' : 'hover:bg-gray-100 dark:hover:bg-slate-700 dark:text-white'}" onclick={() => selectTool(stage, layer, "hand")}>
      <Hand strokeWidth={1.5} size={20} />
    </button>
    <div class="absolute z-10 invisible group-hover:visible bg-gray-800 text-white text-sm px-2 py-1 rounded mb-2 whitespace-nowrap transform -translate-x-1/2 left-1/2 bottom-full">Pan/Move</div>
  </div>
  <div class="group relative inline-block">
    <button class="p-2 rounded {$selectedTool === 'pen' ? 'bg-blue-500 text-white' : 'hover:bg-gray-100 dark:hover:bg-slate-700 dark:text-white'}" onclick={() => selectTool(stage, layer, "pen")}>
      <Pencil strokeWidth={1.5} size={20} />
    </button>
    <div class="absolute z-10 invisible group-hover:visible bg-gray-800 text-white text-sm px-2 py-1 rounded mb-2 whitespace-nowrap transform -translate-x-1/2 left-1/2 bottom-full">Pencil</div>
  </div>
  <div class="group relative inline-block">
    <button class="p-2 {$selectedTool === 'eraser' ? 'bg-blue-500 text-white' : 'hover:bg-gray-100 dark:hover:bg-slate-700 dark:text-white'} rounded" onclick={() => selectTool(stage, layer, "eraser")}>
      <Eraser strokeWidth={1.5} size={20} />
    </button>
    <div class="absolute z-10 invisible group-hover:visible bg-gray-800 text-white text-sm px-2 py-1 rounded mb-2 whitespace-nowrap transform -translate-x-1/2 left-1/2 bottom-full">Eraser</div>
  </div>
  <div class="group relative inline-block">
    <button class="p-2 {$selectedTool === 'arrow' ? 'bg-blue-500 text-white' : 'hover:bg-gray-100 dark:hover:bg-slate-700 dark:text-white'} rounded" onclick={() => selectTool(stage, layer, "arrow")}>
      <MoveUpRight strokeWidth={1.5} size={20} />
    </button>
    <div class="absolute z-10 invisible group-hover:visible bg-gray-800 text-white text-sm px-2 py-1 rounded mb-2 whitespace-nowrap transform -translate-x-1/2 left-1/2 bottom-full">Arrow</div>
  </div>
  <div class="group relative inline-block">
    <button class="p-2 {$selectedTool === 'text' ? 'bg-blue-500 text-white' : 'hover:bg-gray-100 dark:hover:bg-slate-700 dark:text-white'} rounded" onclick={() => selectTool(stage, layer, "text")}>
      <Type strokeWidth={1.5} size={20} />
    </button>
    <div class="absolute z-10 invisible group-hover:visible bg-gray-800 text-white text-sm px-2 py-1 rounded mb-2 whitespace-nowrap transform -translate-x-1/2 left-1/2 bottom-full">Text</div>
  </div>
  <div class="group relative inline-block">
    <button class="p-2 {$selectedTool === 'image' ? 'bg-blue-500 text-white' : 'hover:bg-gray-100 dark:hover:bg-slate-700 dark:text-white'} rounded" onclick={imageUpload}>
      <ImageIcon strokeWidth={1.5} size={20} />
    </button>
    <input bind:this={fileInput} type="file" accept="image/*" class="hidden" />
    <div class="absolute z-10 invisible group-hover:visible bg-gray-800 text-white text-sm px-2 py-1 rounded mb-2 whitespace-nowrap transform -translate-x-1/2 left-1/2 bottom-full">Upload Image</div>
  </div>
  <div class="group relative inline-block">
    <button class="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 dark:text-white rounded" onclick={() => layer.destroyChildren()}>
      <PaintRoller strokeWidth={1.5} size={20} />
    </button>
    <div class="absolute z-10 invisible group-hover:visible bg-gray-800 text-white text-sm px-2 py-1 rounded mb-2 whitespace-nowrap transform -translate-x-1/2 left-1/2 bottom-full">Clear Board</div>
  </div>

  <div class="relative">
    <div class="group relative inline-block">
      <button class="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 dark:text-white rounded" onclick={toggleDropdown}>
        {#if !isDropDownOpen}
          <ChevronUp strokeWidth={1.5} size={20} />
        {:else}
          <X strokeWidth={1.5} size={20} />
        {/if}
      </button>
      <div class="absolute z-10 invisible group-hover:visible bg-gray-800 text-white text-sm px-2 py-1 rounded mb-2 whitespace-nowrap transform -translate-x-1/2 left-1/2 bottom-full">
        {#if !isDropDownOpen}
          More Tools
        {:else}
          Close
        {/if}
      </div>
    </div>

    <!-- Dropdown Menu -->
    <div bind:this={dropDownMenu} class="hidden w-48 absolute bottom-full mb-2 left-0 bg-white dark:bg-slate-800 border border-gray-300 shadow-lg rounded-lg p-2">
      <div class="grid grid-cols-4 gap-2">
        <div class="group relative inline-block">
          <button
            class="p-2 {$selectedTool === 'box' ? 'bg-blue-500 text-white' : 'hover:bg-gray-100 dark:hover:bg-slate-700 dark:text-white'} rounded"
            onclick={() => {
              selectTool(stage, layer, "box");
              toggleDropdown();
            }}
          >
            <Square strokeWidth={1.5} size={20} />
          </button>
          <div class="absolute z-10 invisible group-hover:visible bg-gray-800 text-white text-sm px-2 py-1 rounded mb-2 whitespace-nowrap transform -translate-x-1/2 left-1/2 bottom-full">Box</div>
        </div>
        <div class="group relative inline-block">
          <button
            class="p-2 {$selectedTool === 'circle' ? 'bg-blue-500 text-white' : 'hover:bg-gray-100 dark:hover:bg-slate-700 dark:text-white'} rounded"
            onclick={() => {
              selectTool(stage, layer, "circle");
              toggleDropdown();
            }}
          >
            <Circle strokeWidth={1.5} size={20} />
          </button>
          <div class="absolute z-10 invisible group-hover:visible bg-gray-800 text-white text-sm px-2 py-1 rounded mb-2 whitespace-nowrap transform -translate-x-1/2 left-1/2 bottom-full">Oval</div>
        </div>
        <div class="group relative inline-block">
          <button
            class="p-2 {$selectedTool === 'triangle' ? 'bg-blue-500 text-white' : 'hover:bg-gray-100 dark:hover:bg-slate-700 dark:text-white'} rounded"
            onclick={() => {
              selectTool(stage, layer, "triangle");
              toggleDropdown();
            }}
          >
            <Triangle strokeWidth={1.5} size={20} />
          </button>
          <div class="absolute z-10 invisible group-hover:visible bg-gray-800 text-white text-sm px-2 py-1 rounded mb-2 whitespace-nowrap transform -translate-x-1/2 left-1/2 bottom-full">Triangle</div>
        </div>
        <div class="group relative inline-block">
          <button
            class="p-2 {$selectedTool === 'diamond' ? 'bg-blue-500 text-white' : 'hover:bg-gray-100 dark:hover:bg-slate-700 dark:text-white'} rounded"
            onclick={() => {
              selectTool(stage, layer, "diamond");
              toggleDropdown();
            }}
          >
            <Diamond strokeWidth={1.5} size={20} />
          </button>
          <div class="absolute z-10 invisible group-hover:visible bg-gray-800 text-white text-sm px-2 py-1 rounded mb-2 whitespace-nowrap transform -translate-x-1/2 left-1/2 bottom-full">Diamond</div>
        </div>
        <div class="group relative inline-block">
          <button
            class="p-2 {$selectedTool === 'hexagon' ? 'bg-blue-500 text-white' : 'hover:bg-gray-100 dark:hover:bg-slate-700 dark:text-white'} rounded"
            onclick={() => {
              selectTool(stage, layer, "hexagon");
              toggleDropdown();
            }}
          >
            <Hexagon strokeWidth={1.5} size={20} />
          </button>
          <div class="absolute z-10 invisible group-hover:visible bg-gray-800 text-white text-sm px-2 py-1 rounded mb-2 whitespace-nowrap transform -translate-x-1/2 left-1/2 bottom-full">Hexagon</div>
        </div>
        <div class="group relative inline-block">
          <button
            class="p-2 {$selectedTool === 'star' ? 'bg-blue-500 text-white' : 'hover:bg-gray-100 dark:hover:bg-slate-700 dark:text-white'} rounded"
            onclick={() => {
              selectTool(stage, layer, "star");
              toggleDropdown();
            }}
          >
            <Star strokeWidth={1.5} size={20} />
          </button>
          <div class="absolute z-10 invisible group-hover:visible bg-gray-800 text-white text-sm px-2 py-1 rounded mb-2 whitespace-nowrap transform -translate-x-1/2 left-1/2 bottom-full">Star</div>
        </div>
        <div class="group relative inline-block">
          <button
            class="p-2 {$selectedTool === 'heart' ? 'bg-blue-500 text-white' : 'hover:bg-gray-100 dark:hover:bg-slate-700 dark:text-white'} rounded"
            onclick={() => {
              selectTool(stage, layer, "heart");
              toggleDropdown();
            }}
          >
            <Heart strokeWidth={1.5} size={20} />
          </button>
          <div class="absolute z-10 invisible group-hover:visible bg-gray-800 text-white text-sm px-2 py-1 rounded mb-2 whitespace-nowrap transform -translate-x-1/2 left-1/2 bottom-full">Heart</div>
        </div>
        <div class="group relative inline-block">
          <button
            class="p-2 {$selectedTool === 'boxX' ? 'bg-blue-500 text-white' : 'hover:bg-gray-100 dark:hover:bg-slate-700 dark:text-white'} rounded"
            onclick={() => {
              selectTool(stage, layer, "boxX");
              toggleDropdown();
            }}
          >
            <SquareX strokeWidth={1.5} size={20} />
          </button>
          <div class="absolute z-10 invisible group-hover:visible bg-gray-800 text-white text-sm px-2 py-1 rounded mb-2 whitespace-nowrap transform -translate-x-1/2 left-1/2 bottom-full">Cross</div>
        </div>
        <div class="group relative inline-block">
          <button
            class="p-2 {$selectedTool === 'boxCheck' ? 'bg-blue-500 text-white' : 'hover:bg-gray-100 dark:hover:bg-slate-700 dark:text-white'} rounded"
            onclick={() => {
              selectTool(stage, layer, "boxCheck");
              toggleDropdown();
            }}
          >
            <SquareCheck strokeWidth={1.5} size={20} />
          </button>
          <div class="absolute z-10 invisible group-hover:visible bg-gray-800 text-white text-sm px-2 py-1 rounded mb-2 whitespace-nowrap transform -translate-x-1/2 left-1/2 bottom-full">Check</div>
        </div>
        <div class="group relative inline-block">
          <button
            class="p-2 {$selectedTool === 'fatArrow' ? 'bg-blue-500 text-white' : 'hover:bg-gray-100 dark:hover:bg-slate-700 dark:text-white'} rounded"
            onclick={() => {
              selectTool(stage, layer, "fatArrow");
              toggleDropdown();
            }}
          >
            <ArrowBigUp strokeWidth={1} size={24} />
          </button>
          <div class="absolute z-10 invisible group-hover:visible bg-gray-800 text-white text-sm px-2 py-1 rounded mb-2 whitespace-nowrap transform -translate-x-1/2 left-1/2 bottom-full">Fat Arrow</div>
        </div>
        <div class="group relative inline-block">
          <button
            class="p-2 {$selectedTool === 'line' ? 'bg-blue-500 text-white' : 'hover:bg-gray-100 dark:hover:bg-slate-700 dark:text-white'} rounded"
            onclick={() => {
              selectTool(stage, layer, "line");
              toggleDropdown();
            }}
          >
            <Slash strokeWidth={1.5} size={20} />
          </button>
          <div class="absolute z-10 invisible group-hover:visible bg-gray-800 text-white text-sm px-2 py-1 rounded mb-2 whitespace-nowrap transform -translate-x-1/2 left-1/2 bottom-full">Line</div>
        </div>
      </div>
    </div>
  </div>
</div>
