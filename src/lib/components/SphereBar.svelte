<script lang="ts">
  import { slide, type SlideParams } from 'svelte/transition';
  import state from '$lib/ws';
  import userData from '$lib/user_data';
  import type { Sphere } from '$lib/types/sphere';
  import type { Category } from '$lib/types/category';
  import { page } from '$app/stores';
  import { SphereChannelType, type Channel } from '$lib/types/channel';

  let currentSphere: Sphere | null = null;
  let currentChannel: Channel | null = null;

  let spheres: Sphere[] = Object.values($state.spheres ?? []);
  $: {
    currentChannel = $state.channels[Number.parseInt($page.params.channel_id)];
    if (
      currentChannel &&
      (currentChannel.type == SphereChannelType.TEXT ||
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

  const toggleCategory = (e: MouseEvent, c: Category) => {
    console.log(c)
    $state.categories[c.id].collapsed = !c.collapsed;
  }
</script>

<div id="sphere-bar" style:width={currentSphere ? '300px' : 'auto'}>
  <ul id="spheres" transition:phoneSlide={{ axis: 'x' }}>
    {#each spheres as sphere (sphere.id)}
      <a
        href="/channels/{sphere.categories[0].channels[0].id}"
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
    <div id="sphere-channels">
      {#if currentSphere.banner}
        <img
          id="sphere-banner"
          src="{$userData?.instanceInfo.effis_url}/sphere-banners/{currentSphere.banner}"
          alt="{currentSphere.slug}'s banner"
        />
      {/if}
      <h3 id="sphere-name">{currentSphere.name ?? currentSphere.slug}</h3>
      <hr />
      <ul id="sphere-channel-list">
        {#each currentSphere.categories as category (category.id)}
          <div class="category">
            {#if category.id != currentSphere.id}
              <span tabindex=0 role="button" on:click={(e) => toggleCategory(e, category)}>
                <h4 class="category-name">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" width="24" height="24" viewBox="4 4 16 16">
                    {#if !category.collapsed}
                      <path d="M12 15l-4.243-4.243 1.415-1.414L12 12.172l2.828-2.829 1.415 1.414z"/>
                    {:else}
                      <path d="M12.172 12L9.343 9.172l1.414-1.415L15 12l-4.243 4.243-1.414-1.415z"/>
                    {/if}
                  </svg>
                  {category.name}
                </h4>
              </span>
              {/if}
              {#if !category.collapsed}
                {#each category.channels as channel (channel.id)}
                  <a href="/channels/{channel.id}" class={`channel${channel == currentChannel ? " current" : ""}`}>
                    # {channel.name}
                  </a>
                  <br/>
                {/each}
              {/if}
            </div>
        {/each}
      </ul>
    </div>
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
    width: calc(100% - 5px);
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
    height: 50px;
    object-fit: cover;
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

  #sphere-channel-list,
  #sphere-name {
    margin: 5px;
  }

  #sphere-channels h3 {
    margin-bottom: 0;
  }

  .category {
    margin: 10px 0;
    user-select: none;
    display: flex;
    flex-direction: column;
  }

  .category h4 {
    margin: 0;
  }
  
  .category-name {
    color: var(--color-text);
    display: flex;
    align-items: center;
    cursor: pointer;
    padding: 5px;
    border-radius: 5px;
  }

  .category-name:hover {
    background-color: var(--purple-300);
  }

  .channel {
    padding: 5px;
    margin: 2px;
    border-radius: 5px;
    text-decoration: none;
  }
  
  .channel:hover {
    color: var(--gray-600);
    background-color: var(--purple-300);
  }

  .channel.current {
    color: var(--gray-600);
    background-color: var(--purple-400);
  }

  #sphere-banner {
    width: 100%;
    height: 115px;
    object-fit: cover;
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
