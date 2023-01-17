<script lang="ts">
  import data from '$lib/data';
</script>

<svelte:head>
  {#if $data?.styles}
    {#if $data.styles.indexOf('</styles>') == -1}
      <!-- poor man's sanitization /shrug -->
      {@html `<style>${$data.styles}</style>`}
    {/if}
  {/if}
</svelte:head>

<slot />
