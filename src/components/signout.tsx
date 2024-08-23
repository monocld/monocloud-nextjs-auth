/* eslint-disable react/jsx-props-no-spreading */
import React from 'react';

interface SignOutProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  children: React.ReactNode;
  postLogoutUrl?: string;
}

export const SignOut: React.FC<SignOutProps> = ({
  children,
  postLogoutUrl,
  ...props
}) => {
  const signOutUrl =
    process.env.NEXT_PUBLIC_MONOCLOUD_AUTH_SIGN_OUT_URL ??
    // eslint-disable-next-line no-underscore-dangle
    `${process.env.__NEXT_ROUTER_BASEPATH ?? ''}/api/auth/signout`;

  const query = new URLSearchParams();

  if (postLogoutUrl) {
    query.set('post_logout_url', postLogoutUrl);
  }

  return (
    <a
      href={`${signOutUrl}${query.size ? `?${query.toString()}` : ''}`}
      {...props}
    >
      {children}
    </a>
  );
};
