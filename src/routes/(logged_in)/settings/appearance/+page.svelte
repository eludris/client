<script lang="ts">
  import config from '$lib/user_config';
  import { onMount, tick } from 'svelte';

  let styleInput: HTMLTextAreaElement;
  let styles = $config.styles ?? '';

  let themeInfo: ThemeInfo[] = [];

  onMount(() => fetchThemeInfo())

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

  type ThemeInfo = {
    name: string;
    'repo-url': string;
    description: string;
    'cover-image': string;
  };

  const fetchThemeInfo = async () => {
    themeInfo = await fetch("https://raw.githubusercontent.com/eludris/client-themes/main/themes.json").then((response) => response.json());
  }
</script>

<details>
  <summary>Theme browser</summary>
  <div class="setting grow">
    {#each themeInfo as theme}
      <div class="theme-container">
        <img class="theme-cover" src={theme['cover-image']} alt="Theme cover">
        <div class="theme-text-container">
          <h2 class="theme-name">{theme.name}</h2>        
          <div class="theme-description">{theme.description}</div>
        </div>
      </div>
    {/each}
  </div>
</details>
<details>
  <summary>Custom styles</summary>
  <div class="setting grow">
    <textarea
      name="styles"
      bind:this={styleInput}
      bind:value={styles}
      on:keydown={onStylesKeyDown}
      on:input={onStylesInput}
      spellcheck="false"
    />
  </div>
</details>
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
    height: 100%;
  }

  textarea {
    height: 40vh;
    /* display: flex;
    flex-grow: 1; */
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

  .theme-container {
    display: flex;
    flex-direction: row;
    gap: 20px;
    padding: 10px;
    height: 15vh;
    background-color: var(--purple-100);
    border-radius: 5px;
  }

  .theme-container:hover {
    background-color: var(--purple-200);
  }

  .theme-cover {
    height: 100%;
    aspect-ratio: 1;
  }
</style>
