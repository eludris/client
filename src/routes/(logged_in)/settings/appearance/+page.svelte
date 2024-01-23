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

<div class="setting grow">
  <label for="styles">Custom styles</label>
  <textarea
    name="styles"
    bind:this={styleInput}
    bind:value={styles}
    on:keydown={onStylesKeyDown}
    on:input={onStylesInput}
    spellcheck="false"
  />
</div>
<div class="setting">
  <label>Spoilers</label>
  <label class="spoiler-toggle" class:checked={$config.showSpoilers} for="spoileron">
    <input type="checkbox" id="spoileron" name="spoileron" bind:checked={$config.showSpoilers} />
    <span id="spoiler-checkbox" />
    Always show spoilers
  </label>
</div>

<style>
  .grow {
    flex-grow: 1;
  }

  textarea {
    flex-grow: 1;
  }

  span {
    font-size: 20px;
    display: inline-block;
  }

  .spoiler-toggle {
    display: flex;
    align-items: center;
    gap: 5px;
  }

  #spoileron {
    display: none;
  }

  #spoiler-checkbox {
    display: inline-block;
    width: 10px;
    height: 10px;
    border: 5px solid white;
    border-radius: 5px;
    background-color: white;
  }

  .spoiler-toggle.checked #spoiler-checkbox {
    background-color: var(--gray-400);
  }
</style>
