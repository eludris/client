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

<div id="bg" />
<slot />

<style>
  #bg {
    position: fixed;
    top: 0;
    left: 0;
    z-index: -1;
    width: 100vw;
    height: 100vh;
    padding: 0;
    margin: 0;
  }
</style>
