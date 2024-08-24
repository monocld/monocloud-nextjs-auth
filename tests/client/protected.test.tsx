/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable import/no-extraneous-dependencies */
import { render, waitFor } from '@testing-library/react';
import React from 'react';
import { fetch500, fetchNoContent, fetchOk, wrapper } from '../client-helper';
import { Protected } from '../../src/components/client/protected';

export const ProtectedComponent = ({
  onAccessDenied,
}: {
  onAccessDenied?: React.ReactNode;
}) => {
  return (
    <Protected onAccessDenied={onAccessDenied}>
      <p>Great Success!!!</p>
    </Protected>
  );
};

describe('<Protected/> (Client)', () => {
  let ogFetch: any;
  beforeEach(() => {
    ogFetch = global.fetch;
  });

  afterEach(() => {
    global.fetch = ogFetch;
  });

  it('should throw error if not used inside <MonoCloudAuthProvider />', () => {
    try {
      render(<ProtectedComponent />);
      throw new Error();
    } catch (error) {
      expect(error.message).toContain(
        'useUser() can only be used inside <MonoCloudAuthProvider>...</MonoCloudAuthProvider>.'
      );
    }
  });

  it('should render the protected component if user is authenticated', async () => {
    fetchOk();

    const { container } = render(<ProtectedComponent />, {
      wrapper,
    });

    await waitFor(() => {
      expect(container.textContent).toContain('Great Success!!!');
    });
  });

  it('should not render the protected component inside if user is not authenticated', async () => {
    fetchNoContent();

    const { container } = render(<ProtectedComponent />, {
      wrapper,
    });

    await waitFor(() => {
      expect(container.textContent).not.toContain('Great Success!!!');
    });
  });

  it('should not render the protected component inside if there was an authentication error', async () => {
    fetch500();

    const { container } = render(<ProtectedComponent />, {
      wrapper,
    });

    await waitFor(() => {
      expect(container.textContent).not.toContain('Great Success!!!');
    });
  });

  it('should render onAccessDenied if the user is not authenticated', async () => {
    fetchNoContent();

    const { container } = render(
      <ProtectedComponent onAccessDenied={<>Great Failure!!!</>} />,
      {
        wrapper,
      }
    );

    await waitFor(() => {
      expect(container.textContent).toContain('Great Failure!!!');
    });
  });

  it('should render onAccessDenied if there was an authentication error', async () => {
    fetch500();

    const { container } = render(
      <ProtectedComponent onAccessDenied={<>Great Failure!!!</>} />,
      {
        wrapper,
      }
    );

    await waitFor(() => {
      expect(container.textContent).toContain('Great Failure!!!');
    });
  });
});
