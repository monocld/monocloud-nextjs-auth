import { NextApiRequest, NextApiResponse } from 'next';
import { CookieJar } from 'tough-cookie';
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
