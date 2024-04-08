/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable global-require */
/* eslint-disable class-methods-use-this */
/* eslint-disable @typescript-eslint/no-var-requires */
import type {
  CookieOptions,
  IMonoCloudCookieResponse,
} from '@monocloud/node-auth-core-sdk';

let isWarned = false;

export default class MonoCloudCookieResponse
  implements IMonoCloudCookieResponse
{
  setCookie(cookieName: string, value: string, options: CookieOptions): void {
    try {
      const { cookies } = require('next/headers');
      cookies().set(cookieName, value, options);
    } catch (e: any) {
      if (!isWarned) {
        console.warn(e.message);
        isWarned = true;
      }
    }
  }
}
