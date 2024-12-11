<script lang="ts">
  import { goto } from '$app/navigation';
  import Thang from '$lib/components/Thang.svelte';
  import { request, type RequestErr } from '$lib/request';
  import type { Sphere } from '$lib/types/sphere';
  import state from '$lib/ws';

  let sphereInput = '';
  let error = '';

  const joinSphere = async () => {
    try {
      let res: Sphere = await request('GET', `/spheres/${sphereInput}/join`);
      $state.spheres[res.id] = res;
      let channelId = 0;
      state.update((state) => {
        state.spheres[res.id] = res;
        res.categories.forEach((category) => {
          state.categories[category.id] = category;
          category.channels.forEach((channel) => {
            if (!channelId) channelId = channel.id;
            state.channels[channel.id] = channel;
          })
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
  <h1>Not much going on here...</h1>
  <p>Hopefully this gets populated by more interesting things soon!</p>
  <Thang />
  <p>Why don't you go check some spheres for now?</p>
  <form on:submit|preventDefault={joinSphere} id="sphere-form">
    <input id="sphere-input" type="text" placeholder="Sphere Name" bind:value={sphereInput} />
    <button id="join-button">Join</button>
  </form>
</div>

<style>
  #content {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    height: 100%;
  }

  h1 {
    margin: 10px;
  }

  #sphere-input,
  #join-button {
    font-size: 18px;
    padding: 5px 10px;
    outline: none;
    border: 2px solid var(--pink-200);
    border-radius: 10px;
    background-color: var(--purple-200);
    color: inherit;
    resize: none;
  }

  #join-button {
    border: unset;
    background-color: var(--pink-500);
    padding: 5px 20px;
    cursor: pointer;
  }

  #join-button:hover {
    background-color: var(--pink-600);
  }
</style>
