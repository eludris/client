<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import userData from '$lib/user_data';
  import state from '$lib/ws';
  import { tick } from 'svelte';
  import { browser } from '$app/environment';
  import MessageInput from './MessageInput.svelte';
  import MessageComponent from './Message.svelte';
  import Markdown from '$lib/components/Markdown.svelte';
  import type { PenginMessage } from '$lib/types/ui/message';
  import { request } from '$lib/request';
  import { StatusType, type User } from '$lib/types/user';

  let messagesUList: HTMLUListElement;
  let value = '';
  let input: HTMLTextAreaElement;

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

  const autoScroll = async () => {
    if (!browser) return;
    await tick();
    if (
      messagesUList.scrollHeight - messagesUList.offsetHeight - messagesUList.scrollTop <
      window.outerHeight / 4
    )
      messagesUList.scroll(0, messagesUList.scrollHeight);
  };

  const logOut = () => {
    userData.set(null);
    goto('/login');
  };

  const onSubmit = async () => {
    if (value.trim()) {
      let headers = new Headers();
      headers.set('Authorization', $userData!.session.token);
      if (value.startsWith('/shrug')) value = value.substring(7) + ' ¯\\\\\\_(ツ)_/¯';
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
        .map((d) => `![${d.name}](${$userData?.instanceInfo.effis_url}/${d.id})`)
        .join('\n')
    }).then((_) => messagesUList.scroll(0, messagesUList.scrollHeight));
    await tick();
    input.focus(); // for mobiles
  };

  const onReply = async (e: CustomEvent<PenginMessage>) => {
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
</script>

<svelte:window on:resize={autoScroll} />

<div class="message-channel">
  <div id="options-div">
    <div id="instance-info">
      <span id="instance-name">{$userData?.instanceInfo?.instance_name ?? 'Pengin - loading'}</span>
      {#if $userData?.instanceInfo?.description}
        <span id="instance-description">{$userData.instanceInfo.description}</span>
        <span id="instance-markdown">
          <Markdown content={$userData.instanceInfo.description} />
        </span>
      {/if}
    </div>
    <a id="settings-link" href="/settings"> Settings </a>
    <button id="logout-button" on:click={logOut}> Logout </button>
  </div>
  <div class="channel-view">
    <div class="message-channel-body">
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
        <button id="send-button">Send</button>
      </form>
    </div>
    <ul id="users">
      {#each users as user (user.id)}
        {#if user.status.type != StatusType.OFFLINE}
          <li>
            <span>{user.username}</span>
          </li>
        {/if}
      {/each}
    </ul>
  </div>
</div>

<style>
  .message-channel {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
  }

  .channel-view {
    display: flex;
    flex-grow: 1;
    overflow-y: hidden;
  }

  .message-channel-body {
    flex-grow: 1;
    display: flex;
    flex-direction: column;
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
  }

  #send-button:hover {
    color: var(--gray-500);
  }

  #users {
    width: 10%;
  }

  #options-div {
    display: flex;
    background-color: var(--gray-200);
    padding: 10px;
    gap: 20px;
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
    text-decoration: none;
    align-self: center;
    border: unset;
  }

  #logout-button {
    padding: 5px 10px;
    outline: none;
    border: unset;
    border-radius: 25px;
    background-color: var(--pink-500);
    color: var(--purple-100);
    box-shadow: 0 2px 4px var(--purple-200);
    transition: box-shadow ease-in-out 200ms, color ease-in-out 200ms,
      background-color ease-in-out 200ms;
    cursor: pointer;
  }

  #logout-button:hover {
    box-shadow: 0 5px 20px var(--purple-200);
    background-color: var(--pink-600);
  }
</style>
