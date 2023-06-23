import { browser } from '$app/environment';
import { writable } from 'svelte/store';
import data from '$lib/user_data';
import config from '$lib/user_config';
import { PayloadOP, type IncomingPayload } from '$lib/types/event';
import markdown from '$lib/markdown';
import type { PenginMessage } from './types/ui/message';
import type { UserData } from './types/ui/user';

const messages = writable<Array<PenginMessage> | null>(null);

let ws: WebSocket | null = null;
let pingInterval: NodeJS.Timer | null = null;
let lastAuthor: number | null = null;
let notification: Notification;
let notification_opt: number;
let oldMessages: Array<PenginMessage> | null = null;

const retryConnect = (wait = 3_000) => {
  messages.subscribe((messages) => {
    if (messages) oldMessages = messages;
  })();
  messages.set(null);
  setTimeout(() => {
    data.subscribe((userData) => {
      if (userData) connect(userData);
    })();
  }, wait);
};

const connect = async (userData: UserData) => {
  ws?.close();
  if (pingInterval) clearInterval(pingInterval);

  const innerWs = new WebSocket(userData.instanceInfo.pandemonium_url);

  innerWs.addEventListener('open', () => {

    innerWs?.addEventListener('message', (msg: MessageEvent) => {
      const payload: IncomingPayload = JSON.parse(msg.data);

      if (payload.op == PayloadOP.HELLO) {
        setTimeout(
          () => {
            ws?.send(JSON.stringify({ op: PayloadOP.PING }));
            pingInterval = setInterval(() => ws?.send(JSON.stringify({ op: PayloadOP.PING })), payload.d.heartbeat_interval);
          },
          payload.d.heartbeat_interval * Math.random()
        );
        ws = innerWs;
        ws?.send(JSON.stringify({ op: PayloadOP.AUTHENTICATE, d: userData.session.token }));
      } else if (payload.op == PayloadOP.AUTHENTICATED) {
        messages.set(oldMessages ?? []);
        ws = innerWs;
      } else if (payload.op == PayloadOP.MESSAGE_CREATE)
        markdown(payload.d.content).then((content) => {
          const message = {
            renderedContent: content,
            showAuthor: payload.d.author.id != lastAuthor,
            mentioned: content.toLowerCase().split(`<@${userData.user.id}>`).length > 1,
            ...payload.d
          };
          if (
            'Notification' in window &&
            Notification.permission == 'granted' &&
            message.author.id != userData.user.id &&
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
          lastAuthor = payload.d.author.id;
          messages.update((messages) => {
            messages?.push(message);
            return messages;
          });
        });
    });

    innerWs?.addEventListener('close', () => {
      console.warn('WebSocket connection closed, reconnecting');
      retryConnect();
    });
  });

  innerWs.addEventListener('error', () => {
    console.error('Encountered an error while connecting to WebSocket');
    retryConnect();
  });
};

if (browser) {
  data.subscribe(async (userData) => {
    // You have to log out to change the instance's url.
    if (userData) {
      await connect(userData);
    } else {
      messages.set(null);
      oldMessages = null;
      ws?.close();
      if (pingInterval) clearInterval(pingInterval);
      ws = null;
    }
  });

  config.subscribe((conf) => {
    if (!conf.notifications) {
      conf.notifications = 2;
    }
    notification_opt = conf.notifications;
  });

  document.addEventListener('focus', () => {
    notification?.close();
  });
}

export default messages;
