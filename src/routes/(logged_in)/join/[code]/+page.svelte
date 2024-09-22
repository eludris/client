<script lang="ts">
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { request, type RequestErr } from '$lib/request';
  import type { Channel } from '$lib/types/channel';
  import state from '$lib/ws';

  let code = $page.params.code;

  let error = '';

  const joinSphere = async () => {
    try {
      let res = await request('GET', `/spheres/${code}/join`);
      $state.spheres[res.id] = res;
      let channelId = 0;
      state.update((state) => {
        res.channels.forEach((channel: Channel) => {
          if (!channelId) channelId = channel.id;
          state.channels[channel.id] = channel;
        });
        return state;
      });
      goto(`/channels/${channelId}`);
    } catch (e) {
      let err = e as RequestErr;
      if (err.code == 404 || err.code == 401) {
        error = "Supplied sphere name doesn't exist";
      } else {
        error = err.message;
      }
    }
  };

  joinSphere();

  // TODO: UI
</script>
