<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import userData from '$lib/user_data';

  let value = '';
  let instanceURL = '';
  let error = '';

  onMount(() => {
    if ($userData) goto('/');
  });

  const onSubmit = () => {
    if (!error && value) {
      const url: string = instanceURL.startsWith('http') ? instanceURL : 'https://' + instanceURL; // I could one line this but I like my codebases sane
      userData.set({
        name: value,
        instanceURL: instanceURL ? url : 'https://eludris.tooty.xyz'
      });
      goto('/');
      if ('Notification' in window && Notification.permission == 'default') {
        Notification.requestPermission();
      }
    }
  };

  const onUsernameInput = () => {
    if (value.length < 2 || value.length > 32) {
      error = 'Your username must be between 2 and 32 characters in length';
    } else {
      error = '';
    }
  };

  const onURLInput = () => {
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
    <input bind:value on:input={onUsernameInput} name="username" placeholder="Username" />
    <label for="instanceUrl">Instance URL</label>
    <input
      bind:value={instanceURL}
      on:input={onURLInput}
      name="instanceUrl"
      placeholder="https://eludris.tooty.xyz"
    />
    {#if error}
      <span class="error">{error}</span>
    {/if}
    <button type="submit" disabled={!!error}>Log in</button>
  </form>
</div>

<style>
  #login-div {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  #login-form {
    display: flex;
    align-items: center;
    justify-items: center;
    flex-direction: column;
    background-color: var(--purple-100);
    border-radius: 10px;
    padding: 40px;
    width: 400px;
  }

  #login-form > h1 {
    font-size: 42px;
  }

  #login-form > label {
    font-size: 20px;
    margin-bottom: 5px;
  }

  #login-form > input {
    margin: 20px;
    margin-top: 0;
    width: 100%;
    font-size: 18px;
    padding: 5px 10px;
    outline: none;
    border: 2px solid var(--pink-200);
    border-radius: 10px;
    background-color: var(--purple-200);
    color: inherit;
  }

  #login-form > button {
    margin: 20px;
    margin-bottom: 10px;
    font-size: 20px;
    padding: 13px 20px;
    outline: none;
    border: unset;
    border-radius: 25px;
    background-color: var(--pink-500);
    color: var(--purple-100);
    box-shadow: 0 2px 4px var(--purple-200);
    transition: box-shadow ease-in-out 200ms, color ease-in-out 200ms,
      background-color ease-in-out 200ms;
    width: 200px;
    cursor: pointer;
  }

  #login-form > button:hover {
    box-shadow: 0 5px 20px var(--purple-200);
    background-color: var(--pink-600);
  }

  #login-form > button:disabled {
    background-color: var(--pink-300);
    box-shadow: 0 2px 2px var(--gray-100);
  }

  .error {
    color: var(--pink-700);
    text-align: center;
  }

  @media only screen and (max-width: 1200px) {
    #login-form > h1 {
      font-size: 36px;
    }

    #login-div {
      margin: 10px;
      margin-top: 0;
      width: 95%;
    }
  }
</style>
