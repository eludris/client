<script lang="ts">
  import Navbar from '$lib/components/Navbar.svelte';
  import { page } from '$app/stores';
</script>

<Navbar />

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
      <a id="back-link" href="/">Back</a>
    </div>
    <slot />
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
    min-height: calc(100% - 90px);
  }

  #settings-div {
    display: flex;
    margin: 0 auto;
    width: 60%;
    flex-direction: column;
    align-items: center;
    gap: 20px;
    flex-grow: 1;
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
    padding: 10px;
    transition: unset;
  }

  #back-link {
    margin-left: auto;
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
