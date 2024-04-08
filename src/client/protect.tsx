/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable react/jsx-no-useless-fragment */

'use client';

import React, { ComponentType, useEffect } from 'react';
import type { MonoCloudUser } from '@monocloud/node-auth-core-sdk';
import { useUser } from './monocloud-auth-provider';

/**
 * Options for configuring page protection.
 */
export interface ProtectPageOptions {
  /**
   * Specifies the URL to redirect to after authentication.
   */
  returnUrl?: string;

  /**
   * Callback function to handle errors.
   * If not provided, errors will be thrown.
   *
   * @param error - The error object.
   * @returns JSX element to handle the error.
   */
  onError?: (error: Error) => JSX.Element;
}

type ProtectPage = <P extends {}>(
  Component: ComponentType<P & { user: MonoCloudUser }>,
  options?: ProtectPageOptions
) => React.FC<P>;

const redirectToSignIn = (returnUrl?: string) => {
  const location = window.location.toString();
  const encodedReturnUrl = encodeURIComponent(
    returnUrl ?? (location.replace(new URL(location).origin, '') || '/')
  );
  window.location.assign(`/api/auth/signin?return_url=${encodedReturnUrl}`);
};

const handlePageError = (error: Error, options?: ProtectPageOptions) => {
  if (options?.onError) {
    return options.onError(error);
  }

  throw error;
};

/**
 * Function to protect a client rendered page component.
 * Ensures that only authenticated users can access the component.
 *
 * @param Component - The component to protect.
 * @param options - The options.
 * @returns Protected clinet rendered page component.
 */
export const protectPage: ProtectPage = (Component, options) => {
  return props => {
    const { user, error, isLoading } = useUser();

    useEffect(() => {
      if (!user && !isLoading && !error) {
        redirectToSignIn(options?.returnUrl);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user, isLoading]);

    if (error) {
      return handlePageError(error, options);
    }

    if (user) {
      return <Component user={user} {...props} />;
    }

    return null;
  };
};
