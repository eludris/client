import type { SphereChannel } from './channel';
import type { Member } from './member';

export enum SphereType {
  CHAT = "CHAT",
  FORUM = "FORUM",
  HYBRID = "HYBRID",
}

export interface Sphere {
  id: number;
  owner_id: number;
  name?: string;
  slug: string;
  type: SphereType;
  description?: string;
  icon?: number;
  banner?: number;
  badges: number;
  channels: SphereChannel[];
  members: Member[];
};
