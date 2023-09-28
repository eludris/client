<script lang="ts">
  import userData from '$lib/user_data';
  import { request } from '$lib/request';
  import Markdown from '$lib/components/Markdown.svelte';
  import { tick } from 'svelte';

  let display_name = $userData!.user.display_name;
  let username = $userData!.user.username;
  let status_type = $userData!.user.status.type;
  let status = $userData!.user.status.text;
  let bio = $userData!.user.bio;

  let bioFocused = false;

  let error: string;

  let avatarInput: HTMLInputElement;
  let bioInput: HTMLTextAreaElement;

  const bioFocusIn = async () => {
    console.log('e');
    bioFocused = true;
    await tick();
    bioInput.focus();
  };

  const bioFocusOut = async () => {
    bioFocused = false;
    await tick();
  };

  const onAvatarInput = async () => {
    let file = avatarInput.files![0];
    if (file) {
      let formData = new FormData();
      formData.append('file', file, file.name);
      const data = await fetch($userData?.instanceInfo.effis_url! + '/avatars', {
        body: formData,
        method: 'POST'
      }).then((r) => r.json());
      await request('PATCH', '/users/profile', { avatar: data.id });
    }
  };

  const updateProfile = async () => {
    console.log('submit');
  };
</script>

{#if $userData}
  <div class="setting">
    <form on:submit|preventDefault={updateProfile}>
      <div id="user">
        <div id="banner-container">
          {#if $userData.user.banner}
            <img
              src="{$userData.instanceInfo.effis_url}/banners/{$userData.user.banner}"
              alt="Your banner"
              id="banner"
            />
          {/if}
        </div>
        <span id="main-info-container">
          <span id="avatar-container">
            <img
              src="{$userData.instanceInfo.effis_url}/avatars/{$userData.user.avatar}"
              alt="Your avatar"
              id="avatar"
            />
          </span>
          <span id="name-container">
            <input
              id="display-name"
              name="display-name"
              bind:value={display_name}
              placeholder={$userData.user.username}
            />
            <input id="username" name="username" bind:value={username} />
          </span>
        </span>
        <span id="status-container">
          <span
            id="status-type"
            class="status-indicator {$userData.user.status.type.toLowerCase()}"
          />
          <input id="status" name="status" bind:value={status} placeholder="Nothing going on yet" />
        </span>
        <div id="bio-container" on:focusout={bioFocusOut}>
          {#if bioFocused}
            <textarea
              id="bio"
              name="bio"
              bind:value={bio}
              placeholder="Nothing here yet"
              bind:this={bioInput}
            />
          {:else}
            <!-- svelte-ignore a11y-click-events-have-key-events -->
            <div id="bio-md-container" on:click={bioFocusIn}>
              <Markdown content={bio ?? 'Nothing here yet'} />
            </div>
          {/if}
        </div>
      </div>
      {#if error}
        <span id="error">{error}</span>
      {/if}
      <button id="save">Save</button>
    </form>
  </div>
{/if}

<style>
  .setting input,
  .setting textarea {
    border: unset;
    padding: 0;
    background-color: initial;
    height: initial;
    width: initial;
    font-size: initial;
  }

  #user {
    display: flex;
    flex-direction: column;
    width: 80%;
    margin: 10px auto;
    background-color: var(--gray-100);
    border-radius: 10px;
    overflow: hidden;
  }

  #banner-container {
    position: relative;
    width: 100%;
    height: 150px;
    background-color: var(--gray-200);
    overflow: hidden;
  }

  #banner {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background-color: var(--gray-200);
  }

  #main-info-container {
    display: flex;
  }

  #avatar-container {
    position: relative;
    width: 100px;
    height: 70px;
    padding: 0 10px;
  }

  #avatar {
    position: absolute;
    top: -50px;
    width: 100px;
    height: 100px;
    border-radius: 100%;
    background-color: var(--gray-100);
    border: 5px solid var(--gray-100);
  }

  #name-container {
    padding-top: 10px;
    display: flex;
    flex-direction: column;
  }

  #display-name {
    font-weight: bold;
    font-size: 24px;
  }

  #status-container {
    display: flex;
    padding: 0 30px 10px 30px;
    gap: 5px;
    align-items: baseline;
  }

  #status-type {
    display: inline-block;
    width: 12px;
    height: 12px;
    border-radius: 100%;
  }

  #status {
    font-weight: 300;
    width: 100%;
  }

  #bio-container {
    padding: 0 30px 20px 30px;
  }

  #bio {
    font-family: 'Ubuntu', sans-serif;
    width: 100%;
    height: 100px;
    resize: none;
    margin: 0;
  }

  #bio-md-container {
    width: 100%;
    min-height: 100px;
    margin: 0;
  }

  @media only screen and (max-width: 1200px) {
    #user {
      width: 95%;
    }
  }
</style>
