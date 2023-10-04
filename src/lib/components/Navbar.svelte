<script lang="ts">
  import Markdown from '$lib/components/Markdown.svelte';
  import userData from '$lib/user_data';
</script>

<div id="options-div">
  <div id="instance-info">
    <span id="instance-name">{$userData?.instanceInfo?.instance_name}</span>
    {#if $userData?.instanceInfo?.description}
      <span id="instance-description">{$userData.instanceInfo.description}</span>
      <span id="instance-markdown">
        <Markdown content={$userData.instanceInfo.description} />
      </span>
    {/if}
  </div>
  <span id="user-info" class="user current-user">
    <span class="user-avatar-container">
      <img
        class="user-avatar"
        src={$userData?.user.avatar
          ? `${$userData?.instanceInfo.effis_url}/avatars/${$userData?.user.avatar}`
          : 'https://github.com/eludris/.github/blob/main/assets/thang-big.png?raw=true'}
        alt="{$userData?.user.username}'s avatar"
      />
      <span class="user-status-indicator">
        <span class="status-indicator {$userData?.user.status.type.toLowerCase()}" />
      </span>
    </span>
    <div class="user-info">
      <span>{$userData?.user.display_name ?? $userData?.user.username}</span>
      {#if $userData?.user.status.text}
        <span class="user-status">{$userData?.user.status.text}</span>
      {/if}
    </div>
    <a id="settings-link" href="/settings">
      <!--- https://icon-sets.iconify.design/mdi/cog/ --->
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
        ><path
          fill="currentColor"
          d="M12 15.5A3.5 3.5 0 0 1 8.5 12A3.5 3.5 0 0 1 12 8.5a3.5 3.5 0 0 1 3.5 3.5a3.5 3.5 0 0 1-3.5 3.5m7.43-2.53c.04-.32.07-.64.07-.97c0-.33-.03-.66-.07-1l2.11-1.63c.19-.15.24-.42.12-.64l-2-3.46c-.12-.22-.39-.31-.61-.22l-2.49 1c-.52-.39-1.06-.73-1.69-.98l-.37-2.65A.506.506 0 0 0 14 2h-4c-.25 0-.46.18-.5.42l-.37 2.65c-.63.25-1.17.59-1.69.98l-2.49-1c-.22-.09-.49 0-.61.22l-2 3.46c-.13.22-.07.49.12.64L4.57 11c-.04.34-.07.67-.07 1c0 .33.03.65.07.97l-2.11 1.66c-.19.15-.25.42-.12.64l2 3.46c.12.22.39.3.61.22l2.49-1.01c.52.4 1.06.74 1.69.99l.37 2.65c.04.24.25.42.5.42h4c.25 0 .46-.18.5-.42l.37-2.65c.63-.26 1.17-.59 1.69-.99l2.49 1.01c.22.08.49 0 .61-.22l2-3.46c.12-.22.07-.49-.12-.64l-2.11-1.66Z"
        /></svg
      >
      {#if $userData?.instanceInfo.email_address && !$userData?.user.verified}
        <span id="warning" />
      {/if}
    </a>
  </span>
</div>

<style>
  #options-div {
    display: flex;
    background-color: var(--gray-200);
    padding: 10px;
    gap: 20px;
    align-items: center;
    height: 40px;
  }

  #instance-info {
    display: flex;
    flex-grow: 1;
    overflow: hidden;
  }

  #instance-name {
    margin-right: 15px;
    font-size: 24px;
    align-self: baseline;
  }

  #instance-description {
    font-weight: 300;
    align-self: baseline;
    white-space: nowrap;
  }

  #instance-markdown {
    display: none;
    position: absolute;
    top: 35px;
    left: 0;
    background-color: var(--gray-300);
    margin: 20px;
    padding: 10px;
    border-radius: 10px;
    max-width: 90%;
  }

  #instance-info:hover > #instance-markdown {
    display: inline;
  }

  #settings-link {
    position: relative;
    text-decoration: none;
    align-self: center;
    border: unset;
    height: 24px;
  }

  #options-div .user-status-indicator {
    background-color: var(--gray-200);
  }

  .current-user .user-info {
    flex-grow: 1;
  }

  .current-user {
    width: 300px;
  }

  :global(.user) {
    display: flex;
    gap: 10px;
  }

  :global(.user-avatar-container) {
    position: relative;
    height: 40px;
  }

  :global(.user-avatar) {
    width: 40px;
    height: 40px;
    object-fit: cover;
    border-radius: 100%;
  }

  :global(.user-status-indicator) {
    border-radius: 100%;
    width: 16px;
    height: 16px;
    position: absolute;
    right: 0;
    bottom: 0;
  }

  :global(.user-status-indicator span) {
    width: 10px;
    height: 10px;
    position: absolute;
    border-radius: 100%;
    right: 3px;
    bottom: 3px;
  }

  :global(.status-indicator.online) {
    background-color: #239e58;
  }

  :global(.status-indicator.idle) {
    background-color: #e6ab32;
  }

  :global(.status-indicator.busy) {
    background-color: #e83d42;
  }

  :global(.status-indicator.offline) {
    background-color: #71757e;
  }

  :global(.user-info) {
    display: flex;
    flex-direction: column;
    height: 100%;
    justify-content: center;
    overflow-x: hidden;
  }

  :global(.user-status) {
    color: #888;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  #warning {
    position: absolute;
    display: inline-block;
    width: 10px;
    height: 10px;
    border-radius: 100%;
    background-color: var(--pink-500);
    top: -5px;
    right: -5px;
  }
</style>
