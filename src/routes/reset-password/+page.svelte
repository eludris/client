<script lang="ts">
  import { page } from '$app/stores';
  import { env } from '$env/dynamic/public';
  import { request, type RequestErr } from '$lib/request';
  import { onMount } from 'svelte';

  const EMAIL_REGEX = new RegExp(
    /^(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9]))\.){3}(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9])|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])$/
  );
  const INSTANCE_URL = env.PUBLIC_INSTANCE_URL ?? 'https://eludris.tooty.xyz/next';

  let codeSent = false;
  let passwordReset = false;
  let sending = false;
  let error = '';

  let email = $page.url.searchParams.get('email') || '';
  let code = '';
  let newPassword = '';
  let confirmPassword = '';

  onMount(() => {
    verifyEmail();
  });

  const verifyEmail = () => {
    if (email) {
      if (!EMAIL_REGEX.test(email)) {
        error = 'Invalid email';
      } else {
        error = '';
      }
    } else {
      error = '';
    }
  };

  const requestCode = async () => {
    sending = true;
    try {
      await request(
        'POST',
        '/users/reset-password',
        { email },
        { apiUrl: INSTANCE_URL, empty: true }
      );
    } catch (e) {
      let err = e as RequestErr;
      if (err.code == 404) {
        error = "A user with this email doesn't exist";
      } else {
        error = err.message;
      }
      sending = false;
      return;
    }
    sending = false;
    codeSent = true;
  };

  const verifyCode = () => {
    code = code.trim().replace(' ', '');
    error = '';
  };

  const verifyPassword = () => {
    if (newPassword) {
      if (newPassword.length < 8) {
        error = 'Password must be at least 8 characters long';
      } else {
        error = '';
        if (confirmPassword) {
          if (newPassword != confirmPassword) {
            error = 'Passwords must match';
          } else {
            error = '';
          }
        }
      }
    } else {
      error = '';
    }
  };

  const resetPassword = async () => {
    sending = true;
    try {
      await request(
        'PATCH',
        '/users/reset-password',
        { email, code: Number.parseInt(code), password: newPassword },
        { apiUrl: INSTANCE_URL, empty: true }
      );
    } catch (e) {
      let err = e as RequestErr;
      if (err.code == 422) {
        error = 'Incorrect code';
      } else {
        error = err.message;
      }
      sending = false;
      return;
    }
    sending = false;
    passwordReset = true;
  };
</script>

<div id="wrapper">
  <div id="reset-password">
    {#if !codeSent}
      <form on:submit|preventDefault={requestCode}>
        <h1>Request a password reset code</h1>
        <label for="email">Email</label>
        <input
          type="text"
          name="email"
          placeholder="email"
          bind:value={email}
          on:input={verifyEmail}
        />
        <button disabled={!email || !!error || sending}>Send code</button>
      </form>
    {:else if !passwordReset}
      <form on:submit|preventDefault={resetPassword}>
        <h1>Choose a new password</h1>
        <span>Check your email for a password reset coded</span>
        <label for="code">Code</label>
        <input
          type="text"
          name="code"
          placeholder="password reset code"
          bind:value={code}
          on:input={verifyCode}
        />
        <label for="password">New password</label>
        <input
          type="password"
          name="password"
          placeholder="new password"
          bind:value={newPassword}
          on:input={verifyPassword}
        />
        <label for="confirm-password">Confirm password</label>
        <input
          type="password"
          name="confirm-password"
          placeholder="confirm password"
          bind:value={confirmPassword}
          on:input={verifyPassword}
        />
        <button disabled={code.length != 6 || !confirmPassword || !!error || sending}>
          Reset password
        </button>
      </form>
    {:else}
      <h2 id="success">You have successfully reset your password</h2>
      <a href="/login">Back</a>
    {/if}
    {#if error}
      <span id="error">{error}</span>
    {/if}
  </div>
</div>

<style>
  #wrapper {
    display: flex;
    height: 100%;
    align-items: center;
    justify-content: center;
  }

  #reset-password {
    display: flex;
    flex-direction: column;
    width: min(400px, 95%);
    padding: 40px;
    background-color: var(--purple-100);
    border-radius: 10px;
    align-items: center;
    justify-content: center;
  }

  form {
    display: flex;
    width: 100%;
    gap: 10px;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }

  h1 {
    font-size: 34px;
    text-align: center;
  }

  label {
    font-size: 20px;
    margin-bottom: 5px;
  }

  input {
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

  button {
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

  button:hover {
    box-shadow: 0 5px 20px var(--purple-200);
    background-color: var(--pink-600);
  }

  button:disabled {
    background-color: var(--pink-300);
    box-shadow: 0 2px 2px var(--gray-100);
    cursor: default;
  }

  #success {
    text-align: center;
  }

  #error {
    color: var(--pink-700);
    text-align: center;
  }
</style>
