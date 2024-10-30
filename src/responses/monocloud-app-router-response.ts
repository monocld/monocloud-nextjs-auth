/* eslint-disable @typescript-eslint/no-explicit-any */
import type {
  CookieOptions,
  MonoCloudResponse,
} from '@monocloud/node-auth-core';
import { NextResponse } from 'next/server';

export default class MonoCloudAppRouterResponse implements MonoCloudResponse {
  constructor(public res: NextResponse) {}

  setCookie(
    cookieName: string,
    value: string,
    options: CookieOptions
  ): Promise<void> {
    this.res.cookies.set(cookieName, value, options);
    return Promise.resolve();
  }

  redirect(url: string, statusCode: number | undefined = 302): void {
    const { headers } = this.res;
    this.res = NextResponse.redirect(url, { status: statusCode, headers });
  }

  sendJson(data: any, statusCode?: number | undefined): void {
    const { headers } = this.res;
    this.res = NextResponse.json(data, { status: statusCode, headers });
  }

  notFound(): void {
    const { headers } = this.res;
    this.res = new NextResponse(null, { status: 404, headers });
  }

  internalServerError(): void {
    const { headers } = this.res;
    this.res = new NextResponse(null, { status: 500, headers });
  }

  noContent(): void {
    const { headers } = this.res;
    this.res = new NextResponse(null, { status: 204, headers });
  }

  methodNotAllowed(): void {
    const { headers } = this.res;
    this.res = new NextResponse(null, { status: 405, headers });
  }

  setNoCache(): void {
    this.res.headers.set('Cache-Control', 'no-cache no-store');
    this.res.headers.set('Pragma', 'no-cache');
  }

  done() {
    return this.res;
  }
}
