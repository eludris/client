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
  .content {
    margin: 0;
    margin-left: 20px;
  }

  .author {
    margin: 10px 0;
  }
</style>
