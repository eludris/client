<script lang="ts">
  import { onMount } from 'svelte';
  import data from '$lib/data';
  import { goto } from '$app/navigation';

  onMount(() => {
    if (!$data) goto('/login');
  });
</script>

<slot />
