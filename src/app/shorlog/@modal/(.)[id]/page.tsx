import type { ShorlogDetail } from '../../../components/shorlog/detail/types';

// 🔧 개발용 Mock 데이터
async function fetchMockShorlogDetail(id: string): Promise<ShorlogDetail> {
  const numericId = Number(id);

  // shorlog/1만 여러 이미지 + 댓글 많은 케이스
  const isFirst = numericId === 1;

  const multiImages = isFirst
    ? [
      'https://images.pexels.com/photos/45201/kitty-cat-kitten-pet-45201.jpeg?auto=compress&cs=tinysrgb&w=1200',
      'https://images.pexels.com/photos/126407/pexels-photo-126407.jpeg?auto=compress&cs=tinysrgb&w=1200',
      'https://images.pexels.com/photos/617278/pexels-photo-617278.jpeg?auto=compress&cs=tinysrgb&w=1200',
    ]
    : [
      'https://images.pexels.com/photos/45201/kitty-cat-kitten-pet-45201.jpeg?auto=compress&cs=tinysrgb&w=1200',
    ];

  const baseContent =
    '새벽 3시에 갑자기 미친 듯이 뛰어다니는 고양이의 비밀에 대하여...\n\n' +
    '사실 아무 이유도 없을 수 있습니다. 하지만 그게 또 사랑스럽죠.\n\n' +
    '이 글은 고양이의 황당한 야간 질주를 기록한 숏로그입니다.';

  return {
    id: numericId,
    userId: 1,
    username: 'karpas762',
    nickname: '닉네임',
    profileImgUrl:
      'https://images.pexels.com/photos/45201/kitty-cat-kitten-pet-45201.jpeg?auto=compress&cs=tinysrgb&w=500',
    content: baseContent,
    thumbnailUrls: multiImages,
    viewCount: isFirst ? 321 : 123,
    likeCount: isFirst ? 48 : 24,
    bookmarkCount: isFirst ? 31 : 24,
    commentCount: isFirst ? 8 : 2, // 1번은 댓글/대댓글 더 많게
    hashtags: ['#고양이', '#복슬복슬'],
    createdAt: new Date().toISOString(),
    modifiedAt: new Date().toISOString(),
    linkedBlogId: 42,
  };
}
