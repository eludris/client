<script lang="ts">
  import { goto } from '$app/navigation';
  import data from '$lib/data';

  let name = $data?.name ?? '';
  let error = '';

  const onNameInput = () => {
    if (name.length < 2 || name.length > 32) {
      error = 'Your username must be between 2 and 32 characters in length';
    } else {
      if ($data) {
        $data.name = name;
      }
      error = '';
    }
  };

  const onKeyPress = (e: KeyboardEvent) => {
    if (e.key == 'Escape') goto('/');
  };
</script>

<div id="settings-wrapper-div" on:keypress={onKeyPress}>
  <a id="back-link" href="/">Back</a>
  <div id="settings-div">
    {#if $data}
      <span>
        <label for="username">Username</label>
        <input name="username" bind:value={name} on:keyup={onNameInput} />
      </span>
      {#if error}
        <span class="error">{error}</span>
      {/if}
      <span>
        <label for="styles">Custom Styles</label>
        <textarea name="styles" bind:value={$data.styles} />
      </span>
    {/if}
  </div>
</div>

<style>
  #settings-wrapper-div {
    display: flex;
    width: 100vw;
    height: 100vh;
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
    width: 100%;
    margin-top: 50px;
    display: flex;
    align-items: center;
    justify-content: center;
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
    width: 30vw;
    resize: none;
  }

  #settings-div textarea {
    height: 40vh;
  }

  .error {
    color: var(--pink-700);
    margin-left: calc(30% + 20px);
    align-self: flex-start;
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
  }
</style>
