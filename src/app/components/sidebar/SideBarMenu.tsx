import {
  Bell,
  FileText,
  Home,
  Image,
  MessageCircle,
  MoreHorizontal,
  PlusSquare,
  User,
  Users,
} from 'lucide-react';

export type MenuItem = {
  icon: any;
  label: string;
  href: string;
  alert?: boolean;
};

// 비로그인 메뉴
export const guestMenu: MenuItem[] = [
  { icon: Home, label: '메인', href: '/' },
  { icon: Image, label: '숏로그', href: '/shorlog/feed' },
  { icon: FileText, label: '블로그', href: '/blogs' },
  { icon: Users, label: '팔로우', href: '/creators' },
  { icon: PlusSquare, label: '작성', href: '/create-content' },
  { icon: User, label: '프로필', href: '/profile' },
  { icon: MoreHorizontal, label: '더보기', href: '' },
];

// 로그인 메뉴
export const loggedInMenu: MenuItem[] = [
  { icon: Home, label: '메인', href: '/' },
  { icon: Image, label: '숏로그', href: '/shorlog/feed' },
  { icon: FileText, label: '블로그', href: '/blogs' },
  { icon: Users, label: '팔로우', href: '/creators' },
  { icon: PlusSquare, label: '작성', href: '/create-content' },
  { icon: MessageCircle, label: '메시지', href: '/messages', alert: true },
  { icon: Bell, label: '알림', href: '/notifications', alert: true },
  { icon: User, label: '프로필', href: '/profile' },
  { icon: MoreHorizontal, label: '더보기', href: '' },
];
