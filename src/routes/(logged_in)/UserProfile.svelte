<script lang="ts">
  import userData from '$lib/user_data';
  import Markdown from '$lib/components/Markdown.svelte';
  import type { User } from '$lib/types/user';
  import { createEventDispatcher, onMount } from 'svelte';

  export let user: User;

  let profile: HTMLDivElement;

  onMount(() => {
    profile.focus();
  });

  const dispatcher = createEventDispatcher();

  let banner = user.banner ? `${$userData!.instanceInfo.effis_url}/banners/${user.banner}` : null;
  let avatar = user.avatar
    ? `${$userData!.instanceInfo.effis_url}/avatars/${user.avatar}`
    : 'https://github.com/eludris/.github/blob/main/assets/thang-big.png?raw=true';
  let display_name = user.display_name || user.username;
  let status_type = user.status.type.toLowerCase();
  let status = user.status.text;
  let bio = user.bio;

  const wrapperClick = (e: MouseEvent) => {
    if (e.target != profile && !profile.contains(e.target as Node)) {
      dispatcher('close');
    }
  };

  const bodyKeyDown = (e: KeyboardEvent) => {
    if (e.key == 'Escape') {
      dispatcher('close');
    }
  };
</script>

<svelte:body on:keydown={bodyKeyDown} />

<!-- svelte-ignore a11y-click-events-have-key-events -->
<div id="profile-wrapper" on:click={wrapperClick}>
  <div id="profile" bind:this={profile}>
    <div id="banner-container">
      {#if banner}
        <img src={banner} alt="Your banner" id="banner" />
      {/if}
    </div>
    <span id="main-info-container">
      <span id="avatar-container">
        <span id="avatar-wrapper">
          <img src={avatar} alt="Your avatar" id="avatar" />
        </span>
      </span>
      <span id="name-container">
        <span id="display-name">
          {display_name}
        </span>
        <span id="username">{user.username}</span>
      </span>
    </span>
    <span id="status-container">
      <span id="status-type" class="status-icon status-indicator {status_type.toLowerCase()}" />
      <span id="status">{status || 'Nothing going on yet'}</span>
    </span>
    <div id="bio-container">
      <div id="bio-md-container">
        <Markdown content={bio ?? 'Nothing here yet'} />
      </div>
    </div>
  </div>
</div>

<style>
  #profile-wrapper {
    position: absolute;
    width: 100%;
    height: 100%;
    background-color: #0007;
    display: flex;
    align-items: center;
    justify-content: center;
    top: 0;
    left: 0;
  }

  #profile {
    display: flex;
    flex-direction: column;
    margin: 10px;
    background-color: var(--gray-100);
    border-radius: 10px;
    overflow: hidden;
    width: min(900px, 95%);
    height: fit-content;
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
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  #main-info-container {
    display: flex;
  }

  #avatar-container {
    position: relative;
    width: 100px;
    height: 70px;
    padding: 0 10px;
    flex-shrink: 0;
  }

  #avatar-wrapper {
    position: absolute;
    top: -50px;
    width: 100px;
    height: 100px;
    border-radius: 100%;
    background-color: var(--gray-100);
    border: 5px solid var(--gray-100);
    overflow: hidden;
  }

  #avatar {
    width: 100px;
    height: 100px;
    object-fit: cover;
  }

  #name-container {
    display: flex;
    padding: 10px 5px 0 0;
    flex-direction: column;
    flex-grow: 1;
  }

  #display-name {
    font-weight: bold;
    font-size: 24px;
  }

  #status-container {
    position: relative;
    display: flex;
    padding: 0 30px 10px 30px;
    gap: 5px;
    align-items: baseline;
  }

  .status-icon {
    display: inline-block;
    width: 12px;
    height: 12px;
    border-radius: 100%;
  }

  .status-container {
    display: flex;
    width: 100%;
    padding: 5px;
    box-sizing: border-box;
    align-items: center;
    gap: 5px;
  }

  .status-container:hover {
    background-color: var(--gray-300);
  }

  .status-container.checked {
    background-color: var(--gray-400);
  }

  .status-radio {
    display: none;
  }

  .status-text {
    display: flex;
    flex-direction: column;
  }

  .status-info {
    font-size: 14px;
    font-weight: 400;
  }

  #status {
    font-weight: 300;
    width: 100%;
  }

  #bio-container {
    padding: 0 30px 20px 30px;
  }

  #bio-md-container {
    width: 100%;
    min-height: 100px;
    margin: 0;
    border-radius: 10px;
  }
</style>
