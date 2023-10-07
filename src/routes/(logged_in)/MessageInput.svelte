<script lang="ts">
  import { afterUpdate, onMount, tick } from 'svelte';
  import Markdown from '$lib/components/Markdown.svelte';
  import userData from '$lib/user_data';
  import { request } from '$lib/request';

  export let value = '';
  export let input: HTMLTextAreaElement;
  export let messagesUList: HTMLElement;
  export let usernames: { [key: string]: number };
  let mobile = false;
  let previewMessage = false;

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
      request('POST', 'messages', { content: value }).then((_) =>
        messagesUList.scroll(0, messagesUList.scrollHeight)
      );
    }
    value = '';
    previewMessage = false;
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
    request('POST', 'messages', {
      content: fileDatas
        .map((d) => `![${d.name}](${$userData?.instanceInfo.effis_url}${d.id})`)
        .join('\n')
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
        messagesUList.scrollHeight - messagesUList.offsetHeight - messagesUList.scrollTop <=
        10;
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
    if (e.key == 'Enter') {onSubmit();} 
  }
  
  const onInputKeyPress = (e: KeyboardEvent) => {
    if (
      e.key == 'Enter' &&
      !mobile &&
      !e.shiftKey &&
      value.substring(0, input.selectionStart).split('```').length % 2 == 1 &&
      value.substring(0, input.selectionStart).split('$$').length % 2 == 1 &&
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
  };

  const onWindowKeyDown = (e: KeyboardEvent) => {
    if ((!e.ctrlKey || e.key == 'v') && !e.altKey && !e.metaKey && !previewMessage) {
      input.focus();
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
</script>

<svelte:window on:keydown={onWindowKeyDown} />

<form id="message-input-form" on:submit|preventDefault={onSubmit}>
  {#if previewMessage}
    <span id="markdown-wrapper">
      <Markdown content={value}/>
    </span>
  {:else}
    <textarea
      bind:this={input}
      bind:value
      on:keypress={onInputKeyPress}
      on:keydown={onInputKeyDown}
      on:paste={onPaste}
      id="message-input"
      placeholder="Send a message to Eludris"
      autocomplete="off"
      spellcheck="true"
    />
  {/if}
  <button id="preview-button" class="input-button" on:click|preventDefault={togglePreviewMessage} on:keydown|preventDefault={previewButtonKeyDown}>
    <!--- https://icon-sets.iconify.design/mdi/eye/ --->
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M12 9a3 3 0 0 0-3 3a3 3 0 0 0 3 3a3 3 0 0 0 3-3a3 3 0 0 0-3-3m0 8a5 5 0 0 1-5-5a5 5 0 0 1 5-5a5 5 0 0 1 5 5a5 5 0 0 1-5 5m0-12.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5Z"/></svg>
  </button>
  <button id="send-button" class="input-button">
    <!--- https://icon-sets.iconify.design/mdi/send/ --->
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
      ><path fill="currentColor" d="m2 21l21-9L2 3v7l15 2l-15 2v7Z" /></svg
    >
  </button>
</form>




<style>

.input-button {
    background: none;
    color: inherit;
    border: none;
    cursor: pointer;
    margin: 3px 5px 3px 0;
    font-size: inherit;
    transition: color ease-in-out 125ms;
    cursor: pointer;
    height: 32px;
    padding-top: 6px;
  }

  .input-button:hover {
    color: var(--gray-500);
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
  }

  #markdown-wrapper {
    flex-grow: 1;
    overflow-y: auto;
    margin: 10px 0 3px 5px;
    max-height: 33vh;
    display: inline-block;
  }
</style>
