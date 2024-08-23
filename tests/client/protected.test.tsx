/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable import/no-extraneous-dependencies */
import { render, waitFor } from '@testing-library/react';
import React from 'react';
import { fetchOkGroups, wrapper } from '../client-helper';
import { Protected } from '../../src/components/client/protected';

export const ProtectedComponent = ({
  groups,
  groupsClaim,
  onAccessDenied,
}: {
  groups: string[];
  groupsClaim?: string;
  onAccessDenied?: React.ReactNode;
}) => {
  return (
    <Protected
      groups={groups}
      groupsClaim={groupsClaim}
      onAccessDenied={onAccessDenied}
    >
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
      render(<ProtectedComponent groups={[]} />);
      throw new Error();
    } catch (error) {
      expect(error.message).toContain(
        'useUser() can only be used inside <MonoCloudAuthProvider>...</MonoCloudAuthProvider>.'
      );
    }
  });

  it('should render the protected component if user belong to any of the specified groups', async () => {
    fetchOkGroups();

    const { container } = render(<ProtectedComponent groups={['testName']} />, {
      wrapper,
    });

    await waitFor(() => {
      expect(container.textContent).toContain('Great Success!!!');
    });
  });

  it('should not render the protected component inside if user does not belong to any of the specified groups', async () => {
    fetchOkGroups();

    const { container } = render(<ProtectedComponent groups={['NOPE']} />, {
      wrapper,
    });

    await waitFor(() => {
      expect(container.textContent).not.toContain('Great Success!!!');
    });
  });

  it('should render onAccessDenied if the the user does not belong to any groups', async () => {
    fetchOkGroups();

    const { container } = render(
      <ProtectedComponent
        groups={['NOPE']}
        onAccessDenied={<>Great Failure!!!</>}
      />,
      {
        wrapper,
      }
    );

    await waitFor(() => {
      expect(container.textContent).toContain('Great Failure!!!');
    });
  });

  it('should be able to customize the groups claim', async () => {
    fetchOkGroups();

    const { container } = render(
      <ProtectedComponent groups={['testId']} groupsClaim="CUSTOM_GROUPS" />,
      {
        wrapper,
      }
    );

    await waitFor(() => {
      expect(container.textContent).toContain('Great Success!!!');
    });
  });
});
