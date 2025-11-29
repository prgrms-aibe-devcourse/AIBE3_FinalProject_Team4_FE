import { Suspense } from 'react';
import UserSearchPageClient from './UserSearchPageClient';

export default function Page() {
  return (
    <Suspense fallback={null}>
      <UserSearchPageClient />
    </Suspense>
  );
}
