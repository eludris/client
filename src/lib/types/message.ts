import type { SphereChannel } from './channel';
import type { User } from './user';

export interface Message {
  id: number;
  author: User;
  content?: string;
  reference?: Message;
  channel: SphereChannel;
  _disguise: MessageDisguise | undefined;
}

export interface MessageDisguise {
  name: string | undefined;
  avatar: string | undefined;
}
