<script lang="ts">
  import Markdown from '$lib/components/Markdown.svelte';
  import MessageContext from './MessageContext.svelte';
  import { createEventDispatcher, tick } from 'svelte';
  import userData from '$lib/user_data';
  import activeContext from '$lib/context';
  import type { ClientMessage } from '$lib/types/ui/message';
  import UserContext from './UserContext.svelte';
  import type { Unsubscriber } from 'svelte/store';

  const dispatch = createEventDispatcher();

  export let message: ClientMessage;
  let currentContext: number;
  let showContext = false;
  let showAuthorContext = false;
  let contextDiv: HTMLDivElement;
  let authorContextDiv: HTMLDivElement;

  const onContextMenu = async (e: MouseEvent) => {
    $activeContext = $activeContext + 1;
    currentContext = $activeContext;
    let unsubscribe: Unsubscriber;
    unsubscribe = activeContext.subscribe((id) => {
      if (id != currentContext) {
        showContext = false;
        unsubscribe();
      }
    });
    showContext = true;
    await tick();
    positionContextDiv(e, contextDiv);
  };

  const closeContextMenu = () => {
    showContext = false;
  };

  const onAuthorContextMenu = async (e: MouseEvent) => {
    $activeContext = $activeContext + 1;
    currentContext = $activeContext;
    let unsubscribe: Unsubscriber;
    unsubscribe = activeContext.subscribe((id) => {
      if (id != currentContext) {
        showAuthorContext = false;
        unsubscribe();
      }
    });
    showAuthorContext = true;
    await tick();
    positionContextDiv(e, authorContextDiv);
  };

  const closeAuthorContextMenu = () => {
    showAuthorContext = false;
  };

  const positionContextDiv = (e: MouseEvent, div: HTMLDivElement) => {
    if (div.clientHeight + e.clientY < window.innerHeight) {
      div.style.top = `${e.clientY}px`;
      div.style.bottom = `auto`;
    } else {
      div.style.bottom = `${window.innerHeight - e.clientY}px`;
      div.style.top = `auto`;
    }
    if (div.clientWidth + e.clientX < window.innerWidth) {
      div.style.left = `${e.clientX}px`;
      div.style.right = `auto`;
    } else {
      div.style.right = `${window.innerWidth - e.clientX}px`;
      div.style.left = `auto`;
    }
  };

  const showProfile = () => {
    dispatch('showProfile', message.author.id);
  };
</script>

<div
  class="message"
  class:mentioned={message.mentioned}
  on:contextmenu|preventDefault={onContextMenu}
>
  <div class="avatar-container">
    {#if message.showAuthor}
      <!-- svelte-ignore a11y-click-events-have-key-events -->
      <img
        on:contextmenu|preventDefault|stopPropagation={onAuthorContextMenu}
        src={message._disguise?.avatar
          ? `${$userData?.instanceInfo.effis_url}/proxy?url=${encodeURIComponent(
              message._disguise?.avatar
            )}`
          : message.author.avatar
            ? `${$userData?.instanceInfo.effis_url}/avatars/${message.author.avatar}`
            : 'https://github.com/eludris/.github/blob/main/assets/thang-big.png?raw=true'}
        alt=""
        class="author-avatar"
        on:click|stopPropagation={showProfile}
      />
    {/if}
  </div>
  <div class="message-body">
    {#if message.showAuthor}
      <!-- svelte-ignore a11y-click-events-have-key-events -->
      <span
        on:contextmenu|preventDefault|stopPropagation={onAuthorContextMenu}
        on:click|preventDefault|stopPropagation={onAuthorContextMenu}
        class="author-name"
      >
        <span class="author-name-text">
          {message._disguise?.name ?? message.author.display_name ?? message.author.username}
        </span>
        {#if message._disguise}
          <span class="bridge-indicator">BRIDGE</span>
        {/if}
      </span>
    {/if}
    <div class="content"><Markdown content={message.renderedContent} preRendered /></div>
    {#if showContext}
      <MessageContext bind:contextDiv {message} on:close={closeContextMenu} on:reply />
    {/if}
    {#if showAuthorContext}
      <UserContext
        bind:contextDiv={authorContextDiv}
        user={message.author}
        on:close={closeAuthorContextMenu}
        on:mention
        on:showProfile
      />
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
    /* This resets KaTeX equation numbers for each message */
    /* https://github.com/KaTeX/KaTeX/issues/3048 */
    counter-reset: katexEqnNo mmlEqnNo;
  }

  .message:hover {
    background-color: var(--purple-100);
  }

  .avatar-container {
    width: 40px;
    flex-shrink: 0;
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
    width: 100%;
    overflow: hidden;
  }

  .content {
    margin-top: auto;
  }

  .author-name {
    white-space: pre;
    font-weight: bold;
    width: fit-content;
    display: flex;
    align-items: center;
  }

  .bridge-indicator {
    background-color: var(--purple-600);
    border-radius: 3px;
    padding: 0 2px;
    font-size: 12px;
    margin: 0 2px;
  }

  .author-name > .author-name-text:hover {
    text-decoration: underline;
  }

  .mentioned {
    background-color: var(--pink-200);
  }
</style>
