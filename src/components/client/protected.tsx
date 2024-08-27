/* eslint-disable react/prop-types */
/* eslint-disable react/jsx-no-useless-fragment */
import { isUserInGroup } from '@monocloud/node-auth-core';
import React from 'react';
import { useUser } from '../../client';
import { ProtectedComponentProps } from '../../types';

export const Protected: React.FC<ProtectedComponentProps> = ({
  children,
  groups,
  groupsClaim,
  matchAllGroups = false,
  onAccessDenied = null,
}) => {
  const { isLoading, error, isAuthenticated, user } = useUser();

  if (isLoading) {
    return null;
  }

  if (error || !isAuthenticated || !user) {
    if (onAccessDenied) {
      return <>{onAccessDenied}</>;
    }

    return null;
  }

  return (
    <>
      {!groups ||
      isUserInGroup(
        user,
        groups,
        groupsClaim ?? process.env.NEXT_PUBLIC_MONOCLOUD_AUTH_GROUPS_CLAIM,
        matchAllGroups
      )
        ? children
        : onAccessDenied}
    </>
  );
};
