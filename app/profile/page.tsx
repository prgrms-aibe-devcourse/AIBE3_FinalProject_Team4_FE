// app/(routes)/profile/page.tsx
import SidebarNav from '@/app/components/SideBar';
import { ProfileContentTabs } from '@/app/components/profile/ProfileContentTabs';
import { ProfileHeader } from '@/app/components/profile/ProfileHeader';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: '프로필 - TexTok',
};

export type ShorlogPostType = 'short' | 'long';

export interface ShorlogPost {
  id: string;
  type: ShorlogPostType;
  title: string;
  excerpt: string;
  likes: number;
  comments: number;
  thumbnailUrl: string;
  createdAt: string; // ISO string
  popularityScore: number; // 정렬용 더미 필드
}

export interface ProfileInfo {
  id: string;
  nickname: string;
  bio: string;
  avatarUrl: string;
  followingCount: number;
  followerCount: number;
  likeCount: number;
}

const mockProfile: ProfileInfo = {
  id: '사용자 아이디',
  nickname: '사용자 닉네임',
  bio: '간단한 자기소개',
  avatarUrl:
    'https://images.pexels.com/photos/45201/kitty-cat-kitten-pet-45201.jpeg?auto=compress&cs=tinysrgb&w=400',
  followingCount: 2,
  followerCount: 73800000,
  likeCount: 1700000000,
};

const mockPosts: ShorlogPost[] = [
  {
    id: '1',
    type: 'short',
    title: '우리 집 고양이의 첫 상자 탐험',
    excerpt: '우리 집 고양이가 오늘 상자 안에 들어가서 안 나오고 울고 난리치는... (더 보기)',
    likes: 123,
    comments: 8,
    thumbnailUrl:
      'https://images.pexels.com/photos/45201/kitty-cat-kitten-pet-45201.jpeg?auto=compress&cs=tinysrgb&w=600',
    createdAt: '2025-11-20T10:00:00.000Z',
    popularityScore: 0.9,
  },
  {
    id: '2',
    type: 'short',
    title: '집사를 감시하는 야간 순찰대',
    excerpt: '새벽마다 내 방문 앞을 지키는 고양이. 대체 무슨 생각을 하는 걸까...',
    likes: 123,
    comments: 8,
    thumbnailUrl:
      'https://images.pexels.com/photos/617278/pexels-photo-617278.jpeg?auto=compress&cs=tinysrgb&w=600',
    createdAt: '2025-11-18T09:30:00.000Z',
    popularityScore: 0.7,
  },
  {
    id: '3',
    type: 'long',
    title: '고양이와 함께 사는 법: 첫 한 달 회고',
    excerpt:
      '입양 첫날부터 한 달 동안의 시행착오를 정리해 보았습니다. 사료 선택부터 모래 적응까지...',
    likes: 999,
    comments: 42,
    thumbnailUrl:
      'https://images.pexels.com/photos/1276553/pexels-photo-1276553.jpeg?auto=compress&cs=tinysrgb&w=600',
    createdAt: '2025-10-01T11:00:00.000Z',
    popularityScore: 1.0,
  },
];

export default function ProfilePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white text-slate-900">
      <div className="flex">
        <aside className="hidden lg:block w-60 border-r border-slate-200 bg-white">
          <SidebarNav />
        </aside>

        <main className="flex-1 min-h-screen">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-10 py-8">
            <ProfileHeader profile={mockProfile} />
            <div className="mt-8">
              <ProfileContentTabs posts={mockPosts} />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
