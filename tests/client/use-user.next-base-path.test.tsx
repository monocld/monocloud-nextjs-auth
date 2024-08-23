import { renderHook, waitFor } from '@testing-library/react';
import { useUser } from '../../src/client';
import { fetchOk, wrapper } from '../client-helper';

describe('useUser() - Base Path', () => {
  it('should pickup base path from __NEXT_ROUTER_BASEPATH', async () => {
    // eslint-disable-next-line no-underscore-dangle
    process.env.__NEXT_ROUTER_BASEPATH = '/test';

    fetchOk('/test/api/auth/userinfo');

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
});
