import { unified, type Plugin } from 'unified';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import remarkMath from 'remark-math';
import remarkGFM from 'remark-gfm';
import rehypeKatex from 'rehype-katex';
import rehypePrism from 'rehype-prism';
import rehypeStringify from 'rehype-stringify';

import { visit } from 'unist-util-visit';
import data from '$lib/user_data';
import state from './ws';
import { get } from 'svelte/store';
import { emojiDictionary, toCodePoints } from './emoji'

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
      try {
        const url = new URL(node.url);
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

const rehypeExternalAnchors: Plugin = () => {
  return (tree) =>
    visit(tree, 'element', (node: { tagName: string; properties: { target: string } }) => {
      if (node.tagName == 'a') {
        node.properties.target = '_blank';
      }
    });
};

const unScrewHtml = (html: string): string => {
  html = html
    .trim()
    // I've spent so much time trying to fix this, thanks to revolt I finally managed to get it working
    .replace(/^(<\/?[a-zA-Z0-9]+>)(.*$)/gm, '\u200E$&')
    // "properly" render empty blockquotes
    .replace(/^> +$/gm, '> \u200E')
    // force whitespace for blockquotes
    .replace(/^([^\\]|)>([^>\s]|$)/gm, '\\$&')
    // better code-block escaping
    .replace(/\\```/gm, '\\`\\`\\`')
    // make empty block quote lines actually render
    .replace(/\\```/gm, '\\`\\`\\`')
    // make blockquotes only one line long
    .replace(/^>.*$/gm, '$&\n\n')
    // solve weird bug with whitespace getting magically removed sometimes
    .replace(/`( +[^`\s]+? +)`/gm, '` $1 `');

  // we have to reassign to get the updated string
  // ensure ``` s have a new line before and after them
  html = html.replace(/(\S+)```(\S+ ?)?/gm, (_, p1, p2, offset) => {
    p1 = p1 ?? '';
    p2 = p2 ?? '';
    offset = offset + p1.length;
    const codeFencesBefore = html.substring(0, offset).split('```').length - 1;
    const lastCodeFence = !html.substring(offset + 3).includes('```');
    if (codeFencesBefore % 2 == 1 && html[offset - 1] != '\n') {
      return `${p1}\n\`\`\`${p2 ? `\n${p2}` : ''}`;
    }
    if (codeFencesBefore % 2 == 0 && !lastCodeFence && html[offset + p2.length + 3] != '\n') {
      return `${p1 ? `${p1}\n` : ''}\`\`\`${p2}\n`;
    }
    return `\`\`\`${p2}`;
  });

  // number list supremacy
  html = html.replace(/^(\+ |\* )/gm, (match, _, offset) => {
    let preList = html.substring(0, offset);
    if (
      preList.split('```').length % 2 == 1 &&
      preList.replace(/```/gm, '').split('`').length % 2 == 1
    ) {
      return `\\${match}`;
    }
    return match;
  });

  // As per the markdown spec, having one newline does not result in a line break. having two
  // means that you get two seperate <p> elements. This makes adding newlines to your messages
  // really wack as you have to escape them. To fix this we escape them all pre-parsing.
  html = html.replace(/[^\\]\n+/gm, (match, offset) => {
    const preNewline = html.substring(0, offset);
    const currentLine = preNewline.substring(preNewline.lastIndexOf('\n')).trim();
    if (/^(?:>|#|- |\d+\. )/.test(currentLine)) return match;
    if (
      preNewline.split('```').length % 2 == 1 &&
      preNewline.replace(/```/gm, '').split('`').length % 2 == 1
    ) {
      return match.substring(0, 2) + match.substring(2).replace(/\n/g, '\\\n');
    }
    return match;
  });

  // add trailing line after lists to make them not merge
  html = html.replace(/^((?:\d+ |- ).+)(\n[^- ]|$)/g, '$1\n$2');

  // trailing ```s leading to an entire code block is...annoying
  if (html.includes('```')) {
    const lastCodeFence = html.lastIndexOf('```');
    const preCodeFence = html.substring(0, lastCodeFence);
    if (preCodeFence.split('```').length % 2 == 1) {
      html = preCodeFence + '\\`\\`\\`' + html.substring(lastCodeFence + 3);
    }
  }
  return html;
};

const renderer = unified()
  .use(remarkParse)
  .use(remarkMath)
  .use(remarkTextifyHtml)
  .use(remarkKillImages)
  .use(remarkGFM, {
    singleTilde: false
  })
  .use(remarkRehype)
  .use(rehypeStringify)
  .use(rehypeKatex, { trust: false, strict: false, output: 'html', throwOnError: false })
  .use(rehypeExternalAnchors)
  .use(rehypePrism);

export default async (content: string): Promise<string> => {
  return await renderer
    .process(unScrewHtml(content))
    .then((res) => res.toString())
    .then((res) =>
      res.replace(
        /\|\|(.+?)\|\|/gm,
        '<span class="spoiler" onclick="this.style.color = \'var(--color-text)\';this.style.cursor = \'unset\'">$1</span>'
      )
    ).then((res) =>
      // Prevents backslashes from rendering in newline markdown before tables/katex blocks etc.
      res.replace(
        /\n\\<\/p>\n<(table|div)/gm,
        '\n<br>\n</p>\n<$1'
      )
    ).then((res) => {
      return res.replace(/&#x3C;@(\d+)>/gm, (m, id, offset) => {
        let user = get(state).users[id];
        if (user && res.substring(0, offset).split(/<\\?code>/gm).length % 2 == 1) {
          return `<span class="mention">@${user.display_name ?? user.username}</span>`;
        }
        return m;
      });
    })
    .then((res) => {
      let big = !content.replace(/:[a-zA-Z0-9_-]+:/gm, '').trim() ? ' big' : '';
      if (big && content.split(':').length > 21) {
        big = '';
      }
      return res.replace(/:([a-zA-Z0-9_-]+):/gm, (m, emojiName, offset) => {
        let emoji = emojiDictionary[emojiName];
        if (emoji && res.substring(0, offset).split(/<\\?code>/gm).length % 2 == 1) {
          if (emoji.startsWith("http")) {
            return `<img src="${emoji}" class="emoji${big}" />`;
          } else {
            if (emoji.indexOf('\u200d') < 0) {
              emoji = emoji.replace(/\uFE0F/g, '');
            }
            return `<img class="emoji${big}" draggable="false" alt="${emoji}" src="https://cdnjs.cloudflare.com/ajax/libs/twemoji/14.0.2/svg/${toCodePoints(emoji)}.svg" title="${emoji}"/>`;
          }
        }
        return m;
      })
    });
};
