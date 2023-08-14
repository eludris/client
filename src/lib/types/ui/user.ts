import type { InstanceInfo } from '../instance';
import type { SessionCreated } from '../session';
import type { User } from '../user';

export interface UserData {
  user: User;
  session: SessionCreated;
  instanceInfo: InstanceInfo;
};
