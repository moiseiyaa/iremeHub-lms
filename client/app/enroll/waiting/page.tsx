export const dynamic = 'force-dynamic';

import { Suspense } from 'react';
import WaitingClient from './WaitingClient';

export default function WaitingPage(){
 return <Suspense fallback={<div className="ih-container py-24"><div className="ih-skeleton h-[320px] max-w-2xl mx-auto"/></div>}><WaitingClient/></Suspense>;
}
