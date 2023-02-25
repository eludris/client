<script lang="ts">
  import { goto } from '$app/navigation';
  import config from '$lib/user_config';
  import { onMount } from 'svelte';

  onMount(() => {
    $config.styles = undefined;
    goto('/settings');
  });
</script>
