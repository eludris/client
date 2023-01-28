<script lang="ts">
  import { createEventDispatcher, tick } from 'svelte';

  export let value = '';
  export let input: HTMLTextAreaElement;
  export let scrollContainer: HTMLElement;
  const dispatch = createEventDispatcher();

  const onInputKeyPress = (e: KeyboardEvent) => {
    if (
      e.key == 'Enter' &&
      !e.shiftKey &&
      value.substring(0, input.selectionStart).split('```').length % 2 == 1
    ) {
      dispatch('submit');
      e.preventDefault();
    }
  };

  const onInputKeyDown = async (e: KeyboardEvent) => {
    if (e.key == 'Tab' && value.substring(0, input.selectionStart).split('```').length % 2 == 0) {
      e.preventDefault();
      var start = input.selectionStart;
      var end = input.selectionEnd;

      value = value.substring(0, start) + '\t' + value.substring(end);
      await tick();
      input.selectionStart = input.selectionEnd = start + 1;
    }
  };

  const onInput = () => {
    let scroll =
      scrollContainer.scrollHeight - scrollContainer.offsetHeight - scrollContainer.scrollTop == 0;
    input.style.height = '1px'; // we do this to avoid it getting incrementally bigger with every press
    input.style.height = `${Math.min(Math.max(26, input.scrollHeight), window.innerHeight / 3)}px`;
    if (scroll) scrollContainer.scroll(0, scrollContainer.scrollHeight);
  };

  const onWindowKeyDown = (e: KeyboardEvent) => {
    if ((!e.ctrlKey || e.key == 'v') && !e.altKey && !e.metaKey) {
      input.focus();
    }
  };
</script>

<svelte:window on:keydown={onWindowKeyDown} />

<textarea
  bind:this={input}
  bind:value
  on:keypress={onInputKeyPress}
  on:keydown={onInputKeyDown}
  on:input={onInput}
  id="message-input"
  placeholder="Send a message to Eludris"
  autocomplete="off"
  spellcheck="true"
/>

<style>
  #message-input {
    flex-grow: 1;
    background: none;
    color: inherit;
    font-size: inherit;
    border: none;
    height: 26px;
    overflow-y: auto;
    margin: 10px 0 3px 5px;
    overflow-wrap: break-word;
    word-break: break-word;
    white-space: pre-wrap;
    user-select: text;
    outline: none;
    resize: none;
    font-family: inherit;
  }
</style>
