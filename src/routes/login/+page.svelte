<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import data from '$lib/data';

  let value = '';
  let instanceURL = '';

  onMount(() => {
    if ($data) goto('/');
  });

  const onSubmit = () => {
    data.set({
      name: value,
      instanceURL: instanceURL ? instanceURL : 'https://eludris.tooty.xyz'
    });
    goto('/');
  };
</script>

<div id="login-div">
  <form id="login-form" on:submit|preventDefault={onSubmit}>
    <h1>Log in to Eludris</h1>
    <label for="username">Username</label>
    <input bind:value name="username" />
    <label for="instanceUrl">Instance URL</label>
    <input bind:value={instanceURL} name="instanceUrl" placeholder="https://eludris.tooty.xyz" />
    <button type="submit">Log in</button>
  </form>
</div>
