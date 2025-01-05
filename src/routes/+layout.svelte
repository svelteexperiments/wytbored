<script lang="ts">
  import "../app.css";
  let { children } = $props();
</script>

<svelte:head>
  <title>Svelte Whiteboard Demo</title>
</svelte:head>
{@render children()}
