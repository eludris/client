<script lang="ts">
  import { createEventDispatcher } from 'svelte';

  const dispatch = createEventDispatcher();

  let popup: HTMLDivElement;

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

<!-- svelte-ignore a11y-click-events-have-key-events -->
<div id="popup-container" on:click={containerClick}>
  <div id="popup" bind:this={popup}>
    <h2 id="popup-title"><slot name="title">Notice</slot></h2>
    <span id="popup-message"><slot /></span>
    <slot name="control">
      <button id="popup-dismiss" on:click={popupDismiss}>Got it</button>
    </slot>
  </div>
</div>

<style>
  #popup-container {
    position: absolute;
    display: flex;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    align-items: center;
    justify-content: center;
    background-color: #0008;
  }

  #popup {
    display: flex;
    border-radius: 10px;
    flex-direction: column;
    padding: 20px;
    background-color: var(--gray-100);
  }

  #popup-title {
    margin: 10px 5px;
  }

  #popup-message {
    margin: 10px;
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
