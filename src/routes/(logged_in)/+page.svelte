<script lang="ts">
  import { onMount } from 'svelte';
  import userData from '$lib/user_data';
  import userConfig from '$lib/user_config';
  import state from '$lib/ws';
  import { tick } from 'svelte';
  import { browser } from '$app/environment';
  import MessageInput from './MessageInput.svelte';
  import MessageComponent from './Message.svelte';
  import type { ClientMessage } from '$lib/types/ui/message';
  import { request } from '$lib/request';
  import { StatusType, type User } from '$lib/types/user';
  import { slide, type SlideParams } from 'svelte/transition';
  import Navbar from '$lib/components/Navbar.svelte';

  let messagesUList: HTMLUListElement;
  let value = '';
  let input: HTMLTextAreaElement;
  let usernames: { [key: string]: number } = {};

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

  const onSubmit = async () => {
    if (value.trim()) {
      let headers = new Headers();
      headers.set('Authorization', $userData!.session.token);
      if (value.startsWith('/shrug')) value = value.substring(7) + ' ¯\\\\\\_(ツ)_/¯';
      value = value.replace(/@([a-z0-9_-]+)/gm, (m, username) => {
        let id = usernames[username];
        if (id) {
          return `<@${id}>`;
        } else {
          return m;
        }
      });
      request('POST', 'messages', { content: value }).then((_) =>
        messagesUList.scroll(0, messagesUList.scrollHeight)
      );
    }
    value = '';
    await tick();
    input.focus(); // for mobiles
  };

  const submitFiles = async (e: CustomEvent<DataTransferItemList>) => {
    let fileDatas = [];
    for (let i = 0; i < e.detail.length; i++) {
      if (e.detail[i].kind == 'file') {
        const file = e.detail[i].getAsFile()!;
        let formData = new FormData();
        formData.append('file', file, file.name);
        const data = await fetch($userData?.instanceInfo.effis_url!, {
          body: formData,
          method: 'POST'
        }).then((r) => r.json());
        fileDatas.push(data);
      }
    }
    request('POST', 'messages', {
      content: fileDatas
        .map((d) => `![${d.name}](${$userData?.instanceInfo.effis_url}${d.id})`)
        .join('\n')
    }).then((_) => messagesUList.scroll(0, messagesUList.scrollHeight));
    await tick();
    input.focus(); // for mobiles
  };

  const onReply = async (e: CustomEvent<ClientMessage>) => {
    const start = input.selectionStart;
    const end = input.selectionEnd;

    const reply = `${value.trim() ? '\n' : ''}${e.detail.content
      .split('\n')
      .map((l) => `> ${l}`)
      .join('\n')}\n<@${e.detail.author.id}>\n\n`;
    value = value.substring(0, start) + reply + value.substring(end);
    await tick();

    input.selectionStart = input.selectionEnd = start + reply.length;

    input.focus();
  };

  const onMention = async (e: CustomEvent<User>) => {
    const start = input.selectionStart;
    const end = input.selectionEnd;

    const mention = `<@${e.detail.id}>`;
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
    if (Math.abs(touchX - touchEndX) > screenWidth / 4) {
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
    <div id="message-channel-body" class={!$userConfig.userList ? 'user-hidden' : ''}>
      <ul bind:this={messagesUList} id="messages">
        {#each $state.messages as message, i (i)}
          <MessageComponent {message} on:reply={onReply} on:mention={onMention} />
        {/each}
      </ul>
      <form id="message-input-form" on:submit|preventDefault={onSubmit}>
        <MessageInput
          bind:input
          bind:value
          on:submit={onSubmit}
          on:submitFiles={submitFiles}
          scrollContainer={messagesUList}
        />
        <button id="send-button">
          <!--- https://icon-sets.iconify.design/mdi/send/ --->
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
            ><path fill="currentColor" d="m2 21l21-9L2 3v7l15 2l-15 2v7Z" /></svg
          >
        </button>
      </form>
    </div>
    {#if !$userConfig.userList}
      <ul id="users" transition:phoneSlide={{ axis: 'x' }}>
        {#each users as user (user.id)}
          {#if user.status.type != StatusType.OFFLINE}
            <div class="user">
              <span class="user-avatar-container">
                <img
                  class="user-avatar"
                  src={user.avatar
                    ? `${$userData?.instanceInfo.effis_url}/avatars/${user.avatar}`
                    : 'https://github.com/eludris/.github/blob/main/assets/thang-big.png?raw=true'}
                  alt="{user.username}'s avatar"
                />
                <span class="user-status-indicator {user.status.type.toLowerCase()}">
                  <span />
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
  </div>
</div>

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

  #message-input-form {
    width: calc(100% - 10px);
    display: flex;
    background-color: var(--gray-200);
    color: var(--gray-600);
    padding: 2px;
    margin: 0 5px 10px 5px;
    font-size: 18px;
    height: auto;
    border-radius: 10px;
  }

  #send-button {
    background: none;
    color: inherit;
    border: none;
    cursor: pointer;
    margin: 3px 5px 3px 0;
    font-size: inherit;
    transition: color ease-in-out 125ms;
    cursor: pointer;
    height: 32px;
    padding-top: 6px;
  }

  #send-button:hover {
    color: var(--gray-500);
  }

  #users {
    width: 300px;
    display: flex;
    flex-direction: column;
    flex-shrink: 0;
    gap: 10px;
    padding: 20px 10px;
    height: 100%;
    margin: 0;
    background-color: var(--purple-200);
  }

  #users .user-status-indicator {
    background-color: var(--purple-200);
  }

  @media only screen and (max-width: 1000px) {
    #message-channel-body {
      width: 100%;
      position: relative;
    }

    #users {
      position: absolute;
      width: 80%;
      right: 0;
    }
  }
</style>
