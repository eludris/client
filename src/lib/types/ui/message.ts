import type { Message } from '../message';

export interface ClientMessage extends Message {
  renderedContent: string;
  showAuthor: boolean;
  mentioned: boolean;
}
