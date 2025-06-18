export const dynamic = 'force-dynamic';

import { Suspense } from 'react';
import AdminUsersClient from './AdminUsersClient';

export default function AdminUsersPage() {
  return (
    <Suspense fallback={<div className="p-6">Loading users…</div>}>
      <AdminUsersClient />
    </Suspense>
  );
}