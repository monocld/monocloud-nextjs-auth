/* eslint-disable react/prop-types */
/* eslint-disable react/jsx-no-useless-fragment */
import { isUserInGroup } from '@monocloud/node-auth-core';
import React from 'react';
import { ProtectedComponentProps } from '../types';
import { getSession } from '../instance/initialize';

export const Protected: React.FC<ProtectedComponentProps> = async ({
  children,
  groups,
  groupsClaim,
  matchAllGroups = false,
  onAccessDenied = null,
}) => {
  const session = await getSession();

  if (!session) {
    if (onAccessDenied) {
      return <>{onAccessDenied}</>;
    }

    return null;
  }

  return (
    <>
      {!groups ||
      isUserInGroup(
        session.user,
        groups,
        groupsClaim ?? process.env.NEXT_PUBLIC_MONOCLOUD_AUTH_GROUPS_CLAIM,
        matchAllGroups
      )
        ? children
        : onAccessDenied}
    </>
  );
};
