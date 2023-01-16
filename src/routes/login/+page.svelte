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

<form id="login-form" on:submit|preventDefault={onSubmit}>
  <h1>log in or else</h1>
  <label for="username">Username</label>
  <input bind:value name="username" />
  <label for="instanceUrl">Instance URL</label>
  <input bind:value={instanceURL} name="instanceUrl" />
  <button type="submit">Log In</button>
</form>
