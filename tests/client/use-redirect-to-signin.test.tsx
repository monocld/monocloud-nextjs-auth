/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable import/no-extraneous-dependencies */
import { render, waitFor } from '@testing-library/react';
import React from 'react';
import { fetchNoContent, wrapper } from '../client-helper';
import { RedirectToSignIn, useUser } from '../../src/client';

export const Component = () => {
  const { user } = useUser();
  if (!user) {
    return <RedirectToSignIn />;
  }
  return <p>Great Success!!!</p>;
};

describe('<RedirectToSignIn/>', () => {
  beforeAll(() => {
    Object.defineProperty(window, 'location', {
      writable: true,
      value: {
        assign: jest.fn(),
        toString: () => 'https://example.org',
      },
    });
  });

  it('should redirect to the sign in endpoint', async () => {
    const ogFetch = global.fetch;

    fetchNoContent();

    const { container } = render(<Component />, { wrapper });

    await waitFor(() => {
      expect(window.location.assign).toHaveBeenCalledWith(
        '/api/auth/signin?return_url=https%3A%2F%2Fexample.org'
      );
      expect(container.textContent).not.toContain('Great Success!!!');
    });

    global.fetch = ogFetch;
  });
});
