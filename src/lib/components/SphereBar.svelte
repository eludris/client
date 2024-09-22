<script lang="ts">
  import { slide, type SlideParams } from 'svelte/transition';
  import state from '$lib/ws';
  import userData from '$lib/user_data';
  import type { Sphere } from '$lib/types/sphere';
  import { page } from '$app/stores';
  import { SphereChannelType } from '$lib/types/channel';

  let currentSphere: Sphere | null = null;

  let spheres: Sphere[] = Object.values($state.spheres ?? []);
  $: {
    let currentChannel = $state.channels[Number.parseInt($page.params.channel_id)];
    if (
      currentChannel &&
      (currentChannel.type == SphereChannelType.CATEGORY ||
        currentChannel.type == SphereChannelType.TEXT ||
        currentChannel.type == SphereChannelType.VOICE)
    ) {
      currentSphere = $state.spheres[currentChannel.sphere_id];
    } else {
      currentSphere = null;
    }
  }

  const sphereContext = (e: MouseEvent, sphere: Sphere) => {};

  // this gets a bit screwed up on pc so we just limit it and call it conforming to discord xd
  const phoneSlide = (node: HTMLElement, params?: SlideParams | undefined) => {
    if (window.screen.width > 1000) return { duration: 0 };
    return slide(node, params);
  };
</script>

<div id="sphere-bar" style:width={currentSphere ? '300px' : 'auto'}>
  <ul id="spheres" transition:phoneSlide={{ axis: 'x' }}>
    {#each spheres as sphere (sphere.id)}
      <a
        href="/channels/{sphere.channels[0].id}"
        class="sphere {currentSphere?.id == sphere.id ? 'current' : ''}"
      >
        <img
          class="sphere-icon"
          src={sphere.icon
            ? `${$userData?.instanceInfo.effis_url}/sphere-icons/${sphere.icon}`
            : ''}
          alt={sphere.slug}
        />
      </a>
    {/each}
  </ul>
  {#if currentSphere}
    <ul id="sphere-channels" transition:phoneSlide={{ axis: 'x' }}>
      <h3>{currentSphere.name ?? currentSphere.slug}</h3>
      <hr />
      {#each currentSphere.channels as channel (channel.id)}
        {#if channel.type == SphereChannelType.CATEGORY}
          <h4 class="category">
            > {channel.name}
          </h4>
        {:else}
          <a href="/channels/{channel.id}" class="channel">
            # {channel.name}
          </a>
        {/if}
      {/each}
    </ul>
  {/if}
</div>

<style>
  #sphere-bar {
    max-width: 300px;
    display: flex;
    flex-shrink: 0;
    margin: 0;
    background-color: var(--purple-200);
    overflow-y: auto;
  }

  hr {
    width: 100%;
  }

  #sphere-bar ul {
    display: flex;
    margin: 0;
    padding: 10px 10px;
    flex-direction: column;
  }

  #spheres {
    background-color: var(--purple-100);
  }

  .sphere {
    cursor: pointer;
    padding: 10px 0;
  }

  .sphere-icon {
    width: 50px;
    border-radius: 100%;
    transition: border-radius ease-in-out 125ms;
  }

  .current .sphere-icon,
  .sphere:hover .sphere-icon {
    border-radius: 25%;
  }

  #sphere-channels {
    flex-grow: 1;
  }

  #sphere-channels h3 {
    margin-bottom: 0;
  }

  .category {
    margin: 10px 0;
  }

  .channel {
    padding-left: 5px;
    text-decoration: none;
  }

  @media only screen and (max-width: 1200px) {
    #users {
      position: absolute;
      width: min(80%, 300px);
      right: 0;
      height: calc(100% - 60px);
      box-sizing: border-box;
    }
  }
</style>
