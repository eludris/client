<script lang="ts">
  import { afterUpdate, onMount, tick } from 'svelte';
  import Markdown from '$lib/components/Markdown.svelte';
  import userData from '$lib/user_data';
  import userConfig from '$lib/user_config';
  import { request } from '$lib/request';
  import { emojiDictionary, toUrl, EMOJI_REGEX } from '$lib/emoji';

  export let channel_id: number;
  export let value = '';
  export let input: HTMLTextAreaElement;
  export let messagesUList: HTMLElement;
  export let usernames: { [key: string]: number };
  let mobile = false;
  let previewMessage = false;

  let emojiPreview: HTMLDivElement;
  let currentEmoji: HTMLButtonElement | undefined;
  let currentEmojiIndex: number | undefined;
  let emojiMatch: string = '';
  let suggestedEmoji: { name: string; display: string }[] = new Array();
  const maxEmoji = 10;

  const getMatchingEmoji = async (searchString: string) => {
    let matches = searchString.match(/:([a-zA-Z0-9_-]{2,})$/);

    if (matches) {
      if (emojiMatch != matches[1]) {
        suggestedEmoji.length = 0;

        emojiMatch = matches[1];
        let emojiRegex = new RegExp(`^${emojiMatch}`, 'i');

        for (let i = 0; i < ($userConfig.recentEmojis?.length ?? 0); i++) {
          let emoji = $userConfig.recentEmojis![i];
          if (emojiRegex.test(emoji)) {
            suggestedEmoji.push({ name: emoji, display: toUrl(emoji) });
          }
        }
        for (let emojiName of Object.keys(emojiDictionary)) {
          if (suggestedEmoji.find((e) => e.name == emojiName)) continue;
          if (suggestedEmoji.length >= maxEmoji) break;
          if (emojiRegex.test(emojiName)) {
            suggestedEmoji.push({ name: emojiName, display: toUrl(emojiName) });
          }
        }

        await tick();
        currentEmoji = emojiPreview?.firstElementChild! as HTMLButtonElement;
        currentEmojiIndex = 0;
      }
    } else {
      suggestedEmoji.length = 0;
      emojiMatch = '';
      currentEmoji = undefined;
    }
  };

  const onSubmit = async () => {
    if (value.trim()) {
      let headers = new Headers();
      headers.set('Authorization', $userData!.session.token);
      if (value.startsWith('/shrug')) value = value.substring(7) + ' ¯\\\\\\_(ツ)_/¯';
      value = value.replace(/@([a-z0-9_-]+)/gm, (m, username) => {
        let id = usernames[username];
        if (id != undefined) {
          return `<@${id}>`;
        } else {
          return m;
        }
      });
      request('POST', `/channels/${channel_id}/messages`, { content: value }).then((_) =>
        messagesUList.scroll(0, messagesUList.scrollHeight)
      );
    }
    let usedEmojis = value.match(EMOJI_REGEX)?.map((m) => m.slice(1, -1)) ?? [];
    if ($userConfig.recentEmojis) {
      for (let i = 0; i < usedEmojis.length; i++) {
        let emoji = usedEmojis[i];
        $userConfig.recentEmojis = $userConfig.recentEmojis.filter((e) => e != emoji);
        $userConfig.recentEmojis.unshift(emoji);
        $userConfig.recentEmojis = $userConfig.recentEmojis;
      }
    } else {
      $userConfig.recentEmojis = usedEmojis;
    }
    value = '';
    previewMessage = false;
    currentEmoji = undefined;
    await tick();
    input?.focus(); // for mobiles
  };

  const submitFiles = async (files: DataTransferItemList) => {
    let fileDatas = [];
    for (let i = 0; i < files.length; i++) {
      if (files[i].kind == 'file') {
        const file = files[i].getAsFile()!;
        let formData = new FormData();
        formData.append('file', file, file.name);
        const data = await fetch($userData?.instanceInfo.effis_url!, {
          body: formData,
          method: 'POST'
        }).then((r) => r.json());
        fileDatas.push(data);
      }
    }
    let effisUrl = $userData?.instanceInfo.effis_url;
    if (!effisUrl?.endsWith('/')) {
      effisUrl += '/';
    }
    request('POST', `/channels/${channel_id}/messages`, {
      content: fileDatas.map((d) => `![${d.name}](${effisUrl}${d.id})`).join('\n')
    }).then((_) => messagesUList.scroll(0, messagesUList.scrollHeight));
    await tick();
    input?.focus(); // for mobiles
  };

  onMount(() => {
    if (
      /(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(
        navigator.userAgent
      ) ||
      /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw-(n|u)|c55\/|capi|ccwa|cdm-|cell|chtm|cldc|cmd-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc-s|devi|dica|dmob|do(c|p)o|ds(12|-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(-|_)|g1 u|g560|gene|gf-5|g-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd-(m|p|t)|hei-|hi(pt|ta)|hp( i|ip)|hs-c|ht(c(-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i-(20|go|ma)|i230|iac( |-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|-[a-w])|libw|lynx|m1-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|-([1-8]|c))|phil|pire|pl(ay|uc)|pn-2|po(ck|rt|se)|prox|psio|pt-g|qa-a|qc(07|12|21|32|60|-[2-7]|i-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h-|oo|p-)|sdk\/|se(c(-|0|1)|47|mc|nd|ri)|sgh-|shar|sie(-|m)|sk-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h-|v-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl-|tdg-|tel(i|m)|tim-|t-mo|to(pl|sh)|ts(70|m-|m3|m5)|tx-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas-|your|zeto|zte-/i.test(
        navigator.userAgent.substring(0, 4)
      )
    ) {
      mobile = true;
    }
  });

  afterUpdate(() => {
    if (messagesUList && !previewMessage) {
      let scroll =
        messagesUList.scrollHeight - messagesUList.offsetHeight - messagesUList.scrollTop <= 10;
      input.style.height = '1px'; // we do this to avoid it getting incrementally bigger with every press
      input.style.height = `${Math.min(
        Math.max(26, input.scrollHeight),
        window.innerHeight / 3
      )}px`;
      if (scroll) messagesUList.scroll(0, messagesUList.scrollHeight);
    }
  });

  const togglePreviewMessage = () => {
    previewMessage = !previewMessage;
  };

  const previewButtonKeyDown = (e: KeyboardEvent) => {
    if (e.key == 'Enter') {
      onSubmit();
    }
  };

  const onInputKeyPress = (e: KeyboardEvent) => {
    const preSelection = value.substring(0, input.selectionStart);

    if (
      e.key == 'Enter' &&
      !mobile &&
      !e.shiftKey &&
      (preSelection.split(/\n```\S?/gm).length + +preSelection.startsWith('```')) % 2 == 1 &&
      preSelection.split('$$').length % 2 == 1 &&
      value.trim().length > 0
    ) {
      onSubmit();
      e.preventDefault();
    }
  };

  const onInputKeyDown = async (e: KeyboardEvent) => {
    if (e.key == 'Tab' && value.substring(0, input.selectionStart).split('```').length % 2 == 0) {
      e.preventDefault();
      const start = input.selectionStart;
      const end = input.selectionEnd;

      value = value.substring(0, start) + '\t' + value.substring(end);
      await tick();
      input.selectionStart = input.selectionEnd = start + 1;
    }
    if ((e.key == 'ArrowDown' || e.key == 'ArrowUp') && currentEmoji) {
      e.preventDefault();
    }
  };

  const onWindowKeyDown = async (e: KeyboardEvent) => {
    if (e.key == 'p' && e.ctrlKey) {
      togglePreviewMessage();
      e.preventDefault();
      await tick();
      input?.focus();
    }
    if ((!e.ctrlKey || e.key == 'v') && !e.altKey && !e.metaKey) {
      if (e.key == 'Enter' && previewMessage) {
        onSubmit();
        e.preventDefault();
      }
      await tick();
      input?.focus();
    }
    if ((e.key == 'Tab' || e.key == 'Enter') && currentEmoji) {
      e.preventDefault();
      currentEmoji.click();
      await tick();
      input?.focus();
    }
    if (e.key == 'ArrowDown' && currentEmoji) {
      if (currentEmoji.nextElementSibling) {
        currentEmojiIndex!++;
        currentEmoji = currentEmoji.nextElementSibling as HTMLButtonElement;
      } else {
        currentEmojiIndex = 0;
        currentEmoji = emojiPreview.firstElementChild as HTMLButtonElement;
      }
    }
    if (e.key == 'ArrowUp' && currentEmoji) {
      if (currentEmoji.previousElementSibling) {
        currentEmojiIndex!--;
        currentEmoji = currentEmoji.previousElementSibling as HTMLButtonElement;
      } else {
        currentEmojiIndex = suggestedEmoji.length - 1;
        currentEmoji = emojiPreview.lastElementChild as HTMLButtonElement;
      }
    }
  };

  const onPaste = (e: ClipboardEvent) => {
    if (e.clipboardData?.items.length) {
      for (let i = 0; i < e.clipboardData.items.length; i++) {
        if (e.clipboardData.items[i].kind == 'file') {
          submitFiles(e.clipboardData.items);
          e.preventDefault();
          break;
        }
      }
    }
  };

  const onSelectionChange = async () => {
    await getMatchingEmoji(value.slice(0, input.selectionStart));
  };

  const autocompleteEmoji = async (emojiName: string) => {
    let cursorPos = input.selectionStart;

    let emojiPart = value.slice(0, cursorPos).replace(/(?<=\:)[a-zA-Z0-9_-]{2,}$/, `${emojiName}:`);
    let remainder = value.slice(cursorPos);
    if (remainder && !/^\s+/.test(remainder)) {
      value = emojiPart + ' ' + remainder;
    } else {
      value = emojiPart + remainder;
    }

    currentEmoji = undefined;
    suggestedEmoji.length = 0;
    emojiMatch = '';
    await tick();
    input.selectionStart = input.selectionEnd = emojiPart.length;
    input?.focus();
  };

  const previewEntryHover = (i: number) => {
    currentEmoji?.classList.remove('highlight');
    currentEmoji = emojiPreview.children[i] as HTMLButtonElement;
    currentEmoji.classList.add('highlight');
    currentEmojiIndex = i;
  };
</script>

<svelte:window on:keydown={onWindowKeyDown} />

<form id="message-input-form" on:submit|preventDefault={onSubmit}>
  {#if previewMessage}
    <span id="markdown-wrapper">
      <Markdown content={value} />
    </span>
  {:else}
    <textarea
      bind:this={input}
      bind:value
      on:keypress={onInputKeyPress}
      on:keydown={onInputKeyDown}
      on:paste={onPaste}
      on:selectionchange={onSelectionChange}
      id="message-input"
      placeholder="Send a message to Eludris"
      autocomplete="off"
      spellcheck="true"
    />
  {/if}
  <button
    id="preview-button"
    class="input-button"
    class:toggled={previewMessage}
    on:click|preventDefault={togglePreviewMessage}
    on:keydown|preventDefault={previewButtonKeyDown}
  >
    <!--- https://icon-sets.iconify.design/mdi/eye/ --->
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
      ><path
        fill="currentColor"
        d="M12 9a3 3 0 0 0-3 3a3 3 0 0 0 3 3a3 3 0 0 0 3-3a3 3 0 0 0-3-3m0 8a5 5 0 0 1-5-5a5 5 0 0 1 5-5a5 5 0 0 1 5 5a5 5 0 0 1-5 5m0-12.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5Z"
      /></svg
    >
  </button>
  <button id="send-button" class="input-button">
    <!--- https://icon-sets.iconify.design/mdi/send/ --->
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
      ><path fill="currentColor" d="m2 21l21-9L2 3v7l15 2l-15 2v7Z" /></svg
    >
  </button>
  {#if suggestedEmoji.length > 0}
    <div id="emoji-preview" bind:this={emojiPreview}>
      {#each suggestedEmoji as emoji, i}
        <button
          class={`${currentEmojiIndex == i ? 'highlight' : ''}`}
          id="emoji-preview-entry"
          type="button"
          on:click={() => autocompleteEmoji(emoji.name)}
          on:mouseenter={() => previewEntryHover(i)}
        >
          <img id="emoji-preview-display" src={emoji.display} alt={emoji.name} />
          <div id="emoji-preview-name">{emoji.name}</div>
          <div id="emoji-preview-spacer" />
          <div id="emoji-preview-sphere" />
        </button>
      {/each}
    </div>
  {/if}
</form>

<style>
  .input-button {
    background: none;
    color: inherit;
    border: none;
    margin: 3px 5px 3px 0;
    font-size: inherit;
    transition: color ease-in-out 125ms;
    height: 32px;
    padding-top: 6px;
  }

  .input-button:hover {
    color: var(--gray-500);
  }

  #preview-button.toggled {
    color: var(--pink-400);
  }

  #preview-button.toggled:hover {
    color: var(--pink-600);
  }

  #message-input {
    flex-grow: 1;
    background: none;
    color: inherit;
    font-size: inherit;
    border: none;
    height: 26px;
    overflow-y: auto;
    margin: 10px 0 3px 5px;
    overflow-wrap: break-word;
    word-break: break-word;
    white-space: pre-wrap;
    user-select: text;
    outline: none;
    resize: none;
    font-family: inherit;
  }

  #message-input-form {
    width: calc(100% - 10px);
    display: flex;
    background-color: var(--gray-200);
    color: var(--gray-600);
    padding: 2px;
    margin: 0 5px 10px 5px;
    font-size: 18px;
    height: auto;
    border-radius: 10px;
    position: relative;
  }

  #markdown-wrapper {
    flex-grow: 1;
    overflow-y: auto;
    margin: 10px 0 3px 5px;
    max-height: 33vh;
    display: inline-block;
  }

  #emoji-preview {
    position: absolute;
    display: flex;
    flex-direction: column;
    position: absolute;
    bottom: 100%;
    left: 0px;
    display: flex;
    align-items: center;
    justify-content: center;
    max-height: 800px;
    width: 100%;
    background-color: var(--gray-200);
    border-radius: 10px;
    margin-bottom: 10px;
    padding: 10px;
    box-sizing: border-box;
  }

  #emoji-preview-entry {
    color: var(--gray-600);
    display: flex;
    flex-direction: row;
    height: 30px;
    width: 100%;
    background: none;
    border: none;
  }

  #emoji-preview-entry.highlight,
  #emoji-preview-entry.highlight {
    background-color: var(--purple-400);
    border-radius: 5px;
  }

  #emoji-preview-display {
    display: flex;
    flex-direction: row;
    width: 30px;
    object-fit: contain;
    padding-right: 1em;
  }

  #emoji-preview-name {
    display: flex;
    align-items: center;
    font-size: 14px;
  }

  #emoji-preview-spacer {
    flex-grow: 1;
    width: 100%;
  }
</style>
