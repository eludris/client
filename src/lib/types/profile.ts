import type { StatusType } from './user';

export interface UpdateUserProfile {
  display_name?: string | null;
  status?: string | null;
  status_type?: StatusType;
  bio?: string | null;
  avatar?: number | null;
  banner?: number | null;
}
