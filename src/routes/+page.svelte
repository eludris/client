<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import data from '$lib/data';

  onMount(() => {
    if (!$data) goto('/login');
  });

  const logOut = () => {
    data.set(null);
    goto('/login');
  };
</script>

<button on:click={logOut}> Logout </button>

<div class="message-channel" />

<style>
  .message-channel {
    width: 100vw;
    height: 100vh;
  }
</style>
