<script lang="ts">
  import { theme } from "$lib/theme.js";
  import { opacity, selectedColor, strokeStyle } from "./tools.js";

  const colors = [
    {
      twclass: "bg-slate-400",
      hex: "#94a3b8",
    },
    {
      twclass: "bg-fuchsia-400",
      hex: "#e879f9",
    },
    {
      twclass: "bg-purple-500",
      hex: "#a855f7",
    },
    {
      twclass: "bg-blue-600",
      hex: "#2563eb",
    },
    {
      twclass: "bg-sky-400",
      hex: "#38bdf8",
    },
    {
      twclass: "bg-amber-400",
      hex: "#fbbf24",
    },
    {
      twclass: "bg-orange-500",
      hex: "#f97316",
    },
    {
      twclass: "bg-green-600",
      hex: "#16a34a",
    },
    {
      twclass: "bg-emerald-400",
      hex: "#34d399",
    },
    {
      twclass: "bg-red-400",
      hex: "#f87171",
    },
    {
      twclass: "bg-red-600",
      hex: "#dc2626",
    },
  ];
</script>

<div class="fixed top-0 right-0 flex flex-col gap-4 bg-white dark:bg-slate-800 border border-gray-300 shadow-lg rounded-lg p-2 m-2">
  <div class="grid grid-cols-4 gap-1 md:gap-4">
    {#if $theme === "light"}
      <!-- svelte-ignore a11y_consider_explicit_label -->
      <button class="relative p-2 w-8 h-8 hover:bg-gray-100 dark:hover:bg-slate-700 {$selectedColor === '#000000' ? 'bg-gray-200 dark:bg-slate-600' : ''} rounded" onclick={() => ($selectedColor = "#000000")}>
        <span class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-black rounded-full"></span>
      </button>
    {:else}
      <!-- svelte-ignore a11y_consider_explicit_label -->
      <button class="relative p-2 w-8 h-8 hover:bg-gray-100 dark:hover:bg-slate-700 {$selectedColor === '#ffffff' ? 'bg-gray-200 dark:bg-slate-600' : ''} rounded" onclick={() => ($selectedColor = "#ffffff")}>
        <span class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full"></span>
      </button>
    {/if}
    {#each colors as { twclass, hex }}
      <!-- svelte-ignore a11y_consider_explicit_label -->
      <button class="relative p-2 w-8 h-8 hover:bg-gray-100 dark:hover:bg-slate-700 {$selectedColor === hex ? 'bg-gray-200 dark:bg-slate-600' : ''} rounded" onclick={() => ($selectedColor = hex)}>
        <span class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 {twclass} rounded-full"></span>
      </button>
    {/each}
  </div>

  <input type="range" min="0.2" max="1" step="0.1" bind:value={$opacity} />

  <div class="grid grid-cols-3 place-items-center mb-2">
    <button class="border-2 border-black dark:border-white p-2 w-4 md:w-6 h-4 md:h-6 hover:bg-gray-100 dark:hover:bg-slate-700 {$strokeStyle === 'solid' ? 'bg-gray-200 dark:bg-slate-600' : ''} rounded-full" onclick={() => ($strokeStyle = "solid")}>
      <!-- Nothing -->
    </button>
    <button class="border-2 border-dashed border-black dark:border-white p-2 w-4 md:w-6 h-4 md:h-6 hover:bg-gray-100 dark:hover:bg-slate-700 {$strokeStyle === 'dash' ? 'bg-gray-200 dark:bg-slate-600' : ''} rounded-full" onclick={() => ($strokeStyle = "dash")}>
      <!-- Nothing -->
    </button>
    <button class="border-2 border-dotted border-black dark:border-white p-2 w-4 md:w-6 h-4 md:h-6 hover:bg-gray-100 dark:hover:bg-slate-700 {$strokeStyle === 'dot' ? 'bg-gray-200 dark:bg-slate-600' : ''} rounded-full" onclick={() => ($strokeStyle = "dot")}>
      <!-- Nothing -->
    </button>
  </div>
</div>
