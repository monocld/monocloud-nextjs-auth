'use client';

/* eslint-disable @typescript-eslint/no-redeclare */
/* eslint-disable react/jsx-no-useless-fragment */

import { type FunctionComponent, useEffect } from 'react';
import { redirectToSignIn } from './protect';
import type { RedirectToSignInProps } from '../types';

/**
 * A client side component that will redirect users to the sign in page.
 *
 * @type RedirectToSignInProps
 */
export const RedirectToSignIn: FunctionComponent<RedirectToSignInProps> = ({
  returnUrl,
}) => {
  useEffect(() => {
    redirectToSignIn(returnUrl);
  }, [returnUrl]);
  return null;
};
