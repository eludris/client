<script lang="ts">
  import { browser } from '$app/environment';
  import markdown from '$lib/markdown';

  if (browser) {
    try {
      import('prismjs').then((Prism) => {
        // @ts-expect-error: this is untyped :(
        import('prismjs/components/prism-rust.js');
        // @ts-expect-error: this is untyped :(
        import('prismjs/components/prism-python.js');
        // @ts-expect-error: this is untyped :(
        import('prismjs/components/prism-typescript.js');
        // @ts-expect-error: this is untyped :(
        import('prismjs/components/prism-nasm.js');
        // @ts-expect-error: this is untyped :(
        import('prismjs/components/prism-go.js');
        // @ts-expect-error: this is untyped :(
        import('prismjs/components/prism-json.js');
        Prism.languages['rs'] = Prism.languages['rust'];
      });
    } catch (e) {
      console.error('Could not load prism syntax highlighting');
    }
  }

  export let content: string;
  export let preRendered = false;
</script>

{#if preRendered}
  <div class="md">
    {@html content}
  </div>
{:else}
  {#await markdown(content)}
    <span> Loading markdown </span>
  {:then content}
    <div class="md">
      {@html content}
    </div>
  {:catch e}
    <span style:color="red">
      Error loading markdown {e}
    </span>
  {/await}
{/if}

<svelte:head>
  <link
    rel="stylesheet"
    href="https://cdn.jsdelivr.net/npm/katex@0.16.0/dist/katex.min.css"
    integrity="sha384-Xi8rHCmBmhbuyyhbI88391ZKP2dmfnOl4rT9ZfRI7mLTdk1wblIUnrIq35nqwEvC"
    crossorigin="anonymous"
  />
  <link rel="stylesheet" href="/lazerwave.css" />
</svelte:head>

<style>
  :global(.md *) {
    white-space: pre-wrap;
    line-break: strict;
    word-wrap: break-word;
  }

  :global(.md blockquote) {
    border-left: 5px solid var(--gray-300);
    margin: 0;
    padding: 0 20px; /* switcheroo */
    display: flex;
  }

  :global(.md p) {
    margin: 6px 0;
    line-height: 20px;
  }

  :global(.md br) {
    line-height: 0px;
  }

  :global(.md pre, pre[class*='language-'][class*='language-']) {
    width: calc(100% - 90px);
    background-color: var(--gray-200);
    padding: 20px;
    margin: 10px;
    border-radius: 10px;
  }

  :global(.md code, code[class*='language-'][class*='language-']) {
    width: 100%;
    background-color: var(--gray-200);
    font-size: 18px;
  }

  :global(.md pre code, pre code[class*='language-'][class*='language-']) {
    background-color: transparent;
  }

  :global(.md img) {
    max-width: calc(100% - 10px);
    border-radius: 5px;
  }
</style>
