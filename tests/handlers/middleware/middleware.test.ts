import { NextRequest, NextResponse } from 'next/server';
import { NextFetchEvent } from 'next/dist/server/web/spec-extension/fetch-event';
import { monoCloudAuth, monoCloudMiddleware } from '../../../src';
import {
  TestAppRes,
  defaultSessionCookieValue,
  setSessionCookie,
  userWithGroupsSessionCookieValue,
} from '../../common-helper';

describe('MonoCloud Middleware', () => {
  beforeEach(() => {
    monoCloudAuth();
  });

  it('should redirect unauthenticated requests to signin endpoint', async () => {
    const middleware = monoCloudMiddleware();

    const request = new NextRequest('http://localhost:3000/');

    const response = await middleware(
      request,
      new NextFetchEvent({ request, page: '/' })
    );

    const res = new TestAppRes(response);

    expect(res.status).toBe(307);
    expect(res.locationHeaderPathOnly).toBe(
      'https://example.org/api/auth/signin'
    );
  });

  [
    NextResponse.json({ custom: true }),
    { body: '{"custom":true}', status: 200 },
  ].forEach(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (ret: any, i) => {
      it(`can customize onAccessDenied for unauthenticated requests ${i + 1}/2`, async () => {
        const middleware = monoCloudMiddleware({
          onAccessDenied: () => ret,
        });

        const request = new NextRequest('http://localhost:3000/');

        const response = await middleware(
          request,
          new NextFetchEvent({ request, page: '/' })
        );

        const res = new TestAppRes(response);

        expect(res.status).toBe(200);
        expect(await res.getBody()).toStrictEqual({ custom: true });
      });
    }
  );

  it('will continue the request if onAccessDenied returns falsy', async () => {
    const middleware = monoCloudMiddleware({
      onAccessDenied: () => null,
    });

    const request = new NextRequest('http://localhost:3000/');

    const response = await middleware(
      request,
      new NextFetchEvent({ request, page: '/' })
    );

    const res = new TestAppRes(response);

    expect(res.status).toEqual(200);
  });

  it('should return 401 unauthorized for api requests', async () => {
    const middleware = monoCloudMiddleware();

    const request = new NextRequest('http://localhost:3000/api/something');

    const response = await middleware(
      request,
      new NextFetchEvent({ request, page: '' })
    );

    const res = new TestAppRes(response);

    expect(res.status).toBe(401);
    expect(await res.getBody()).toEqual({ message: 'unauthorized' });
  });

  it('should retain the path as return_url in the signin redirect', async () => {
    const middleware = monoCloudMiddleware();

    const request = new NextRequest('http://localhost:3000/path?any=thing');

    const response = await middleware(
      request,
      new NextFetchEvent({ request, page: '/path' })
    );

    const res = new TestAppRes(response);

    expect(res.locationHeaderPathOnly).toBe(
      'https://example.org/api/auth/signin'
    );
    expect(res.locationHeader.query).toEqual({
      return_url: '/path?any=thing',
    });
  });

  [
    '/api/auth/signin',
    '/api/auth/callback',
    '/api/auth/signout',
    '/api/auth/userinfo',
  ].forEach(endpoint => {
    it('should not affect any auth requests', async () => {
      const middleware = monoCloudMiddleware();

      const request = new NextRequest(`http://localhost:3000${endpoint}`);

      const response = await middleware(
        request,
        new NextFetchEvent({ request, page: endpoint })
      );

      const res = new TestAppRes(response);

      expect(res.status).not.toBe(307);
    });
  });

  it('can customize the protected routes', async () => {
    const middleware = monoCloudMiddleware({
      protectedRoutes: ['/protected'],
    });

    const skippedRequest = new NextRequest('http://localhost:3000/skipped');
    const skippedResponse = await middleware(
      skippedRequest,
      new NextFetchEvent({ request: skippedRequest, page: '/skipped' })
    );
    const skippedRes = new TestAppRes(skippedResponse);
    expect(skippedRes.status).not.toBe(307);

    const protectedRequest = new NextRequest('http://localhost:3000/protected');
    const protectedResponse = await middleware(
      protectedRequest,
      new NextFetchEvent({ request: protectedRequest, page: '/protected' })
    );
    const protectedRes = new TestAppRes(protectedResponse);
    expect(protectedRes.status).toBe(307);
  });

  ['/protected', '/secret', '/protected/nested', '/secret/nested'].forEach(
    endpoint => {
      it('can protect routes using regex', async () => {
        const middleware = monoCloudMiddleware({
          protectedRoutes: ['^/(protected|secret)'],
        });

        const skippedRequest = new NextRequest('http://localhost:3000/skipped');
        const skippedResponse = await middleware(
          skippedRequest,
          new NextFetchEvent({ request: skippedRequest, page: '/skipped' })
        );
        const skippedRes = new TestAppRes(skippedResponse);
        expect(skippedRes.status).not.toBe(307);

        const protectedRequest = new NextRequest(
          `http://localhost:3000${endpoint}`
        );
        const protectedResponse = await middleware(
          protectedRequest,
          new NextFetchEvent({ request: protectedRequest, page: endpoint })
        );
        const protectedRes = new TestAppRes(protectedResponse);
        expect(protectedRes.status).toBe(307);
      });
    }
  );

  it('can take in a callback that can decide if the route is protected', async () => {
    const middleware = monoCloudMiddleware({
      protectedRoutes: req => {
        return req.nextUrl.pathname.includes('/protected');
      },
    });

    const skippedRequest = new NextRequest('http://localhost:3000/skipped');
    const skippedResponse = await middleware(
      skippedRequest,
      new NextFetchEvent({ request: skippedRequest, page: '/skipped' })
    );
    const skippedRes = new TestAppRes(skippedResponse);
    expect(skippedRes.status).not.toBe(307);

    const protectedRequest = new NextRequest(
      'http://localhost:3000/something/protected'
    );
    const protectedResponse = await middleware(
      protectedRequest,
      new NextFetchEvent({
        request: protectedRequest,
        page: '/something/protected',
      })
    );
    const protectedRes = new TestAppRes(protectedResponse);
    expect(protectedRes.status).toBe(307);
    expect(protectedRes.locationHeaderPathOnly).toBe(
      'https://example.org/api/auth/signin'
    );
  });

  it('should allow authenticated users', async () => {
    const middleware = monoCloudMiddleware();

    const request = new NextRequest('http://localhost:3000/test');

    await setSessionCookie(request);

    const response = await middleware(
      request,
      new NextFetchEvent({ request, page: '/test' })
    );

    const res = new TestAppRes(response);

    expect(res.status).not.toBe(307);
  });

  it('can return monoCloudMiddleware from a customMiddleware', async () => {
    const customMiddleware = async (
      req: NextRequest,
      evt: NextFetchEvent
      // eslint-disable-next-line require-await
    ) => {
      return monoCloudMiddleware(req, evt);
    };

    const request = new NextRequest('http://localhost:3000/test');

    const response = await customMiddleware(
      request,
      new NextFetchEvent({ request, page: '/test' })
    );

    const res = new TestAppRes(response);

    expect(res.status).toBe(307);
    expect(res.locationHeaderPathOnly).toBe(
      'https://example.org/api/auth/signin'
    );
  });

  it('returns forbidden if the user does not belong to a group (Non API)', async () => {
    const middleware = monoCloudMiddleware({
      protectedRoutes: [{ routes: ['/protected'], groups: ['NOPE'] }],
    });

    const request = new NextRequest('http://localhost:3000/protected');

    await setSessionCookie(
      request,
      undefined,
      userWithGroupsSessionCookieValue
    );

    const response = await middleware(
      request,
      new NextFetchEvent({ request, page: '/protected' })
    );

    const res = new TestAppRes(response);

    expect(res.status).toBe(403);
    expect(await res.getBody()).toBe('forbidden');
  });

  it('returns forbidden if the user does not belong to a group (API)', async () => {
    const middleware = monoCloudMiddleware({
      protectedRoutes: [{ routes: ['/api/protected'], groups: ['NOPE'] }],
    });

    const request = new NextRequest('http://localhost:3000/api/protected');

    await setSessionCookie(
      request,
      undefined,
      userWithGroupsSessionCookieValue
    );

    const response = await middleware(
      request,
      new NextFetchEvent({ request, page: '/protected' })
    );

    const res = new TestAppRes(response);

    expect(res.status).toBe(403);
    expect(await res.getBody()).toStrictEqual({ message: 'forbidden' });
  });

  it('allows the user if the user belongs to the group', async () => {
    const middleware = monoCloudMiddleware({
      protectedRoutes: [{ routes: ['/protected'], groups: ['test'] }],
    });

    const request = new NextRequest('http://localhost:3000/protected');

    await setSessionCookie(
      request,
      undefined,
      userWithGroupsSessionCookieValue
    );

    const response = await middleware(
      request,
      new NextFetchEvent({ request, page: '/protected' })
    );

    const res = new TestAppRes(response);

    expect(res.status).toBe(200);
  });

  it('can set custom groups claim', async () => {
    const middleware = monoCloudMiddleware({
      groupsClaim: 'CUSTOM_GROUPS',
      protectedRoutes: [{ routes: ['/protected'], groups: ['test'] }],
    });

    const request = new NextRequest('http://localhost:3000/protected');

    await setSessionCookie(request, undefined, {
      ...defaultSessionCookieValue,
      user: { ...defaultSessionCookieValue.user, CUSTOM_GROUPS: ['test'] },
    });

    const response = await middleware(
      request,
      new NextFetchEvent({ request, page: '/protected' })
    );

    const res = new TestAppRes(response);

    expect(res.status).toBe(200);
  });

  [
    {
      ret: { body: '{"custom":true}', status: 200 },
      expected: { custom: true },
      route: '/protected',
    },
    {
      ret: NextResponse.json({ custom: true }),
      expected: { custom: true },
      route: '/protected',
    },
    {
      ret: null,
      expected: '',
      route: '/protected',
    },
  ].forEach(({ ret, expected, route }, i) => {
    it(`can set custom onAccessDenied middleware function ${i + 1}/1`, async () => {
      const middleware = monoCloudMiddleware({
        protectedRoutes: [
          {
            routes: [route],
            groups: ['NOPE'],
          },
        ],
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        onAccessDenied: () => ret as any,
      });

      const request = new NextRequest(`http://localhost:3000${route}`);

      await setSessionCookie(
        request,
        undefined,
        userWithGroupsSessionCookieValue
      );

      const response = await middleware(
        request,
        new NextFetchEvent({ request, page: route })
      );

      const res = new TestAppRes(response);

      expect(res.status).toBe(200);
      expect(await res.getBody()).toStrictEqual(expected);
    });
  });
});
