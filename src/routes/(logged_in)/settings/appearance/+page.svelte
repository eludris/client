<script lang="ts">
  import config from '$lib/user_config';
  import { tick } from 'svelte';

  let styleInput: HTMLTextAreaElement;
  let styles = $config.styles ?? '';

  const onStylesKeyDown = async (e: KeyboardEvent) => {
    if (
      e.key == 'Tab' &&
      styles.substring(0, styleInput.selectionStart).split('{').length >
        styles.substring(0, styleInput.selectionStart).split('}').length
    ) {
      e.preventDefault();
      const start = styleInput.selectionStart;
      const end = styleInput.selectionEnd;

      styles = styles.substring(0, start) + '  ' + styles.substring(end);
      await tick();
      styleInput.selectionStart = styleInput.selectionEnd = start + 2;
    }
  };

  const onStylesInput = () => {
    $config.styles = styles;
  };
</script>

<div class="setting">
  <label for="styles">Custom Styles</label>
  <textarea
    name="styles"
    bind:this={styleInput}
    bind:value={styles}
    on:keydown={onStylesKeyDown}
    on:input={onStylesInput}
    spellcheck="false"
  />
</div>

<style>
  .setting {
    flex-grow: 1;
  }

  textarea {
    flex-grow: 1;
  }
</style>
