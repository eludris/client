export enum StatusType {
  ONLINE = "ONLINE",
  OFFLINE = "OFFLINE",
  IDLE = "IDLE",
  BUSY = "BUSY",
};

export interface Status {
  type: StatusType;
  text?: string;
};

export interface User {
  id: number;
  username: string;
  display_name?: string;
  social_credit: number;
  status: Status;
  bio?: string;
  avatar?: number;
  banner?: number;
  badges: number;
  permissions: number;
  email?: string;
  verified?: boolean;
};
