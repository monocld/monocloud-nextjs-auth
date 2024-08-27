/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable import/no-extraneous-dependencies */
import { render, waitFor } from '@testing-library/react';
import React from 'react';
import {
  Component,
  fetch500,
  fetchNoContent,
  fetchOk,
  fetchOkGroups,
  wrapper,
} from '../client-helper';
import { protectPage } from '../../src/client';

describe('protectPage() - CSR', () => {
  beforeAll(() => {
    Object.defineProperty(window, 'location', {
      writable: true,
      value: {
        assign: jest.fn(),
        toString: () => 'https://example.org',
      },
    });
  });

  let ogFetch: any;
  beforeEach(() => {
    ogFetch = global.fetch;
  });

  afterEach(() => {
    global.fetch = ogFetch;
  });

  it('should redirect the to sign in endpoint if the user is not authenticated', async () => {
    fetchNoContent();

    const ProtectedComponent = protectPage(Component());

    const { container } = render(<ProtectedComponent />, { wrapper });

    await waitFor(() => {
      expect(window.location.assign).toHaveBeenCalledWith(
        '/api/auth/signin?return_url=https%3A%2F%2Fexample.org'
      );
      expect(container.textContent).not.toContain('Great Success!!!');
    });
  });

  it('can set custom onAccessDenied component if user is not authenticated', async () => {
    fetchNoContent();

    const ProtectedComponent = protectPage(Component(false), {
      onAccessDenied: () => <p>CUSTOM</p>,
    });

    const { container } = render(<ProtectedComponent />, { wrapper });

    await waitFor(() => {
      const components = container.querySelectorAll('p');
      const para = components.item(0);

      expect(components.length).toBe(1);
      expect(para.textContent).toBe('CUSTOM');
    });
  });

  it('should render the component if user is authenticated', async () => {
    fetchOk();

    const ProtectedComponent = protectPage(Component());

    const { container } = render(<ProtectedComponent />, { wrapper });

    await waitFor(() => {
      const components = container.querySelectorAll('p');
      const para = components.item(0);

      expect(components.length).toBe(1);
      expect(para.textContent).toBe('Great Success!!!');
    });
  });

  it('should redirect with return url set in the options', async () => {
    fetchNoContent();

    const ProtectedComponent = protectPage(Component(), { returnUrl: '/test' });

    const { container } = render(<ProtectedComponent />, { wrapper });

    await waitFor(() => {
      expect(window.location.assign).toHaveBeenCalledWith(
        '/api/auth/signin?return_url=%2Ftest'
      );
      expect(container.textContent).not.toContain('Great Success!!!');
    });
  });

  it('should display onError component', async () => {
    fetch500();

    const ProtectedComponent = protectPage(Component(), {
      onError: () => <strong>Error</strong>,
    });

    const { container } = render(<ProtectedComponent />, { wrapper });

    await waitFor(() => {
      const components = container.querySelectorAll('strong');
      const strong = components.item(0);

      expect(components.length).toBe(1);
      expect(strong.textContent).toBe('Error');
      expect(container.textContent).not.toContain('Great Success!!!');
    });
  });

  it('should render the component if the user belong to any of the specified groups', async () => {
    fetchOkGroups();

    const ProtectedComponent = protectPage(Component(false), {
      groups: ['testName'],
    });

    const { container } = render(<ProtectedComponent />, { wrapper });

    await waitFor(() => {
      const components = container.querySelectorAll('p');
      const para = components.item(0);

      expect(components.length).toBe(1);
      expect(para.textContent).toBe('Great Success!!!');
    });
  });

  it('can customize groups claim', async () => {
    fetchOkGroups();

    const ProtectedComponent = protectPage(Component(false), {
      groups: ['testName'],
      groupsClaim: 'CUSTOM_GROUPS',
    });

    const { container } = render(<ProtectedComponent />, { wrapper });

    await waitFor(() => {
      const components = container.querySelectorAll('p');
      const para = components.item(0);

      expect(components.length).toBe(1);
      expect(para.textContent).toBe('Great Success!!!');
    });
  });

  it('should not render the component if the user does not belong to any of the specified groups', async () => {
    fetchOkGroups();

    const ProtectedComponent = protectPage(Component(false), {
      groups: ['NOPE'],
    });

    const { container } = render(<ProtectedComponent />, { wrapper });

    await waitFor(() => {
      const components = container.querySelectorAll('div');
      const para = components.item(0);

      expect(components.length).toBe(1);
      expect(para.textContent).toBe('Access Denied');
    });
  });

  it('can set custom onAccessDenied component', async () => {
    fetchOkGroups();

    const ProtectedComponent = protectPage(Component(false), {
      groups: ['NOPE'],
      onAccessDenied: () => <p>CUSTOM</p>,
    });

    const { container } = render(<ProtectedComponent />, { wrapper });

    await waitFor(() => {
      const components = container.querySelectorAll('p');
      const para = components.item(0);

      expect(components.length).toBe(1);
      expect(para.textContent).toBe('CUSTOM');
    });
  });
});
