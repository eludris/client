<script lang="ts">
  import userData from '$lib/user_data';
</script>

<svelte:head>
  {#if $userData?.styles}
    {#if $userData.styles.indexOf('</styles>') == -1}
      <!-- poor man's sanitization /shrug -->
      {@html `<style>${$userData.styles}</style>`}
    {/if}
  {/if}
</svelte:head>

<div id="bg" />
<div id="app">
  <slot />
</div>

<style>
  #bg {
    position: fixed;
    top: 0;
    left: 0;
    z-index: -1;
    width: 100%;
    height: 100%;
    padding: 0;
    margin: 0;
  }

  #app {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    padding: 0;
    margin: 0;
  }
</style>
