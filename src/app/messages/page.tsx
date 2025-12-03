import type { MessageThread } from '@/src/types/messages';
import MessagesShell from './MessagesShell';

const mockThreads: MessageThread[] = [
  {
    id: 't1',
    user: {
      id: 'u1',
      name: '카카오닉',
      handle: '@kakaonic',
      avatarUrl: '/images/avatars/talk.png',
    },
    lastMessage: '강아지 고양이 진짜 누가 더 귀여울까',
    lastAt: '09:12',
    unreadCount: 2,
    messages: [
      { id: 'm1', at: '09:00', sender: 'them', text: '여기 내 최신 숏로그 봤어?' },
      {
        id: 'm2',
        at: '09:01',
        sender: 'them',
        shared: {
          type: 'shorlog',
          title: '강아지 고양이 진짜 누가 더 귀여울까',
          summary: '짧게 비교해봤는데 결론은… 둘 다!',
          thumbnailUrl: '/images/mock/cat.jpg',
          href: '/shorlog/1',
        },
      },
      { id: 'm3', at: '09:10', sender: 'me', text: 'ㅋㅋㅋ 결론 마음에 든다' },
      { id: 'm4', at: '09:12', sender: 'them', text: '댓글도 남겨줘 😆' },
    ],
  },
  {
    id: 't2',
    user: { id: 'u2', name: 'naver', handle: '@naver', avatarUrl: '/images/avatars/naver.png' },
    lastMessage: '오늘 바다 사진 업로드했어',
    lastAt: '어제',
    unreadCount: 0,
    messages: [
      { id: 'm5', at: '어제 18:10', sender: 'them', text: '오늘 바다 사진 업로드했어!' },
      { id: 'm6', at: '어제 18:12', sender: 'me', text: '색감 미쳤다… 어디야?' },
    ],
  },
  {
    id: 't3',
    user: { id: 'u3', name: 'jooky', handle: '@jooky', avatarUrl: '/images/avatars/google.png' },
    lastMessage: '블로그로 자세히 정리해둘게',
    lastAt: '3일 전',
    unreadCount: 1,
    messages: [
      { id: 'm7', at: '3일 전', sender: 'them', text: '블로그로 자세히 정리해둘게!' },
      {
        id: 'm8',
        at: '3일 전',
        sender: 'them',
        shared: {
          type: 'blog',
          title: '고양이와 함께한 7일 - 관찰 기록',
          summary: '짧게 요약하면: 루틴이 생기면 성격이 보인다.',
          thumbnailUrl: '/images/mock/raccoon.jpg',
          href: '/blog/99',
        },
      },
      { id: 'm9', at: '3일 전', sender: 'me', text: '오케이! 링크 오면 바로 읽을게' },
    ],
  },
];

export default function MessagesPage() {
  // 서버 컴포넌트에서 더미 데이터 전달 (추후 fetch로 교체)
  return <MessagesShell initialThreads={mockThreads} />;
}
