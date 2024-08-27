import type { MonoCloudRequest } from '@monocloud/node-auth-core';
import type { NextRequest } from 'next/server';
import { AppRouterContext } from '../types';

export default class MonoCloudAppRouterRequest implements MonoCloudRequest {
  constructor(
    public readonly req: NextRequest,
    public readonly ctx: AppRouterContext
  ) {}

  /* c8 ignore start */
  getRoute(parameter: string): string | string[] | undefined {
    return this.ctx.params?.[parameter];
  }
  /* c8 ignore stop */

  getQuery(parameter: string): string | string[] | undefined {
    const url = new URL(this.req.url);
    return url.searchParams.get(parameter) ?? undefined;
  }

  getCookie(name: string): string | undefined {
    return this.req.cookies.get(name)?.value;
  }

  async getRawRequest(): Promise<{
    method: string;
    url: string;
    body: Record<string, string> | string;
  }> {
    return {
      method: this.req.method,
      url: this.req.url,
      body: await this.req.text(),
    };
  }

  getAllCookies(): Map<string, string> {
    const values = new Map<string, string>();
    this.req.cookies.getAll().forEach(x => {
      values.set(x.name, x.value);
    });
    return values;
  }
}
