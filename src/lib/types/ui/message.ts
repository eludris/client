import type { Message } from '../message';

export interface PenginMessage extends Message {
  renderedContent: string;
  showAuthor: boolean;
  mentioned: boolean;
};
