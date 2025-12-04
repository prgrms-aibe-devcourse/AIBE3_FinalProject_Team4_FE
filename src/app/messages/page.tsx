import { Suspense } from 'react';
import MessagesShell from './MessagesShell';

export default function MessagesPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <MessagesShell />
    </Suspense>
  );
}
