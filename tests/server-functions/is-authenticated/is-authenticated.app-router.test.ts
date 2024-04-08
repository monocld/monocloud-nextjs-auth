import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticated, monoCloudAuth } from '../../../src';
import { setSessionCookie } from '../../common-helper';

describe('isAuthenticated() - App Router', () => {
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

    it('should return true if the request is authenticated', async () => {
      await setSessionCookie(req);

      const result = await isAuthenticated();

      expect(result).toBe(true);
    });

    it('should return false if the request is not authenticated', async () => {
      const result = await isAuthenticated();

      expect(result).toBe(false);
    });
  });

  describe('With Request and Response (req, res)', () => {
    it('should return true if the request is authenticated', async () => {
      await setSessionCookie(req);

      const res = new NextResponse();

      const result = await isAuthenticated(req, res);

      expect(result).toBe(true);
    });

    it('should return false if the request is not authenticated', async () => {
      const res = new NextResponse();

      const result = await isAuthenticated(req, res);

      expect(result).toBe(false);
    });
  });

  describe('With Request and Context (req, ctx)', () => {
    it('should return true if the request is authenticated', async () => {
      await setSessionCookie(req);

      const result = await isAuthenticated(req, { params: {} });

      expect(result).toBe(true);
    });

    it('should return false if the request is not authenticated', async () => {
      const result = await isAuthenticated(req, { params: {} });

      expect(result).toBe(false);
    });
  });
});
