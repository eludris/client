<script lang="ts">
  import userData from '$lib/user_data';
  import type { UpdateUserProfile } from '$lib/types/profile';
  import { request, type RequestErr } from '$lib/request';
  import Markdown from '$lib/components/Markdown.svelte';
  import { tick } from 'svelte';
  import type { StatusType } from '$lib/types/user';
  import Popup from '$lib/components/Popup.svelte';
  import CropperComponent from './cropper.svelte';

  let statuses = [
    ['Online', ''],
    ['Idle', ''],
    ['Busy', 'You will not get any notifications'],
    ['Offline', 'You will appear offline to other users']
  ];

  let banner = $userData!.user.banner
    ? `${$userData!.instanceInfo.effis_url}/banners/${$userData?.user.banner}`
    : null;
  let avatar = $userData!.user.avatar
    ? `${$userData!.instanceInfo.effis_url}/avatars/${$userData?.user.avatar}`
    : 'https://github.com/eludris/.github/blob/main/assets/thang-big.png?raw=true';
  let display_name = $userData!.user.display_name;
  let status_type = $userData!.user.status.type.toLowerCase();
  let status = $userData!.user.status.text;
  let bio = $userData!.user.bio;

  let bannerFiles: FileList | undefined | null = undefined;
  let avatarFiles: FileList | undefined | null = undefined;
  let bannerFile: Blob | null | undefined = undefined;
  let avatarFile: Blob | null | undefined = undefined;
  let cropperFile: Blob | null = null; 
  let cropDone: boolean = false;

  let popupError = '';

  let showCropper = false;
  let cropperKind = 'avatar'

  $: if (bannerFiles) {
    if (bannerFiles[0].size > $userData!.instanceInfo.file_size) {
      popupError = `Your banner image cannot be bigger than ${
        $userData!.instanceInfo.file_size / 1000000
      }MB`;
      bannerFiles = bannerFile = undefined;
    } else {
      cropperFile = bannerFile = bannerFiles![0];
      cropperKind = "banner";
      openCropper();
    }
  }

  const resetBanner = () => {
    banner = null;
    bannerFiles = null;
  };

  $: if (avatarFiles) {
    if (avatarFiles[0].size > $userData!.instanceInfo.file_size) {
      popupError = `Your avatar image cannot be bigger than ${
        $userData!.instanceInfo.file_size / 1000000
      }MB`;
      avatarFiles = avatarFile = undefined;
    } else {
      cropperFile = avatarFile = avatarFiles![0];
      cropperKind = "avatar";
      openCropper();
    }
  }

  const resetAvatar = () => {
    avatar = 'https://github.com/eludris/.github/blob/main/assets/thang-big.png?raw=true';
    avatarFiles = null;
  };

  let cropSuccess = (e: CustomEvent<Blob>) => {
    if (cropperKind == "avatar") {
      avatarFile = e.detail;
      avatar = URL.createObjectURL(avatarFile);
    } else {
      bannerFile = e.detail;
      banner = URL.createObjectURL(bannerFile);
    }
    cropDone = true;
    closeCropper();
  }

  let bioFocused = false;
  let statusIndicatorFocused = false;

  let saving = false;

  let errors: { [field: string]: string | undefined } = {};

  $: changed =
    cropDone ||
    (display_name || null) != $userData!.user.display_name ||
    status_type != $userData!.user.status.type.toLowerCase() ||
    (status || null) != $userData!.user.status.text ||
    (bio || null) != $userData!.user.bio;

  $: disableSave = saving || !!Object.keys(errors).length || !changed;

  let statusSelector: HTMLUListElement;
  let bioInput: HTMLTextAreaElement;

  const statusIndicatorClick = () => {
    statusIndicatorFocused = true;
  };

  const bodyClick = (e: MouseEvent) => {
    if (
      statusIndicatorFocused &&
      e.target != statusSelector &&
      !statusSelector.contains(e.target as Node)
    ) {
      statusIndicatorFocused = false;
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

  // verification

  const verifyDisplayName = () => {
    if (display_name && (display_name.length < 2 || display_name.length > 32)) {
      errors.display_name = 'Display name must be between 2 and 32 characters long';
    } else {
      delete errors.display_name;
      errors = errors; // wake up svelte
    }
  };

  const verifyStatus = () => {
    if (status && status.length > 150) {
      errors.status = 'Status must be less than 150 characters long';
    } else {
      delete errors.status;
      errors = errors; // wake up svelte
    }
  };

  const verifyBio = () => {
    if (bio && bio.length > $userData!.instanceInfo.bio_limit) {
      errors.bio = `Bio must be less than ${$userData?.instanceInfo.bio_limit} characters long`;
    } else {
      delete errors.bio;
      errors = errors; // wake up svelte
    }
  };

  const uploadFile = async (bucket: string, file: Blob) => {
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
    if (bannerFiles !== undefined) {
      if (bannerFiles) {
        let data = await uploadFile('banners', bannerFiles[0]);
        newProfile.banner = data.id;
      } else {
        newProfile.banner = null;
      }
      bannerFiles = undefined;
    }
    if (avatarFile !== undefined) {
      if (avatarFile) {
        let data = await uploadFile('avatars', avatarFile);
        newProfile.avatar = data.id;
      } else {
        newProfile.avatar = null;
      }
      avatarFile = avatarFiles = undefined;
    }
    if (display_name != $userData?.user.display_name) {
      newProfile.display_name = display_name?.trim() || null;
    }
    if (status_type.toUpperCase() != $userData?.user.status.type) {
      newProfile.status_type = status_type.toUpperCase() as StatusType;
    }
    if (status != $userData?.user.status.text) {
      newProfile.status = status?.trim() || null;
    }
    if (bio != $userData?.user.bio) {
      newProfile.bio = bio?.trim() || null;
    }
    try {
      await request('PATCH', '/users/profile', newProfile);
    } catch (e) {
      let err = e as RequestErr;
      popupError = err.message;
    }
     cropDone = saving = false;
  };

  const popupDismiss = () => {
    popupError = '';
  };

  const openCropper = () => {
    showCropper = true;
  };

  const closeCropper = () => {
    showCropper = false;
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
    {#if changed}
      <span id="change-warning">
        <!-- https://icon-sets.iconify.design/mdi/alert/ -->
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
          ><path fill="currentColor" d="M13 14h-2V9h2m0 9h-2v-2h2M1 21h22L12 2L1 21Z" /></svg
        >
        You have unsaved changes
      </span>
    {/if}
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
              {#if banner}
                <button on:click={resetBanner}>Reset</button>
              {/if}
            </span>
            <input
              id="image-input"
              name="banner"
              type="file"
              accept="image/*"
              bind:files={bannerFiles}
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
                  <input
                    id="image-input"
                    name="avatar"
                    type="file"
                    accept="image/*"
                    bind:files={avatarFiles}
                  />
                  {#if avatar != 'https://github.com/eludris/.github/blob/main/assets/thang-big.png?raw=true'}
                    <button on:click={resetAvatar}>Reset</button>
                  {/if}
                </span>
              </span>
            </span>
          </span>
          <span id="name-container">
            <input
              id="display-name"
              name="display-name"
              bind:value={display_name}
              on:input={verifyDisplayName}
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
            <ul id="status-type-selector" bind:this={statusSelector}>
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
          <input
            id="status"
            name="status"
            bind:value={status}
            on:input={verifyStatus}
            placeholder="Nothing going on yet"
          />
        </span>
        <div id="bio-container" on:focusout={bioFocusOut}>
          {#if bioFocused}
            <textarea
              id="bio"
              name="bio"
              bind:value={bio}
              on:input={verifyBio}
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
      <ul id="errors">
        {#each Object.entries(errors) as [k, v] (k)}
          {#if v}
            <li class="error">{v}</li>
          {/if}
        {/each}
      </ul>
      <button id="save" disabled={disableSave}>
        {#if saving}
          Saving...
        {:else}
          Save
        {/if}
      </button>
    </form>
  </div>

  {#if popupError}
    <Popup on:dismiss={popupDismiss}>
      <span slot="title">Error</span>
      {popupError}
    </Popup>
  {/if}

  {#if showCropper}
    <CropperComponent
      on:dismiss={closeCropper}
      on:success={cropSuccess}
      {cropperFile}
      {cropperKind}
    />
  {/if}
{/if}

<style>
  .setting {
    background-color: var(--purple-100);
    padding: 20px;
    margin: 5px;
    border-radius: 10px;
    gap: 5px;
    align-items: center;
  }

  .setting input,
  .setting textarea {
    border: unset;
    padding: 0;
    background-color: initial;
    height: initial;
    width: initial;
    font-size: initial;
  }

  #info,
  #change-warning {
    display: flex;
    width: 100%;
    align-items: center;
    justify-content: center;
    gap: 5px;
    color: #ccc;
  }

  #change-warning {
    color: var(--pink-500);
  }

  form {
    display: flex;
    flex-direction: column;
    width: min(900px, 95%);
  }

  #user {
    display: flex;
    flex-direction: column;
    margin: 10px auto;
    background-color: var(--gray-100);
    border-radius: 10px;
    overflow: visible;
    width: 100%;
  }

  #banner-container {
    position: relative;
    width: 100%;
    height: 150px;
    background-color: var(--gray-200);
    overflow: hidden;
    border-top-right-radius: 10px;
    border-top-left-radius: 10px;
  }

  #banner {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    height: 100%;
    width: 100%;
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
    cursor: pointer;
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

  #image-input-hover button {
    background-color: unset;
    border: unset;
    color: var(--pink-700);
    z-index: 2;
  }

  #image-input-hover button:hover {
    text-decoration: underline;
  }

  #name-container {
    display: flex;
    padding: 10px 5px 0 0;
    flex-direction: column;
    flex-grow: 1;
  }

  #name-container * {
    width: 100%;
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
    line-height: 20px;
  }

  #bio-md-container {
    width: 100%;
    min-height: 100px;
    margin: 0;
    border-radius: 10px;
  }

  #errors {
    display: flex;
    margin: 0 auto;
    width: 60%;
    flex-direction: column;
    color: var(--pink-700);
  }

  #save {
    width: fit-content;
    align-self: flex-end;
    border: unset;
    border-radius: 5px;
    padding: 10px 40px;
    margin-top: 10px;
    font-size: 18px;
    background-color: var(--gray-300);
    transition: background-color ease-in-out 125ms, color ease-in-out 125ms;
    color: var(--color-text);
  }

  #save:hover {
    background-color: var(--gray-400);
  }

  #save:disabled {
    background-color: var(--gray-200);
    color: #aaa;
  }

  @media only screen and (max-width: 1200px) {
    .setting {
      padding: 20px 5px;
    }
  }
</style>
