<script lang="ts">
  import type { Message } from '$lib/types/message';
  import Markdown from '$lib/components/Markdown.svelte';

  export let message: Message;
  export let showAuthor: boolean;
</script>

<div class="message">
  {#if showAuthor}
    <div class="author">{message.author}</div>
  {/if}
  <div class="content"><Markdown content={message.content} /></div>
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
  }
</style>
