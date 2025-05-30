<script lang="ts">
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import userConfig from '$lib/user_config';

  let keys: string[] = [];
  let backUrl = $userConfig.lastChannel ? `/channels/${$userConfig.lastChannel}` : '/';

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key == 'Escape') goto(backUrl);

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
</script>

<svelte:body on:keydown={onKeyDown} />

<div id="settings-wrapper-div">
  <div id="settings-div">
    <div id="settings-nav">
      <a href="/settings" class:current={$page.url.pathname == '/settings'}>Account</a>
      <a href="/settings/profile" class:current={$page.url.pathname == '/settings/profile'}
        >Profile</a
      >
      <a
        href="/settings/notifications "
        class:current={$page.url.pathname == '/settings/notifications'}>Notifications</a
      >
      <a href="/settings/appearance" class:current={$page.url.pathname == '/settings/appearance'}
        >Appearance</a
      >
      <a id="back-link" href={backUrl}>
        <!-- https://icon-sets.iconify.design/mdi/exit-to-app/ -->
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
          ><path
            fill="currentColor"
            d="M19 3H5c-1.11 0-2 .89-2 2v4h2V5h14v14H5v-4H3v4a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2m-8.92 12.58L11.5 17l5-5l-5-5l-1.42 1.41L12.67 11H3v2h9.67l-2.59 2.58Z"
          /></svg
        >
        Back</a
      >
    </div>
    <span id="settings-container">
      <slot />
    </span>
  </div>

  <footer>
    <span>
      The client is fully FOSS! Check out our <a
        href="https://github.com/eludris/client"
        target="_blank"
        rel="noreferrer">GitHub</a
      > repository!
    </span>
  </footer>
</div>

<style>
  #settings-wrapper-div {
    display: flex;
    flex-direction: column;
    margin-top: 30px;
    overflow-y: scroll;
    min-height: calc(100% - 30px);
  }

  #settings-div,
  #settings-container {
    display: flex;
    margin: 0 auto;
    width: 60%;
    flex-direction: column;
    align-items: center;
    gap: 20px;
    flex-grow: 1;
  }

  #settings-container {
    width: 100%;
  }

  #settings-nav {
    width: 100%;
    display: flex;
    gap: 10px;
    border-bottom: 2px solid var(--gray-500);
    overflow-x: auto;
  }

  #settings-nav a {
    border: unset;
    text-decoration: none;
    padding: 10px;
    transition: unset;
  }

  #back-link {
    display: flex;
    margin-left: auto;
    align-items: center;
    gap: 5px;
  }

  #settings-nav a.current {
    border-bottom: 3px solid var(--gray-500);
  }

  footer {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 10px;
    background-color: var(--gray-200);
    width: 100%;
    box-sizing: border-box;
    margin-top: 10px;
  }

  :global(.setting) {
    display: flex;
    flex-direction: column;
    gap: 20px;
    width: 100%;
  }

  :global(.setting > label) {
    font-size: 20px;
    display: inline-block;
  }

  :global(.setting input),
  :global(.setting textarea) {
    font-size: 18px;
    padding: 5px 10px;
    outline: none;
    border: 2px solid var(--pink-200);
    border-radius: 10px;
    background-color: var(--purple-200);
    color: inherit;
    resize: none;
  }

  :global(.setting button) {
    width: fit-content;
  }

  @media only screen and (max-width: 1200px) {
    #settings-div {
      width: 95%;
    }

    footer {
      text-align: center;
    }
  }
</style>
