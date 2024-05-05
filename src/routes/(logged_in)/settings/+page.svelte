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
  let resendVerificationDisabled = false;

  let username = '';
  let email = '';
  let newPassword = '';
  let confirmPassword = '';
  let code = '';

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

  const codeInput = () => {
    code = code.replace(/ /gi, '');
    error = '';
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

  const verifyCode = () => {
    edit = 'verify';
  };

  const resendVerification = async () => {
    await request('POST', '/users/resend-verification');
    resendVerificationDisabled = true;
    setTimeout(() => {
      resendVerificationDisabled = false;
    }, 5 * 60 * 1000);
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

  const verifyAccount = async () => {
    saving = true;
    try {
      await request('POST', `/users/verify?code=${code}`, {}, { empty: true });
    } catch (e) {
      let err = e as RequestErr;
      error = err.message;
      saving = false;
      return;
    }
    saving = false;
    code = '';
    $userData!.user.verified = true;
    popupDismiss();
  };

  const logOut = () => {
    userData.set(null);
    goto('/login');
  };
</script>

{#if $userData}
  <a id="user-display" href="/settings/profile">
    <img src={avatar} alt="Your avatar" id="avatar" />
    <span id="username"> {$userData.user.display_name || $userData.user.username}</span>
  </a>
  <div class="setting account-info">
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
  <div class="setting account-info">
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
  <div class="setting account-info">
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
  {#if $userData.instanceInfo.email_address && !$userData.user.verified}
    <div id="verify" class="setting account-info">
      <!-- https://icon-sets.iconify.design/mdi/alert/ -->
      <h2 class="verification-warning">
        <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24"
          ><path fill="currentColor" d="M13 14h-2V9h2m0 9h-2v-2h2M1 21h22L12 2L1 21Z" /></svg
        >
        Your account has not been verified.
      </h2>
      <span>
        Unverified accounts get deleted after 7 days, please verify your account to maintain access
        to it
      </span>
      <span id="verify-buttons">
        <button id="verify-button" on:click={verifyCode}>Verify Account</button>
        <button
          id="resend-code-button"
          on:click={resendVerification}
          disabled={resendVerificationDisabled}>Resend Code</button
        >
      </span>
      {#if edit == 'verify'}
        <Popup on:dismiss={popupDismiss}>
          <span slot="title">Verify your account</span>
          <div class="popup-body">
            <span style="text-align: center;"
              ><em>Check your email for a verification code</em></span
            >
            <label for="code">Verification code</label>
            <input name="code" placeholder="Code" bind:value={code} on:input={codeInput} />
            {#if error}
              <span class="error">{error}</span>
            {/if}
          </div>
          <span class="popup-control" slot="control">
            <button class="popup-dismiss" on:click={popupDismiss}>Nevermind</button>
            <button
              class="popup-confirm"
              on:click={verifyAccount}
              disabled={code.length != 6 || !!error || saving}>Verify</button
            >
          </span>
        </Popup>
      {/if}
    </div>
  {/if}
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
    color: unset;
    border: unset;
  }

  #avatar {
    border-radius: 100%;
    width: 100px;
    height: 100px;
    object-fit: cover;
  }

  #username {
    margin-top: 25px;
    font-size: 20px;
  }

  .account-info {
    flex-direction: row;
    background-color: var(--gray-200);
    padding: 10px;
    border-radius: 10px;
  }

  #verify {
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 10px;
  }

  .verification-warning {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 20px;
    color: var(--pink-500);
    font-size: 20px;
    margin: 0;
  }

  #verify-buttons {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  #verify-button {
    border: unset;
    border-radius: 5px;
    padding: 10px 20px;
    font-size: 18px;
    background-color: var(--gray-300);
    transition: background-color ease-in-out 125ms;
    color: var(--color-text);
  }

  #verify-button:hover {
    background-color: var(--gray-400);
  }

  #resend-code-button {
    border: unset;
    font-size: 16px;
    background-color: transparent;
    transition: color ease-in-out 125ms, border-color ease-in-out 125ms;
    color: #888;
    border-bottom: 2px solid #888;
    height: fit-content;
  }

  #resend-code-button:hover {
    color: #bbb;
    border-color: #bbb;
  }

  #resend-code-button:disabled {
    color: #555;
    border-color: #555;
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
    color: #ccc;
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
    background-color: var(--pink-400);
    transition: background-color ease-in-out 125ms;
    align-items: center;
    gap: 5px;
    color: #ccc;
    cursor: pointer;
  }

  #logout:hover {
    background-color: var(--pink-500);
  }

  .error {
    color: var(--pink-600);
  }

  @media only screen and (max-width: 1200px) {
    .popup-body {
      width: min(80vw, 400px);
    }
  }
</style>
