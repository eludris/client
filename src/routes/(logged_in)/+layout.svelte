<script lang="ts">
  import { onMount } from 'svelte';
  import data from '$lib/data';
  import { goto } from '$app/navigation';
  import messages from '$lib/ws';

  onMount(() => {
    if (!$data) goto('/login');
  });

  let facts = [
    'Eludritians are eldritch demons who do not need sleep, this is why it is okay for us to be sleep deprived, no, you do not need to call Health & Safety.',
    'Thang >>>> other mascots',
    'We need more of these',
    '100% of the people who saw this screen have used Eludris at least once',
    'Why are we still here?',
    '```',
    "So you're telling me a morb fried this rice???",
    'What the heck is a mile',
    'Eludris is factually better than Disco- well, maybe not yet',
    'I am the storm that is approaching',
    'Coffee is kinda pog',
    'The game pengin originally started as a joke about linux users while watching <a href="https://cdn.eludris.gay/447046752257344245340176389" target="_blank">this video</a> on loop'
  ];

  const randomFact = () => {
    return facts[Math.floor(Math.random() * facts.length)];
  };
</script>

{#if $data && $messages}
  <slot />
{:else}
  <div id="fact">
    <h1>Fun Fact</h1>
    <p>{@html randomFact()}</p>
    <span>Yes, this is a loading screen</span>
  </div>
{/if}

<style>
  #fact {
    width: 100vw;
    height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 5px;
    box-sizing: border-box;
  }

  #fact > h1 {
    font-size: 42px;
    margin-bottom: 5px;
  }

  #fact > span {
    font-weight: 300;
    font-size: 12px;
  }
</style>
