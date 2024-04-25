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
        // @ts-expect-error: this is untyped :(
        import('prismjs/components/prism-bash.js');
        Prism.languages['rs'] = Prism.languages['rust'];
        Prism.languages['bash'] = Prism.languages['sh'];
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

<style>
  :global(.md *) {
    white-space: pre-wrap;
    line-break: strict;
    word-wrap: break-word;
  }

  :global(.md blockquote) {
    display: inline-block;
    border-left: 5px solid var(--gray-300);
    margin: 0;
    padding: 0 20px; /* switcheroo */
    display: flex;
  }

  :global(.md p) {
    margin: 0;
    line-height: 20px;
  }

  :global(.md br) {
    display: block;
    height: 0;
  }

  :global(.md pre, pre[class*='language-'][class*='language-']) {
    display: block;
    width: 80%;
    background-color: var(--gray-200);
    padding: 20px;
    margin: 10px;
    border-radius: 10px;
    overflow-y: auto;
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
    max-width: 30%;
    max-height: 80vw;
    border-radius: 5px;
  }

  :global(.md:has(.math)) {
    overflow-x: auto;
  }

  :global(.md .math *) {
    white-space: nowrap;
    line-break: unset;
    word-wrap: unset;
  }

  :global(.md table) {
    border-spacing: 0;
  }

  :global(.md td, .md th) {
    border: 1px solid var(--gray-300);
    padding: 10px;
  }

  :global(.md th) {
    border-top-width: 2px;
    background-color: var(--gray-200);
  }

  :global(.md th:first-of-type) {
    border-top-left-radius: 5px;
    border-left-width: 2px;
  }

  :global(.md th:last-of-type) {
    border-top-right-radius: 5px;
    border-right-width: 2px;
  }

  :global(.md tr:last-of-type td) {
    border-bottom-width: 2px;
  }

  :global(.md tr td:first-of-type) {
    border-left-width: 2px;
  }

  :global(.md tr td:last-of-type) {
    border-right-width: 2px;
  }

  :global(.md tr:last-of-type td:first-of-type) {
    border-bottom-left-radius: 5px;
  }

  :global(.md tr:last-of-type td:last-of-type) {
    border-bottom-right-radius: 5px;
  }

  :global(.md ul) {
    display: inline-block;
    padding: 0 20px;
  }

  :global(.md li) {
    white-space: initial;
  }

  :global(.md .spoiler) {
    display: inline;
    background-color: var(--purple-100);
    color: transparent;
    cursor: pointer;
    padding: 2px;
  }

  :global(.md .spoiler img) {
    filter: blur(10px);
  }

  :global(.md .spoiler.unspoilered) {
    color: inherit;
    cursor: default;
  }

  :global(.md .spoiler.unspoilered img) {
    filter: none;
  }

  :global(.md .mention) {
    display: inline-block;
    background-color: color-mix(in srgb, var(--pink-400) 50%, transparent);
    padding: 2px 5px;
    border-radius: 5px;
  }

  :global(.md .emoji) {
    height: 22px;
    aspect-ratio: 1;
    object-fit: contain;
    vertical-align: bottom;
  }

  :global(.md .emoji.big) {
    height: 100px;
  }

  @media only screen and (max-width: 1000px) {
    :global(.md img) {
      max-width: 100%;
    }
  }
</style>
