'use client';

import { Heart, MessageCircle } from 'lucide-react';
import Sidebar from './components/SideBar';

export default function CatGalleryPage() {
  const catPosts = [
    {
      id: 1,
      image: 'https://images.unsplash.com/photo-1574158622682-e40e69881006?w=400&h=400&fit=crop',
      username: 'karpas762',
      likes: 123,
      comments: 8,
      caption: '우리 집 고양이가 자는 상태 은 애 같아요ㅋㅋ',
    },
    {
      id: 2,
      image: 'https://images.unsplash.com/photo-1573865526739-10c1dd7e9ba0?w=400&h=400&fit=crop',
      username: 'karpas762',
      likes: 123,
      comments: 8,
      caption: '우리 집 고양이가 오늘 싫냐 우 애 같아요ㅋㅋ',
    },
    {
      id: 3,
      image: 'https://images.unsplash.com/photo-1592194996308-7b43878e84a6?w=400&h=400&fit=crop',
      username: 'karpas762',
      likes: 123,
      comments: 8,
      caption: '세계 3시에 강아지 머리 토이 하이나다는',
    },
  ];

  return (
    <div className="flex h-screen bg-white">
      <Sidebar />

      {/* 메인 콘텐츠 - 스크롤 가능 */}
      <div className="ml-60 flex-1 overflow-y-auto bg-gray-50">
        {/* 헤더 */}
        <div className="bg-white border-b border-gray-200 p-6 sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">쇼로그</h1>
            </div>
          </div>
        </div>

        {/* 갤러리 그리드 */}
        <div className="p-6">
          <div className="grid grid-cols-3 gap-4">
            {catPosts.map((post) => (
              <div
                key={post.id}
                className="bg-white rounded-xl overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow cursor-pointer"
              >
                {/* 이미지 */}
                <div className="relative aspect-square bg-gray-100">
                  <img src={post.image} alt="Cat" className="w-full h-full object-cover" />
                  {/* 프로필 오버레이 */}
                  <div className="absolute bottom-3 left-3 flex items-center gap-2">
                    <div className="w-8 h-8 bg-white rounded-full border-2 border-white overflow-hidden">
                      <img src={post.image} alt="Profile" className="w-full h-full object-cover" />
                    </div>
                  </div>
                </div>

                {/* 정보 */}
                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-sm">{post.username}</span>
                    <span className="text-xs text-gray-500">#고양이 #육아중독</span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                    <div className="flex items-center gap-1">
                      <Heart size={16} />
                      <span>{post.likes}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MessageCircle size={16} />
                      <span>{post.comments}</span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-700 line-clamp-2">{post.caption}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
