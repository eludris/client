<script lang="ts">
  import { goto } from '$app/navigation';
  import userData from '$lib/user_data';
  import { request } from '$lib/request';

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

<div class="setting">
  <label for="styles">Avatar</label>
  <input
    name="avatar"
    type="file"
    accept="image/*"
    on:input={onAvatarInput}
    bind:this={avatarInput}
  />
</div>
<div class="setting">
  <label for="styles">Status</label>
  <input bind:value={status} name="status" />
  <button on:click={setStatus}>Set status</button>
</div>
