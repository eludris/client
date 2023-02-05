import type { InstanceInfo } from '../instance';

export interface UserData {
  name: string;
  instanceURL: string;
  instanceInfo?: InstanceInfo;
}
