import { Suspense } from 'react';
import ShorlogSearchPageClient from './ShorlogSearchPageClient';

export default function Page() {
  return (
    <Suspense fallback={null}>
      <ShorlogSearchPageClient />
    </Suspense>
  );
}
