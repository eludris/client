<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import data from '$lib/data';
  import messages from '$lib/ws';
  import type { Message } from '$lib/types/message';
  import { tick } from 'svelte';
  import { browser } from '$app/environment';
  import MessageInput from './MessageInput.svelte';
  import MessageComponent from './Message.svelte';

  interface UiMessage {
    message: Message;
    showAuthor: boolean;
    index: number;
  }

  let lastAuthor: string | null = null;
  let messagesUList: HTMLUListElement;
  let value = '';
  let input: HTMLTextAreaElement;
  let uiMessages: Array<UiMessage> = [];

  onMount(() => {
    messagesUList.scroll(0, 1);
    input.focus();
  });

  const checkAuthor = (author: string, index: number): boolean => {
    const res = author !== lastAuthor;
    lastAuthor = author;
    if (index == 0) {
      return true;
    }
    return res;
  };

  const mapMessages = (messages: Array<Message>) => {
    let newMessages: Array<UiMessage> = [];
    messages.forEach((m, i) =>
      newMessages.push({
        message: m,
        showAuthor: checkAuthor(m.author, i),
        index: i
      })
    );
    return newMessages;
  };

  $: {
    uiMessages = mapMessages($messages);
    if (browser)
      tick().then(() => {
        if (
          messagesUList.scrollHeight - messagesUList.offsetHeight - messagesUList.scrollTop <
          window.outerHeight / 4
        )
          messagesUList.scroll(0, messagesUList.scrollHeight);
      });
  }

  const logOut = () => {
    data.set(null);
    goto('/login');
  };

  const onSubmit = async () => {
    if (value.trim())
      fetch($data?.instanceURL + '/messages', {
        method: 'POST',
        body: JSON.stringify({ author: $data?.name, content: value }) // data?.name is fine here
      }).then(() => messagesUList.scroll(0, messagesUList.scrollHeight));
    value = '';
    await tick();
    input.style.height = '1px';
    input.style.height = `${Math.min(Math.max(26, input.scrollHeight), window.outerHeight / 3)}px`;
    input.focus(); // for mobiles
  };
</script>

<div class="message-channel">
  <div id="options-div">
    <button on:click={logOut}> Logout </button>
    <a href="/settings"> Settings </a>
  </div>
  <ul bind:this={messagesUList} id="messages">
    {#each uiMessages as { message, showAuthor, index } (index)}
      <MessageComponent {message} {showAuthor} />
    {/each}
  </ul>
  <form id="message-input-form" on:submit|preventDefault={onSubmit}>
    <MessageInput bind:input bind:value on:submit={onSubmit} />
    <button id="send-button">Send</button>
  </form>
</div>

<style>
  .message-channel {
    width: 100vw;
    height: 100vh;
    display: flex;
    flex-direction: column;
  }

  #messages {
    flex-grow: 1;
    padding: 10px;
    overflow-y: auto;
  }

  #message-input-form {
    width: calc(100% - 10px);
    display: flex;
    background-color: var(--gray-200);
    color: var(--gray-600);
    padding: 2px;
    margin: 10px 5px;
    font-size: 18px;
    min-height: 31px;
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
</style>
