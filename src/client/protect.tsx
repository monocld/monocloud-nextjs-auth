/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable react/jsx-no-useless-fragment */

'use client';

import React, { ComponentType, useEffect } from 'react';
import type { MonoCloudUser } from '@monocloud/node-auth-core';
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

export const redirectToSignIn = (returnUrl?: string) => {
  const encodedReturnUrl = encodeURIComponent(
    returnUrl ?? window.location.toString()
  );
  window.location.assign(
    // eslint-disable-next-line no-underscore-dangle
    `${process.env.NEXT_PUBLIC_MONOCLOUD_AUTH_SIGN_IN_URL ?? `${process.env.__NEXT_ROUTER_BASEPATH ?? ''}/api/auth/signin`}?return_url=${encodedReturnUrl}`
  );
};

/* c8 ignore start */
const handlePageError = (error: Error, options?: ProtectPageOptions) => {
  if (options?.onError) {
    return options.onError(error);
  }

  throw error;
};
/* c8 ignore end */

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
