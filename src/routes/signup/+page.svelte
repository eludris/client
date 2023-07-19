<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import userData from '$lib/user_data';
  import { request, type RequestErr } from '$lib/request';
  import type { InstanceInfo } from '$lib/types/instance';
  import type { User } from '$lib/types/user';
  import type { SessionCreated } from '$lib/types/session';

  const EMAIL_REGEX = new RegExp(
    /^(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9]))\.){3}(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9])|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])$/
  );

  let username = '';
  let email = '';
  let password = '';
  let instanceURL = '';
  let error = '';
  let requesting = false;

  onMount(() => {
    if ($userData) goto('/');
  });

  const onSubmit = async () => {
    if (!error && username) {
      if ('Notification' in window && Notification.permission == 'default') {
        Notification.requestPermission();
      }
      const url: string = instanceURL.startsWith('http') ? instanceURL : 'https://' + instanceURL; // I could one line this but I like my codebases sane
      instanceURL = instanceURL ? url : 'https://eludris.tooty.xyz/next/';
      error = 'Loading...';
      requesting = true;
      try {
        let instanceInfo: InstanceInfo = await request('GET', '', null, { apiUrl: url });
        await request('POST', 'users', { username, email, password }, { apiUrl: url });
        let session: SessionCreated = await request(
          'POST',
          'sessions',
          { identifier: username, password, platform: 'linox', client: 'pengin' },
          { apiUrl: url }
        );
        let user: User = await request('GET', 'users/@me', null, {
          apiUrl: url,
          token: session.token
        });
        userData.set({
          user,
          session,
          instanceInfo
        });
        goto('/');
      } catch (e) {
        let err = e as RequestErr;
        if (err.code == 409) {
          error = `A user with this  ${err.err.item} already exists`;
        } else {
          error = err.message;
        }
        requesting = false;
      }
    }
  };

  const onUsernameInput = () => {
    validateInputs();
  };

  const onEmailInput = () => {
    validateInputs();
  };

  const onPasswordInput = () => {
    validateInputs();
  };

  const onURLInput = () => {
    validateInputs();
  };

  const validateInputs = () => {
    if (requesting) {
      return;
    }
    username = username.trim().toLowerCase();
    if (username.length < 2 || username.length > 32) {
      error = 'Your username must be between 2 and 32 characters in length';
    } else if (!EMAIL_REGEX.test(email)) {
      error = 'You must pass a valid email';
    } else if (password.length < 8) {
      error = 'Your password must be at least 8 characters long';
    } else if (instanceURL) {
      const url: string = instanceURL.startsWith('http') ? instanceURL : 'https://' + instanceURL;
      try {
        new URL(url);
        error = '';
      } catch {
        error = 'Invalid instance url';
      }
    } else {
      error = '';
    }
  };
</script>

<div id="signup-div">
  <form id="signup-form" on:submit|preventDefault={onSubmit}>
    <h1>Make an Eludris account</h1>
    <label for="username">Username</label>
    <input
      bind:value={username}
      on:input={onUsernameInput}
      name="username"
      placeholder="Username"
    />
    <label for="email">Email</label>
    <input bind:value={email} on:input={onEmailInput} name="email" placeholder="Email" />
    <label for="password">Password</label>
    <input
      bind:value={password}
      on:input={onPasswordInput}
      name="password"
      placeholder="Password"
      type="password"
    />
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
    <button type="submit" disabled={!!error}>Sign up</button>
    <a id="login-prompt" href="/login">Already have an account? Log in!</a>
  </form>
</div>

<style>
  #signup-div {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  #signup-form {
    display: flex;
    align-items: center;
    justify-items: center;
    flex-direction: column;
    background-color: var(--purple-100);
    border-radius: 10px;
    padding: 40px;
    width: 400px;
  }

  #signup-form > h1 {
    font-size: 34px;
  }

  #signup-form > label {
    font-size: 20px;
    margin-bottom: 5px;
  }

  #signup-form > input {
    margin: 20px;
    margin-top: 0;
    width: 90%;
    font-size: 18px;
    padding: 5px 10px;
    outline: none;
    border: 2px solid var(--pink-200);
    border-radius: 10px;
    background-color: var(--purple-200);
    color: inherit;
  }

  #signup-form > button {
    margin: 20px;
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

  #signup-form > button:hover {
    box-shadow: 0 5px 20px var(--purple-200);
    background-color: var(--pink-600);
  }

  #signup-form > button:disabled {
    background-color: var(--pink-300);
    box-shadow: 0 2px 2px var(--gray-100);
  }

  .error {
    color: var(--pink-700);
    text-align: center;
  }

  #login-prompt {
    font-weight: 300;
  }

  @media only screen and (max-width: 1200px) {
    #signup-form > h1 {
      font-size: 36px;
    }

    #signup-div {
      margin: 10px;
      margin-top: 0;
      width: 95%;
    }
  }
</style>
