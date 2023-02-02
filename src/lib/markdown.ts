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
import data from '$lib/user_data';

let effisHost: string | undefined = undefined;

data.subscribe((value) => {
  if (value?.instanceInfo?.effis_url) {
    try {
      const url = new URL(value.instanceInfo.effis_url);
      effisHost = url.hostname;
    } catch {
      console.warn('Invalid instance Effis url');
    }
  }
});

const remarkTextifyHtml: Plugin = () => {
  return (tree) =>
    visit(tree, 'html', (node: { type: string }) => {
      node.type = 'text';
    });
};

const remarkKillImages: Plugin = () => {
  return (tree) =>
    visit(tree, 'image', (node: { type: string; alt: string; value: string; url: string }) => {
      console.log(node);
      try {
        const url = new URL(node.url);
        console.log(url.hostname, effisHost);
        if (url.hostname != effisHost) {
          node.type = 'text';
          node.value = node.alt;
        }
      } catch {
        node.type = 'text';
        node.value = node.alt;
      }
    });
};

const remarkExternalAnchors: Plugin = () => {
  return (tree) =>
    visit(tree, 'element', (node: { tagName: string; properties: { target: string } }) => {
      if (node.tagName == 'a') {
        node.properties.target = '_blank';
      }
    });
};

const unScrewHtml = (
  html: string
): string => // I've spent so much time trying to fix this, thanks to revolt I finally managed to get it working
  html
    .replace(/^(<\/?[a-zA-Z0-9]+>)(.*$)/gm, '\u200E$&')
    // force whitespace for blockquotes
    .replace(/^([^\\]|)>[^>\s]/gm, '\\$&')
    // number list supremacy
    .replace(/^(\+|-|\* )/gm, '\\$&')
    // let the newlines live
    .replace(/^\s*$/gm, '\u200E')
    // make blockquotes only one line long
    .replace(/^>.*$/gm, '$&\n\n')
    // ensure ``` s have a new line before them
    .replace(new RegExp('(.)```', 'gm'), '$1\n```')
    // ... and after them
    .replace(new RegExp('``` (.)', 'gm'), '```\n$1');

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
  .use(remarkExternalAnchors)
  .use(rehypePrism);

export default async (content: string): Promise<string> => {
  return await renderer.process(unScrewHtml(content)).then((res) => res.toString());
};
