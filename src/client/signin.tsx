/* eslint-disable react/jsx-props-no-spreading */
import { Authenticators } from '@monocloud/node-auth-core';
import React from 'react';

interface SignInProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  children: React.ReactNode;
  authenticator?: Authenticators;
  loginHint?: string;
  returnUrl?: string;
}

export const SignIn: React.FC<SignInProps> = ({
  children,
  authenticator,
  loginHint,
  returnUrl,
  ...props
}) => {
  const signInUrl =
    process.env.NEXT_PUBLIC_MONOCLOUD_AUTH_SIGN_IN_URL ??
    // eslint-disable-next-line no-underscore-dangle
    `${process.env.__NEXT_ROUTER_BASEPATH ?? ''}/api/auth/signin`;

  const query = new URLSearchParams();

  if (authenticator) {
    query.set('authenticator', authenticator);
  }

  if (loginHint) {
    query.set('login_hint', loginHint);
  }

  if (returnUrl) {
    query.set('return_url', returnUrl);
  }

  return (
    <a
      href={`${signInUrl}${query.size ? `?${query.toString()}` : ''}`}
      {...props}
    >
      {children}
    </a>
  );
};
