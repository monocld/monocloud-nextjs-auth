/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable import/no-extraneous-dependencies */
import { render, waitFor } from '@testing-library/react';
import React from 'react';
import { Component, fetchNoContent, wrapper } from '../client-helper';
import { protectPage } from '../../src/client';

describe('protectPage() - CSR - NEXT_PUBLIC_MONOCLOUD_AUTH_SIGN_IN_URL', () => {
  beforeAll(() => {
    Object.defineProperty(window, 'location', {
      writable: true,
      value: {
        assign: jest.fn(),
        toString: () => 'https://example.org',
      },
    });
  });

  it('should redirect to the custom auth endpoint set through the env', async () => {
    process.env.NEXT_PUBLIC_MONOCLOUD_AUTH_SIGN_IN_URL = '/test';

    fetchNoContent();

    const ProtectedComponent = protectPage(Component);

    const { container } = render(<ProtectedComponent />, { wrapper });

    await waitFor(() => {
      expect(window.location.assign).toHaveBeenCalledWith(
        '/test?return_url=https%3A%2F%2Fexample.org'
      );
      expect(container.textContent).not.toContain('Great Success!!!');
    });
  });
});
