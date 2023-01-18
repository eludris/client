<script lang="ts" context="module">
  import { unified, type Plugin } from 'unified';
  import remarkParse from 'remark-parse';
  import remarkRehype from 'remark-rehype';
  import remarkBreaks from 'remark-breaks';
  import remarkMath from 'remark-math';
  import remarkGFM from 'remark-gfm';
  import rehypeKatex from 'rehype-katex';
  import rehypePrism from 'rehype-prism';
  import rehypeStringify from 'rehype-stringify';

  import { visit } from 'unist-util-visit';

  const remarkTextifyHtml: Plugin = () => {
    return (tree) =>
      visit(tree, 'html', (node: { type: string }) => {
        node.type = 'text';
      });
  };

  const remarkKillImages: Plugin = () => {
    return (tree) =>
      visit(tree, 'image', (node: { type: string; alt: string; value: string }) => {
        node.type = 'text';
        node.value = node.alt;
      });
  };

  const unScrewHtml = (
    html: string
  ): string => // I've spent so much time trying to fix this, thanks to revolt I finally managed to get it working
    html.replace(/^(<\/?[a-zA-Z0-9]+>)(.*$)/gm, (match) => `\u200E${match}`);

  const renderer = unified()
    .use(remarkParse)
    .use(remarkBreaks)
    .use(remarkMath)
    .use(remarkTextifyHtml)
    .use(remarkKillImages)
    .use(remarkGFM, {
      singleTilde: false
    })
    .use(remarkRehype)
    .use(rehypeStringify)
    .use(rehypeKatex, { trust: false, strict: false, output: 'html', throwOnError: false })
    .use(rehypePrism);
</script>

<script lang="ts">
  import Prism from 'prismjs';
  import 'prismjs/components/prism-rust.js';
  import 'prismjs/components/prism-python.js';
  import 'prismjs/components/prism-typescript.js';
  import 'prismjs/components/prism-nasm.js';
  import 'prismjs/components/prism-go.js';

  Prism.languages['rs'] = Prism.languages['rust']; // alias

  export let content: string;
</script>

{#await renderer.process(unScrewHtml(content))}
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

<svelte:head>
  <link
    rel="stylesheet"
    href="https://cdn.jsdelivr.net/npm/katex@0.16.0/dist/katex.min.css"
    integrity="sha384-Xi8rHCmBmhbuyyhbI88391ZKP2dmfnOl4rT9ZfRI7mLTdk1wblIUnrIq35nqwEvC"
    crossorigin="anonymous"
  />
  <link rel="stylesheet" href="lazerwave.css" />
</svelte:head>

<style>
  .md {
    white-space: pre;
  }

  :global(.md blockquote) {
    border-left: 5px solid var(--gray-300);
    margin: 0;
    padding: 2px 20px; /* switcheroo */
  }

  :global(.md p) {
    margin: 0;
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
</style>
