import React from 'react';
import { NextRequest } from 'next/server';
import { monoCloudAuth, protectPage } from '../../../src';
import {
  defaultSessionCookieValue,
  setSessionCookie,
  userWithGroupsSessionCookieValue,
} from '../../common-helper';

const Component =
  (assertUser = true) =>
  ({ user }: { user: unknown }) => {
    if (assertUser) {
      expect(user).toEqual(defaultSessionCookieValue.user);
    }
    return Promise.resolve(React.createElement('div', {}, 'Great Success!!!'));
  };

describe('protectPage() - App Router', () => {
  let req: NextRequest;

  beforeEach(() => {
    req = new NextRequest('http://localhost:3000/');

    monoCloudAuth();

    jest.mock('next/headers', () => {
      const headers = jest.requireActual('next/headers');
      return {
        ...headers,
        headers: () => ({
          ...headers.headers,
          get: (name: string) => req.headers.get(name),
        }),
        cookies: () => ({
          ...headers.cookies,
          get: (name: string) => req.cookies.get(name),
          getAll: () => req.cookies.getAll(),
        }),
      };
    });
  });

  afterEach(() => {
    req = undefined as unknown as NextRequest;
  });

  it('should render the component when session exists', async () => {
    await setSessionCookie(req);

    const protectedComponent = protectPage(Component());

    const componentResult = await protectedComponent({});

    expect(componentResult.type).toBe('div');
    expect(componentResult.props.children).toBe('Great Success!!!');
  });

  it('should redirect to sign in when there is no session', async () => {
    jest.mock('next/navigation', () => ({
      redirect: (url: URL) => {
        expect(url.toString()).toBe(
          'https://example.org/api/auth/signin?return_url=%2F'
        );
      },
    }));

    const protectedComponent = protectPage(Component());

    try {
      await protectedComponent({});
    } catch (error) {
      expect(error.message).toBe('NEXT_REDIRECT');
    }
  });

  it('should pickup return url from x-monocloud-path header', async () => {
    req.headers.set('x-monocloud-path', '/custom');

    jest.mock('next/navigation', () => ({
      redirect: (url: URL) => {
        expect(url.toString()).toBe(
          'https://example.org/api/auth/signin?return_url=%2Fcustom'
        );
      },
    }));

    const protectedComponent = protectPage(Component());

    try {
      await protectedComponent({});
    } catch (error) {
      expect(error.message).toBe('NEXT_REDIRECT');
    }
  });

  it('should pickup return url from options if configured', async () => {
    req.headers.set('x-monocloud-path', '/custom');

    jest.mock('next/navigation', () => ({
      redirect: (url: URL) => {
        expect(url.toString()).toBe(
          'https://example.org/api/auth/signin?return_url=%2Foverrides'
        );
      },
    }));

    const protectedComponent = protectPage(Component(), {
      returnUrl: '/overrides',
    });

    try {
      await protectedComponent({});
    } catch (error) {
      expect(error.message).toBe('NEXT_REDIRECT');
    }
  });

  describe('groups', () => {
    it('should render the protected component if user belongs to any of the listed groups', async () => {
      await setSessionCookie(req, undefined, userWithGroupsSessionCookieValue);

      const protectedComponent = protectPage(Component(false), {
        groups: ['test'],
      });

      const componentResult = await protectedComponent({});

      expect(componentResult.type).toBe('div');
      expect(componentResult.props.children).toBe('Great Success!!!');
    });

    it('can customize the groups claim', async () => {
      await setSessionCookie(req, undefined, {
        ...defaultSessionCookieValue,
        user: { ...defaultSessionCookieValue.user, CUSTOM_GROUPS: ['test'] },
      });

      const protectedComponent = protectPage(Component(false), {
        groups: ['test'],
        groupsClaim: 'CUSTOM_GROUPS',
      });

      const componentResult = await protectedComponent({});

      expect(componentResult.type).toBe('div');
      expect(componentResult.props.children).toBe('Great Success!!!');
    });

    it('should not render the protected component if user does not belongs to any of the listed groups', async () => {
      await setSessionCookie(req, undefined, userWithGroupsSessionCookieValue);

      const protectedComponent = protectPage(Component(false), {
        groups: ['NOPE'],
      });

      const componentResult = await protectedComponent({});

      expect(componentResult).toBe('You are not allowed to visit this page');
    });

    it('can set custom onAccessDenied component', async () => {
      await setSessionCookie(req, undefined, userWithGroupsSessionCookieValue);

      const protectedComponent = protectPage(Component(false), {
        groups: ['NOPE'],
        onAccessDenied: () => 'Custom ERROR' as unknown as JSX.Element,
      });

      const componentResult = await protectedComponent({});

      expect(componentResult).toBe('Custom ERROR');
    });
  });
});
