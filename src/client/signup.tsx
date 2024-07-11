/* eslint-disable react/jsx-props-no-spreading */
import React from 'react';

interface SignUpProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  children: React.ReactNode;
  returnUrl?: string;
}

export const SignUp: React.FC<SignUpProps> = ({
  children,
  returnUrl,
  ...props
}) => {
  const signInUrl =
    process.env.NEXT_PUBLIC_MONOCLOUD_AUTH_SIGN_IN_URL ??
    // eslint-disable-next-line no-underscore-dangle
    `${process.env.__NEXT_ROUTER_BASEPATH ?? ''}/api/auth/signin`;

  const query = new URLSearchParams();

  query.set('register', 'true');

  if (returnUrl) {
    query.set('return_url', returnUrl);
  }

  return (
    <a href={`${signInUrl}?${query.toString()}`} {...props}>
      {children}
    </a>
  );
};
