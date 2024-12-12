import type { Category } from '../category';
import type { Channel } from '../channel';
import type { Sphere } from '../sphere';
import type { User } from '../user';
import type { ClientMessage } from './message';

export interface State {
  connected: boolean;
  users: { [key: number]: User };
  spheres: { [key: number]: Sphere };
  categories: { [key: number]: Category };
  channels: { [key: number]: Channel };
  messages: { [key: number]: { messages: ClientMessage[], hasEveryMessage: boolean } };
}
