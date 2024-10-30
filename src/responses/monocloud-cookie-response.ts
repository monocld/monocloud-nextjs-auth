/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable global-require */
/* eslint-disable class-methods-use-this */
/* eslint-disable @typescript-eslint/no-var-requires */
import type {
  CookieOptions,
  IMonoCloudCookieResponse,
} from '@monocloud/node-auth-core';

let isWarned = false;

export default class MonoCloudCookieResponse
  implements IMonoCloudCookieResponse
{
  async setCookie(
    cookieName: string,
    value: string,
    options: CookieOptions
  ): Promise<void> {
    try {
      const { cookies } = require('next/headers');
      (await cookies()).set(cookieName, value, options);
    } catch (e: any) {
      if (!isWarned) {
        console.warn(e.message);
        isWarned = true;
      }
    }
  }
}
