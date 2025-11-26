import type { BlogSummary } from '@/src/types/blog';

type BlogDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function BlogDetailPage({ params }: BlogDetailPageProps) {
  const { id } = await params;

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="mx-auto w-full max-w-3xl px-4 pb-16 pt-10">
        <h1 className="text-2xl font-bold">블로그 상세 (id: {id})</h1>
      </div>
    </main>
  );
}
