<script lang="ts">
  import Navbar from '$lib/components/Navbar.svelte';
  import { page } from '$app/stores';
</script>

<Navbar />

<div id="settings-wrapper-div">
  <div id="settings-div">
    <div id="settings-nav">
      <a href="/settings" class:current={$page.url.pathname == '/settings'}>Account</a>
      <a href="/settings/profile">Profile</a>
      <a href="/settings/notifications">Notifications</a>
      <a href="/settings/Appearance">Appearance</a>
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
    margin-top: 30px;
    overflow-y: scroll;
  }

  #settings-div {
    display: flex;
    margin: 0 auto;
    width: 60%;
    flex-direction: column;
    align-items: center;
    gap: 20px;
  }

  #settings-nav {
    width: 100%;
    display: flex;
    gap: 10px;
    border-bottom: 2px solid var(--gray-500);
  }

  #settings-nav a {
    border: unset;
    padding: 10px;
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

  @media only screen and (max-width: 1200px) {
    footer {
      text-align: center;
    }
  }
</style>
