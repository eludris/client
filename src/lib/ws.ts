import { browser } from '$app/environment';
import { writable } from 'svelte/store';
import data from '$lib/data';
import type { Message } from '$lib/types/message';
import type { InstanceInfo } from '$lib/types/instance';
import { PayloadOP, type IncomingPayload } from '$lib/types/event';

const messages = writable<Array<Message>>([]);

let instanceUrl: string | null = null;
let ws: WebSocket | null = null;
let pingInterval: NodeJS.Timer | null = null;

if (browser) {
  data.subscribe(async (value) => {
    if (value) {
      if (value.instanceURL != instanceUrl) {
        instanceUrl = value.instanceURL;
        const res = await fetch(value.instanceURL);
        const info: InstanceInfo = await res.json();

        ws = new WebSocket(info.pandemonium_url);

        pingInterval = setInterval(() => ws?.send(JSON.stringify({ op: PayloadOP.PING })), 45_000);

        ws?.addEventListener('message', (msg: MessageEvent) => {
          const payload: IncomingPayload = JSON.parse(msg.data);

          if (payload.op == PayloadOP.MESSAGE_CREATE)
            messages.update((messages) => {
              messages.push(payload.d);
              return messages;
            });
        });
      }
    } else {
      instanceUrl = null;
      messages.set([]);
      ws?.close();
      if (pingInterval) clearInterval(pingInterval);
      ws = null;
    }
  });
}

export default messages;
