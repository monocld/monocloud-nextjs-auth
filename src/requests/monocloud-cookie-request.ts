/* eslint-disable global-require */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable class-methods-use-this */
/* eslint-disable @typescript-eslint/no-var-requires */
import type { IMonoCloudCookieRequest } from '@monocloud/node-auth-core';

export default class MonoCloudCookieRequest implements IMonoCloudCookieRequest {
  /* c8 ignore start */
  getCookie(name: string): string | undefined {
    const { cookies } = require('next/headers');
    return cookies().get(name)?.value;
  }
  /* c8 ignore end */

  getAllCookies(): Map<string, string> {
    const values = new Map<string, string>();
    const { cookies } = require('next/headers');
    cookies()
      .getAll()
      .forEach((x: any) => {
        values.set(x.name, x.value);
      });
    return values;
  }
}
