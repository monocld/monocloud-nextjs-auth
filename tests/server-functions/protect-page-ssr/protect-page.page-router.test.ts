/* eslint-disable @typescript-eslint/no-explicit-any */
import { CookieJar } from 'tough-cookie';
import { NextApiRequest, NextApiResponse } from 'next';
import { monoCloudAuth, protectPage } from '../../../src';
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

describe('protectPage() - Page Router', () => {
  beforeEach(() => {
    monoCloudAuth();
  });

  afterEach(async () => {
    await stopNodeServer();
  });

  it('should return serverside props with the current user when the request is authenticated', async () => {
    const serverSideProps = protectPage();

    const handler = async (req: NextApiRequest, res: NextApiResponse) => {
      const result: any = await serverSideProps({
        req,
        res,
        query: req.query,
        resolvedUrl: req.url ?? '/',
      });

      res.end();

      expect(result.props.user).toEqual(defaultSessionCookieValue.user);
    };

    const baseUrl = await startNodeServer(handler);

    const cookieJar = new CookieJar();

    await setSessionCookie(cookieJar, `${baseUrl}/`);

    await get(baseUrl, '/', cookieJar);
  });

  it('should execute custom getServerSideProps()', async () => {
    const getServerSideProps = (context: any) => {
      expect(context.req).toBeDefined();
      expect(context.res).toBeDefined();
      return Promise.resolve({ props: { custom: 'prop' } });
    };

    const serverSideProps = protectPage({ getServerSideProps });

    const handler = async (req: NextApiRequest, res: NextApiResponse) => {
      const result: any = await serverSideProps({
        req,
        res,
        query: req.query,
        resolvedUrl: req.url ?? '/',
      });

      res.end();

      expect(result.props.user).toEqual(defaultSessionCookieValue.user);
      expect(result.props.custom).toEqual('prop');
    };

    const baseUrl = await startNodeServer(handler);

    const cookieJar = new CookieJar();

    await setSessionCookie(cookieJar, `${baseUrl}/`);

    await get(baseUrl, '/', cookieJar);
  });

  it('should handle promises as props in getServerSideProps()', async () => {
    const getServerSideProps = (context: any) => {
      expect(context.req).toBeDefined();
      expect(context.res).toBeDefined();
      return Promise.resolve({ props: Promise.resolve({ custom: 'prop' }) });
    };

    const serverSideProps = protectPage({ getServerSideProps });

    const handler = async (req: NextApiRequest, res: NextApiResponse) => {
      const result: any = await serverSideProps({
        req,
        res,
        query: req.query,
        resolvedUrl: req.url ?? '/',
      });

      res.end();

      expect(result.props).toBeInstanceOf(Promise);

      expect(result.props).resolves.toEqual({
        user: defaultSessionCookieValue.user,
        custom: 'prop',
      });
    };

    const baseUrl = await startNodeServer(handler);

    const cookieJar = new CookieJar();

    await setSessionCookie(cookieJar, `${baseUrl}/`);

    await get(baseUrl, '/', cookieJar);
  });

  it('should not execute custom getServerSideProps for unauthenticated requests', async () => {
    const getServerSideProps = jest.fn();

    const serverSideProps = protectPage({ getServerSideProps });

    const handler = async (req: NextApiRequest, res: NextApiResponse) => {
      const result: any = await serverSideProps({
        req,
        res,
        query: req.query,
        resolvedUrl: req.url ?? '/',
      });

      res.end();

      expect(result.redirect).toEqual({
        permanent: false,
        destination: 'https://example.org/api/auth/signin?return_url=%2F',
      });
      expect(getServerSideProps).toHaveBeenCalledTimes(0);
    };

    const baseUrl = await startNodeServer(handler);

    await get(baseUrl, '/');
  });

  [
    [{}, { props: {} }],
    [{ props: { custom: true } }, { props: { custom: true } }],
    [null, { props: {} }],
  ].forEach(([ret, expected]: any, i) => {
    it(`can customize onAccessDenied if user is not authenticated ${i + 1}/3`, async () => {
      const serverSideProps = protectPage({ onAccessDenied: () => ret });

      const handler = async (req: NextApiRequest, res: NextApiResponse) => {
        const result: any = await serverSideProps({
          req,
          res,
          query: req.query,
          resolvedUrl: req.url ?? '/',
        });

        res.end();

        expect(result).toEqual(expected);
      };

      const baseUrl = await startNodeServer(handler);

      await get(baseUrl, '/');
    });
  });

  it('should redirect to sign in when there is no session', async () => {
    const serverSideProps = protectPage();

    const handler = async (req: NextApiRequest, res: NextApiResponse) => {
      const result: any = await serverSideProps({
        req,
        res,
        query: req.query,
        resolvedUrl: req.url ?? '/',
      });

      res.end();

      expect(result.redirect).toEqual({
        permanent: false,
        destination: 'https://example.org/api/auth/signin?return_url=%2F',
      });
    };

    const baseUrl = await startNodeServer(handler);

    await get(baseUrl, '/');
  });

  it('should pickup return url from the resolvedUrl of the request', async () => {
    const serverSideProps = protectPage();

    const handler = async (req: NextApiRequest, res: NextApiResponse) => {
      const result: any = await serverSideProps({
        req,
        res,
        query: req.query,
        resolvedUrl: req.url ?? '/',
      });

      res.end();

      expect(result.redirect).toEqual({
        permanent: false,
        destination: 'https://example.org/api/auth/signin?return_url=%2Ftest',
      });
    };

    const baseUrl = await startNodeServer(handler);

    await get(baseUrl, '/test');
  });

  it('should pickup return url from options', async () => {
    const serverSideProps = protectPage({ returnUrl: '/overrides' });

    const handler = async (req: NextApiRequest, res: NextApiResponse) => {
      const result: any = await serverSideProps({
        req,
        res,
        query: req.query,
        resolvedUrl: req.url ?? '/',
      });

      res.end();

      expect(result.redirect).toEqual({
        permanent: false,
        destination:
          'https://example.org/api/auth/signin?return_url=%2Foverrides',
      });
    };

    const baseUrl = await startNodeServer(handler);

    await get(baseUrl, '/test');
  });

  describe('groups', () => {
    it('should return props with user if the user belongs to any of the listed groups', async () => {
      const serverSideProps = protectPage({ groups: ['test'] });

      const user = { ...defaultSessionCookieValue.user, groups: ['test'] };

      const handler = async (req: NextApiRequest, res: NextApiResponse) => {
        const result: any = await serverSideProps({
          req,
          res,
          query: req.query,
          resolvedUrl: req.url ?? '/',
        });

        res.end();

        expect(result.props.user).toEqual(user);
      };

      const baseUrl = await startNodeServer(handler);

      const cookieJar = new CookieJar();

      await setSessionCookie(cookieJar, `${baseUrl}/`, {
        ...defaultSessionCookieValue,
        user,
      });

      await get(baseUrl, '/', cookieJar);
    });

    it('can customize the groups claim', async () => {
      const serverSideProps = protectPage({
        groups: ['test'],
        groupsClaim: 'CUSTOM_GROUPS',
      });

      const user = {
        ...defaultSessionCookieValue.user,
        CUSTOM_GROUPS: ['test'],
      };

      const handler = async (req: NextApiRequest, res: NextApiResponse) => {
        const result: any = await serverSideProps({
          req,
          res,
          query: req.query,
          resolvedUrl: req.url ?? '/',
        });

        res.end();

        expect(result.props.user).toEqual(user);
      };

      const baseUrl = await startNodeServer(handler);

      const cookieJar = new CookieJar();

      await setSessionCookie(cookieJar, `${baseUrl}/`, {
        ...defaultSessionCookieValue,
        user,
      });

      await get(baseUrl, '/', cookieJar);
    });

    it('should return props with accessDenied - true if the user does not belongs to any of the listed groups', async () => {
      const serverSideProps = protectPage({
        groups: ['NOPE'],
      });

      const handler = async (req: NextApiRequest, res: NextApiResponse) => {
        const result: any = await serverSideProps({
          req,
          res,
          query: req.query,
          resolvedUrl: req.url ?? '/',
        });

        res.end();

        expect(result.props).toEqual({ accessDenied: true });
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

    [
      [{}, { props: {} }],
      [{ props: { custom: true } }, { props: { custom: true } }],
      [null, { props: { accessDenied: true } }],
    ].forEach(([ret, expected]: any, i) => {
      it(`can set custom onAccessDenied getServerSideProps ${i + 1}/2`, async () => {
        const serverSideProps = protectPage({
          groups: ['NOPE'],
          onAccessDenied: () => ret,
        });

        const handler = async (req: NextApiRequest, res: NextApiResponse) => {
          const result: any = await serverSideProps({
            req,
            res,
            query: req.query,
            resolvedUrl: req.url ?? '/',
          });

          res.end();

          expect(result).toEqual(expected);
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
    });
  });
});
