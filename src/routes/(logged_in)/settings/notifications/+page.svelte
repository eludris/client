<script lang="ts">
  import config from '$lib/user_config';
</script>

<div class="setting">
  <label for="notifications">Notifications Level</label>
  {#each ['Off', 'Mentions only', 'Everything'] as name, value}
    <label class="container {$config.notifications == value + 1 ? 'checked' : ''}">
      <span class="radio" />
      <input
        name="notifications"
        type="radio"
        value={value + 1}
        bind:group={$config.notifications}
      />
      {name}
    </label>
  {/each}
</div>

<style>
  .setting {
    gap: 10px;
    width: fit-content;
    align-self: flex-start;
  }

  .container {
    display: flex;
    background-color: var(--gray-200);
    padding: 10px;
    align-items: center;
    gap: 10px;
    border-radius: 5px;
    transition: background-color ease-in-out 125ms;
    font-size: 18px;
    box-sizing: border-box;
  }

  .container:hover {
    background-color: var(--gray-300);
  }

  input {
    display: none;
  }

  .container.checked {
    background-color: var(--gray-400);
  }

  .radio {
    display: inline-block;
    width: 10px;
    height: 10px;
    border: 5px solid white;
    border-radius: 100%;
    background-color: white;
  }

  .container.checked .radio {
    background-color: var(--gray-400);
  }

  @media only screen and (max-width: 1200px) {
    .container {
      width: 100%;
    }
  }
</style>
