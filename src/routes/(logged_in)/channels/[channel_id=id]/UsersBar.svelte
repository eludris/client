<script lang="ts">
  import { StatusType, type User } from '$lib/types/user';
  import userData from '$lib/user_data';
  import { slide, type SlideParams } from 'svelte/transition';
  import { createEventDispatcher } from 'svelte';

  // TODO: reduce code repeating

  export let users: User[];

  const dispatch = createEventDispatcher();

  const showProfile = (user_id: number) => dispatch('showProfile', user_id);
  const userContext = (e: MouseEvent, user: User) => dispatch('userContext', { event: e, user });

  // this gets a bit screwed up on pc so we just limit it and call it conforming to discord xd
  const phoneSlide = (node: HTMLElement, params?: SlideParams | undefined) => {
    if (window.screen.width > 1000) return { duration: 0 };
    return slide(node, params);
  };
</script>

<ul id="users" transition:phoneSlide={{ axis: 'x' }}>
  {#each users as user (user.id)}
    {#if user.status.type != StatusType.OFFLINE}
      <!-- svelte-ignore a11y-click-events-have-key-events -->
      <div
        class="user"
        on:click={() => showProfile(user.id)}
        on:contextmenu|preventDefault|stopPropagation={async (e) => userContext(e, user)}
      >
        <span class="user-avatar-container">
          <img
            class="user-avatar"
            src={user.avatar
              ? `${$userData?.instanceInfo.effis_url}/avatars/${user.avatar}`
              : 'https://github.com/eludris/.github/blob/main/assets/thang-big.png?raw=true'}
            alt="{user.username}'s avatar"
          />
          <span class="user-status-indicator">
            <span class="status-indicator {user.status.type.toLowerCase()}" />
          </span>
        </span>
        <div class="user-info">
          <span>{user.display_name ?? user.username}</span>
          {#if user.status.text}
            <span class="user-status">{user.status.text}</span>
          {/if}
        </div>
      </div>
    {/if}
  {/each}
  {#each users as user (user.id)}
    {#if user.status.type == StatusType.OFFLINE}
      <div
        class="user offline"
        on:click={() => showProfile(user.id)}
        on:contextmenu|preventDefault|stopPropagation={async (e) => userContext(e, user)}
      >
        <span class="user-avatar-container">
          <img
            class="user-avatar"
            src={user.avatar
              ? `${$userData?.instanceInfo.effis_url}/avatars/${user.avatar}`
              : 'https://github.com/eludris/.github/blob/main/assets/thang-big.png?raw=true'}
            alt="{user.username}'s avatar"
          />
          <span class="user-status-indicator">
            <span class="status-indicator {user.status.type.toLowerCase()}" />
          </span>
        </span>
        <div class="user-info">
          <span>{user.display_name ?? user.username}</span>
          {#if user.status.text}
            <span class="user-status">{user.status.text}</span>
          {/if}
        </div>
      </div>
    {/if}
  {/each}
</ul>

<style>
  #users {
    width: 300px;
    display: flex;
    flex-direction: column;
    flex-shrink: 0;
    padding: 10px 10px;
    margin: 0;
    background-color: var(--purple-200);
    overflow-y: auto;
  }

  #users .user-status-indicator {
    background-color: var(--purple-200);
  }

  .user {
    cursor: pointer;
    transition: background-color ease-in-out 125ms;
    padding: 10px 0;
    border-radius: 5px;
  }

  .user:hover {
    background-color: var(--gray-300);
  }

  .offline {
    opacity: 50%;
  }

  @media only screen and (max-width: 1200px) {
    #users {
      position: absolute;
      width: min(80%, 300px);
      right: 0;
      height: calc(100% - 60px);
      box-sizing: border-box;
    }
  }
</style>
