import React from 'react';
import { NextRequest } from 'next/server';
import { monoCloudAuth, redirectToSignIn } from '../../../src';
import { setSessionCookie } from '../../common-helper';

const Component = async () => {
  await redirectToSignIn();
  return React.createElement('div', {}, 'Great Success!!!');
};

describe('redirectToSignIn() - App Router', () => {
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

    const componentResult: JSX.Element = await Component();

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

    try {
      await Component();
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

    try {
      await Component();
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

    const ComponentWithRedirect = async () => {
      await redirectToSignIn('/overrides');
      return React.createElement('div', {}, 'Great Success!!!');
    };

    try {
      await ComponentWithRedirect();
    } catch (error) {
      expect(error.message).toBe('NEXT_REDIRECT');
    }
  });
});
