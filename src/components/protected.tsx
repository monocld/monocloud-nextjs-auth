/* eslint-disable react/jsx-no-useless-fragment */
import React from 'react';
import { ProtectedComponentProps } from '../types';
import { getSession } from '../instance/initialize';

export const Protected: React.FC<ProtectedComponentProps> = async ({
  children,
  onAccessDenied = null,
}) => {
  const session = await getSession();

  if (!session) {
    if (onAccessDenied) {
      return <>{onAccessDenied}</>;
    }

    return null;
  }

  return <>{children}</>;
};
