<script lang="ts" context="module">
  let hideOtherContext = () => {};
</script>

<script lang="ts">
  import Markdown from '$lib/components/Markdown.svelte';
  import MessageContext from './MessageContext.svelte';
  import { tick } from 'svelte';
  import type { PenginMessage } from '$lib/types/ui/message';

  export let message: PenginMessage;
  let showContext = false;
  let contextDiv: HTMLDivElement;

  const onContextMenu = async (e: MouseEvent) => {
    hideOtherContext();
    hideOtherContext = () => {
      console.log(message.content);
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

<div class="message" on:contextmenu|preventDefault={onContextMenu}>
  {#if message.showAuthor}
    <div class="author">{message.author}</div>
  {/if}
  <div class="content"><Markdown content={message.renderedContent} preRendered /></div>
  {#if showContext}
    <MessageContext bind:contextDiv {message} on:close={closeContextMenu} />
  {/if}
</div>

<style>
  .message {
    padding: 5px;
    background-color: var(--colour-bg);
    transition: background-color ease-in-out 75ms;
  }

  .message:hover {
    background-color: var(--purple-100);
  }

  .content {
    margin: 0;
    margin-left: 20px;
  }

  .author {
    margin: 10px 0;
    white-space: pre;
    font-weight: bold;
  }
</style>
