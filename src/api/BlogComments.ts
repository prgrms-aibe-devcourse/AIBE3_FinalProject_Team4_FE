// 댓글 리스트 불러오기
export async function getBlogComments(blogId: number) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/comments/BLOG/${blogId}`,
    { credentials: 'include' }
  );

  const json = await res.json();
  if (!res.ok) throw new Error(json.msg || '댓글 조회 실패');

  return json.data;
}

// 댓글 작성
export async function createBlogComment(blogId: number, content: string, parentId?: number) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/comments`,
    {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        targetType: 'BLOG',
        targetId: blogId,
        parentId: parentId ?? null,
        content,
      }),
    }
  );

  const json = await res.json();
  if (!res.ok) throw new Error(json.msg || '댓글 작성 실패');

  return json.data;
}

// 댓글 수정
export async function editBlogComment(commentId: number, newContent: string) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/comments/${commentId}`,
    {
      method: 'PUT',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: newContent }),
    }
  );

  const json = await res.json();
  if (!res.ok) throw new Error(json.msg || '댓글 수정 실패');
  return json.data;
}

// 댓글 삭제
export async function deleteBlogComment(commentId: number) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/comments/${commentId}`,
    {
      method: 'DELETE',
      credentials: 'include',
    }
  );

  const json = await res.json();
  if (!res.ok) throw new Error(json.msg || '댓글 삭제 실패');

  return json.data;
}
// 댓글 좋아요
export async function likeBlogComment(commentId: number) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/comments/${commentId}/like`,
    {
      method: 'POST',
      credentials: 'include',
    },
  );

  const json = await res.json();
  if (!res.ok) throw new Error(json.msg || '좋아요 실패');
  return json.data;
}

// 댓글 좋아요 취소
export async function unlikeBlogComment(commentId: number) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/comments/${commentId}/unlike`,
    {
      method: 'POST',
      credentials: 'include',
    },
  );

  const json = await res.json();
  if (!res.ok) throw new Error(json.msg || '좋아요 취소 실패');
  return json.data;
}