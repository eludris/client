import type { User } from "./user";

export interface Member {
  user: User;
  sphere_id: number;
  nickname?: string;
  server_avatar?: string;
};
