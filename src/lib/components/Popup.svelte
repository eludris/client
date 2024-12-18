<script lang="ts">
  import { createEventDispatcher, onMount } from 'svelte';

  const dispatch = createEventDispatcher();

  let popup: HTMLDivElement;
  let content: HTMLSpanElement;

  onMount(() => {
    new ResizeObserver(
      () => {
        if (!content) return;
        if (content.scrollHeight > content.clientHeight) {
          content.style.marginRight = "-20px";
          content.style.paddingRight = "20px";
        } else {
          content.style.marginRight = "10px";
          content.style.paddingRight = "0";
        }
      }
    ).observe(content)
  })

  const containerClick = (e: MouseEvent) => {
    if (e.target != popup && !popup.contains(e.target as Node)) {
      popupDismiss();
    }
  };

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key == 'Escape') {
      popupDismiss();
    }
  };

  const popupDismiss = () => {
    dispatch('dismiss');
  };
</script>

<svelte:body on:keydown|stopPropagation|capture={onKeyDown} />
<svelte:head
  ><style>
    #app {
      overflow: hidden;
      user-select: none;
    }
  </style></svelte:head
>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- NOTE: popup-window exists only so that the container can be made sticky. -->
<div id="popup-window">
  <div id="popup-container" on:click={containerClick}>
    <div id="popup" bind:this={popup}>
      <h2 id="popup-title"><slot name="title">Notice</slot></h2>
      <span id="popup-message" bind:this={content}><slot /></span>
      <slot name="control">
        <button id="popup-dismiss" on:click={popupDismiss}>Got it</button>
      </slot>
    </div>
  </div>
</div>

<style>
  #popup-window {
    position: fixed;
    overflow: visible;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  }

  #popup-container {
    position: sticky;
    display: flex;
    width: 100%;
    height: 100%;
    align-items: center;
    justify-content: center;
    background-color: #0008;
    z-index: 999;
  }

  #popup {
    display: flex;
    border-radius: 10px;
    flex-direction: column;
    padding: 20px;
    background-color: var(--gray-100);
    max-width: 80%;
    max-height: 80%;
  }

  #popup-title {
    margin: 10px 5px;
    display: var(--display-title, unset);
  }

  #popup-message {
    margin: 10px;
    overflow-y: auto;
  }

  :global(#popup-dismiss) {
    width: fit-content;
    align-self: flex-end;
    border: unset;
    border-radius: 5px;
    padding: 5px 7px;
    margin-top: 10px;
    font-size: 14px;
    background-color: var(--pink-500);
    transition: background-color ease-in-out 125ms;
  }

  #popup-dismiss:hover {
    background-color: var(--pink-600);
  }
</style>
