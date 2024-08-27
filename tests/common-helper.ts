/* eslint-disable @typescript-eslint/return-await */
/* eslint-disable max-classes-per-file */
/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { CookieJar } from 'tough-cookie';
import { UrlWithParsedQuery, parse } from 'url';
import { NextRequest, NextResponse } from 'next/server';
import { MonoCloudSession } from '@monocloud/node-auth-core';

export const now = () => Math.floor(Date.now() / 1000);

export const setupDefaultConfig = () => {
  process.env.MONOCLOUD_AUTH_ISSUER = 'https://op.example.com';
  process.env.MONOCLOUD_AUTH_CLIENT_ID = '__test_client_id__';
  process.env.MONOCLOUD_AUTH_CLIENT_SECRET = '__test_client_secret__';
  process.env.MONOCLOUD_AUTH_APP_URL = 'https://example.org';
  process.env.MONOCLOUD_AUTH_COOKIE_SECRET = 'cookie_secret';
  process.env.MONOCLOUD_AUTH_SCOPES = 'openid profile email read:customer';
};

export const deleteDefaultConfig = () => {
  process.env.MONOCLOUD_AUTH_ISSUER = undefined;
  process.env.MONOCLOUD_AUTH_CLIENT_ID = undefined;
  process.env.MONOCLOUD_AUTH_CLIENT_SECRET = undefined;
  process.env.MONOCLOUD_AUTH_APP_URL = undefined;
  process.env.MONOCLOUD_AUTH_COOKIE_SECRET = undefined;
  process.env.MONOCLOUD_AUTH_SCOPES = undefined;
};

export interface ParsedCookie {
  value: string | undefined;
  options: {
    path?: string | null;
    sameSite?: string;
    secure?: boolean;
    expires?: Date | 'Infinity';
    domain?: string | null;
    httpOnly?: boolean;
  };
}

export interface TestResponse {
  status: number;
  locationHeader: UrlWithParsedQuery;
  locationHeaderPathOnly: string;
  stateCookie: ParsedCookie;
  sessionCookie: ParsedCookie;
  getBody(): Promise<any>;
}

export class TestPageRes implements TestResponse {
  constructor(
    private readonly res: any,
    private readonly data: any,
    private readonly baseUrl: string,
    public readonly cookieJar: CookieJar
  ) {}

  get status(): number {
    return this.res.statusCode;
  }

  get locationHeader(): UrlWithParsedQuery {
    return parse(this.res.headers.location, true);
  }

  get locationHeaderPathOnly(): string {
    const url = this.locationHeader;
    return `${url.protocol}//${url.host}${url.pathname}`;
  }

  get stateCookie(): ParsedCookie {
    const stateCookie = this.cookieJar
      .getCookiesSync(this.baseUrl, { secure: true })
      .find(x => x.key === 'state');

    return {
      value: stateCookie?.value,
      options: {
        path: stateCookie?.path,
        sameSite: stateCookie?.sameSite,
        secure: stateCookie?.secure,
        expires: stateCookie?.expires,
        domain: stateCookie?.domain,
        httpOnly: stateCookie?.httpOnly,
      },
    };
  }

  get sessionCookie(): ParsedCookie {
    const sessionCookie = this.cookieJar
      .serializeSync()
      .cookies.find(x => x.key === 'session');

    return {
      value: sessionCookie?.value,
      options: {
        path: sessionCookie?.path,
        sameSite: sessionCookie?.sameSite,
        secure: sessionCookie?.secure,
        expires:
          sessionCookie?.expires && sessionCookie?.expires !== 'Infinity'
            ? new Date(sessionCookie?.expires)
            : sessionCookie?.expires,
        domain: sessionCookie?.domain,
        httpOnly: sessionCookie?.httpOnly,
      },
    };
  }

  getBody(): Promise<any> {
    try {
      const data = JSON.parse(this.data);
      return Promise.resolve(data);
    } catch (error) {
      return Promise.resolve(this.data);
    }
  }
}

export class TestAppRes implements TestResponse {
  private readonly res: NextResponse;

  constructor(res: any) {
    this.res = res;
  }

  get status(): number {
    return this.res.status;
  }

  get locationHeader(): UrlWithParsedQuery {
    return parse(this.res.headers.get('location') ?? '', true);
  }

  get locationHeaderPathOnly(): string {
    const url = this.locationHeader;
    return `${url.protocol}//${url.host}${url.pathname}`;
  }

  get stateCookie(): ParsedCookie {
    const stateCookie = this.res.cookies.get('state');

    return {
      value: stateCookie?.value,
      options: {
        path: stateCookie?.path,
        sameSite: stateCookie?.sameSite,
        secure: stateCookie?.secure,
        expires: stateCookie?.expires
          ? new Date(stateCookie.expires)
          : 'Infinity',
        domain: stateCookie?.domain ?? 'localhost',
        httpOnly: stateCookie?.httpOnly,
      },
    } as any;
  }

  get sessionCookie(): ParsedCookie {
    const sessionCookie = this.res.cookies.get('session');

    return {
      value: sessionCookie?.value,
      options: {
        path: sessionCookie?.path,
        sameSite: sessionCookie?.sameSite,
        secure: sessionCookie?.secure,
        expires: sessionCookie?.expires
          ? new Date(sessionCookie?.expires)
          : sessionCookie?.expires,
        domain: sessionCookie?.domain ?? 'localhost',
        httpOnly: sessionCookie?.httpOnly,
      },
    } as any;
  }

  async getBody(): Promise<any> {
    let data;
    try {
      data = await this.res.text();
      data = JSON.parse(data);
    } catch (error) {
      // ignore
    }
    return data;
  }
}

const toB64Url = (input: string) =>
  input.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

const fromB64Url = (input: string) => {
  let str = input;
  if (str.length % 4 !== 0) {
    str += '==='.slice(0, 4 - (str.length % 4));
  }

  str = str.replace(/-/g, '+').replace(/_/g, '/');

  return str;
};

const stringToArrayBuffer = (str: string) => {
  const encoder = new TextEncoder();
  return encoder.encode(str);
};

const arrayBufferToString = (buffer: ArrayBuffer) => {
  const decoder = new TextDecoder();
  return decoder.decode(buffer);
};

const arrayBufferToBase64 = (buffer: Uint8Array) => {
  const bytes = new Uint8Array(buffer);
  const binary = bytes.reduce(
    (acc, byte) => acc + String.fromCharCode(byte),
    ''
  );
  return toB64Url(btoa(binary));
};

const encryptData = async (
  data: string,
  secretKey: string
): Promise<string> => {
  const iv = crypto.getRandomValues(new Uint8Array(16));
  const plaintextBuffer = stringToArrayBuffer(data);
  const keyBuffer = await crypto.subtle.digest(
    'SHA-256',
    stringToArrayBuffer(secretKey)
  );
  const key = await crypto.subtle.importKey(
    'raw',
    keyBuffer,
    { name: 'AES-CBC' },
    false,
    ['encrypt']
  );

  const ciphertext = await crypto.subtle.encrypt(
    {
      name: 'AES-CBC',
      iv,
    },
    key,
    plaintextBuffer
  );

  // Concatenate IV and ciphertext into single buffer
  const resultBuffer = new Uint8Array(iv.byteLength + ciphertext.byteLength);
  resultBuffer.set(iv, 0);
  resultBuffer.set(new Uint8Array(ciphertext), iv.byteLength);

  // Convert the result to a Base64-encoded string
  return arrayBufferToBase64(resultBuffer);
};

const decryptData = async (data: string, secretKey: string) => {
  try {
    const ciphertextBuffer = Uint8Array.from(atob(fromB64Url(data)), c =>
      c.charCodeAt(0)
    );
    const keyBuffer = await crypto.subtle.digest(
      'SHA-256',
      stringToArrayBuffer(secretKey)
    );
    const key = await crypto.subtle.importKey(
      'raw',
      keyBuffer,
      { name: 'AES-CBC' },
      false,
      ['decrypt']
    );
    const iv = ciphertextBuffer.slice(0, 16);
    const decryptedBuffer = await crypto.subtle.decrypt(
      {
        name: 'AES-CBC',
        iv,
      },
      key,
      ciphertextBuffer.slice(16)
    );
    const decryptedText = arrayBufferToString(decryptedBuffer);
    return decryptedText;
  } catch {
    return undefined;
  }
};

export const defaultStateCookieValue = {
  appState: '{}',
  nonce: 'nonce',
  state: 'state',
  verifier: 'a', // ypeBEsobvcr6wjGzmiPcTaeG7_gUfE5yuYB3ha_uSLs
};

export const setStateCookie = async (
  reqOrCookieJar: NextRequest | CookieJar,
  currentUrl = '',
  state: {
    state: string;
    nonce: string;
    appState: string;
    verifier?: string;
    maxAge?: number;
    returnUrl?: string;
  } = defaultStateCookieValue
) => {
  const value = await encryptData(
    JSON.stringify({ state }),
    process.env.MONOCLOUD_AUTH_COOKIE_SECRET ?? ''
  );

  if (reqOrCookieJar instanceof CookieJar) {
    reqOrCookieJar.setCookieSync(`state=${value}`, currentUrl, {
      secure: true,
    });

    return;
  }

  reqOrCookieJar.cookies.set('state', value);
};

export const defaultSessionCookieValue = {
  user: { sub: 'sub' },
  accessToken: 'at',
  accessTokenExpiration: now() + 300,
  idToken: 'idtoken',
  refreshToken: 'rt',
  scopes: process.env.MONOCLOUD_AUTH_SCOPES,
};

export const userWithGroupsSessionCookieValue = {
  ...defaultSessionCookieValue,
  user: { ...defaultSessionCookieValue.user, groups: ['test'] },
};

export const setSessionCookie = async (
  reqOrCookieJar: NextRequest | CookieJar,
  currentUrl = '',
  session: MonoCloudSession = defaultSessionCookieValue,
  lifetime: { u?: number; e?: number; c?: number } = {
    u: now(),
    e: now() + 300,
    c: now(),
  }
) => {
  const value = await encryptData(
    JSON.stringify({
      session,
      lifetime,
    }),
    process.env.MONOCLOUD_AUTH_COOKIE_SECRET ?? ''
  );

  if (reqOrCookieJar instanceof CookieJar) {
    reqOrCookieJar.setCookieSync(`session=${value}`, currentUrl, {
      secure: true,
    });

    return;
  }

  reqOrCookieJar.cookies.set('session', value);
};

export const getCookieValue = async (data: string): Promise<any> =>
  JSON.parse(
    (await decryptData(data, process.env.MONOCLOUD_AUTH_COOKIE_SECRET ?? '')) ??
      ''
  );
