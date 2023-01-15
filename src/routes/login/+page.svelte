<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import data from '$lib/data';
  let input: HTMLInputElement;

  onMount(() => {
    if ($data) goto('/');
  });

  const onSubmit = (e: Event) => {
    e.preventDefault();
    data.set({
      name: input.value,
      instanceURL: 'https://eludris.tooty.xyz'
    });
    goto('/');
  };
</script>

<h1>log in or else</h1>

<form on:submit={onSubmit}>
  <label for="username"> Username </label>
  <input bind:this={input} name="username" />
</form>
