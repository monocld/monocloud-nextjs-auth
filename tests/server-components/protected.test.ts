import React, { ReactElement } from 'react';
import { NextRequest } from 'next/server';
import { monoCloudAuth } from '../../src';
import { Protected } from '../../src/components/protected';
import { setSessionCookie } from '../common-helper';

const ProtectedComponent = ({
  onAccessDenied,
}: {
  onAccessDenied?: React.ReactNode;
}) => {
  return Protected({
    onAccessDenied,
    children: [React.createElement('div', {}, 'Great Success!!!')],
  }) as unknown as Promise<ReactElement>;
};

describe('<Protected/> - App Router (Server)', () => {
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

  it('should render the protected component if the user is authenticated', async () => {
    await setSessionCookie(req, undefined, {
      user: {
        sub: 'sub',
        groups: [{ id: 'testId', name: 'testName' }],
      },
    });

    const result = await ProtectedComponent({});

    expect(result.props.children[0].props.children).toBe('Great Success!!!');
  });

  it('should not render the protected component when there is no session', async () => {
    const result = await ProtectedComponent({});

    expect(result).toBeNull();
  });

  it('should render on accessDenied when the user does not have a session', async () => {
    const result = await ProtectedComponent({
      onAccessDenied: React.createElement('div', {}, 'Great Failure!!!'),
    });

    expect(result.props.children.props.children).toBe('Great Failure!!!');
  });
});
