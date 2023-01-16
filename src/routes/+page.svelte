<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import data from '$lib/data';
  import messages from '$lib/ws';
  import type { Message } from '$lib/types/message';
  import { tick } from 'svelte';

  interface UiMessage {
    message: Message;
    showAuthor: boolean;
    index: number;
  }

  let lastAuthor: string | null = null;
  let value = '';
  let messagesUList: HTMLUListElement;
  let input: HTMLTextAreaElement;
  let uiMessages: Array<UiMessage> = [];

  onMount(() => {
    if (!$data) goto('/login');
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
    tick().then(() => {
      if (
        messagesUList?.scrollHeight - messagesUList?.offsetHeight - messagesUList?.scrollTop <
        100
      )
        // this also runs on the server
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

  const onInputKeyPress = (e: KeyboardEvent) => {
    if (e.key == 'Enter' && !e.shiftKey) {
      onSubmit();
      e.preventDefault();
    }
  };

  const onInput = () => {
    input.style.height = '1px'; // we do this to avoid it getting incrementally bigger with every press
    input.style.height = `${Math.min(Math.max(26, input.scrollHeight), window.outerHeight / 3)}px`;
  };
</script>

<div class="message-channel">
  <div id="options-div">
    <button on:click={logOut}> Logout </button>
  </div>
  <ul bind:this={messagesUList} id="messages">
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
    <textarea
      bind:this={input}
      bind:value
      on:keypress={onInputKeyPress}
      on:input={onInput}
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
