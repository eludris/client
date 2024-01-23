import type { User } from '../user';
import type { ClientMessage } from './message';

export interface State {
  connected: boolean;
  users: { [key: number]: User };
  messages: ClientMessage[];
}
