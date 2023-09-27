<script lang="ts">
  import { goto } from '$app/navigation';
  import userData from '$lib/user_data';
  import config from '$lib/user_config';
  import { tick } from 'svelte';
  import { request } from '$lib/request';

  let styles = $config.styles ?? '';
  let styleInput: HTMLTextAreaElement;
  let avatarInput: HTMLInputElement;
  let keys: string[] = [];
  let status = $userData?.user.status.text;

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

  const onAvatarInput = async () => {
    let file = avatarInput.files![0];
    if (file) {
      let formData = new FormData();
      formData.append('file', file, file.name);
      const data = await fetch($userData?.instanceInfo.effis_url! + '/avatars', {
        body: formData,
        method: 'POST'
      }).then((r) => r.json());
      await request('PATCH', '/users/profile', { avatar: data.id });
    }
  };

  const setStatus = async () => {
    await request('PATCH', '/users/profile', { status: status ?? null });
  };
</script>

<svelte:body on:keydown={onKeyDown} />

{#if $userData}
  <span>
    <label for="styles">Avatar for Sir {$userData.user.username}</label>
    <input
      name="avatar"
      type="file"
      accept="image/*"
      on:input={onAvatarInput}
      bind:this={avatarInput}
    />
  </span>
  <span>
    <label for="styles">Status for Sir {$userData.user.username}</label>
    <input bind:value={status} name="status" />
    <button on:click={setStatus}>Set status</button>
  </span>
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

<style>
  span {
    display: flex;
    flex-direction: column;
    gap: 20px;
    width: 100%;
  }

  span > label {
    font-size: 20px;
    display: inline-block;
  }

  input,
  textarea {
    margin-top: 0;
    font-size: 18px;
    padding: 5px 10px;
    outline: none;
    border: 2px solid var(--pink-200);
    border-radius: 10px;
    background-color: var(--purple-200);
    color: inherit;
    resize: none;
  }

  span.has-textarea {
    height: 50%;
  }

  textarea {
    height: 50vh;
  }

  button {
    width: fit-content;
  }
</style>
