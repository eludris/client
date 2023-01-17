<script lang="ts">
  import data from '$lib/data';
</script>

<a href="/">Back</a>
{#if $data}
  <input bind:value={$data.name} />
  <textarea bind:value={$data.styles} />
{/if}
