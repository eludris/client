<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import data from '$lib/data';

  let value = '';
  let instanceURL = '';
  let error = '';

  onMount(() => {
    if ($data) goto('/');
  });

  const onSubmit = () => {
    if (!error && value) {
      const url: string = instanceURL.startsWith('http') ? instanceURL : 'https://' + instanceURL; // I could one line this but I like my codebases sane
      data.set({
        name: value,
        instanceURL: instanceURL ? url : 'https://eludris.tooty.xyz'
      });
      goto('/');
    }
  };

  const onUsernameKeyUp = () => {
    if (value.length < 2 || value.length > 32) {
      error = 'Your username must be between 2 and 32 characters in length';
    } else {
      error = '';
    }
  };

  const onURLKeyUp = () => {
    if (!instanceURL) {
      error = '';
      return;
    }
    const url: string = instanceURL.startsWith('http') ? instanceURL : 'https://' + instanceURL;
    try {
      new URL(url);
      error = '';
    } catch {
      error = 'Invalid instance url';
    }
  };
</script>

<div id="login-div">
  <form id="login-form" on:submit|preventDefault={onSubmit}>
    <h1>Log in to Eludris</h1>
    <label for="username">Username</label>
    <input on:keyup={onUsernameKeyUp} bind:value name="username" placeholder="Username" />
    <label for="instanceUrl">Instance URL</label>
    <input
      on:keyup={onURLKeyUp}
      bind:value={instanceURL}
      name="instanceUrl"
      placeholder="https://eludris.tooty.xyz"
    />
    {#if error}
      <span class="error">{error}</span>
    {/if}
    <button type="submit" disabled={!!error}>Log in</button>
  </form>
</div>
