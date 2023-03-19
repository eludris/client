<script lang="ts">
  import { goto } from '$app/navigation';
  import userData from '$lib/user_data';
  import config from '$lib/user_config';
  import { tick } from 'svelte';

  let name = $userData?.name ?? '';
  let styles = $config.styles ?? '';
  let styleInput: HTMLTextAreaElement;
  let error = '';
  let keys: string[] = [];

  const onNameInput = () => {
    if (name.length < 2 || name.length > 32) {
      error = 'Your username must be between 2 and 32 characters in length';
    } else {
      if ($userData) {
        $userData.name = name;
      }
      error = '';
    }
  };

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key == 'Escape') goto('/');

    if (e.key == 'Shift') {
      return;
    }

    if (keys.length < 2 && e.key == 'g') {
      keys.push('g');
    } else if (keys[0] == 'g' && keys[1] == 'g' && e.key == 'V') {
      keys.push('V');
    } else if (keys[0] == 'g' && keys[1] == 'g' && keys[2] == 'V' && e.key == 'G') {
      alert('ggVG is a sensible keybind');
      keys = [];
    } else {
      keys = [];
    }
  };

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

<svelte:body on:keydown={onKeyDown} />

<div id="settings-wrapper-div">
  <a id="back-link" href="/">Back</a>
  <div id="settings-div">
    {#if $userData}
      <span>
        <label for="username">Username</label>
        <input name="username" bind:value={name} on:keyup={onNameInput} />
      </span>
      {#if error}
        <span class="error">{error}</span>
      {/if}
      <span class="has-textarea">
        <label for="styles">Custom Styles</label>
        <textarea
          name="styles"
          bind:this={styleInput}
          bind:value={styles}
          on:keydown={onStylesKeyDown}
          on:input={onStylesInput}
          spellcheck="false"
        />
      </span>
      <span>
        <label for="notifications">Notifications Level</label>
        <div id="notifications-div">
          <datalist id="notification-opts">
            <option value="1" label="Off"><span class="mark" /></option>
            <option value="2" label="Mentions only"><span class="mark" /></option>
            <option value="3" label="Everything"><span class="mark" /></option>
          </datalist>
          <input
            name="notifications"
            bind:value={$config.notifications}
            type="range"
            list="notification-opts"
            min="1"
            max="3"
          />
          <span id="notifications-input-track" />
          <div />
        </div>
      </span>
    {/if}
  </div>
  <footer>
    <span>
      Pengin is fully FOSS! Check out our <a
        href="https://github.com/eludris/pengin"
        target="_blank"
        rel="noreferrer">GitHub</a
      > repository!
    </span>
  </footer>
</div>

<style>
  #settings-wrapper-div {
    display: flex;
    width: 100%;
    height: 100%;
    flex-direction: column;
  }

  #back-link {
    text-decoration: none;
    border: unset;
    padding: 10px;
    width: auto;
    margin-left: auto;
  }

  #settings-div {
    margin-bottom: auto;
    margin-top: 50px;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: top;
    flex-direction: column;
    gap: 20px;
  }

  #settings-div > span:not(.error) {
    display: flex;
    gap: 20px;
    width: 100%;
  }

  #settings-div > span > label {
    width: 30%;
    font-size: 20px;
    text-align: right;
    display: inline-block;
  }

  #settings-div input,
  #settings-div textarea {
    margin-top: 0;
    font-size: 18px;
    padding: 5px 10px;
    outline: none;
    border: 2px solid var(--pink-200);
    border-radius: 10px;
    background-color: var(--purple-200);
    color: inherit;
    width: 30%;
    resize: none;
  }

  #settings-div > span.has-textarea {
    height: 50%;
  }

  #settings-div textarea {
    height: 100%;
  }

  #notifications-div {
    position: relative;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    width: calc(30% + 24px);
  }

  #notifications-div > datalist {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    width: 100%;
    place-items: center;
    padding: 0;
  }

  #notifications-div > datalist > option::after {
    content: '';
    display: inline;
    position: absolute;
    width: 2px;
    height: 24px;
    top: 24px;
    left: 50%;
    transform: translate(-50%, 0);
    background-color: var(--pink-700);
    z-index: -1;
  }

  #notifications-div > input {
    position: absolute;
    top: 24px;
    width: 70%;
    margin: 10px 15%;
    padding: 0;
    -webkit-appearance: none;
    appearance: none;
    outline: none;
    height: 3px;
    border: unset;
    background-color: transparent;
  }

  #notifications-div > #notifications-input-track {
    position: absolute;
    top: 24px;
    width: 80%;
    margin: 10px 10%;
    padding: 0;
    -webkit-appearance: none;
    appearance: none;
    outline: none;
    height: 3px;
    border: unset;
    background-color: var(--pink-200);
    z-index: -1;
  }

  input[type='range']::-moz-range-thumb {
    appearance: none;
    border-radius: 100%;
    border: unset;
    width: 18px;
    height: 18px;
    background: var(--pink-600);
    cursor: pointer;
  }

  input[type='range']::-ms-thumb {
    appearance: none;
    border-radius: 100%;
    border: unset;
    width: 18px;
    height: 18px;
    background: var(--pink-600);
    cursor: pointer;
  }

  input[type='range']::-webkit-slider-thumb {
    -webkit-appearance: none;
    border-radius: 100%;
    border: unset;
    width: 18px;
    height: 18px;
    background: var(--pink-600);
    cursor: pointer;
  }

  .error {
    color: var(--pink-700);
    margin-left: calc(30% + 20px);
    align-self: flex-start;
  }

  footer {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 10px;
    background-color: var(--gray-200);
  }

  @media only screen and (max-width: 1200px) {
    #settings-div > span {
      flex-direction: column;
    }

    #settings-div > span > label {
      width: auto;
      text-align: center;
    }

    #settings-div input,
    #settings-div textarea {
      width: auto;
      margin: 10px;
    }

    #notifications-div {
      width: 100%;
    }

    #notifications-div > input {
      width: 70%;
      margin: 10px 15%;
    }

    footer {
      text-align: center;
    }

    .error {
      margin: 10px;
      text-align: center;
    }
  }
</style>
