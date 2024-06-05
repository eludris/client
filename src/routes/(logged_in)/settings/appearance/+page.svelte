<script lang="ts">
  import config from '$lib/user_config';
  import { onMount, tick } from 'svelte';
  import Popup from '$lib/components/Popup.svelte'
  import Markdown from '$lib/components/Markdown.svelte';

  let styleInput: HTMLTextAreaElement;
  let styles = $config.styles ?? '';

  let themeInfo: ThemeInfo[] = [];
  let themeDesc: string | undefined;
  let selectedTheme: ThemeInfo | undefined;

  type ThemeInfo = {
    name: string;
    author: string;
    'repo-url': string;
    description: string;
    'cover-image': string;
    'readme-url': string | undefined;
    'style-url': string | undefined;
  };

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

  const fetchThemeInfo = async () => {
    themeInfo = await fetch("https://raw.githubusercontent.com/eludris/client-themes/main/themes.json").then((r) => r.json());
    themeInfo[0].author = "Sharp Eyes"
    themeInfo = [...themeInfo, ...themeInfo, ...themeInfo, ...themeInfo, ...themeInfo, ...themeInfo];
  }

  const fetchTheme = async (theme: ThemeInfo) => {
    if (!theme['readme-url'] || !theme['style-url']) {
      themeDesc = await fetch(
        theme['repo-url']!.replace(
          /^(?:https?:\/\/)?github.com\/(.*?)\/(.*?)$/,
          "https://raw.githubusercontent.com/$1/$2/main/README.md"
        )
      ).then((r) => r.text());
    }

    selectedTheme = theme;
  }

  const onKeyDown = async (e: KeyboardEvent, theme: ThemeInfo) => {
    if (e.key == "Enter") {
      await fetchTheme(theme);
    }
  }

  const popupDismiss = () => {
    themeDesc = selectedTheme = undefined;
  }

  const useTheme = async () => {
    $config.styles = styles = await fetch(
      selectedTheme!['repo-url']!.replace(
        /^(?:https?:\/\/)?github.com\/(.*?)\/(.*?)$/,
        "https://raw.githubusercontent.com/$1/$2/main/style.css"
      )
    ).then((r) => r.text());
  } 

</script>

<details>
  <summary>Theme browser</summary>
  <div class="setting grid" tabindex="-1">
    {#each themeInfo as theme}
      <div
        class="theme-container"
        on:click={() => fetchTheme(theme)}
        on:keydown={(e) => onKeyDown(e, theme)}
        role="button"
        tabindex=0
      >
        <img class="theme-cover" src={theme['cover-image']} alt="Theme cover">
        <div class="theme-header">
          <div class="theme-name">{theme.name}</div>
          <div class="theme-author">by {theme.author}</div>
        </div>
        <div class="theme-description">{theme.description}</div>
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
  <label for="spoileron">Spoilers</label>
  <label class="spoiler-toggle" class:checked={$config.showSpoilers} for="spoileron">
    <input type="checkbox" id="spoileron" name="spoileron" bind:checked={$config.showSpoilers} />
    <span id="spoiler-checkbox" />
    Always show spoilers
  </label>
</div>
{#if themeDesc}
  <Popup on:dismiss={popupDismiss} --display-title="none">
    <span slot="title"></span>
    <div class="theme-popup-desc">
      <Markdown content={themeDesc}/>
    </div>
    <span slot="control">
      <div class="theme-buttons">
        <a class="theme-button repo" href={selectedTheme?.['repo-url']}>
          <svg viewBox="0 0 24 24" height=24 width=24>
            <path fill="currentColor" fill-rule="evenodd" d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" clip-rule="evenodd"></path>
          </svg>
        </a>
        <div class="button-separator" />
        <button class="theme-button cancel" on:click={popupDismiss}>Cancel</button>
        <button class="theme-button confirm" on:click={useTheme}>Use Theme</button>
      </div>
    </span>
  </Popup>
{/if}

<style>
  .grow {
    flex-grow: 1;
    height: 100%;
  }

  textarea {
    height: 40vh;
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

  .setting.grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    grid-auto-rows: 350px;
    grid-gap: 15px;
    height: 50vh;
    overflow-y: scroll;
    background-color: var(--purple-100);
    padding: 10px;
    width: calc(100% - 20px);
  }

  .theme-container {
    display: flex;
    flex-direction: column;
    gap: 20px;
    padding: 10px;
    background-color: var(--gray-100);
    border-radius: 10px;
  }

  .theme-container:hover,
  .theme-container:focus {
    background-color: var(--purple-200);
    box-shadow: 0 0 2px white inset;
  }

  .theme-cover {
    width: 100%;
    aspect-ratio: 16 / 9;
    object-fit: cover;
    border-radius: 2px;
  }

  .theme-description {
    color: #aaa;
  }

  .theme-name {
    font-size: 14pt;
  }

  .theme-author {
    color: #aaa;
  }

  :global(.theme-popup-desc > .md > p img) {
    width: 80%;
    max-width: unset;
    display: block;
    margin: 0 auto;
  }

  .theme-buttons {
    display: flex;
  }

  .theme-button {
    margin: 5px;
    background-color: transparent;
    border: none;
    color: white;
    padding: 10px 10px;
    border-radius: 5px;
    font-size: 12pt;
    margin: 0px 20px;
  }

  .button-separator {
    flex-grow: 1;
    flex-direction: row;
  }

  .theme-button.confirm {
    background-color: var(--gray-300);
    width: 120px;
  }

  .theme-button:hover {
    text-decoration: underline;
  }

  .theme-button.confirm:hover {
    background-color: var(--gray-400);
    text-decoration: none;
  }

  .theme-button:disabled {
    text-decoration: none;
    color: #aaa;
  }

  .theme-button.confirm:disabled {
    background-color: var(--purple-300);
  }

</style>
