<script lang="ts">
  import type { PenginMessage } from '$lib/types/ui/message';
  import { createEventDispatcher } from 'svelte';

  export let message: PenginMessage;

  const dispatch = createEventDispatcher();
  export let contextDiv: HTMLDivElement;

  const onClick = (e: MouseEvent) => {
    if (e.target != contextDiv && !contextDiv.contains(e.target as Node)) dispatch('close');
  };

  const copyButton = () => {
    navigator.clipboard.writeText(message.content).then(() => {
      dispatch('close');
    });
  };
</script>

<svelte:window on:mousedown={onClick} />

<div id="context" bind:this={contextDiv}>
  <button on:click={copyButton}>Copy</button>
</div>

<style>
  #context {
    position: fixed;
    border-radius: 10px;
    padding: 10px 0;
    width: 150px;
    background-color: var(--purple-200);
  }

  button {
    border: unset;
    width: 100%;
    color: inherit;
    background-color: transparent;
    padding: 5px;
  }

  button:hover {
    border: unset;
    width: 100%;
    color: inherit;
    background-color: var(--purple-300);
    padding: 5px;
  }
</style>

