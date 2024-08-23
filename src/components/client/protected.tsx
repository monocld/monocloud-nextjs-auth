/* eslint-disable react/prop-types */
/* eslint-disable react/jsx-no-useless-fragment */
import { isUserInGroup } from '@monocloud/node-auth-core';
import React from 'react';
import { useUser } from '../../client';
import { ProtectedComponent } from '../../types';

export const Protected: ProtectedComponent = ({
  children,
  groups,
  groupsClaim,
  onAccessDenied = null,
}) => {
  const { isLoading, error, isAuthenticated, user } = useUser();

  if (isLoading || error || !isAuthenticated || !user) {
    return null;
  }

  return (
    <>
      {isUserInGroup(
        user,
        groups,
        groupsClaim?.trim() ||
          process.env.NEXT_PUBLIC_MONOCLOUD_AUTH_GROUPS_CLAIM
      )
        ? children
        : onAccessDenied}
    </>
  );
};
