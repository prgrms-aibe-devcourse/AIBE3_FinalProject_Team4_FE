import { Suspense } from 'react';
import BlogSearchPageClient from './BlogSearchPageClient';

export default function Page() {
  return (
    <Suspense fallback={null}>
      <BlogSearchPageClient />
    </Suspense>
  );
}
