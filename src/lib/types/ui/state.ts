import type { User } from '../user';
import type { PenginMessage } from './message';

export interface State {
  connected: boolean;
  users: { [key: number]: User };
  messages: PenginMessage[];
};
