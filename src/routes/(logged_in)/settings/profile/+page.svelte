<script lang="ts">
  import userData from '$lib/user_data';
  import type { UpdateUserProfile } from '$lib/types/profile';
  import { request } from '$lib/request';
  import Markdown from '$lib/components/Markdown.svelte';
  import { tick } from 'svelte';
  import type { StatusType } from '$lib/types/user';

  let statuses = [
    ['Online', ''],
    ['Idle', ''],
    ['Busy', 'You will not get any notifications'],
    ['Offline', 'You will appear offline to other users']
  ];

  let banner = $userData!.user.banner
    ? `${$userData!.instanceInfo.effis_url}/banners/${$userData?.user.banner}`
    : null;
  let avatar: string = $userData!.user.avatar
    ? `${$userData!.instanceInfo.effis_url}/avatars/${$userData?.user.avatar}`
    : 'https://github.com/eludris/.github/blob/main/assets/thang-big.png?raw=true';
  let display_name = $userData!.user.display_name;
  let status_type = $userData!.user.status.type.toLowerCase();
  let status = $userData!.user.status.text;
  let bio = $userData!.user.bio;

  let bannerFile: FileList;
  let avatarFile: FileList;

  $: if (avatarFile) {
    let reader = new FileReader();
    reader.addEventListener('load', () => {
      avatar = reader.result! as string;
    });
    reader.readAsDataURL(avatarFile[0]);
  }

  $: if (bannerFile) {
    let reader = new FileReader();
    reader.addEventListener('load', () => {
      banner = reader.result! as string;
    });
    reader.readAsDataURL(bannerFile[0]);
  }

  let bioFocused = false;
  let statusIndicatorFocused = false;

  let saving = false;

  let error: string;

  let bioInput: HTMLTextAreaElement;

  const statusIndicatorClick = () => {
    statusIndicatorFocused = true;
  };

  const bodyClick = (e: MouseEvent) => {
    if (statusIndicatorFocused) {
      statusIndicatorFocused = false;
      e.preventDefault();
    }
  };

  const bioClick = async () => {
    bioFocused = true;
    await tick();
    bioInput.focus();
  };

  const bioFocusOut = () => {
    bioFocused = false;
  };

  const uploadFile = async (bucket: string, file: File) => {
    let formData = new FormData();
    formData.append('file', file, file.name);
    return await fetch($userData?.instanceInfo.effis_url! + `/${bucket}`, {
      body: formData,
      method: 'POST'
    }).then((r) => r.json());
  };

  const updateProfile = async () => {
    saving = true;
    let newProfile: UpdateUserProfile = {};
    if (avatarFile) {
      let data = await uploadFile('avatars', avatarFile[0]);
      newProfile.avatar = data.id;
    }
    if (bannerFile) {
      let data = await uploadFile('banners', bannerFile[0]);
      newProfile.banner = data.id;
    }
    if (display_name != $userData?.user.display_name) {
      newProfile.display_name = display_name ?? null;
    }
    if (status_type.toUpperCase() != $userData?.user.status.type) {
      newProfile.status_type = status_type.toUpperCase() as StatusType;
    }
    if (status != $userData?.user.status.text) {
      newProfile.status = status ?? null;
    }
    if (bio != $userData?.user.bio) {
      newProfile.bio = bio ?? null;
    }
    await request('PATCH', '/users/profile', newProfile);
    saving = false;
  };
</script>

<svelte:body on:click={bodyClick} />

{#if $userData}
  <div class="setting">
    <span id="info">
      <!-- https://icon-sets.iconify.design/mdi/information/ -->
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
        ><path
          fill="currentColor"
          d="M13 9h-2V7h2m0 10h-2v-6h2m-1-9A10 10 0 0 0 2 12a10 10 0 0 0 10 10a10 10 0 0 0 10-10A10 10 0 0 0 12 2Z"
        /></svg
      >
      <em>Click on a field to edit it</em>
    </span>
    <form on:submit|preventDefault={updateProfile}>
      <div id="user">
        <div id="banner-container">
          {#if banner}
            <img src={banner} alt="Your banner" id="banner" />
          {/if}
          <span id="image-input-wrapper">
            <span id="image-input-hover">
              <!-- https://icon-sets.iconify.design/mdi/tray-arrow-up/ -->
              <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24"
                ><path
                  fill="currentColor"
                  d="M2 12h2v5h16v-5h2v5c0 1.11-.89 2-2 2H4a2 2 0 0 1-2-2v-5M12 2L6.46 7.46l1.42 1.42L11 5.75V15h2V5.75l3.13 3.13l1.42-1.43L12 2Z"
                /></svg
              >
              <em>Max {$userData.instanceInfo.file_size / 1000000}MB</em>
            </span>
            <input
              id="image-input"
              name="banner"
              type="file"
              accept="image/*"
              bind:files={bannerFile}
            />
          </span>
        </div>
        <span id="main-info-container">
          <span id="avatar-container">
            <span id="avatar-wrapper">
              <img src={avatar} alt="Your avatar" id="avatar" />
              <span id="image-input-wrapper">
                <span id="image-input-hover">
                  <!-- https://icon-sets.iconify.design/mdi/tray-arrow-up/ -->
                  <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24"
                    ><path
                      fill="currentColor"
                      d="M2 12h2v5h16v-5h2v5c0 1.11-.89 2-2 2H4a2 2 0 0 1-2-2v-5M12 2L6.46 7.46l1.42 1.42L11 5.75V15h2V5.75l3.13 3.13l1.42-1.43L12 2Z"
                    /></svg
                  >
                  <em>Max {$userData.instanceInfo.file_size / 1000000}MB</em>
                </span>
                <input
                  id="image-input"
                  name="avatar"
                  type="file"
                  accept="image/*"
                  bind:files={avatarFile}
                />
              </span>
            </span>
          </span>
          <span id="name-container">
            <input
              id="display-name"
              name="display-name"
              bind:value={display_name}
              placeholder={$userData.user.username}
            />
            <span id="username">{$userData.user.username}</span>
          </span>
        </span>
        <span id="status-container">
          <!-- svelte-ignore a11y-click-events-have-key-events -->
          <span
            id="status-type"
            class="status-icon status-indicator {status_type.toLowerCase()}"
            on:click|stopPropagation={statusIndicatorClick}
          />
          {#if statusIndicatorFocused}
            <ul id="status-type-selector">
              {#each statuses as [value, info]}
                <li>
                  <label
                    class="status-container {status_type.toLowerCase() == value.toLowerCase()
                      ? 'checked'
                      : ''}"
                  >
                    <span class="status-icon status-indicator {value.toLowerCase()}" />
                    <input
                      name="notifications"
                      class="status-radio"
                      type="radio"
                      {value}
                      bind:group={status_type}
                    />
                    <span class="status-text">
                      {value}
                      <span class="status-info">{info}</span>
                    </span>
                  </label>
                </li>
              {/each}
            </ul>
          {/if}
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
            <div id="bio-md-container" on:click={bioClick}>
              <Markdown content={bio ?? 'Nothing here yet'} />
            </div>
          {/if}
        </div>
      </div>
      {#if error}
        <span id="error">{error}</span>
      {/if}
      <button id="save" disabled={saving}>
        {#if saving}
          Saving...
        {:else}
          Save
        {/if}
      </button>
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

  .setting {
    background-color: var(--purple-100);
    padding: 20px;
    margin: 5px;
    border-radius: 10px;
  }

  #info {
    display: flex;
    width: 100%;
    align-items: center;
    justify-content: center;
    gap: 5px;
    color: #ccc;
  }

  #user {
    display: flex;
    flex-direction: column;
    width: min(900px, 100%);
    margin: 10px auto;
    background-color: var(--gray-100);
    border-radius: 10px;
    overflow: visible;
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
    width: 900px;
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
  }

  #image-input-wrapper {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  }

  #image-input {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    opacity: 0;
  }

  #image-input-hover {
    display: flex;
    width: 100%;
    height: 100%;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    opacity: 0;
    text-align: center;
    background-color: #0007;
    font-weight: 400;
    gap: 5px;
    font-size: 14px;
    transition: opacity ease-in-out 125ms;
  }

  #image-input-wrapper:hover #image-input-hover {
    opacity: 1;
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

  #status-type-selector {
    position: absolute;
    display: flex;
    top: -13px;
    left: 45px;
    flex-direction: column;
    margin: 0;
    padding: 10px;
    background-color: var(--gray-200);
    border-radius: 5px;
  }

  #status-type-selector li {
    list-style: none;
    overflow: hidden;
  }

  #status-type-selector li:first-child {
    border-top-left-radius: 5px;
    border-top-right-radius: 5px;
  }

  #status-type-selector li:last-child {
    border-bottom-left-radius: 5px;
    border-bottom-right-radius: 5px;
  }

  .status-container {
    display: flex;
    width: 100%;
    padding: 5px;
    box-sizing: border-box;
    align-items: center;
    gap: 5px;
  }

  .status-container .status-icon {
    margin-top: 3px;
    align-self: baseline;
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
    .setting {
      padding: 5px;
    }

    #user {
      width: 95%;
    }
  }
</style>
