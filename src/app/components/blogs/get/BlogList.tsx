import { BlogCard } from '@/src/app/components/blogs/get/BlogCard';
import type { BlogSummary } from '@/src/types/blog';

type BlogListProps = {
  blogs: BlogSummary[];
};

export function BlogList({ blogs }: BlogListProps) {
  if (blogs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white/60 py-16 text-center">
        <p className="text-sm font-medium text-slate-700">아직 검색 결과가 없어요.</p>
        <p className="mt-1 text-xs text-slate-500">다른 키워드로 검색해 보세요.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {blogs.map((blog) => (
        <BlogCard key={blog.id} blog={blog} />
      ))}
    </div>
  );
}
