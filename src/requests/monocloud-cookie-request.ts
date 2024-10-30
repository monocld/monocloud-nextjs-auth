/* eslint-disable global-require */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable class-methods-use-this */
/* eslint-disable @typescript-eslint/no-var-requires */
import type { IMonoCloudCookieRequest } from '@monocloud/node-auth-core';

export default class MonoCloudCookieRequest implements IMonoCloudCookieRequest {
  /* c8 ignore start */
  async getCookie(name: string): Promise<string | undefined> {
    const { cookies } = require('next/headers');
    return (await cookies()).get(name)?.value;
  }
  /* c8 ignore stop */

  async getAllCookies(): Promise<Map<string, string>> {
    const values = new Map<string, string>();
    const { cookies } = require('next/headers');

    (await cookies()).getAll().forEach((x: any) => {
      values.set(x.name, x.value);
    });
    return values;
  }
}
