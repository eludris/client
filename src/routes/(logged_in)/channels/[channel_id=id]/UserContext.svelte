<script lang="ts">
  import type { User } from '$lib/types/user';
  import { createEventDispatcher } from 'svelte';

  export let user: User;

  const dispatch = createEventDispatcher();
  export let contextDiv: HTMLDivElement;

  const onClick = (e: MouseEvent) => {
    if (e.target != contextDiv && !contextDiv.contains(e.target as Node)) dispatch('close');
  };

  const copyIdButton = () => {
    navigator.clipboard.writeText(user.id.toString()).then(() => {
      dispatch('close');
    });
  };

  const profileButton = () => {
    dispatch('showProfile', user.id);
    dispatch('close');
  };

  const mentionButton = () => {
    dispatch('mention', user);
    dispatch('close');
  };

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key == 'Escape') {
      dispatch('close');
    }
  };
</script>

<svelte:window on:mousedown={onClick} on:keydown={onKeyDown} />

<div id="context" bind:this={contextDiv}>
  <button on:click={profileButton}>Profile</button>
  <button on:click={mentionButton}>Mention</button>
  <hr />
  <button on:click={copyIdButton}>Copy ID</button>
</div>

<style>
  #context {
    position: fixed;
    border-radius: 10px;
    padding: 10px 0;
    width: 150px;
    background-color: var(--purple-200);
    z-index: 999;
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

  hr {
    width: 90%;
    color: #fff3;
  }
</style>
