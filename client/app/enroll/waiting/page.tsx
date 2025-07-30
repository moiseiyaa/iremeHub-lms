// Server-side wrapper for client-only dialog
export const dynamic = 'force-dynamic';

import { Suspense } from 'react';
import dynamicImport from 'next/dynamic';

const WaitingClient = dynamicImport(() => import('./WaitingClient'), { ssr: false });

export default function WaitingPage() {
  return (
    <Suspense>
      <WaitingClient />
    </Suspense>
  );
}


