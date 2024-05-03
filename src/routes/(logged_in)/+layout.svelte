<script lang="ts">
  import { onMount } from 'svelte';
  import userData from '$lib/user_data';
  import { goto } from '$app/navigation';
  import state from '$lib/ws';
  import type { PageData } from './$types';

  onMount(() => {
    if (!$userData) goto('/login');
  });

  export let data: PageData;
  let showHelp = false;

  setTimeout(() => {
    showHelp = true;
  }, 10_000); // 10 seconds

  const logOut = () => {
    userData.set(null);
    goto('/login');
  };
</script>

{#if $userData && $state.connected}
  <slot />
{:else}
  <div id="fact">
    <h1>Fun Fact</h1>
    <p>{@html data.fact}</p>
    <span>Yes, this is a loading screen</span>
  </div>
  {#if showHelp}
    <div id="help">
      <span>Issues connecting?</span>
      <a class="help-option" href="https://discord.gg/vV6v2DhWQB" target="_blank" rel="noreferrer"
        >Get help</a
      >
      <span id="separator" />
      <button class="help-option" on:click={logOut}>Log out</button>
    </div>
  {/if}
{/if}

<style>
  #fact {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 5px;
    text-align: center;
    box-sizing: border-box;
  }

  #fact > h1 {
    font-size: 42px;
    margin-bottom: 5px;
  }

  #fact > span {
    font-weight: 300;
    font-size: 12px;
  }

  #help {
    position: fixed;
    bottom: 0;
    width: 100%;
    text-align: center;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 5px;
    padding: 10px;
  }

  #separator {
    display: inline-block;
    height: 1px;
    width: 7px;
    background-color: var(--gray-600);
  }

  .help-option {
    border: unset;
    background-color: transparent;
    color: var(--gray-500);
    font-size: inherit;
    cursor: pointer;
    align-self: baseline;
    transition: color ease-in-out 125ms;
    text-decoration: underline;
  }

  .help-option:hover {
    color: var(--gray-600);
  }
</style>
