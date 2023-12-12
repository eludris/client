<script lang="ts">
  import config from '$lib/user_config';
</script>

<svelte:head>
  {#if $config.styles}
    {#if $config.styles.indexOf('</styles>') == -1}
      <!-- poor man's sanitization /shrug -->
      {@html `<style>${$config.styles}</style>`}
    {/if}
  {/if}
  {#if $config.showSpoilers}
    <style>
      .md .spoiler {
        color: inherit;
        cursor: default;
      }

      .md .spoiler img {
        filter: none;
      }
    </style>
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
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    padding: 0;
    margin: 0;
  }
</style>
