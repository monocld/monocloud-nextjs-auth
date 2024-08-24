import { NextApiRequest, NextApiResponse } from 'next';
import { CookieJar } from 'tough-cookie';
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
import {
  get,
  startNodeServer,
  stopNodeServer,
} from '../../page-router-helpers';

describe('getTokens() - Page Router', () => {
  beforeEach(() => {
    monoCloudAuth();
  });

  afterEach(async () => {
    await stopNodeServer();
  });

  describe('With Request and Response (req, res)', () => {
    it('should return the tokens if the request is authenticated', async () => {
      const handler = async (req: NextApiRequest, res: NextApiResponse) => {
        const result = await getTokens(req, res);

        res.end();

        expect(result).toEqual({
          accessToken: defaultSessionCookieValue.accessToken,
          idToken: defaultSessionCookieValue.idToken,
          refreshToken: defaultSessionCookieValue.refreshToken,
          isExpired: false,
        });
      };

      const baseUrl = await startNodeServer(handler);

      const cookieJar = new CookieJar();

      await setSessionCookie(cookieJar, `${baseUrl}/`);

      await get(baseUrl, '/', cookieJar);
    });

    it('should return and object with isExpired false if the request is not authenticated', async () => {
      const handler = async (req: NextApiRequest, res: NextApiResponse) => {
        const result = await getTokens(req, res);

        res.end();

        expect(result).toEqual({
          accessToken: undefined,
          idToken: undefined,
          refreshToken: undefined,
          isExpired: false,
        });
      };

      const baseUrl = await startNodeServer(handler);

      await get(baseUrl, '/');
    });

    it('should refresh the tokens when forceRefresh is true', async () => {
      await setupOp(defaultDiscovery, tokenAndUserInfoEnabled);

      const handler = async (req: NextApiRequest, res: NextApiResponse) => {
        const result = await getTokens(req, res, { forceRefresh: true });

        res.end();

        expect(result).toEqual({
          ...refreshedTokens,
          isExpired: false,
        });
      };

      const baseUrl = await startNodeServer(handler);

      const cookieJar = new CookieJar();

      await setSessionCookie(cookieJar, `${baseUrl}/`);

      await get(baseUrl, '/', cookieJar);
    });

    it('should send custom refresh params', async () => {
      await setupOp(defaultDiscovery, tokenAndUserInfoEnabled, {
        custom: 'test',
        ui_locales: 'en-us',
      });

      const handler = async (req: NextApiRequest, res: NextApiResponse) => {
        const result = await getTokens(req, res, {
          forceRefresh: true,
          refreshParams: {
            custom: 'test',
            ui_locales: 'en-us',
          },
        });

        res.end();

        expect(result).toEqual({
          ...refreshedTokens,
          isExpired: false,
        });
      };

      const baseUrl = await startNodeServer(handler);

      const cookieJar = new CookieJar();

      await setSessionCookie(cookieJar, `${baseUrl}/`);

      await get(baseUrl, '/', cookieJar);
    });
  });
});
