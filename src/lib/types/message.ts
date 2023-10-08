import type { User } from './user';

export interface Message {
  author: User;
  content: string;
}
