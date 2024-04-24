<script lang="ts">
  import { onMount } from 'svelte';
  import userData from '$lib/user_data';
  import userConfig from '$lib/user_config';
  import activeContext from '$lib/context';
  import state from '$lib/ws';
  import { tick } from 'svelte';
  import { browser } from '$app/environment';
  import MessageInput from './MessageInput.svelte';
  import MessageComponent from './Message.svelte';
  import type { ClientMessage } from '$lib/types/ui/message';
  import { StatusType, type User } from '$lib/types/user';
  import { slide, type SlideParams } from 'svelte/transition';
  import Navbar from '$lib/components/Navbar.svelte';
  import UserProfile from './UserProfile.svelte';
  import type { Unsubscriber } from 'svelte/store';
  import UserContext from './UserContext.svelte';

  let messagesUList: HTMLUListElement;
  let value = '';
  let input: HTMLTextAreaElement;
  let usernames: { [key: string]: number } = {};
  let currentProfile: number | undefined;
  let currentContext: number;
  let authorContext: User | undefined;
  let authorContextDiv: HTMLDivElement;

  onMount(() => {
    messagesUList.scroll(0, messagesUList.scrollHeight);
    input.focus();
  });

  $: {
    if ($state.connected) {
      let scroll =
        messagesUList &&
        messagesUList.scrollHeight - messagesUList.offsetHeight - messagesUList.scrollTop <
          window.outerHeight / 4;
      tick().then(() => {
        if (scroll) messagesUList?.scroll(0, messagesUList.scrollHeight);
      });
    }
  }
  $: users = Object.values($state.users);
  $: {
    usernames = {};
    users.forEach((u) => (usernames[u.username] = u.id));
  }

  const autoScroll = async () => {
    if (!browser) return;
    await tick();
    if (
      messagesUList.scrollHeight - messagesUList.offsetHeight - messagesUList.scrollTop <
      window.outerHeight / 4
    )
      messagesUList.scroll(0, messagesUList.scrollHeight);
  };

  const onReply = async (e: CustomEvent<ClientMessage>) => {
    const start = input.selectionStart;
    const end = input.selectionEnd;

    const reply = `${value.trim() ? '\n' : ''}${e.detail.content
      .split('\n')
      .map((l) => `> ${l}`)
      .join('\n')}\n@${e.detail.author.username}\n\n`;
    value = value.substring(0, start) + reply + value.substring(end);
    await tick();

    input.selectionStart = input.selectionEnd = start + reply.length;

    input.focus();
  };

  const onMention = async (e: CustomEvent<User>) => {
    const start = input.selectionStart;
    const end = input.selectionEnd;

    const mention = `@${e.detail.username}`;
    value = value.substring(0, start) + mention + value.substring(end);
    await tick();

    input.selectionStart = input.selectionEnd = start + mention.length;

    input.focus();
  };

  const windowKeyDown = (e: KeyboardEvent) => {
    if (e.key == 'u' && e.ctrlKey) {
      $userConfig.userList = !$userConfig.userList;
      e.preventDefault();
    }
  };

  let touchX = 0;

  const windowTouchStart = (e: TouchEvent) => {
    touchX = e.touches[0].clientX;
  };

  const windowTouchMove = (e: TouchEvent) => {
    let screenWidth = window.screen.width;
    if (screenWidth > 1000) return;
    let touchEndX = e.touches[0].clientX;
    let diff = touchX - touchEndX;
    if (Math.abs(touchX - touchEndX) > screenWidth / 5) {
      if (diff > 0) {
        if ($userConfig.userList) {
          $userConfig.userList = false;
        }
      } else {
        if (!$userConfig.userList) {
          $userConfig.userList = true;
        }
      }
    }
  };

  // this gets a bit screwed up on pc so we just limit it and call it conforming to discord xd
  const phoneSlide = (node: HTMLElement, params?: SlideParams | undefined) => {
    if (window.screen.width > 1000) return { duration: 0 };
    return slide(node, params);
  };

  const showProfile = (id: number) => {
    currentProfile = id;
  };

  const userContext = async (e: MouseEvent, user: User) => {
    $activeContext = $activeContext + 1;
    currentContext = $activeContext;
    let unsubscribe: Unsubscriber;
    unsubscribe = activeContext.subscribe((id) => {
      if (id != currentContext) {
        authorContext = undefined;
        unsubscribe();
      }
    });
    authorContext = user;
    await tick();
    positionContextDiv(e, authorContextDiv);
  };

  const positionContextDiv = (e: MouseEvent, div: HTMLDivElement) => {
    if (div.clientHeight + e.clientY < window.innerHeight) {
      div.style.top = `${e.clientY}px`;
      div.style.bottom = `auto`;
    } else {
      div.style.bottom = `${window.innerHeight - e.clientY}px`;
      div.style.top = `auto`;
    }
    if (div.clientWidth + e.clientX < window.innerWidth) {
      div.style.left = `${e.clientX}px`;
      div.style.right = `auto`;
    } else {
      div.style.right = `${window.innerWidth - e.clientX}px`;
      div.style.left = `auto`;
    }
  };

  const showContextProfile = (e: CustomEvent<number>) => {
    showProfile(e.detail);
  };

  const closeContext = () => {
    authorContext = undefined;
  };

  const closeProfile = () => {
    currentProfile = undefined;
  };
</script>

<svelte:window
  on:resize={autoScroll}
  on:keydown={windowKeyDown}
  on:touchstart={windowTouchStart}
  on:touchmove={windowTouchMove}
/>

<div id="message-channel">
  <Navbar />
  <div id="channel-view">
    <div id="message-channel-body" class={$userConfig.userList ? 'users-hidden' : ''}>
      <ul bind:this={messagesUList} id="messages">
        {#each $state.messages as message, i (i)}
          <MessageComponent
            {message}
            on:reply={onReply}
            on:showProfile={showContextProfile}
            on:mention={onMention}
          />
        {/each}
      </ul>
      <MessageInput bind:input bind:value bind:usernames {messagesUList} />
    </div>
    {#if !$userConfig.userList}
      <ul id="users" transition:phoneSlide={{ axis: 'x' }}>
        {#each users as user (user.id)}
          {#if user.status.type != StatusType.OFFLINE}
            <!-- svelte-ignore a11y-click-events-have-key-events -->
            <div
              class="user"
              on:click={() => showProfile(user.id)}
              on:contextmenu|preventDefault|stopPropagation={async (e) =>
                await userContext(e, user)}
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
    {/if}
    {#if authorContext}
      <UserContext
        user={authorContext}
        bind:contextDiv={authorContextDiv}
        on:close={closeContext}
        on:showProfile={showContextProfile}
        on:mention={onMention}
      />
    {/if}
  </div>
</div>

{#if currentProfile !== undefined}
  <UserProfile user={$state.users[currentProfile]} on:close={closeProfile} />
{/if}

<style>
  #message-channel {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
  }

  #channel-view {
    display: flex;
    flex-grow: 1;
    overflow-y: hidden;
  }

  #message-channel-body {
    display: flex;
    flex-direction: column;
    width: calc(100% - 320px);
  }

  #message-channel-body.users-hidden {
    width: 100%;
  }

  :global(#message-channel-body.users-hidden) {
    width: 100% !important;
  }

  #messages {
    flex-grow: 1;
    padding: 10px;
    overflow-y: auto;
    overflow-x: hidden;
    padding: 0;
    margin-top: 0;
    margin-bottom: 0; /* where is react native marginVertical when you need it? */
  }

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

  @media only screen and (max-width: 1200px) {
    #message-channel-body {
      width: 100%;
      position: relative;
    }

    #users {
      position: absolute;
      width: min(80%, 300px);
      right: 0;
      height: calc(100% - 60px);
      box-sizing: border-box;
    }
  }
</style>
