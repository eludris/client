<script lang="ts" context="module">
  let hideOtherContext: () => void;
</script>

<script lang="ts">
  import Markdown from '$lib/components/Markdown.svelte';
  import MessageContext from './MessageContext.svelte';
  import { tick } from 'svelte';
  import userData from '$lib/user_data';
  import type { PenginMessage } from '$lib/types/ui/message';

  export let message: PenginMessage;
  let showContext = false;
  let contextDiv: HTMLDivElement;

  const onContextMenu = async (e: MouseEvent) => {
    if (hideOtherContext) {
      hideOtherContext();
    }
    hideOtherContext = () => {
      showContext = false;
    };
    showContext = true;
    await tick();
    if (contextDiv.clientHeight + e.clientY < window.innerHeight) {
      contextDiv.style.top = `${e.clientY}px`;
      contextDiv.style.bottom = `auto`;
    } else {
      contextDiv.style.bottom = `${window.innerHeight - e.clientY}px`;
      contextDiv.style.top = `auto`;
    }
    if (contextDiv.clientWidth + e.clientX < window.innerWidth) {
      contextDiv.style.left = `${e.clientX}px`;
      contextDiv.style.right = `auto`;
    } else {
      contextDiv.style.right = `${window.innerWidth - e.clientX}px`;
      contextDiv.style.left = `auto`;
    }
  };

  const closeContextMenu = () => {
    showContext = false;
  };
</script>

<div
  class="message"
  class:mentioned={message.mentioned}
  on:contextmenu|preventDefault={onContextMenu}
>
  <div class="avatar-container">
    {#if message.showAuthor}
      <img
        src={message.author.avatar
          ? `${$userData?.instanceInfo.effis_url}/avatars/${message.author.avatar}`
          : 'https://github.com/eludris/.github/blob/main/assets/thang-big.png?raw=true'}
        alt=""
        class="author-avatar"
      />
    {/if}
  </div>
  <div class="message-body">
    {#if message.showAuthor}
      <span class="author-name">
        {message.author.display_name ?? message.author.username}
      </span>
    {/if}
    <div class="content"><Markdown content={message.renderedContent} preRendered /></div>
    {#if showContext}
      <MessageContext bind:contextDiv {message} on:close={closeContextMenu} on:reply />
    {/if}
  </div>
</div>

<style>
  .message {
    display: flex;
    gap: 10px;
    padding: 5px;
    background-color: var(--colour-bg);
    transition: background-color ease-in-out 75ms;
  }

  .message:hover {
    background-color: var(--purple-100);
  }

  .avatar-container {
    width: 40px;
  }

  .author-avatar {
    width: 40px;
    height: 40px;
    object-fit: cover;
    border-radius: 100%;
  }

  .message-body {
    display: flex;
    flex-direction: column;
  }

  .content {
    margin-top: auto;
  }

  .author-name {
    white-space: pre;
    font-weight: bold;
  }

  .mentioned {
    background-color: var(--pink-200);
  }
</style>
