import type { User } from './user';

export interface Message {
  author: User;
  content: string;
  _disguise?: {
    name: string | null;
    avatar: string | null;
  };
}
