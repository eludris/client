<script lang="ts">
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import Thang from '$lib/components/Thang.svelte';
  import userData from '$lib/user_data';
  import { request, type RequestErr } from '$lib/request';
  import type { Channel } from '$lib/types/channel';
  import type { Sphere } from '$lib/types/sphere';
  import state from '$lib/ws';

  let code = $page.params.code;

  let error = '';

  let sphereData: Promise<Sphere> = request('get', `/spheres/${code}`);

  const joinSphere = async () => {
    try {
      let res = await request('GET', `/spheres/${code}/join`);
      $state.spheres[res.id] = res;
      let channelId = 0;
      state.update((state) => {
        state.spheres[res.id] = res;
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
</script>

<div id="content">
  {#await sphereData}
    <Thang animate={true} />
    <h2>Loading Sphere Information...</h2>
  {:then sphere}
    <div id="join-dialogue" class={sphere.banner ? 'big' : ''}>
      <div id="info">
        <img
          id="sphere-icon"
          src={sphere.icon
            ? `${$userData?.instanceInfo.effis_url}/sphere-icons/${sphere.icon}`
            : ''}
          alt={sphere.slug}
        />
        <p class="flavour">You've been invited to join</p>
        <h1 id="sphere-name">{sphere.name ?? sphere.slug}</h1>
        <p class="flavour">{sphere.members.length} Member{sphere.members.length == 1 ? '' : 's'}</p>
        {#if sphere.description}
          <p class="flavour">{sphere.description}</p>
        {/if}
        <span id="filler" />
        <div id="buttons">
          <button id="join" on:click={joinSphere}>Join</button>
          <button id="cancel" on:click={() => goto('/')}>Cancel</button>
        </div>
      </div>
      {#if sphere.banner}
        <img
          id="sphere-banner"
          src="{$userData?.instanceInfo.effis_url}/sphere-banners/{sphere.banner}"
          alt="{sphere.slug}'s banner"
        />
      {/if}
    </div>
  {:catch}
    <h2>Error joining sphere {code}</h2>
  {/await}
</div>

<style>
  h2 {
    color: #999;
  }

  #content {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    flex-direction: column;
  }

  #join-dialogue {
    background-color: var(--purple-100);
    border-radius: 15px;
    display: flex;
    width: 30%;
    height: 60%;
    box-sizing: border-box;
    overflow: hidden;
  }

  #join-dialogue.big {
    width: 60%;
  }

  #info {
    display: flex;
    padding: 30px 50px;
    gap: 15px;
    height: 100%;
    align-items: center;
    flex-direction: column;
    flex-grow: 1;
    box-sizing: border-box;
  }

  #sphere-name {
    margin: 0;
    color: inherit;
  }

  #sphere-icon {
    border-radius: 100%;
    width: 20%;
    margin-bottom: 20px;
  }

  .flavour {
    font-weight: 300px;
    color: #999;
    margin: 0;
  }

  #buttons {
    display: flex;
    flex-direction: column;
    gap: 20px;
    width: 100%;
  }

  #join {
    border: unset;
    background-color: var(--pink-500);
    padding: 10px 20px;
    cursor: pointer;
    border-radius: 5px;
    width: 100%;
  }

  #join:hover {
    background-color: var(--pink-600);
  }

  #cancel {
    border: unset;
    background-color: inherit;
    color: #777;
    text-decoration: underline;
    cursor: pointer;
  }

  #cancel:hover {
    color: #aaa;
  }

  #sphere-banner {
    flex-grow: 1;
    width: 50%;
    height: 100%;
    object-fit: cover;
  }

  #filler {
    flex-grow: 1;
  }
</style>
