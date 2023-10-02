<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import userData from '$lib/user_data';
  import { request, type RequestErr } from '$lib/request';
  import type { InstanceInfo } from '$lib/types/instance';
  import type { User } from '$lib/types/user';
  import type { SessionCreated } from '$lib/types/session';
  import { env } from '$env/dynamic/public';
  import getPlatform from '$lib/platform';

  let username = '';
  let password = '';
  let instanceURL = env.PUBLIC_INSTANCE_URL ?? 'https://eludris.tooty.xyz';
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
      error = 'Loading...';
      requesting = true;
      try {
        let instanceInfo: InstanceInfo = await request('GET', '', null, { apiUrl: instanceURL });
        let session: SessionCreated = await request(
          'POST',
          'sessions',
          { identifier: username, password, platform: getPlatform(), client: 'pengin' },
          { apiUrl: instanceURL }
        );
        let user: User = await request('GET', 'users/@me', null, {
          apiUrl: instanceURL,
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
        if (err.code == 404 || err.code == 401) {
          error = 'Incorrect username or password';
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

  const onPasswordInput = () => {
    validateInputs();
  };

  const validateInputs = () => {
    if (requesting) {
      return;
    }
    username = username.trim();
    if (password.length < 8) {
      error = 'Your password must be at least 8 characters long';
    } else {
      error = '';
    }
  };
</script>

<div id="login-div">
  <form id="login-form" on:submit|preventDefault={onSubmit}>
    <h1>Log in to Eludris</h1>
    <label for="username">Username / Email</label>
    <input
      bind:value={username}
      on:input={onUsernameInput}
      name="username"
      placeholder="Username / Email"
    />
    <label for="password">Password</label>
    <input
      bind:value={password}
      on:input={onPasswordInput}
      name="password"
      placeholder="Password"
      type="password"
    />
    {#if error}
      <span class="error">{error}</span>
    {/if}
    <button type="submit" disabled={!!error}>Log in</button>
    <a id="signup-prompt" href="/signup">Don't have an account? Sign up!</a>
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
    font-size: 34px;
  }

  #login-form > label {
    font-size: 20px;
    margin-bottom: 5px;
  }

  #login-form > input {
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

  #login-form > button {
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

  #signup-prompt {
    font-weight: 300;
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
