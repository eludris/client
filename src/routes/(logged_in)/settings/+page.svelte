<script lang="ts">
  import { goto } from '$app/navigation';
  import Popup from '$lib/components/Popup.svelte';
  import { request, type RequestErr } from '$lib/request';
  import userData from '$lib/user_data';

  const USERNAME_REGEX = new RegExp(/^[a-z0-9_-]{2,32}$/);
  const EMAIL_REGEX = new RegExp(
    /^(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9]))\.){3}(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9])|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])$/
  );

  let avatar = $userData!.user.avatar
    ? `${$userData!.instanceInfo.effis_url}/avatars/${$userData?.user.avatar}`
    : 'https://github.com/eludris/.github/blob/main/assets/thang-big.png?raw=true';

  let showEmail = false;

  let edit = '';
  let error = '';
  let saving = false;

  let username = '';
  let email = '';
  let newPassword = '';
  let confirmPassword = '';

  const usernameInput = () => {
    username = username.toLowerCase().trim();
    if (username) {
      if (!USERNAME_REGEX.test(username)) {
        error =
          'Username must be between 2 and 32 characters and only include letters, numbers, dashes and underscores';
      } else {
        error = '';
      }
    } else {
      error = '';
    }
  };

  const emailInput = () => {
    email = email.trim();
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

  const passwordInput = () => {
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

  let password = '';

  const toggleEmail = () => {
    showEmail = !showEmail;
  };

  const editUsername = () => {
    edit = 'username';
  };

  const editEmail = () => {
    edit = 'email';
  };

  const editPassword = () => {
    edit = 'password';
  };

  const popupDismiss = () => {
    error = '';
    edit = '';
  };

  const updateUsername = async () => {
    saving = true;
    try {
      await request('PATCH', '/users', { password, username });
    } catch (e) {
      let err = e as RequestErr;
      if (err.code == 409) {
        error = 'A user with this username already exists';
      } else if (err.code == 401) {
        error = 'Incorrect password';
      } else {
        error = err.message;
      }
      saving = false;
      return;
    }
    saving = false;
    username = '';
    password = '';
    popupDismiss();
  };

  const updateEmail = async () => {
    saving = true;
    try {
      await request('PATCH', '/users', { password, email });
    } catch (e) {
      let err = e as RequestErr;
      if (err.code == 409) {
        error = 'A user with this email already exists';
      } else if (err.code == 401) {
        error = 'Incorrect password';
      } else {
        error = err.message;
      }
      saving = false;
      return;
    }
    saving = false;
    email = '';
    password = '';
    popupDismiss();
  };

  const updatePassword = async () => {
    saving = true;
    try {
      await request('PATCH', '/users', { password, new_password: newPassword });
    } catch (e) {
      let err = e as RequestErr;
      if (err.code == 401) {
        error = 'Incorrect password';
      } else {
        error = err.message;
      }
      saving = false;
      return;
    }
    saving = false;
    password = '';
    newPassword = '';
    confirmPassword = '';
    popupDismiss();
  };

  const logOut = () => {
    userData.set(null);
    goto('/login');
  };
</script>

{#if $userData}
  <div id="user-display">
    <img src={avatar} alt="Your avatar" id="avatar" />
    <span id="username"> {$userData.user.display_name || $userData.user.username}</span>
  </div>
  <div class="setting">
    <span class="current">
      <h3>Username</h3>
      <span>
        {$userData.user.username}
      </span>
    </span>
    <button class="edit-button" on:click={editUsername}>
      <!-- https://icon-sets.iconify.design/material-symbols/edit/ -->
      <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24"
        ><path
          fill="currentColor"
          d="m19.3 8.925l-4.25-4.2l1.4-1.4q.575-.575 1.413-.575t1.412.575l1.4 1.4q.575.575.6 1.388t-.55 1.387L19.3 8.925ZM17.85 10.4L7.25 21H3v-4.25l10.6-10.6l4.25 4.25Z"
        /></svg
      >
    </button>
    {#if edit == 'username'}
      <Popup on:dismiss={popupDismiss}>
        <span slot="title">Edit your username</span>
        <div class="popup-body">
          <label for="username">Username</label>
          <input
            name="username"
            type="text"
            placeholder={$userData.user.username}
            bind:value={username}
            on:input={usernameInput}
          />
          <label for="password">Password</label>
          <input name="password" type="password" placeholder="Password" bind:value={password} />
          {#if error}
            <span class="error">{error}</span>
          {/if}
        </div>
        <span class="popup-control" slot="control">
          <button class="popup-dismiss" on:click={popupDismiss}>Nevermind</button>
          <button
            class="popup-confirm"
            on:click={updateUsername}
            disabled={!username || !!error || saving}>Confirm</button
          >
        </span>
      </Popup>
    {/if}
  </div>
  <div class="setting">
    <span class="current">
      <h3>Email</h3>
      {#if showEmail}
        <span>
          {$userData.user.email}
        </span>
      {:else}
        <span>
          {$userData.user.email?.replace(/[^@.]/gm, '*')}
        </span>
      {/if}
      <button on:click={toggleEmail}>{showEmail ? 'Hide' : 'Show'}</button>
    </span>
    <button class="edit-button" on:click={editEmail}>
      <!-- https://icon-sets.iconify.design/material-symbols/edit/ -->
      <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24"
        ><path
          fill="currentColor"
          d="m19.3 8.925l-4.25-4.2l1.4-1.4q.575-.575 1.413-.575t1.412.575l1.4 1.4q.575.575.6 1.388t-.55 1.387L19.3 8.925ZM17.85 10.4L7.25 21H3v-4.25l10.6-10.6l4.25 4.25Z"
        /></svg
      >
    </button>
    {#if edit == 'email'}
      <Popup on:dismiss={popupDismiss}>
        <span slot="title">Edit your email</span>
        <div class="popup-body">
          <label for="email">Email</label>
          <input
            name="email"
            type="text"
            placeholder="Email"
            bind:value={email}
            on:input={emailInput}
          />
          <label for="password">Password</label>
          <input name="password" type="password" placeholder="Password" bind:value={password} />
          {#if error}
            <span class="error">{error}</span>
          {/if}
        </div>
        <span class="popup-control" slot="control">
          <button class="popup-dismiss" on:click={popupDismiss}>Nevermind</button>
          <button
            class="popup-confirm"
            on:click={updateEmail}
            disabled={!email || !!error || saving}>Confirm</button
          >
        </span>
      </Popup>
    {/if}
  </div>
  <div class="setting">
    <span class="current">
      <h3>Password</h3>
      <span> •••••••••••• </span>
    </span>
    <button class="edit-button" on:click={editPassword}>
      <!-- https://icon-sets.iconify.design/material-symbols/edit/ -->
      <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24"
        ><path
          fill="currentColor"
          d="m19.3 8.925l-4.25-4.2l1.4-1.4q.575-.575 1.413-.575t1.412.575l1.4 1.4q.575.575.6 1.388t-.55 1.387L19.3 8.925ZM17.85 10.4L7.25 21H3v-4.25l10.6-10.6l4.25 4.25Z"
        /></svg
      >
    </button>
    {#if edit == 'password'}
      <Popup on:dismiss={popupDismiss}>
        <span slot="title">Edit your password</span>
        <div class="popup-body">
          <label for="password">Old password</label>
          <input name="password" type="password" placeholder="Old password" bind:value={password} />
          <label for="new-password">New password</label>
          <input
            name="new-password"
            type="password"
            placeholder="New password"
            bind:value={newPassword}
            on:input={passwordInput}
          />
          <label for="confirm-password">Confirm password</label>
          <input
            name="confirm-password"
            type="password"
            placeholder="Confirm password"
            bind:value={confirmPassword}
            on:input={passwordInput}
          />
          {#if error}
            <span class="error">{error}</span>
          {/if}
        </div>
        <span class="popup-control" slot="control">
          <button class="popup-dismiss" on:click={popupDismiss}>Nevermind</button>
          <button
            class="popup-confirm"
            on:click={updatePassword}
            disabled={!confirmPassword || !!error || saving}>Confirm</button
          >
        </span>
      </Popup>
    {/if}
  </div>
  <div>
    <button id="logout" on:click={logOut}>
      <!-- https://icon-sets.iconify.design/mdi/exit-to-app/ -->
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
        ><path
          fill="currentColor"
          d="M19 3H5c-1.11 0-2 .89-2 2v4h2V5h14v14H5v-4H3v4a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2m-8.92 12.58L11.5 17l5-5l-5-5l-1.42 1.41L12.67 11H3v2h9.67l-2.59 2.58Z"
        /></svg
      >
      Log out
    </button>
  </div>
{/if}

<style>
  #user-display {
    display: flex;
  }

  #avatar {
    border-radius: 100%;
    width: 100px;
    height: 100px;
  }

  #username {
    margin-top: 25px;
    font-size: 20px;
  }

  .setting {
    flex-direction: row;
    background-color: var(--gray-200);
    padding: 10px;
    border-radius: 10px;
  }

  h3 {
    margin: 0 0 5px 0;
    color: var(--color-text);
  }

  .current {
    flex-grow: 1;
    color: #aaa;
  }

  .edit-button {
    width: fit-content;
    align-self: flex-start;
    border: unset;
    border-radius: 5px;
    padding: 5px;
    font-size: 18px;
    background-color: var(--gray-300);
    transition: background-color ease-in-out 125ms;
    color: var(--color-text);
    height: 40px;
    cursor: pointer;
  }

  .edit-button:hover {
    background-color: var(--gray-400);
  }

  .current button {
    background-color: inherit;
    border: unset;
    font-size: inherit;
    color: var(--pink-500);
    font-weight: 300;
    padding: 0;
    cursor: pointer;
    font-size: 14px;
    transition: color ease-in-out 125ms;
  }

  .current button:hover {
    color: var(--pink-600);
    transition: color ease-in-out 125ms;
  }

  .popup-body {
    display: flex;
    flex-direction: column;
    gap: 10px;
    margin-bottom: 10px;
    width: 400px;
  }

  .popup-body label {
    margin-top: 5px;
  }

  .popup-control {
    margin: 5px 10px;
    display: flex;
    justify-content: flex-end;
    align-items: center;
    gap: 10px;
  }

  .popup-confirm {
    width: fit-content;
    align-self: flex-end;
    border: unset;
    border-radius: 5px;
    padding: 5px 7px;
    font-size: 14px;
    background-color: var(--pink-500);
    transition: background-color ease-in-out 125ms;
    cursor: pointer;
  }

  .popup-confirm:hover {
    background-color: var(--pink-600);
  }

  .popup-confirm:disabled {
    background-color: var(--pink-300);
    cursor: default;
  }

  .popup-dismiss {
    background-color: inherit;
    border: unset;
    font-size: inherit;
    color: var(--pink-400);
    font-weight: 300;
    padding: 0;
    cursor: pointer;
    font-size: 14px;
    text-decoration: underline;
    transition: color ease-in-out 125ms;
  }

  .popup-dismiss:hover {
    color: var(--pink-500);
  }

  #logout {
    display: flex;
    width: fit-content;
    border: unset;
    border-radius: 5px;
    padding: 10px 20px;
    margin-top: 10px;
    font-size: 18px;
    background-color: var(--gray-300);
    transition: background-color ease-in-out 125ms;
    align-items: center;
    gap: 5px;
    color: var(--color-text);
  }

  #logout:hover {
    background-color: var(--gray-400);
  }

  @media only screen and (max-width: 1200px) {
    .popup-body {
      width: min(80vw, 400px);
    }
  }
</style>
