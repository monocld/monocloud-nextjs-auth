/* eslint-disable @typescript-eslint/no-non-null-assertion */
import type { MonoCloudRequest } from '@monocloud/node-auth-core';
import type { NextApiRequest } from 'next';

export default class MonoCloudPageRouterRequest implements MonoCloudRequest {
  constructor(public readonly req: NextApiRequest) {}

  /* c8 ignore start */
  getRoute(parameter: string): string | string[] | undefined {
    return this.req.query[parameter];
  }
  /* c8 ignore stop */

  getQuery(parameter: string): string | string[] | undefined {
    return this.req.query[parameter];
  }

  getCookie(name: string): string | undefined {
    return this.req.cookies[name];
  }

  getRawRequest(): Promise<{
    method: string;
    url: string;
    body: Record<string, string> | string;
  }> {
    return Promise.resolve({
      method: this.req.method!,
      url: this.req.url!,
      body: this.req.body,
    });
  }

  getAllCookies(): Map<string, string> {
    const values = new Map<string, string>();
    const { cookies } = this.req;
    Object.keys(cookies).forEach(x => {
      const val = cookies[x];
      if (typeof x === 'string' && typeof val === 'string') {
        values.set(x, val);
      }
    });
    return values;
  }
}
