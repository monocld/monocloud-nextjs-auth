import { NextRequest, NextResponse } from 'next/server';
import { getSession, monoCloudAuth } from '../../../src';
import {
  defaultDiscovery,
  noTokenAndUserInfo,
  setupOp,
} from '../../op-helpers';
import {
  defaultSessionCookieValue,
  setSessionCookie,
} from '../../common-helper';

describe('getSession() - App Router', () => {
  beforeEach(() => {
    setupOp(defaultDiscovery, noTokenAndUserInfo);

    monoCloudAuth();
  });

  it('should return undefined if there is no session (NextRequest, NextResponse)', async () => {
    const req = new NextRequest('http://localhost:3000/');

    const nextRes = new NextResponse();

    const session = await getSession(req, nextRes);

    expect(session).toBeUndefined();
  });

  it('should return the session of the current user (NextRequest, NextResponse)', async () => {
    const req = new NextRequest('http://localhost:3000/');

    await setSessionCookie(req);

    const nextRes = new NextResponse();

    const session = await getSession(req, nextRes);

    expect(session).toEqual(defaultSessionCookieValue);
  });

  it('should return undefined if there is no session (NextRequest, AppRouterContext)', async () => {
    const req = new NextRequest('http://localhost:3000/');

    const session = await getSession(req, { params: {} });

    expect(session).toBeUndefined();
  });

  it('should return the session of the current user (NextRequest, AppRouterContext)', async () => {
    const req = new NextRequest('http://localhost:3000/');

    await setSessionCookie(req);

    const session = await getSession(req, { params: {} });

    expect(session).toEqual(defaultSessionCookieValue);
  });

  it('should return undefined if there is no session (<From Cookies>)', async () => {
    const req = new NextRequest('http://localhost:3000/');

    jest.mock('next/headers', () => ({
      cookies: () => ({
        get: (name: string) => req.cookies.get(name),
        getAll: () => req.cookies.getAll(),
      }),
    }));

    const session = await getSession();

    expect(session).toBeUndefined();
  });

  it('should return the session of the current user (<From Cookies>)', async () => {
    const req = new NextRequest('http://localhost:3000/');
    await setSessionCookie(req);

    jest.mock('next/headers', () => ({
      cookies: () => ({
        get: (name: string) => req.cookies.get(name),
        getAll: () => req.cookies.getAll(),
      }),
    }));

    const session = await getSession();

    expect(session).toEqual(defaultSessionCookieValue);
  });
});
