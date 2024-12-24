/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable react/jsx-no-useless-fragment */

'use client';

import React, { ComponentType, useEffect, JSX } from 'react';
import { isUserInGroup, type MonoCloudUser } from '@monocloud/node-auth-core';
import { useUser } from './monocloud-auth-provider';
import { GroupOptions } from '../types';

/**
 * Options for configuring page protection.
 */
export type ProtectPageOptions = {
  /**
   * Specifies the URL to redirect to after authentication.
   */
  returnUrl?: string;

  /**
   * A custom react element to render when the user is not authenticated or is not a member of the specified groups.
   */
  onAccessDenied?: (user?: MonoCloudUser) => JSX.Element;

  /**
   * Callback function to handle errors.
   * If not provided, errors will be thrown.
   *
   * @param error - The error object.
   * @returns JSX element to handle the error.
   */
  onError?: (error: Error) => JSX.Element;
} & GroupOptions;

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
/* c8 ignore stop */

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
        if (options?.onAccessDenied) {
          return;
        }
        redirectToSignIn(options?.returnUrl);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user, isLoading]);

    if (error) {
      return handlePageError(error, options);
    }

    if (!user && !isLoading && options?.onAccessDenied) {
      return options.onAccessDenied();
    }

    if (user) {
      if (
        options?.groups &&
        !isUserInGroup(
          user,
          options.groups,
          options.groupsClaim ??
            process.env.NEXT_PUBLIC_MONOCLOUD_AUTH_GROUPS_CLAIM,
          options.matchAll
        )
      ) {
        const { onAccessDenied = () => <div>Access Denied</div> } = options;
        return onAccessDenied(user);
      }

      return <Component user={user} {...props} />;
    }

    return null;
  };
};
