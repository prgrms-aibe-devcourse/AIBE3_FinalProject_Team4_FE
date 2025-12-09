'use client';

import { deleteBlog } from '@/src/api/blogDetail';
import { showGlobalToast } from '@/src/lib/toastStore';
import { BlogDetailDto } from '@/src/types/blog';
import { useRouter } from 'next/navigation';
import BlogDetailClient from '../../components/blogs/detail/BlogDetailClient';

export function BlogDetailClientWrapper(props: {
  initialData: BlogDetailDto;
  isOwner: boolean;
  initialIsFollowing: boolean;
}) {
  const router = useRouter();

  const handleDelete = async () => {
    if (!confirm('정말 삭제하시겠습니까?')) return;
    try {
      await deleteBlog(props.initialData.id);
      router.replace('/blogs');
    } catch (e) {
      console.error(e);
      showGlobalToast('삭제 중 오류가 발생했습니다.', 'error');
    }
  };

  const handleEdit = () => {
    router.push(`/blogs/${props.initialData.id}/edit`);
  };

  return (
    <BlogDetailClient
      initialData={props.initialData}
      isOwner={props.isOwner}
      initialIsFollowing={props.initialIsFollowing}
      onDelete={handleDelete}
      onEdit={handleEdit}
    />
  );
}
