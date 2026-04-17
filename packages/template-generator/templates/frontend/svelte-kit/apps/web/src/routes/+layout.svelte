<script lang="ts">
  let { children } = $props();
</script>

{@render children()}

<style>
  :global(html, body) {
    margin: 0;
    padding: 0;
    background: #0f0f0f;
    color: #e5e5e5;
    font-family: ui-sans-serif, system-ui, -apple-system, sans-serif;
    color-scheme: dark;
  }
  :global(*) {
    box-sizing: border-box;
  }
  :global(code) {
    font-family: ui-monospace, "JetBrains Mono", monospace;
    background: rgba(255, 255, 255, 0.08);
    padding: 0 4px;
  }
</style>
