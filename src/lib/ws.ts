import { browser } from '$app/environment';
import { writable } from 'svelte/store';
import data from '$lib/user_data';
import config from '$lib/user_config';
import type { InstanceInfo } from '$lib/types/instance';
import { PayloadOP, type IncomingPayload } from '$lib/types/event';
import markdown from '$lib/markdown';
import type { PenginMessage } from './types/ui/message';

const messages = writable<Array<PenginMessage> | null>(null);

let instanceUrl: string | null = null;
let ws: WebSocket | null = null;
let pingInterval: NodeJS.Timer | null = null;
let lastAuthor: string | null = null;
let notification: Notification;
let notification_opt: number;

const retryConnect = (wait = 1_000) => {
  messages.set(null);
  lastAuthor = null;
  instanceUrl = null;
  setTimeout(() => data.update((d) => d), wait);
};

if (browser) {
  data.subscribe(async (value) => {
    if (value) {
      if (value.instanceURL != instanceUrl) {
        instanceUrl = value.instanceURL;
        messages.set(null);
        ws?.close();
        if (pingInterval) clearInterval(pingInterval);
        const res = await fetch(value.instanceURL);
        const info: InstanceInfo = await res.json();

        if (!info.pandemonium_url) {
          return retryConnect(5_000);
        }

        data.update((d) => {
          if (d) d.instanceInfo = info;
          return d;
        });

        ws = new WebSocket(info.pandemonium_url);

        ws.addEventListener('open', () => {
          pingInterval = setInterval(
            () => ws?.send(JSON.stringify({ op: PayloadOP.PING })),
            45_000
          );
          messages.set([]);

          ws?.addEventListener('message', (msg: MessageEvent) => {
            const payload: IncomingPayload = JSON.parse(msg.data);

            if (payload.op == PayloadOP.MESSAGE_CREATE)
              markdown(payload.d.content).then((content) => {
                const message = {
                  renderedContent: content,
                  showAuthor: payload.d.author != lastAuthor,
                  mentioned: content.split(`@${value.name}`).length > 1,
                  ...payload.d
                };
                if (
                  'Notification' in window &&
                  Notification.permission == 'granted' &&
                  message.author != value.name &&
                  !document.hasFocus() &&
                  notification_opt > 0
                ) {
                  if (notification_opt >= 3 || message.mentioned)
                    notification = new Notification(
                      message.mentioned
                        ? `New mention from ${message.author}`
                        : `New message from ${message.author}`,
                      {
                        body: message.content,
                        icon: '/das_ding.png',
                        renotify: true,
                        tag: 'NewMessage'
                      }
                    );
                }
                lastAuthor = payload.d.author;
                messages.update((messages) => {
                  messages?.push(message);
                  return messages;
                });
              });
          });
        });

        ws.addEventListener('error', (e) => {
          console.error(e);
          retryConnect();
        });

        ws.addEventListener('close', () => {
          console.warn('WebSocket connection closed, reconnecting');
          retryConnect();
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

  config.subscribe((conf) => {
    notification_opt = conf.notifications ?? 0;
  });

  document.addEventListener('focus', () => {
    notification?.close();
  });
}

export default messages;
