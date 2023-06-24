import type { UserData } from './types/ui/user';
import userData from './user_data';

let data: UserData | null;

userData.subscribe((d) => (data = d));

export interface RequestOptions {
  apiUrl?: string;
  token?: string;
}

export interface RequestErr {
  message: string;
  code: number;
  err?: Object;
}

export const request = async (
  method: string,
  route: string,
  body?: Object | null,
  options?: RequestOptions
): Promise<any> => {
  let url = options?.apiUrl ?? data?.instanceInfo.oprish_url;
  if (!url?.endsWith('/')) {
    url = url + '/';
  }
  let headers = new Headers();
  if (data || options?.token) {
    headers.append('Authorization', data?.session.token || options?.token || ''); // :/
  }
  const resp = await fetch(`${url}${route}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : null
  });
  if (resp.status >= 200 && resp.status < 300) {
    return await resp.json();
  }
  let err = await resp
    .json()
    .then((err) => {
      let msg: string | null = null;
      if (err.type == 'CONFLICT') {
        (msg = `Conflicting ${err.item}`), err;
      } else if (err.type == 'MISDIRECTED') {
        msg = err.info;
      } else if (err.type == 'VALIDATION') {
        msg = `Invalid ${err.value_name}: ${err.info}`;
      } else if (err.type == 'RATE_LIMITED') {
        msg = `Rate limited, try again after ${err.retry_after * 1000}s`;
      } else if (err.type == 'SERVER') {
        msg = `${err.status}: ${err.info}`;
      }
      return [msg ?? `${err.status}: ${err.message}`, err];
    })
    .catch((_) => {
      return ['Failed to make request', null];
    });
  throw { message: err[0], code: resp.status, err: err[1] } as RequestErr;
};
