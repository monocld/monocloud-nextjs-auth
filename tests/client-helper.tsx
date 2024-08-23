/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { MonoCloudAuthProvider } from '../src/client';

export const wrapper = ({ children }: any) => (
  <MonoCloudAuthProvider>{children}</MonoCloudAuthProvider>
);

export const Component = ({ user }: any) => {
  expect(user).toEqual({ sub: 'sub', email: 'a@b.com' });
  return <p>Great Success!!!</p>;
};

export const fetch500 = () => {
  (global as any).fetch = jest.fn((url: string) => {
    expect(url).toBe('/api/auth/userinfo');
    return {
      status: 500,
      ok: false,
    };
  });
};

export const fetchOk = (expectedUrl = '/api/auth/userinfo') => {
  (global as any).fetch = jest.fn((url: string) => {
    expect(url).toBe(expectedUrl);
    return {
      status: 200,
      ok: true,
      json: () =>
        Promise.resolve({
          sub: 'sub',
          email: 'a@b.com',
        }),
    };
  });
};

export const fetchOkGroups = () => {
  (global as any).fetch = jest.fn((url: string) => {
    expect(url).toBe('/api/auth/userinfo');
    return {
      status: 200,
      ok: true,
      json: () =>
        Promise.resolve({
          sub: 'sub',
          email: 'a@b.com',
          groups: [{ id: 'testId', name: 'testName' }],
          CUSTOM_GROUPS: [{ id: 'testId', name: 'testName' }],
        }),
    };
  });
};

export const fetchNoContent = (expectedUrl = '/api/auth/userinfo') => {
  (global as any).fetch = jest.fn((url: string) => {
    expect(url).toBe(expectedUrl);
    return {
      status: 204,
      ok: true,
    };
  });
};
