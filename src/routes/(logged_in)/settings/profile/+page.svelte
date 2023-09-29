<script lang="ts">
  import userData from '$lib/user_data';
  import type { UpdateUserProfile } from '$lib/types/profile';
  import { request } from '$lib/request';
  import Markdown from '$lib/components/Markdown.svelte';
  import { tick } from 'svelte';

  let banner = $userData!.user.banner
    ? `${$userData!.instanceInfo.effis_url}/banners/${$userData?.user.banner}`
    : null;
  let avatar: string = $userData!.user.avatar
    ? `${$userData!.instanceInfo.effis_url}/avatars/${$userData?.user.avatar}`
    : 'https://github.com/eludris/.github/blob/main/assets/thang-big.png?raw=true';
  let display_name = $userData!.user.display_name;
  let status_type = $userData!.user.status.type;
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

  let saving = false;

  let error: string;

  let avatarInput: HTMLInputElement;
  let bioInput: HTMLTextAreaElement;

  const bioFocusIn = async () => {
    bioFocused = true;
    await tick();
    bioInput.focus();
  };

  const bioFocusOut = async () => {
    bioFocused = false;
    await tick();
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
    width: 900px;
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
    .setting {
      padding: 5px;
    }

    #user {
      width: 95%;
    }
  }
</style>
