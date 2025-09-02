<script lang="ts">
  import "../app.css";
  let { children } = $props();
</script>

<svelte:head>
  <title>WytBored</title>
</svelte:head>
{@render children()}
