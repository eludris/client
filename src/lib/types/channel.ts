import type { User } from "./user";

export enum SphereChannelType {
  // CATEGORY = "CATEGORY",
  TEXT = "TEXT",
  VOICE = "VOICE"
};

export enum NonSphereChannelType {
  GROUP = "GROUP",
  DIRECT = "DIRECT",
}

export type ChannelType = SphereChannelType | NonSphereChannelType;

interface SphereChannelBase {
  type: SphereChannelType;
  id: number;
  sphere_id: number;
  name: string;
  position: number;
}

// export interface Category extends SphereChannelBase {
//   type: SphereChannelType.CATEGORY;
// };

export interface TextChannel extends SphereChannelBase {
  type: SphereChannelType.TEXT;
  topic: number;
};

export interface VoiceChannel extends SphereChannelBase {
  type: SphereChannelType.VOICE;
};

export interface GroupChannel {
  type: NonSphereChannelType.GROUP;
  id: number;
  owner: User;
  name: string;
  members: User[];
  icon?: number;
  topic?: string;
};

export interface DirectMessageChannel {
  type: NonSphereChannelType.DIRECT;
  id: number;
  owner: User;
  recipient: User;
};

export type SphereChannel = TextChannel | VoiceChannel;  // | Category
export type Channel = SphereChannel | GroupChannel | DirectMessageChannel;
