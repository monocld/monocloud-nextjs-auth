/* eslint-disable react/prop-types */
/* eslint-disable react/jsx-no-useless-fragment */
import { isUserInGroup } from '@monocloud/node-auth-core';
import React from 'react';
import { getSession } from '../instance/initialize';
import { ProtectedComponent } from '../types';

export const Protected: ProtectedComponent = async ({
  children,
  groups,
  groupsClaim,
  onAccessDenied = null,
}) => {
  const session = await getSession();

  if (!session) {
    return null;
  }

  return (
    <>
      {isUserInGroup(
        session.user,
        groups,
        groupsClaim?.trim() ||
          process.env.NEXT_PUBLIC_MONOCLOUD_AUTH_GROUPS_CLAIM
      )
        ? children
        : onAccessDenied}
    </>
  );
};
