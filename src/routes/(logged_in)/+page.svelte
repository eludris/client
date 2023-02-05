<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import userData from '$lib/user_data';
  import messages from '$lib/ws';
  import { tick } from 'svelte';
  import { browser } from '$app/environment';
  import MessageInput from './MessageInput.svelte';
  import MessageComponent from './Message.svelte';
  import Markdown from '$lib/components/Markdown.svelte';
  import type { PenginMessage } from '$lib/types/ui/message';

  let lastAuthor: string | null = null;
  let messagesUList: HTMLUListElement;
  let value = '';
  let input: HTMLTextAreaElement;

  onMount(() => {
    messagesUList.scroll(0, messagesUList.scrollHeight);
    input.focus();
  });

  $: {
    if ($messages) {
      console.log('a');
      let scroll =
        messagesUList &&
        messagesUList.scrollHeight - messagesUList.offsetHeight - messagesUList.scrollTop <
          window.outerHeight / 4;
      tick().then(() => {
        if (scroll) messagesUList.scroll(0, messagesUList.scrollHeight);
      });
    }
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

  const logOut = () => {
    userData.set(null);
    goto('/login');
  };

  const onSubmit = async () => {
    if (value.trim()) {
      if (value.startsWith('/shrug')) value = value.substring(7) + ' ¯\\\\\\_(ツ)_/¯';
      fetch($userData?.instanceURL + '/messages', {
        method: 'POST',
        body: JSON.stringify({ author: $userData?.name, content: value }) // data?.name is fine here
      }).then(() => messagesUList.scroll(0, messagesUList.scrollHeight));
    }
    value = '';
    await tick();
    let scroll =
      messagesUList.scrollHeight - messagesUList.offsetHeight - messagesUList.scrollTop == 0;
    input.style.height = '1px';
    input.style.height = `${Math.min(Math.max(26, input.scrollHeight), window.outerHeight / 3)}px`;
    if (scroll) messagesUList.scroll(0, messagesUList.scrollHeight);
    input.focus(); // for mobiles
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
  <ul bind:this={messagesUList} id="messages">
    {#if $messages}
      {#each $messages as message, i (i)}
        <MessageComponent {message} />
      {/each}
    {/if}
  </ul>
  <form id="message-input-form" on:submit|preventDefault={onSubmit}>
    <MessageInput bind:input bind:value on:submit={onSubmit} scrollContainer={messagesUList} />
    <button id="send-button">Send</button>
  </form>
</div>

<style>
  .message-channel {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
  }

  #messages {
    flex-grow: 1;
    padding: 10px;
    overflow-y: auto;
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
