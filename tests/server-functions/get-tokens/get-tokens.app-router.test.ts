import { NextRequest, NextResponse } from 'next/server';
import { getTokens, monoCloudAuth } from '../../../src';
import {
  defaultSessionCookieValue,
  setSessionCookie,
} from '../../common-helper';
import {
  defaultDiscovery,
  refreshedTokens,
  setupOp,
  tokenAndUserInfoEnabled,
} from '../../op-helpers';

describe('getTokens() - App Router', () => {
  let req: NextRequest;

  beforeEach(() => {
    req = new NextRequest('http://localhost:3000/');

    monoCloudAuth();
  });

  afterEach(() => {
    req = undefined as unknown as NextRequest;
  });

  describe('No params (<From Cookies>)', () => {
    beforeEach(() => {
      jest.mock('next/headers', () => {
        const headers = jest.requireActual('next/headers');
        return {
          ...headers,
          cookies: () => ({
            ...headers.cookies,
            get: (name: string) => req.cookies.get(name),
            getAll: () => req.cookies.getAll(),
          }),
        };
      });
    });

    it('should return the tokens if the request is authenticated', async () => {
      await setSessionCookie(req);

      const result = await getTokens();

      expect(result).toEqual({
        accessToken: defaultSessionCookieValue.accessToken,
        idToken: defaultSessionCookieValue.idToken,
        refreshToken: defaultSessionCookieValue.refreshToken,
        isExpired: false,
      });
    });

    it('should return and object with isExpired false if the request is not authenticated', async () => {
      const result = await getTokens();

      expect(result).toEqual({
        accessToken: undefined,
        idToken: undefined,
        refreshToken: undefined,
        isExpired: false,
      });
    });

    it('should refresh the tokens when forceRefresh is true', async () => {
      await setupOp(defaultDiscovery);

      await setSessionCookie(req);

      const result = await getTokens({ forceRefresh: true });

      expect(result).toEqual({
        ...refreshedTokens,
        isExpired: false,
      });
    });

    it('should send custom refresh params', async () => {
      await setupOp(defaultDiscovery, tokenAndUserInfoEnabled, {
        custom: 'test',
        ui_locales: 'en-us',
      });

      await setSessionCookie(req);

      const result = await getTokens({
        forceRefresh: true,
        refreshParams: { custom: 'test', ui_locales: 'en-us' },
      });

      expect(result).toEqual({
        ...refreshedTokens,
        isExpired: false,
      });
    });
  });

  describe('With Request and Response (req, res)', () => {
    it('should return the tokens if the request is authenticated', async () => {
      await setSessionCookie(req);

      const res = new NextResponse();

      const result = await getTokens(req, res);

      expect(result).toEqual({
        accessToken: defaultSessionCookieValue.accessToken,
        idToken: defaultSessionCookieValue.idToken,
        refreshToken: defaultSessionCookieValue.refreshToken,
        isExpired: false,
      });
    });

    it('should return and object with isExpired false if the request is not authenticated', async () => {
      const res = new NextResponse();

      const result = await getTokens(req, res);

      expect(result).toEqual({
        accessToken: undefined,
        idToken: undefined,
        refreshToken: undefined,
        isExpired: false,
      });
    });

    it('should refresh the tokens when forceRefresh is true', async () => {
      await setupOp(defaultDiscovery);

      await setSessionCookie(req);

      const res = new NextResponse();

      const result = await getTokens(req, res, { forceRefresh: true });

      expect(result).toEqual({
        ...refreshedTokens,
        isExpired: false,
      });
    });

    it('should send custom refresh params', async () => {
      await setupOp(defaultDiscovery, tokenAndUserInfoEnabled, {
        custom: 'test',
        ui_locales: 'en-us',
      });

      await setSessionCookie(req);

      const res = new NextResponse();

      const result = await getTokens(req, res, {
        forceRefresh: true,
        refreshParams: { custom: 'test', ui_locales: 'en-us' },
      });

      expect(result).toEqual({
        ...refreshedTokens,
        isExpired: false,
      });
    });
  });

  describe('With Request and Context (req, ctx)', () => {
    it('should return the tokens if the request is authenticated', async () => {
      await setSessionCookie(req);

      const result = await getTokens(req, { params: {} });

      expect(result).toEqual({
        accessToken: defaultSessionCookieValue.accessToken,
        idToken: defaultSessionCookieValue.idToken,
        refreshToken: defaultSessionCookieValue.refreshToken,
        isExpired: false,
      });
    });

    it('should return and object with isExpired false if the request is not authenticated', async () => {
      const result = await getTokens(req, { params: {} });

      expect(result).toEqual({
        accessToken: undefined,
        idToken: undefined,
        refreshToken: undefined,
        isExpired: false,
      });
    });

    it('should refresh the tokens when forceRefresh is true', async () => {
      await setupOp(defaultDiscovery);

      await setSessionCookie(req);

      const result = await getTokens(
        req,
        { params: {} },
        { forceRefresh: true }
      );

      expect(result).toEqual({
        ...refreshedTokens,
        isExpired: false,
      });
    });

    it('should send custom refresh params', async () => {
      await setupOp(defaultDiscovery, tokenAndUserInfoEnabled, {
        custom: 'test',
        ui_locales: 'en-us',
      });

      await setSessionCookie(req);

      const result = await getTokens(
        req,
        { params: {} },
        {
          forceRefresh: true,
          refreshParams: { custom: 'test', ui_locales: 'en-us' },
        }
      );

      expect(result).toEqual({
        ...refreshedTokens,
        isExpired: false,
      });
    });
  });
});
