import type { InstanceInfo } from './instance';
import type { Message } from './message';
import type { Status, User } from './user';

export enum PayloadOP {
  PING = 'PING',
  AUTHENTICATE = 'AUTHENTICATE',
  PONG = 'PONG',
  HELLO = 'HELLO',
  RATE_LIMIT = 'RATE_LIMIT',
  AUTHENTICATED = 'AUTHENTICATED',
  USER_UPDATE = 'USER_UPDATE',
  PRESENCE_UPDATE = 'PRESENCE_UPDATE',
  MESSAGE_CREATE = 'MESSAGE_CREATE',
}

export interface PingPayload {
  op: PayloadOP.PING;
}

export interface AuthenticatePayload {
  op: PayloadOP.AUTHENTICATE,
}

export interface PongPayload {
  op: PayloadOP.PONG;
}

export interface RateLimitPayload {
  op: PayloadOP.RATE_LIMIT;
  d: {
    wait: number;
  }
}

export interface HelloPayload {
  op: PayloadOP.HELLO;
  d: {
    heartbeat_interval: number;
    instance_info: InstanceInfo;
    rate_limit: {
      reset_after: number;
      limit: number;
    }
  };
}

export interface AuthenticatedPayload {
  op: PayloadOP.AUTHENTICATED;
  d: {
    user: User;
    users: User[];
  }
}

export interface UserUpdatePayload {
  op: PayloadOP.USER_UPDATE;
  d: User;
}

export interface PresenceUpdatePayload {
  op: PayloadOP.PRESENCE_UPDATE;
  d: {
    user_id: number;
    status: Status;
  };
}

export interface MessageCreatePayload {
  op: PayloadOP.MESSAGE_CREATE;
  d: Message;
}

export type IncomingPayload = PongPayload | HelloPayload | RateLimitPayload | AuthenticatedPayload | UserUpdatePayload | PresenceUpdatePayload | MessageCreatePayload;
export type OutgoingPayload = PingPayload | AuthenticatePayload;
