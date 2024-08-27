/* eslint-disable @typescript-eslint/no-explicit-any */
import type {
  CookieOptions,
  MonoCloudResponse,
} from '@monocloud/node-auth-core';
import type { NextApiResponse } from 'next';
import { serialize } from 'cookie';

export default class MonoCloudPageRouterResponse implements MonoCloudResponse {
  constructor(public readonly res: NextApiResponse) {}

  setCookie(cookieName: string, value: string, options: CookieOptions): void {
    let cookies = this.res.getHeader('Set-Cookie') || [];

    /* c8 ignore start */
    if (!Array.isArray(cookies)) {
      cookies = [cookies as string];
    }
    /* c8 ignore stop */

    this.res.setHeader('Set-Cookie', [
      ...cookies.filter(cookie => !cookie.startsWith(`${cookieName}=`)),
      serialize(cookieName, value, options),
    ]);
  }

  redirect(url: string, statusCode?: number | undefined): void {
    this.res.redirect(statusCode || 302, url);
  }

  sendJson(data: any, statusCode?: number | undefined): void {
    /* c8 ignore start */
    this.res.status(statusCode ?? 200);
    /* c8 ignore stop */
    this.res.json(data);
  }

  notFound(): void {
    this.res.status(404);
  }

  internalServerError(): void {
    this.res.status(500);
  }

  noContent(): void {
    this.res.status(204);
  }

  methodNotAllowed(): void {
    this.res.status(405);
  }

  setNoCache(): void {
    this.res.setHeader('Cache-Control', 'no-cache no-store');
    this.res.setHeader('Pragma', 'no-cache');
  }

  done(): any {
    this.res.end();
  }
}
