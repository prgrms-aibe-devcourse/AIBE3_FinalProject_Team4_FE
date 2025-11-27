'use client';

import { getBlogById } from '@/src/api/blogApi';
import ImageSelector, { BlogImage } from '@/src/app/components/ImageSelector/ImageSelector';
import { useEffect, useState } from 'react';

export default function BlogForm() {
  // TODO: 실제로는 초안 블로그 등록 후 받은 blogId를 사용하거나,
  // 수정 모드에서는 props/params로 받아온 blogId를 사용
  const blogId = '1';
  const [blogImages, setBlogImages] = useState<BlogImage[]>([]);

  // blogId로 블로그 정보 조회하여 images 배열 가져오기
  useEffect(() => {
    const fetchBlogImages = async () => {
      if (!blogId) return;

      try {
        const response = await getBlogById(blogId);
        if (response.ok) {
          const result = await response.json();
          setBlogImages(result.data?.images || []);
        }
      } catch (error) {
        console.error('블로그 이미지 조회 실패:', error);
      }
    };

    fetchBlogImages();
  }, [blogId]);

  return (
    <>
      {/* ... */}

      {/* 섬네일용 이미지 선택 */}
      <main className="w-full min-h-screen bg-gray-50 p-6">
        <h1 className="text-2xl font-bold mb-6">섬네일 이미지 선택</h1>
        <p className="text-sm text-slate-500 mb-6">
          블로그의 내용을 알려주는 이미지를 선택하거나 업로드하세요
        </p>
        <ImageSelector blogId={blogId} blogImages={blogImages} />
      </main>
    </>
  );
}
