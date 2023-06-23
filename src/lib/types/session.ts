export interface Session {
  id: number;
  user_id: number;
  platform: string;
  client: string;
  ip: string;
};

export interface SessionCreated {
  token: string;
  session: Session;
};
