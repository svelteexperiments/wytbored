<script lang="ts">
  import { selectedColor } from "./tools.js";

  const colors = [
    {
      twclass: "bg-black",
      hex: "#000000",
    },
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

<div class="fixed top-0 right-0 flex flex-col gap-4 bg-white border border-gray-300 shadow-lg rounded-lg p-2 m-2">
  <div class="grid grid-cols-4 gap-4">
    {#each colors as { twclass, hex }}
      <!-- svelte-ignore a11y_consider_explicit_label -->
      <button class="relative p-2 w-8 h-8 hover:bg-gray-100 {$selectedColor === hex ? 'bg-gray-200' : ''} rounded" onclick={() => ($selectedColor = hex)}>
        <span class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 {twclass} rounded-full"></span>
      </button>
    {/each}
  </div>
  <hr />
  <input type="range" min="0.2" max="1" step="0.1" value="1" />
</div>
