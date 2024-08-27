import { NextApiRequest, NextApiResponse } from 'next';
import { CookieJar } from 'tough-cookie';
import { MonoCloudValidationError } from '@monocloud/node-auth-core';
import { isUserInGroup, monoCloudAuth } from '../../../src';
import {
  defaultSessionCookieValue,
  setSessionCookie,
  userWithGroupsSessionCookieValue,
} from '../../common-helper';
import {
  get,
  startNodeServer,
  stopNodeServer,
} from '../../page-router-helpers';

describe('isUserInGroup() - Page Router', () => {
  beforeEach(() => {
    monoCloudAuth();
  });

  afterEach(async () => {
    await stopNodeServer();
  });

  describe('With Request and Response (req, res)', () => {
    it('should return true if the user is in any of the specified groups', async () => {
      const handler = async (req: NextApiRequest, res: NextApiResponse) => {
        const result = await isUserInGroup(req, res, ['test']);

        res.end();

        expect(result).toBe(true);
      };

      const baseUrl = await startNodeServer(handler);

      const cookieJar = new CookieJar();

      await setSessionCookie(
        cookieJar,
        `${baseUrl}/`,
        userWithGroupsSessionCookieValue
      );

      await get(baseUrl, '/', cookieJar);
    });

    it('should return false if the user is in not in any of the specified groups', async () => {
      const handler = async (req: NextApiRequest, res: NextApiResponse) => {
        const result = await isUserInGroup(req, res, ['NOPE']);

        res.end();

        expect(result).toBe(false);
      };

      const baseUrl = await startNodeServer(handler);

      const cookieJar = new CookieJar();

      await setSessionCookie(
        cookieJar,
        `${baseUrl}/`,
        userWithGroupsSessionCookieValue
      );

      await get(baseUrl, '/', cookieJar);
    });

    it('can customize the groups claim', async () => {
      const handler = async (req: NextApiRequest, res: NextApiResponse) => {
        const result = await isUserInGroup(req, res, ['test'], {
          groupsClaim: 'CUSTOM_GROUPS',
        });

        res.end();

        expect(result).toBe(true);
      };

      const baseUrl = await startNodeServer(handler);

      const cookieJar = new CookieJar();

      await setSessionCookie(cookieJar, `${baseUrl}/`, {
        ...defaultSessionCookieValue,
        user: {
          ...defaultSessionCookieValue.user,
          CUSTOM_GROUPS: ['test'],
        },
      });

      await get(baseUrl, '/', cookieJar);
    });

    it('should return false if there is no session', async () => {
      const handler = async (req: NextApiRequest, res: NextApiResponse) => {
        const result = await isUserInGroup(req, res, ['NOPE']);

        res.end();

        expect(result).toBe(false);
      };

      const baseUrl = await startNodeServer(handler);

      await get(baseUrl, '/');
    });

    it('should throw if no groups are passed', async () => {
      const handler = async (req: NextApiRequest, res: NextApiResponse) => {
        try {
          await isUserInGroup(req, res, null as unknown as string[]);
          throw new Error();
        } catch (error) {
          expect(error).toBeInstanceOf(MonoCloudValidationError);
          expect(error.message).toBe(
            'Invalid parameters passed to isUserInGroup()'
          );
        }

        res.end();
      };

      const baseUrl = await startNodeServer(handler);

      await get(baseUrl, '/');
    });
  });
});
