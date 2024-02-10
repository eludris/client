import type { User } from './user';

export interface Message {
  author: User;
  content: string;
  _disguise: MessageDisguise | undefined;
}

export interface MessageDisguise {
  name: string | undefined;
  avatar: string | undefined;
}
