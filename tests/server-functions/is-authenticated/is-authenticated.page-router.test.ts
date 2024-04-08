import { NextApiRequest, NextApiResponse } from 'next';
import { CookieJar } from 'tough-cookie';
import { NextRequest } from 'next/server';
import { isAuthenticated, monoCloudAuth } from '../../../src';
import { setSessionCookie } from '../../common-helper';
import {
  get,
  startNodeServer,
  stopNodeServer,
} from '../../page-router-helpers';

describe('isAuthenticated() - Page Router', () => {
  beforeEach(() => {
    monoCloudAuth();
  });

  afterEach(async () => {
    await stopNodeServer();
  });

  describe('No params (<From Cookies>)', () => {
    let tempReq: NextRequest;

    beforeEach(() => {
      tempReq = new NextRequest('http://localhost:3000/');

      jest.mock('next/headers', () => {
        const headers = jest.requireActual('next/headers');
        return {
          ...headers,
          cookies: () => ({
            ...headers.cookies,
            get: (name: string) => tempReq.cookies.get(name),
            getAll: () => tempReq.cookies.getAll(),
          }),
        };
      });
    });

    afterEach(() => {
      tempReq = undefined as unknown as NextRequest;
    });

    it('should return true if the request is authenticated', async () => {
      await setSessionCookie(tempReq);

      const handler = async (_req: NextApiRequest, res: NextApiResponse) => {
        const result = await isAuthenticated();

        res.end();

        expect(result).toBe(true);
      };

      const baseUrl = await startNodeServer(handler);

      await get(baseUrl, '/');
    });

    it('should return false if the request is not authenticated', async () => {
      const handler = async (_req: NextApiRequest, res: NextApiResponse) => {
        const result = await isAuthenticated();

        res.end();

        expect(result).toBe(false);
      };

      const baseUrl = await startNodeServer(handler);

      await get(baseUrl, '/');
    });
  });

  describe('With Request and Response (req, res)', () => {
    it('should return true if the request is authenticated', async () => {
      const handler = async (req: NextApiRequest, res: NextApiResponse) => {
        const result = await isAuthenticated(req, res);

        res.end();

        expect(result).toBe(true);
      };

      const baseUrl = await startNodeServer(handler);

      const cookieJar = new CookieJar();
      await setSessionCookie(cookieJar, `${baseUrl}/`);

      await get(baseUrl, '/', cookieJar);
    });

    it('should return false if the request is not authenticated', async () => {
      const handler = async (req: NextApiRequest, res: NextApiResponse) => {
        const result = await isAuthenticated(req, res);

        res.end();

        expect(result).toBe(false);
      };

      const baseUrl = await startNodeServer(handler);

      await get(baseUrl, '/');
    });
  });
});
