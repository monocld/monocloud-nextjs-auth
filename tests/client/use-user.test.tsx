/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable import/no-extraneous-dependencies */
import { renderHook, waitFor } from '@testing-library/react';
import { useUser } from '../../src/client';
import { fetch500, fetchNoContent, fetchOk, wrapper } from '../client-helper';

describe('useUser()', () => {
  let ogFetch: any;
  beforeEach(() => {
    ogFetch = global.fetch;
  });

  afterEach(() => {
    global.fetch = ogFetch;
  });

  it('should return the default value if MonoCloudAuthProvider is not setup', () => {
    const { result } = renderHook(() => useUser());

    expect(result.current).toEqual({
      isAuthenticated: false,
      isLoading: true,
      user: undefined,
      error: undefined,
    });
  });

  it('should return error if the server responded with an error', async () => {
    fetch500();

    const { result } = renderHook(() => useUser(), {
      wrapper,
    });

    await waitFor(() => {
      expect(result.current.error).toBeInstanceOf(Error);
      expect(result.current.error?.message).toBe('Failed to fetch user');
    });
  });

  it('should get the user when the server responds with a success', async () => {
    fetchOk();

    const { result } = renderHook(() => useUser(), {
      wrapper,
    });

    await waitFor(() => {
      expect(result.current).toEqual({
        error: undefined,
        user: { sub: 'sub', email: 'a@b.com' },
        isAuthenticated: true,
        isLoading: false,
      });
    });
  });

  it('should return unauthenticated if response from userinfo is 204', async () => {
    fetchNoContent();

    const { result } = renderHook(() => useUser(), {
      wrapper,
    });

    await waitFor(() => {
      expect(result.current).toEqual({
        error: undefined,
        user: undefined,
        isAuthenticated: false,
        isLoading: false,
      });
    });
  });
});
