import type { InstanceInfo } from './instance';
import type { Message } from './message';

export enum PayloadOP {
  PING = 'PING',
  PONG = 'PONG',
  MESSAGE_CREATE = 'MESSAGE_CREATE',
  HELLO = 'HELLO',
  RATE_LIMIT = 'RATE_LIMIT',
}

export interface PingPayload {
  op: PayloadOP.PING;
}

export interface PongPayload {
  op: PayloadOP.PONG;
}

export interface MessageCreatePayload {
  op: PayloadOP.MESSAGE_CREATE;
  d: Message;
}

export interface HelloPayload {
  op: PayloadOP.HELLO;
  d: {
    heartbeat_interval: number;
    instance_info: InstanceInfo;
    pandemonium_info: {
      url: string;
      rate_limit: {
        reset_after: number;
        limit: number;
      }
    }
  };
}

export interface RateLimitPayload {
  op: PayloadOP.RATE_LIMIT;
  d: { wait: number };
}

export type IncomingPayload = PongPayload | MessageCreatePayload | HelloPayload | RateLimitPayload;
export type OutgoingPayload = PingPayload;
