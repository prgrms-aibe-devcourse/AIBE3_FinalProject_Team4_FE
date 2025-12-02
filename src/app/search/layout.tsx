import { Suspense } from 'react';
import SearchLayoutClient from './SearchLayoutClient';

export default function SearchLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={null}>
      <SearchLayoutClient>{children}</SearchLayoutClient>
    </Suspense>
  );
}
