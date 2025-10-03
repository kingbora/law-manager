'use client';

import React from 'react';

import RequireAuth from '../../components/RequireAuth';
import DashboardShell from '../../components/dashboard/DashboardShell';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RequireAuth>
      <DashboardShell>{children}</DashboardShell>
    </RequireAuth>
  );
}
