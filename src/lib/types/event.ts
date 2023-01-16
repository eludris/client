import type { Message } from './message';

export enum PayloadOP {
  PING = 'PING',
  PONG = 'PONG',
  MESSAGE_CREATE = 'MESSAGE_CREATE'
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

export type IncomingPayload = PongPayload | MessageCreatePayload;
export type OutgoingPaylod = PingPayload;
