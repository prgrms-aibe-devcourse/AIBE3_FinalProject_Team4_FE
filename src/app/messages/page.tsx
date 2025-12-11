import { Suspense } from 'react';
import MessagesShell from './MessagesShell';

export default function MessagesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-sky-50/40 to-slate-50">
      <Suspense fallback={<div>Loading...</div>}>
        <MessagesShell />
      </Suspense>
    </div>
  );
}
