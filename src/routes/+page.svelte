<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import data from '$lib/data';
  import messages from '$lib/ws';
  import type { Message } from '$lib/types/message';

  interface UiMessage {
    message: Message;
    showAuthor: boolean;
    index: number;
  }

  let lastAuthor: string | null = null;
  let value: string = '';

  onMount(() => {
    if (!$data) goto('/login');
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

  $: uiMessages = mapMessages($messages);

  const logOut = () => {
    data.set(null);
    goto('/login');
  };

  const onSubmit = () => {
    if (value)
      fetch($data?.instanceURL + '/messages', {
        method: 'POST',
        body: JSON.stringify({ author: $data?.name, content: value }) // data?.name is fine here
      });
    value = '';
  };
</script>

<div class="message-channel">
  <div id="options-div">
    <button on:click={logOut}> Logout </button>
  </div>
  <ul id="messages">
    {#each uiMessages as { message, showAuthor, index } (index)}
      <div class="message">
        {#if showAuthor}
          <div class="author">{message.author}</div>
        {/if}
        <div class="content">{message.content}</div>
      </div>
    {/each}
  </ul>
  <form id="message-input-form" on:submit|preventDefault={onSubmit}>
    <input
      bind:value
      type="text"
      id="message-input"
      placeholder="Send a message to Eludris"
      autocomplete="off"
      spellcheck="true"
    />
    <button id="send-button">Send</button>
  </form>
</div>

<style>
  .message-channel {
    width: 100vw;
    height: 100vh;
  }
</style>
